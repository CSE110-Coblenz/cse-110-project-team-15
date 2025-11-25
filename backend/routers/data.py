# backend/api/routers/data.py
from fastapi import APIRouter

from models.save import SyncResponse, SaveRequest, OkResponse
from models.update import UpdateEvent
from repo.saves import get_save, upsert_save, apply_update

data_router = APIRouter(tags=["data"])
USERNAME = "demo"

@data_router.get("/sync", response_model=SyncResponse)
async def handle_data_sync():
    return SyncResponse(**get_save(USERNAME).model_dump())

@data_router.put("/update", response_model=OkResponse)
async def handle_data_update(event: UpdateEvent):
    apply_update(USERNAME, type=event.type, id=event.id, msg=event.msg)
    return {"ok": True}

@data_router.post("/save", response_model=OkResponse)
async def handle_data_save(payload: SaveRequest):
    upsert_save(USERNAME, payload)  # SaveRequest is a SaveState subtype—OK
    return {"ok": True}