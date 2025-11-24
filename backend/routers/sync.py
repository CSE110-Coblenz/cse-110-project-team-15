from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import JSONResponse

import asyncpg  # type: ignore[import]

from core.dependencies import get_db_connection, get_current_user
from models.save import SyncResponse

game_sync_router = APIRouter(tags=["game"])

@game_sync_router.get("/sync", response_model=SyncResponse)
async def handle_data_sync(
    sessionId: str,
    connection: asyncpg.Connection = Depends(get_db_connection)
):
    user_id: int = -1
    
    try:
        user_id = get_current_user(sessionId)
    except:
        HTTPException(status_code=status.HTTP_401_UNAUTHORIZED)
    
    game_data = await connection.fetchrow(
        "SELECT game_data FROM session WHERE user_id = $1",
        user_id,
    )
    if not game_data:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED)
    
    return game_data