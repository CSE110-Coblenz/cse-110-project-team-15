from pydantic import BaseModel, ConfigDict, Field

class Credentials(BaseModel):
    email: str = Field(alias="user", min_length=1)
    password: str = Field(alias="pass", min_length=1)

    model_config = ConfigDict(populate_by_name=True)

class RegisterRequest(Credentials):
    pass

class LoginRequest(Credentials):
    pass

class AuthResponse(BaseModel):
    ok: bool
    message: str

class OkMessage(BaseModel):
    ok: bool
    message: str