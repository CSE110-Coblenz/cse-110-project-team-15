from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import JSONResponse

import asyncpg  # type: ignore[import]
from models.save import OkResponse, SaveRequest, Location, Npc, SaveState
from repo.saves import upsert_save
from schema import Schema, And, Use, Optional, SchemaError

from typing import Any, Dict, List, Optional

from core.dependencies import get_db_connection, get_current_user
import json

game_save_router = APIRouter(tags=["game"])
USERNAME = "demo"

@game_save_router.post("/save", response_model=OkResponse)
async def handle_game_save(
    sessionId: str,
    payload: SaveRequest,
    connection: asyncpg.Connection = Depends(get_db_connection)
):
    if not check(game_data_schema, game_data):
        return OkResponse(ok=False)
    
    user_id: int = -1
    
    try:
        user_id = get_current_user(sessionId)
    except:
        HTTPException(status_code=status.HTTP_401_UNAUTHORIZED)
    
    game_data = json.dumps(payload)
    
    try:
        '''
        await connection.execute(
            "INSERT INTO session game_data VALUES ($1) WHERE user_id = $2",
            game_data,
            user_id)
        '''
        
        await connection.execute(
            '''
            INSERT INTO session (user_id, game_data)
            VALUES ($1, $2)
            ON CONFLICT (user_id) DO UPDATE
            SET user_id = EXCLUDED.user_id
            ''',
            user_id,
            game_data
        )
    except:
        return OkResponse(ok=False)
    finally:
        await connection.close()
    
    return OkResponse(ok=True)

def check(conf_schema, conf):
    try:
        conf_schema.validate(conf)
        return True
    except SchemaError:
        return False

game_data_schema = Schema({
    'location': And(Use(Location)),
    'notebook': And(Dict[str, Any]),
    'access': And(Dict[str, any]),
    'npc': And(Use(List[Npc])),
})