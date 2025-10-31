# backend/api/routers/users.py
from fastapi import APIRouter
from schemas.users import UserCreate, LoginRequest, LoginResponse, OkMessage

user_router = APIRouter(tags=["users"])

@user_router.post("/register", response_model=OkMessage)
async def handle_reg_request(body: UserCreate):
    # mock only for now
    return {"ok": True, "message": "Successfully Registered"}

@user_router.post("/login", response_model=LoginResponse)
async def handle_login_request(body: LoginRequest):
    # mock only for now
    return {"ok": True, "message": "Successfully Authorized"}

@user_router.delete("/delete", response_model=OkMessage)
async def handle_deletion_request(body: LoginRequest):
    # mock only for now
    return {"ok": True, "message": "Successfully Deleted"}
