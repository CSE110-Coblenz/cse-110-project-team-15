import pytest
from httpx import AsyncClient

@pytest.mark.asyncio
async def test_register_login_delete_flow(client: AsyncClient):
    email = "test@example.com"
    password = "securepassword123"

    # 1. Register
    response = await client.post(
        "/register",
        json={"user": email, "pass": password},
    )
    assert response.status_code == 200
    assert response.json()["ok"] is True

    # 2. Login
    response = await client.post(
        "/login",
        json={"user": email, "pass": password},
    )
    assert response.status_code == 200
    assert response.json()["ok"] is True
    
    # Verify cookie is set
    assert "access_token" in response.cookies
    access_token = response.cookies["access_token"]
    assert "Bearer " in access_token

    # 3. Delete (with correct credentials)
    response = await client.request(
        "DELETE",
        "/delete",
        json={"user": email, "pass": password},
    )
    assert response.status_code == 200
    assert response.json()["ok"] is True

    # 4. Verify Login Fails after Delete
    response = await client.post(
        "/login",
        json={"user": email, "pass": password},
    )
    assert response.status_code == 401


@pytest.mark.asyncio
async def test_register_duplicate_email(client: AsyncClient):
    email = "dup@example.com"
    password = "password"

    await client.post("/register", json={"user": email, "pass": password})
    
    response = await client.post("/register", json={"user": email, "pass": password})
    assert response.status_code == 409


@pytest.mark.asyncio
async def test_login_invalid_credentials(client: AsyncClient):
    email = "wrong@example.com"
    password = "password"
    
    # Register first
    await client.post("/register", json={"user": email, "pass": password})

    # Wrong password
    response = await client.post("/login", json={"user": email, "pass": "wrongpass"})
    assert response.status_code == 401

    # Wrong email
    response = await client.post("/login", json={"user": "nonexistent@example.com", "pass": password})
    assert response.status_code == 401


@pytest.mark.asyncio
async def test_delete_invalid_credentials(client: AsyncClient):
    email = "del@example.com"
    password = "password"
    
    await client.post("/register", json={"user": email, "pass": password})

    # Wrong password
    response = await client.request(
        "DELETE",
        "/delete",
        json={"user": email, "pass": "wrongpass"},
    )
    assert response.status_code == 401
