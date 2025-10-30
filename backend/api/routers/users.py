from fastapi import APIRouter

user_router = APIRouter(
    # prefix="/users",
    tags=["users"]
)

@user_router.post("/register", tags=["users"])
async def handle_reg_request():
    return { "ok": True, "message": "Successfully Registered" }

@user_router.post("/login", tags=["users"])
async def handle_login_request():
    return { "ok": True, "message": "Successfully Authorized" }

@user_router.delete("/delete", tags=["users"])
async def handle_deletion_request():
    return { "ok": True, "message": "Successfully Deleted" }