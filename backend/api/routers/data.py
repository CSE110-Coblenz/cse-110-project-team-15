# backend/api/routers/data.py
from fastapi import APIRouter
from schemas.save import SyncResponse, SaveRequest, OkResponse
from schemas.update import UpdateEvent
from repo.saves import get_save, upsert_save, apply_update

data_router = APIRouter(tags=["data"])

# For now, mock a single user. Later we’ll take it from auth.
USERNAME = "demo"

@data_router.get("/sync", response_model=SyncResponse, tags=["data"])
async def handle_data_sync():
    return get_save(USERNAME)

@data_router.put("/update", response_model=OkResponse, tags=["data"])
async def handle_data_update(event: UpdateEvent):
    apply_update(USERNAME, type=event.type, id=event.id, msg=event.msg)
    return {"ok": True}

@data_router.post("/save", response_model=OkResponse, tags=["data"])
async def handle_data_save(payload: SaveRequest):
    upsert_save(USERNAME, payload)
    return {"ok": True}
