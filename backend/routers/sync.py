from fastapi import APIRouter
from models.save import SyncResponse
from repo.saves import get_save

game_sync_router = APIRouter(tags=["game"])
USERNAME = "demo"

@game_sync_router.get("/sync", response_model=SyncResponse)
async def handle_data_sync():
    return SyncResponse(**get_save(USERNAME).model_dump())