from pydantic import BaseModel, Field
from typing import Any, Dict, List, Optional

class Location(BaseModel):
    room: str = "Start"   # was ""
    x: int = 0
    y: int = 0

class Npc(BaseModel):
    id: str
    state: Dict[str, Any] = Field(default_factory=dict)

class SaveState(BaseModel):
    location: Location = Field(default_factory=Location)
    notebook: Dict[str, Any] = Field(default_factory=dict)
    access: Dict[str, Any] = Field(default_factory=dict)
    npc: List[Npc] = Field(default_factory=list)

class SyncResponse(SaveState):
    pass

class SaveRequest(SaveState):
    pass

class OkResponse(BaseModel):
    ok: bool = True
