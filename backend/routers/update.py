from fastapi import APIRouter, Depends, HTTPException, status
import asyncpg  # type: ignore[import]
import json
from models.save import OkResponse, SaveState, Location, Npc
from models.update import UpdateEvent
from core.database import get_db_connection, get_current_user

game_update_router = APIRouter(tags=["game"])

@game_update_router.put("/game/update", response_model=OkResponse)
async def game_update(
    event: UpdateEvent,
    user_id: int = Depends(get_current_user),
    connection: asyncpg.Connection = Depends(get_db_connection)
):
    # 1. Fetch current state
    row = await connection.fetchrow(
        "SELECT game_data FROM game_saves WHERE user_id = $1",
        user_id,
    )
    
    if row is None or row["game_data"] is None:
        # If no save exists, we might want to create a default one or error.
        # For update, it implies a session exists.
        # Let's create default state if missing, similar to repo.saves.get_save
        state = SaveState(
            location=Location(room="Start", x=0, y=0),
            notebook={},
            access={},
            npc=[Npc(id="npc1"), Npc(id="npc2")]
        )
    else:
        game_data_json = row["game_data"]
        if isinstance(game_data_json, str):
            data_dict = json.loads(game_data_json)
        else:
            data_dict = game_data_json
        state = SaveState(**data_dict)

    # 2. Apply update
    if event.type == "location" and isinstance(event.msg, dict):
        state.location.room = event.msg.get("room", state.location.room)
        # Coerce to int as in repo.saves
        state.location.x = int(event.msg.get("x", state.location.x))
        state.location.y = int(event.msg.get("y", state.location.y))
    elif event.type in ("problem", "minigame") and event.id:
        key = f"completed_{event.type}s"
        bucket = state.notebook.setdefault(key, [])
        if event.id not in bucket:
            bucket.append(event.id)
    
    # 3. Save back
    json_data = json.dumps(state.model_dump())
    
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

    return OkResponse(ok=True)