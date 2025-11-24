from fastapi import APIRouter
from models.save import OkResponse
from models.update import UpdateEvent
from repo.saves import apply_update

game_update_router = APIRouter(tags=["game"])
USERNAME = "demo"

@game_update_router.put("/game/update", response_model=OkResponse)
async def game_update(event: UpdateEvent):
    apply_update(USERNAME, type=event.type, id=event.id, msg=event.msg)
    return OkResponse(ok=True)