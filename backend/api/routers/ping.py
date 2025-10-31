# backend/api/routers/ping.py

from fastapi import APIRouter
from schemas.save import OkResponse

ping_router = APIRouter(tags=["ping"])

@ping_router.head("/ping", response_model=OkResponse)
async def pong():
    return {"ok": True}
