import asyncpg  # type: ignore[import]
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import JSONResponse

from core.database import get_db_connection
from core.security import hash_password
from models.register import RegisterRequest, RegisterResponse

register_router = APIRouter()


@register_router.post(
    "/register",
    tags=["register"],
    response_model=RegisterResponse,
)
async def handle_reg_request(
    payload: RegisterRequest,
    connection: asyncpg.Connection = Depends(get_db_connection),
) -> RegisterResponse:
    """Register a new user with a salted + hashed password."""
    existing = await connection.fetchval(
        "SELECT 1 FROM users WHERE email = $1",
        payload.email,
    )
    if existing:
        return JSONResponse(
            status_code=status.HTTP_409_CONFLICT,
            content={"ok": False, "message": "Email already in use"},
        )

    password_hash = hash_password(payload.password)
    try:
        await connection.execute(
            """
            INSERT INTO users (email, password)
            VALUES ($1, $2)
            """,
            payload.email,
            password_hash,
        )
    except asyncpg.PostgresError as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unable to register user",
        ) from exc

    return RegisterResponse(ok=True, message="Successfully Registered")
