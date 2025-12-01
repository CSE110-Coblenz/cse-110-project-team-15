import sys
import os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

import asyncio
from typing import AsyncGenerator, Generator

import asyncpg  # type: ignore[import]
import pytest
import testing.postgresql  # type: ignore[import]
from httpx import AsyncClient, ASGITransport

# Set environment variables before importing main/config
os.environ["DATABASE_URL"] = "postgresql://test:test@localhost:5432/test_db"
os.environ["SECRET_KEY"] = "test_secret_key"
os.environ["DEBUG"] = "true"

from main import app
from core.database import get_db_pool, _pool_lock

# Define the scope of the temporary database
# We use "session" so it spins up once per test run, but you could use "function" for isolation per test
@pytest.fixture(scope="session")
def postgresql() -> Generator[testing.postgresql.Postgresql, None, None]:
    # Skip local DB setup if running against remote
    if os.environ.get("TEST_REMOTE_URL"):
        yield None # type: ignore
        return

    with testing.postgresql.Postgresql() as pg:
        yield pg


@pytest.fixture(scope="function")
async def db_pool(postgresql: testing.postgresql.Postgresql) -> AsyncGenerator[asyncpg.Pool, None]:
    """Create a database pool connected to the temporary database."""
    if os.environ.get("TEST_REMOTE_URL"):
        yield None # type: ignore
        return

    pool = await asyncpg.create_pool(dsn=postgresql.url())
    yield pool
    await pool.close()


@pytest.fixture(scope="function", autouse=True)
async def setup_db(db_pool: asyncpg.Pool) -> AsyncGenerator[None, None]:
    """Create tables before each test and clean up after."""
    if os.environ.get("TEST_REMOTE_URL"):
        yield
        return

    async with db_pool.acquire() as connection:
        # Create tables
        await connection.execute("""
            CREATE TABLE IF NOT EXISTS users (
                user_id SERIAL PRIMARY KEY,
                email TEXT UNIQUE NOT NULL,
                password TEXT NOT NULL,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );
            CREATE TABLE IF NOT EXISTS session (
                user_id INT NOT NULL,
                session_id TEXT NOT NULL,
                is_active BOOLEAN DEFAULT TRUE,
                time_expire TIMESTAMP WITH TIME ZONE,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                PRIMARY KEY (session_id)
            );
            CREATE TABLE IF NOT EXISTS game_saves (
                user_id INT PRIMARY KEY,
                game_data JSONB,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );
        """)
        yield
        # Clean up data (truncate tables)
        await connection.execute("TRUNCATE users, session, game_saves RESTART IDENTITY CASCADE;")


@pytest.fixture
async def client(db_pool: asyncpg.Pool) -> AsyncGenerator[AsyncClient, None]:
    """Create a test client."""
    
    remote_url = os.environ.get("TEST_REMOTE_URL")
    if remote_url:
        # Remote testing: Use standard AsyncClient pointing to the URL
        print(f"\nRunning tests against REMOTE URL: {remote_url}")
        async with AsyncClient(base_url=remote_url) as ac:
            yield ac
    else:
        # Local testing: Override DB and use app
        
        # Override the get_db_pool dependency
        async def override_get_db_pool() -> asyncpg.Pool:
            return db_pool

        app.dependency_overrides[get_db_pool] = override_get_db_pool
        
        # Mock core.database.get_db_pool
        from unittest.mock import patch
        
        async def mock_get_db_pool():
            return db_pool

        with patch("core.database.get_db_pool", side_effect=mock_get_db_pool):
             async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
                yield ac
        
        app.dependency_overrides.clear()
