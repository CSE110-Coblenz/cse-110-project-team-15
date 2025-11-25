from fastapi import APIRouter, Depends, HTTPException, status
import asyncpg  # type: ignore[import]
import json
from core.database import get_db_connection, get_current_user
from models.save import SyncResponse

game_sync_router = APIRouter(tags=["game"])

@game_sync_router.get("/game/sync", response_model=SyncResponse)
async def handle_data_sync(
    user_id: int = Depends(get_current_user),
    connection: asyncpg.Connection = Depends(get_db_connection)
):
    row = await connection.fetchrow(
        "SELECT game_data FROM game_saves WHERE user_id = $1",
        user_id,
    )

    if row is None or row["game_data"] is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Game data not found",
        )
        
    game_data_json = row["game_data"]
    if isinstance(game_data_json, str):
        game_data = json.loads(game_data_json)
    else:
        game_data = game_data_json

    return SyncResponse(**game_data)