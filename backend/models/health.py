from pydantic import BaseModel

class HealthResponse(BaseModel):
    ok: bool
    db_status: str
