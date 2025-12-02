import pytest
import uuid
from httpx import AsyncClient

@pytest.fixture
async def test_user(client: AsyncClient):
    """Fixture to create and clean up a test user."""
    unique_id = str(uuid.uuid4())[:8]
    user_email = f"integration_test_{unique_id}@example.com"
    user_pass = "securepassword123"
    
    # Setup: No action needed, user is created in the test
    yield {"email": user_email, "pass": user_pass}
    
    # Teardown: Attempt to delete the user
    # We use a separate request to ensure cleanup
    print(f"\nCleaning up test user: {user_email}")
    try:
        response = await client.request("DELETE", "/delete", json={"user": user_email, "pass": user_pass})
        if response.status_code == 200:
            print("User deleted successfully.")
        else:
            print(f"Failed to delete user: {response.status_code} {response.text}")
    except Exception as e:
        print(f"Error during cleanup: {e}")

@pytest.mark.asyncio
async def test_user_lifecycle_flow(client: AsyncClient, test_user: dict):
    user_email = test_user["email"]
    user_pass = test_user["pass"]

    # 1. Health Check
    response = await client.get("/health")
    assert response.status_code == 200
    # Allow for flexible health response (db_status might vary in some envs, but should be connected)
    data = response.json()
    assert data["ok"] is True
    assert "db_status" in data

    # 2. Register
    response = await client.post("/register", json={"user": user_email, "pass": user_pass})
    assert response.status_code == 200
    assert response.json()["ok"] is True

    # 3. Login
    response = await client.post("/login", json={"user": user_email, "pass": user_pass})
    assert response.status_code == 200
    assert response.json()["ok"] is True
    
    # Verify we got a session cookie
    assert "access_token" in response.cookies

    # 4. Initial Save (Create)
    initial_game_data = {
        "location": {"room": "Start", "x": 10, "y": 20},
        "notebook": {"notes": ["first note"]},
        "access": {"level1": True},
        "npc": [{"id": "npc1", "state": {"talked": True}}]
    }
    
    response = await client.post("/game/save", json=initial_game_data)
    assert response.status_code == 200
    assert response.json()["ok"] is True

    # 5. Sync (Read)
    response = await client.get("/game/sync")
    assert response.status_code == 200
    data = response.json()
    assert data["location"]["x"] == 10
    assert data["notebook"]["notes"] == ["first note"]

    # 6. Update (Modify)
    # Update location
    update_event_loc = {
        "type": "location",
        "msg": {"room": "Hallway", "x": 50, "y": 60}
    }
    response = await client.put("/game/update", json=update_event_loc)
    assert response.status_code == 200
    assert response.json()["ok"] is True

    # Update notebook (add item)
    update_event_note = {
        "type": "problem", # Using 'problem' type as per update.py logic for notebook
        "id": "problem1"
    }
    response = await client.put("/game/update", json=update_event_note)
    assert response.status_code == 200

    # 7. Verify Updates via Sync
    response = await client.get("/game/sync")
    assert response.status_code == 200
    data = response.json()
    assert data["location"]["room"] == "Hallway"
    assert data["location"]["x"] == 50
    # Check if problem1 was added to completed_problems
    assert "problem1" in data["notebook"].get("completed_problems", [])

    # 8. Delete User (Explicitly tested here, but also handled by fixture)
    # We perform it here to verify the endpoint works as part of the flow.
    # The fixture will try again and likely get 401 or 404, which is fine.
    response = await client.request("DELETE", "/delete", json={"user": user_email, "pass": user_pass})
    assert response.status_code == 200
    assert response.json()["ok"] is True

    # 9. Verify Deletion (Login should fail)
    response = await client.post("/login", json={"user": user_email, "pass": user_pass})
    assert response.status_code == 401
