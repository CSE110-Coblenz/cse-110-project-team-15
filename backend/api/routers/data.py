from fastapi import APIRouter

data_router = APIRouter(
    # prefix="/data",
    tags=["data"]
)

@data_router.get("/sync", tags=["data"])
async def handle_data_sync():
    return { "ok": True }

@data_router.post("/update", tags=["data"])
async def handle_data_update():
    return { "ok": True }

@data_router.post("/save", tags=["data"])
async def handle_data_save():
    return { "ok": True }