import asyncpg  # type: ignore[import]
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import JSONResponse

from core.database import get_db_connection
from core.security import verify_password
from models.delete import DeleteRequest, DeleteResponse

delete_router = APIRouter()


@delete_router.delete(
    "/delete",
    tags=["delete"],
    response_model=DeleteResponse,
)
async def handle_deletion_request(
    payload: DeleteRequest,
    connection: asyncpg.Connection = Depends(get_db_connection),
) -> DeleteResponse:
    """Delete a user account after verifying credentials."""
    record = await connection.fetchrow(
        "SELECT user_id, password FROM users WHERE email = $1",
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

    user_id = record["user_id"]

    try:
        async with connection.transaction():
            # Delete sessions first (foreign key constraint usually handles this, but good to be explicit or if cascade isn't set)
            # Assuming CASCADE on delete in DB, but if not:
            await connection.execute("DELETE FROM session WHERE user_id = $1", user_id)
            
            # Delete user
            await connection.execute("DELETE FROM users WHERE user_id = $1", user_id)
            
    except asyncpg.PostgresError as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unable to delete user",
        ) from exc

    return DeleteResponse(ok=True, message="Successfully Deleted")
