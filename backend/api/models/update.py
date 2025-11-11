from pydantic import BaseModel
from typing import Optional, Dict, Any, Literal

class UpdateEvent(BaseModel):
    type: Literal["problem", "minigame", "location", "notebook", "access", "npc"]
    id: Optional[str] = None
    msg: Optional[str] = None
    value: Optional[Dict[str, Any]] = None
