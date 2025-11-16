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
