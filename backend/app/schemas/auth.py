from pydantic import BaseModel
from typing import Optional

class LoginRequest(BaseModel):
    username: str
    password: str

class Token(BaseModel):
    access_token: str
    refresh_token: Optional[str] = None
    token_type: str
    user: dict

class ForgotPasswordRequest(BaseModel):
    email: str

class RefreshRequest(BaseModel):
    refresh_token: str

class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str