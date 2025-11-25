import asyncio
from collections.abc import AsyncGenerator
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


async def get_db_connection() -> AsyncGenerator[asyncpg.Connection, None]:
    """Yield a database connection from the shared pool."""
    pool = await get_db_pool()
    async with pool.acquire() as connection:
        yield connection


from fastapi import Cookie, Depends, HTTPException, status
from core.security import verify_token

async def get_current_user(
    access_token: str | None = Cookie(default=None),
    connection: asyncpg.Connection = Depends(get_db_connection),
) -> int:
    """Validate the session and return the user ID."""
    if not access_token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED)
    
    if access_token.startswith("Bearer "):
        access_token = access_token.split(" ")[1]

    payload = verify_token(access_token)
    if not payload:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED)
    
    session_id = payload.get("session_id")
    if not session_id:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED)

    session = await connection.fetchrow(
        "SELECT user_id FROM session WHERE session_id = $1 AND time_expire > NOW()",
        session_id,
    )
    if not session:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED)
    
    return session["user_id"]


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
