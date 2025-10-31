from typing import Any, Literal, Optional
from pydantic import BaseModel

UpdateType = Literal["problem", "minigame", "location"]

class UpdateEvent(BaseModel):
    type: UpdateType
    id: Optional[str] = None
    msg: Optional[Any] = None