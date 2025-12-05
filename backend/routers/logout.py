from fastapi import APIRouter, Depends, Response, status
from fastapi.responses import JSONResponse
import asyncpg  # type: ignore[import]

from core.database import get_db_connection, get_current_user

logout_router = APIRouter()

@logout_router.post(
    "/logout",
    tags=["logout"],
    response_model=None,
)
async def handle_logout(
    response: Response,
    user_id: int = Depends(get_current_user),
    connection: asyncpg.Connection = Depends(get_db_connection),
) -> JSONResponse:
    """Invalidate the current session."""
    
    # Delete all sessions for the user to be safe, or just the current one?
    # The requirement says "logs the use out (deactivates the session)".
    # Since we are enforcing single session, deleting all sessions for the user is effectively the same as deleting the current one if we enforce it correctly on login.
    # But to be precise with the current request context (which implies potentially multiple sessions existing before we enforce single session), 
    # and "If session id is active then we should terminate previous login and create new session" applies to login.
    # For logout, we should probably just invalidate the current session or all. 
    # Let's delete all sessions for this user to ensure clean logout.
    
    await connection.execute(
        "DELETE FROM session WHERE user_id = $1",
        user_id,
    )

    response.delete_cookie(key="access_token")
    
    return JSONResponse(
        status_code=status.HTTP_200_OK,
        content={"ok": True, "message": "Successfully logged out"},
    )
