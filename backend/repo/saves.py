from typing import Dict

from models.save import SaveState, Location, Npc

# In-memory store keyed by username
_STORE: Dict[str, SaveState] = {}

def get_default_state() -> SaveState:
    return SaveState(
        location=Location(room="Start", x=0, y=0),
        notebook={},
        access={},
        npc=[Npc(id="npc1"), Npc(id="npc2")]
    )

def get_save(username: str) -> SaveState:
    if username not in _STORE:
        _STORE[username] = get_default_state()
    return _STORE[username]

def upsert_save(username: str, state: SaveState) -> None:
    _STORE[username] = state

def apply_update(username: str, *, type: str, id: str | None, msg) -> None:
    s = get_save(username)
    if type == "location" and isinstance(msg, dict):
        s.location.room = msg.get("room", s.location.room)
        s.location.x = int(msg.get("x", s.location.x))
        s.location.y = int(msg.get("y", s.location.y))
    elif type in ("problem", "minigame") and id:
        # mark completion idempotently in notebook/access
        key = f"completed_{type}s"
        bucket = s.notebook.setdefault(key, [])
        if id not in bucket:
            bucket.append(id)
    _STORE[username] = s