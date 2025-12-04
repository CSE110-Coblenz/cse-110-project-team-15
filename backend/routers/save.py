from fastapi import APIRouter, Depends, HTTPException, status, Body
from typing import Any
import asyncpg  # type: ignore[import]
import json
from models.save import OkResponse, SaveState, Location, Npc
from core.database import get_db_connection, get_current_user

game_save_router = APIRouter(tags=["game"])

@game_save_router.post("/game/save", response_model=OkResponse)
async def handle_game_save(
    payload: Any = Body(...),
    user_id: int = Depends(get_current_user),
    connection: asyncpg.Connection = Depends(get_db_connection)
):
    if payload is None or payload == {}:
        # empty JSON; prob new user, so should create new JSON?
        state = SaveState(
            location=Location(room="Start", x=0, y=0),
            notebook={},
            access={},
            npc=[]
        )
        json_data = json.dumps(state.model_dump())
    else:
        # non-empty JSON; just read it
        try:
            json_data = json.dumps(payload)
        except Exception as e:
            print("JSON save data error:", e)
            raise HTTPException(
                status_code=500,
                detail="Failed to save game data"
            )
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