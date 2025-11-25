# backend/api/routers/health.py
from fastapi import APIRouter, Response

health_router = APIRouter(tags=["health"])

@health_router.head("/health")
async def health_head():
    return Response(status_code=200)
