from fastapi import APIRouter
from api.models.save import OkResponse
from api.models.update import UpdateEvent
from api.repo.saves import apply_update

game_update_router = APIRouter(tags=["game"])
USERNAME = "demo"

@game_update_router.put("/game/update", response_model=OkResponse)
async def game_update(event: UpdateEvent):
    apply_update(USERNAME, type=event.type, id=event.id, msg=event.msg)
    return OkResponse(ok=True)