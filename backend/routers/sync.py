from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import JSONResponse

import asyncpg  # type: ignore[import]

from core.dependencies import get_db_connection
from core.security import hash_password, verify_password
from models.users import AuthResponse, LoginRequest, RegisterRequest
from models.save import SyncResponse
from repo.saves import get_save

game_sync_router = APIRouter(tags=["game"])

@game_sync_router.get("/sync", response_model=SyncResponse)
async def handle_data_sync(
    connection: asyncpg.Connection = Depends(get_db_connection),
    user=Depends(get_session_id)
):
    pass
    # return SyncResponse(**get_save(USERNAME).model_dump())