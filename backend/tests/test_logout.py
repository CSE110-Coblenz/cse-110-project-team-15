import pytest
from httpx import AsyncClient
from fastapi import status

@pytest.mark.asyncio
async def test_logout(client: AsyncClient):
    """Test that a user can log out successfully."""
    email = "logout_test@example.com"
    password = "password123"

    # 1. Register
    await client.post("/register", json={"user": email, "pass": password})

    # 2. Login
    response = await client.post("/login", json={"user": email, "pass": password})
    assert response.status_code == status.HTTP_200_OK
    
    # Extract token/headers
    # The client handles cookies automatically, but for explicit header usage if needed:
    # access_token = response.cookies["access_token"]
    
    # 3. Logout
    response = await client.post("/logout")
    assert response.status_code == status.HTTP_200_OK
    assert response.json()["ok"] is True
    
    # Verify cookie is cleared
    # In httpx, if the server sends Set-Cookie to clear it, it should be reflected.
    # The cookie might still be present but with expired time or empty value.
    # Let's check if we can access a protected route.
    
    # 4. Verify session is invalid by trying to logout again (which requires auth)
    response = await client.post("/logout")
    assert response.status_code == status.HTTP_401_UNAUTHORIZED

@pytest.mark.asyncio
async def test_single_session_enforcement(client: AsyncClient):
    """Test that logging in again invalidates the previous session."""
    email = "session_test@example.com"
    password = "password123"

    # 1. Register
    await client.post("/register", json={"user": email, "pass": password})

    # 2. Login first time
    response1 = await client.post("/login", json={"user": email, "pass": password})
    assert response1.status_code == status.HTTP_200_OK
    
    # Capture the first session's cookie value
    cookie_value1 = response1.cookies["access_token"]
    
    # 3. Login second time
    response2 = await client.post("/login", json={"user": email, "pass": password})
    assert response2.status_code == status.HTTP_200_OK
    
    # 4. Verify first session is invalid
    # We manually set the cookie to the old value
    response_old = await client.post("/logout", cookies={"access_token": cookie_value1})
    assert response_old.status_code == status.HTTP_401_UNAUTHORIZED
