from fastapi import APIRouter
from models.save import OkResponse, SaveRequest
from repo.saves import upsert_save

game_save_router = APIRouter(tags=["game"])
USERNAME = "demo"

@game_save_router.post("/game/save", response_model=OkResponse)
async def game_save(payload: SaveRequest):
    upsert_save(USERNAME, payload)
    return OkResponse(ok=True)