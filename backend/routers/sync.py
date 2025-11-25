from fastapi import APIRouter, Depends, HTTPException, status, Cookie
from fastapi.responses import JSONResponse

import asyncpg  # type: ignore[import]

from core.dependencies import get_db_connection, get_current_user
from models.save import SyncResponse

game_sync_router = APIRouter(tags=["game"])

@game_sync_router.get("/sync", response_model=SyncResponse)
async def handle_data_sync(
    session_id: str = Cookie(None),
    connection: asyncpg.Connection = Depends(get_db_connection)
):

    if session_id is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, 
            detail="Missing session token"
        )
    
    try:
        user_id = get_current_user(session_id)
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid session token",
        )
    
    row = await connection.fetchrow(
        "SELECT game_data FROM session WHERE user_id = $1",
        user_id,
    )

    if row is None or row["game_data"] is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Game data not found",
        )
        
    game_data = row["game_data"]

    # spreads dict before returning to get proper JSON format
    return SyncResponse(**game_data)