from pydantic import BaseModel, ConfigDict, Field

class RegisterRequest(BaseModel):
    email: str = Field(alias="user", min_length=1)
    password: str = Field(alias="pass", min_length=1)

    model_config = ConfigDict(populate_by_name=True)

class RegisterResponse(BaseModel):
    ok: bool
    message: str
