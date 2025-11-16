from collections.abc import AsyncGenerator

import asyncpg  # type: ignore[import]

from core.database import get_db_pool


async def get_db_connection() -> AsyncGenerator[asyncpg.Connection, None]:
    """Yield a database connection from the shared pool."""
    pool = await get_db_pool()
    async with pool.acquire() as connection:
        yield connection

