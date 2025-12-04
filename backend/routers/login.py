from datetime import timedelta

import asyncpg  # type: ignore[import]
from fastapi import APIRouter, Depends, HTTPException, Response, status
from fastapi.responses import JSONResponse

from core.config import settings
from core.database import get_db_connection
from core.security import create_access_token, generate_session_id, verify_password
from models.login import LoginRequest, LoginResponse

login_router = APIRouter()


@login_router.post(
    "/login",
    tags=["login"],
    response_model=LoginResponse,
)
async def handle_login_request(
    payload: LoginRequest,
    response: Response,
    connection: asyncpg.Connection = Depends(get_db_connection),
) -> LoginResponse:
    """Validate user credentials and create a session."""
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
    session_id = generate_session_id()
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    
    # Create JWT
    access_token = create_access_token(
        data={"sub": str(user_id), "session_id": session_id},
        expires_delta=access_token_expires,
    )

    # Save session to DB
    try:
        # Enforce single session: Delete existing sessions for this user
        await connection.execute(
            "DELETE FROM session WHERE user_id = $1",
            user_id,
        )
        
        await connection.execute(
            """
            INSERT INTO session (user_id, session_id, time_expire)
            VALUES ($1, $2, NOW() + interval '30 minutes')
            """,
            user_id,
            session_id,
        )
    except asyncpg.PostgresError as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unable to create session",
        ) from exc

    # Set HttpOnly cookie
    response.set_cookie(
        key="access_token",
        value=f"Bearer {access_token}",
        httponly=True,
        max_age=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        expires=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        samesite="lax",
        secure=not settings.DEBUG,  # Secure only in production/non-debug
    )

    return LoginResponse(ok=True, message="Successfully Authorized")
