import asyncio
from typing import Optional

import asyncpg  # type: ignore[import]

from core.config import settings

_pool: Optional[asyncpg.Pool] = None
_pool_lock = asyncio.Lock()


async def init_db_pool() -> asyncpg.Pool:
    """Initialize the global database connection pool if needed."""
    global _pool

    if _pool is None:
        async with _pool_lock:
            if _pool is None:
                if not settings.DATABASE_URL:
                    raise RuntimeError(
                        "DATABASE_URL is not set. Cannot initialize the database pool."
                    )

                _pool = await asyncpg.create_pool(
                    dsn=settings.DATABASE_URL,
                    min_size=1,
                    max_size=10,
                )

    return _pool


async def get_db_pool() -> asyncpg.Pool:
    """Ensure a pool exists and return it."""
    if _pool is None:
        return await init_db_pool()
    return _pool


async def close_db_pool() -> None:
    """Close the global database pool."""
    global _pool
    if _pool is not None:
        await _pool.close()
        _pool = None

async def get_current_user():
    pass

async def get_session_id():
    pass