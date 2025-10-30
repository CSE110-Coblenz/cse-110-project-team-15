from fastapi import APIRouter

ping_router = APIRouter(
    # prefix="/ping",
    tags=["ping"],
)

@ping_router.post("/ping", tags=["ping"])
async def pong():
    return { "ok": True }