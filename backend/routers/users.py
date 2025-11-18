<<<<<<< HEAD
# backend/api/routers/users.py
from fastapi import APIRouter, HTTPException
from api.models.users import UserCreate, LoginRequest, LoginResponse, OkMessage

user_router = APIRouter(prefix="/users", tags=["users"])
_USERS: set[str] = set()

@user_router.post("/register", response_model=OkMessage)
async def handle_reg_request(body: UserCreate):
    if body.username in _USERS:
        raise HTTPException(409, "username taken")
    _USERS.add(body.username)
    return OkMessage(ok=True, message="Successfully Registered")

@user_router.post("/login", response_model=LoginResponse)
async def handle_login_request(body: LoginRequest):
    if body.username not in _USERS:
        raise HTTPException(401, "invalid credentials")
    return LoginResponse(ok=True, message="Successfully Authorized")

@user_router.delete("/delete", response_model=OkMessage)
async def handle_deletion_request(username: str):
    _USERS.discard(username)
    return OkMessage(ok=True, message="Successfully Deleted")
=======
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import JSONResponse

import asyncpg  # type: ignore[import]

from core.dependencies import get_db_connection
from core.security import hash_password, verify_password
from models.users import AuthResponse, LoginRequest, RegisterRequest

user_router = APIRouter(
    # prefix="/users",
    tags=["users"],
)


@user_router.post(
    "/register",
    tags=["users"],
    response_model=AuthResponse,
)
async def handle_reg_request(
    payload: RegisterRequest,
    connection: asyncpg.Connection = Depends(get_db_connection),
) -> AuthResponse:
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

    return AuthResponse(ok=True, message="Successfully Registered")


@user_router.post(
    "/login",
    tags=["users"],
    response_model=AuthResponse,
)
async def handle_login_request(
    payload: LoginRequest,
    connection: asyncpg.Connection = Depends(get_db_connection),
) -> AuthResponse:
    """Validate user credentials."""
    record = await connection.fetchrow(
        "SELECT password FROM users WHERE email = $1",
        payload.email,
    )
    if record is None:
        return JSONResponse(
            status_code=status.HTTP_401_UNAUTHORIZED,
            content={"ok": False, "message": "Invalid email or password"},
        )

    stored_hash = record["password"]
    if not verify_password(payload.password, stored_hash):
        return JSONResponse(
            status_code=status.HTTP_401_UNAUTHORIZED,
            content={"ok": False, "message": "Invalid email or password"},
        )

    return AuthResponse(ok=True, message="Successfully Authorized")


@user_router.delete("/delete", tags=["users"])
async def handle_deletion_request() -> AuthResponse:
    return AuthResponse(ok=True, message="Successfully Deleted")
>>>>>>> origin/backend
