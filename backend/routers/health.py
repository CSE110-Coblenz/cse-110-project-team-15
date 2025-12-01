# backend/api/routers/health.py
from fastapi import APIRouter, Depends, Response, status
import asyncpg
from core.database import get_db_connection
from models.health import HealthResponse

health_router = APIRouter(tags=["health"])

@health_router.api_route("/health", methods=["GET", "HEAD"], response_model=HealthResponse)
async def health_check(
    connection: asyncpg.Connection = Depends(get_db_connection),
):
    try:
        await connection.execute("SELECT 1")
        db_status = "connected"
    except Exception:
        db_status = "disconnected"
        # Optionally return 503 if DB is down, but often 200 with status details is preferred for "app is up"
    
    return HealthResponse(ok=True, db_status=db_status)
