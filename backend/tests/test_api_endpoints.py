
from typing import Dict, Any
import pytest
import json
from httpx import AsyncClient
from main import app
from core.database import get_current_user, get_db_pool

# Mock user ID
TEST_USER_ID = 1

# Override get_current_user dependency
async def mock_get_current_user():
    return TEST_USER_ID

@pytest.fixture(autouse=True)
def override_auth():
    app.dependency_overrides[get_current_user] = mock_get_current_user
    yield
    # conftest.py clears overrides, but we can be safe
    if get_current_user in app.dependency_overrides:
        del app.dependency_overrides[get_current_user]

# ---------- helpers ----------

async def get_state_from_db(db_pool):
    async with db_pool.acquire() as connection:
        row = await connection.fetchrow(
            "SELECT game_data FROM game_saves WHERE user_id = $1",
            TEST_USER_ID
        )
        if row and row["game_data"]:
            data = row["game_data"]
            if isinstance(data, str):
                return json.loads(data)
            return data
        return None

# ---------- tests ----------

@pytest.mark.asyncio
async def test_health_get_ok(client: AsyncClient):
    r = await client.get("/health")
    assert r.status_code == 200
    assert r.json() == {"ok": True, "db_status": "connected"}


# ---------- game/save ----------

@pytest.mark.asyncio
async def test_game_save_accepts_full_payload_and_persists_defaults(client: AsyncClient, db_pool):
    payload: Dict[str, Any] = {
        "location": {"room": "Start", "x": 0, "y": 0},
        "notebook": {},
        "access": {},
        "npc": [{"id": "npc1"}, {"id": "npc2"}],
    }
    r = await client.post("/game/save", json=payload)
    assert r.status_code == 200
    assert r.json() == {"ok": True}

    st = await get_state_from_db(db_pool)
    assert st["location"]["room"] == "Start"
    assert st["location"]["x"] == 0 and st["location"]["y"] == 0
    assert [n["id"] for n in st["npc"]] == ["npc1", "npc2"]


@pytest.mark.asyncio
async def test_game_save_allows_empty_body_uses_defaults(client: AsyncClient, db_pool):
    # SaveRequest inherits from SaveState which has defaults
    r = await client.post("/game/save", json={})
    assert r.status_code == 200

    st = await get_state_from_db(db_pool)
    assert st["location"]["room"] == "Start"
    assert isinstance(st["notebook"], dict)
    assert isinstance(st["access"], dict)
    assert isinstance(st["npc"], list)


# ---------- game/update ----------

@pytest.mark.asyncio
async def test_game_update_location_updates_room_and_coords(client: AsyncClient, db_pool):
    # Initialize state
    await client.post("/game/save", json={})

    r = await client.put("/game/update", json={"type": "location", "msg": {"room": "Lab", "x": 3, "y": 4}})
    assert r.status_code == 200
    assert r.json() == {"ok": True}

    st = await get_state_from_db(db_pool)
    assert st["location"]["room"] == "Lab"
    assert st["location"]["x"] == 3 and st["location"]["y"] == 4


@pytest.mark.asyncio
async def test_game_update_location_coerces_string_numbers_to_ints(client: AsyncClient, db_pool):
    await client.post("/game/save", json={})

    # msg values as strings; update logic coerces to int
    r = await client.put("/game/update", json={"type": "location", "msg": {"room": "Hall", "x": "9", "y": "10"}})
    assert r.status_code == 200

    st = await get_state_from_db(db_pool)
    assert st["location"]["room"] == "Hall"
    assert st["location"]["x"] == 9 and st["location"]["y"] == 10


@pytest.mark.asyncio
async def test_game_update_problem_idempotent_completion_log(client: AsyncClient, db_pool):
    await client.post("/game/save", json={})

    # First mark completion
    r1 = await client.put("/game/update", json={"type": "problem", "id": "p1"})
    assert r1.status_code == 200

    # Repeat same completion should be idempotent (no duplicates)
    r2 = await client.put("/game/update", json={"type": "problem", "id": "p1"})
    assert r2.status_code == 200

    st = await get_state_from_db(db_pool)
    bucket = st["notebook"].get("completed_problems", [])
    assert bucket == ["p1"]


@pytest.mark.asyncio
async def test_game_update_minigame_idempotent_completion_log(client: AsyncClient, db_pool):
    await client.post("/game/save", json={})

    await client.put("/game/update", json={"type": "minigame", "id": "m7"})
    await client.put("/game/update", json={"type": "minigame", "id": "m7"})

    st = await get_state_from_db(db_pool)
    bucket = st["notebook"].get("completed_minigames", [])
    assert bucket == ["m7"]


@pytest.mark.asyncio
async def test_game_update_rejects_unknown_type(client: AsyncClient):
    # Literal["problem","minigame","location","notebook","access","npc"]
    r = await client.put("/game/update", json={"type": "teleport", "msg": {"room": "Somewhere"}})
    assert r.status_code == 422  # Pydantic validation error


# ---------- game/sync  ----------

@pytest.mark.asyncio
async def test_game_sync_if_present(client: AsyncClient, db_pool):
    # Ensure state exists
    await client.post("/game/save", json={})

    r = await client.get("/game/sync")
    assert r.status_code == 200
    body = r.json()
    assert "location" in body and "notebook" in body and "access" in body and "npc" in body