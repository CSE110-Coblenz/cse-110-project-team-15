from fastapi import APIRouter, Depends, HTTPException, status
import asyncpg  # type: ignore[import]
import json
from models.save import OkResponse, SaveRequest
from core.database import get_db_connection, get_current_user

game_save_router = APIRouter(tags=["game"])

@game_save_router.post("/game/save", response_model=OkResponse)
async def handle_game_save(
    payload: SaveRequest,
    user_id: int = Depends(get_current_user),
    connection: asyncpg.Connection = Depends(get_db_connection)
):
    game_data = payload.model_dump()
    json_data = json.dumps(game_data)
    
    try:
        await connection.execute(
            '''
            INSERT INTO game_saves (user_id, game_data)
            VALUES ($1, $2)
            ON CONFLICT (user_id) DO UPDATE
                SET game_data = EXCLUDED.game_data
            ''',
            user_id,
            json_data
        )
    except Exception as e:
        print("DB error:", e)
        raise HTTPException(
            status_code=500,
            detail="Failed to save game data"
        )
    
    return OkResponse(ok=True)