
from typing import Dict, Any
import pytest
from fastapi.testclient import TestClient
from main import app
from repo import saves as saves_repo

client = TestClient(app)


# ---------- helpers ----------

def reset_store():
    """Clear in-memory saves so tests don't leak state."""
    if hasattr(saves_repo, "_STORE"):
        saves_repo._STORE.clear() 


def get_state_for(username: str = "demo"):
    """Convenience accessor for current saved state (bypasses API if /game/sync not present)."""
    return saves_repo.get_save(username)


# ---------- fixtures ----------

@pytest.fixture(autouse=True)
def _isolate_store():
    reset_store()
    yield
    reset_store()


# ---------- health ----------

def test_health_head_ok():
    r = client.head("/health")
    assert r.status_code == 200
    # HEAD should not return a body
    assert r.text == ""


# ---------- game/save ----------

def test_game_save_accepts_full_payload_and_persists_defaults():
    payload: Dict[str, Any] = {
        "location": {"room": "Start", "x": 0, "y": 0},
        "notebook": {},
        "access": {},
        "npc": [{"id": "npc1"}, {"id": "npc2"}],
    }
    r = client.post("/game/save", json=payload)
    assert r.status_code == 200
    assert r.json() == {"ok": True}

    st = get_state_for()
    assert st.location.room == "Start"
    assert st.location.x == 0 and st.location.y == 0
    assert [n.id for n in st.npc] == ["npc1", "npc2"]


def test_game_save_allows_empty_body_uses_defaults():
    r = client.post("/game/save", json={})
    assert r.status_code == 200

    st = get_state_for()
    assert st.location.room == "Start"
    assert isinstance(st.notebook, dict)
    assert isinstance(st.access, dict)
    assert isinstance(st.npc, list)


# ---------- game/update ----------

def test_game_update_location_updates_room_and_coords():
    client.post("/game/save", json={})

    r = client.put("/game/update", json={"type": "location", "msg": {"room": "Lab", "x": 3, "y": 4}})
    assert r.status_code == 200
    assert r.json() == {"ok": True}

    st = get_state_for()
    assert st.location.room == "Lab"
    assert st.location.x == 3 and st.location.y == 4


def test_game_update_location_coerces_string_numbers_to_ints():
    client.post("/game/save", json={})

    # msg values as strings; repo.apply_update coerces to int with int(...)
    r = client.put("/game/update", json={"type": "location", "msg": {"room": "Hall", "x": "9", "y": "10"}})
    assert r.status_code == 200

    st = get_state_for()
    assert st.location.room == "Hall"
    assert st.location.x == 9 and st.location.y == 10


def test_game_update_problem_idempotent_completion_log():
    client.post("/game/save", json={})

    # First mark completion
    r1 = client.put("/game/update", json={"type": "problem", "id": "p1"})
    assert r1.status_code == 200

    # Repeat same completion should be idempotent (no duplicates)
    r2 = client.put("/game/update", json={"type": "problem", "id": "p1"})
    assert r2.status_code == 200

    st = get_state_for()
    bucket = st.notebook.get("completed_problems", [])
    assert bucket == ["p1"]


def test_game_update_minigame_idempotent_completion_log():
    client.post("/game/save", json={})

    client.put("/game/update", json={"type": "minigame", "id": "m7"})
    client.put("/game/update", json={"type": "minigame", "id": "m7"})

    st = get_state_for()
    bucket = st.notebook.get("completed_minigames", [])
    assert bucket == ["m7"]


def test_game_update_rejects_unknown_type():
    # Literal["problem","minigame","location","notebook","access","npc"]
    r = client.put("/game/update", json={"type": "teleport", "msg": {"room": "Somewhere"}})
    assert r.status_code == 422  # Pydantic validation error


# ---------- game/sync  ----------

def test_game_sync_if_present():
    r = client.get("/game/sync")
    if r.status_code == 404:
        pytest.skip("`/game/sync` not implemented yet")

    assert r.status_code == 200
    body = r.json()
    assert "location" in body and "notebook" in body and "access" in body and "npc" in body