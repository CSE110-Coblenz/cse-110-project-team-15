from fastapi import APIRouter, Depends, HTTPException, status, Cookie

import asyncpg  # type: ignore[import]
from models.save import OkResponse, SaveRequest
from repo.saves import upsert_save

from core.dependencies import get_db_connection, get_current_user
import json

game_save_router = APIRouter(tags=["game"])
USERNAME = "demo"

@game_save_router.post("/save", response_model=OkResponse)
async def handle_game_save(
    payload: SaveRequest,
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
            detail="Invalid session token"
        )
    
    game_data = payload.model_dump()
    
    try:
        await connection.execute(
            '''
            INSERT INTO session (user_id, game_data)
            VALUES ($1, $2)
            ON CONFLICT (user_id) DO UPDATE
                SET game_data = EXCLUDED.game_data
            ''',
            user_id,
            game_data
        )
    except Exception as e:
        print("DB error:", e)
        raise HTTPException(
            status_code=500,
            detail="Failed to save game data"
        )
    
    return OkResponse(ok=True)