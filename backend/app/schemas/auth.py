from pydantic import BaseModel, EmailStr

class LoginRequest(BaseModel):
    username: str  # OAuth2/JWT standard uses username (maps to email here)
    password: str

class UserResponse(BaseModel):
    id: int
    email: EmailStr
    is_admin: bool

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse