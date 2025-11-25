import sys
import os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

import asyncio
from typing import AsyncGenerator, Generator

import asyncpg  # type: ignore[import]
import pytest
import testing.postgresql  # type: ignore[import]
from httpx import AsyncClient, ASGITransport

from main import app
from core.database import get_db_pool, _pool_lock

# Define the scope of the temporary database
# We use "session" so it spins up once per test run, but you could use "function" for isolation per test
@pytest.fixture(scope="session")
def postgresql() -> Generator[testing.postgresql.Postgresql, None, None]:
    with testing.postgresql.Postgresql() as pg:
        yield pg


@pytest.fixture(scope="function")
async def db_pool(postgresql: testing.postgresql.Postgresql) -> AsyncGenerator[asyncpg.Pool, None]:
    """Create a database pool connected to the temporary database."""
    pool = await asyncpg.create_pool(dsn=postgresql.url())
    yield pool
    await pool.close()


@pytest.fixture(scope="function", autouse=True)
async def setup_db(db_pool: asyncpg.Pool) -> AsyncGenerator[None, None]:
    """Create tables before each test and clean up after."""
    async with db_pool.acquire() as connection:
        # Create tables
        await connection.execute("""
            CREATE TABLE IF NOT EXISTS users (
                user_id SERIAL PRIMARY KEY,
                email TEXT UNIQUE NOT NULL,
                password TEXT NOT NULL
            );
            CREATE TABLE IF NOT EXISTS session (
                user_id INT NOT NULL,
                session_id TEXT NOT NULL,
                is_active BOOLEAN DEFAULT TRUE,
                time_expire TIMESTAMP WITH TIME ZONE,
                PRIMARY KEY (session_id)
            );
        """)
        yield
        # Clean up data (truncate tables)
        await connection.execute("TRUNCATE users, session RESTART IDENTITY CASCADE;")


@pytest.fixture
async def client(db_pool: asyncpg.Pool) -> AsyncGenerator[AsyncClient, None]:
    """Create a test client with the overridden database pool."""
    
    # Override the get_db_pool dependency
    async def override_get_db_pool() -> asyncpg.Pool:
        return db_pool

    app.dependency_overrides[get_db_pool] = override_get_db_pool
    
    # We also need to patch the global pool in database.py if it's accessed directly
    # But since we use dependency injection or get_db_pool, overriding the dependency is usually enough.
    # However, core.database.get_db_connection calls get_db_pool directly.
    # So we should mock core.database.get_db_pool or set the global _pool.
    
    # Better approach: Mock the get_db_pool function in core.database
    from unittest.mock import patch
    
    async def mock_get_db_pool():
        return db_pool

    with patch("core.database.get_db_pool", side_effect=mock_get_db_pool):
         async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
            yield ac
    
    app.dependency_overrides.clear()
