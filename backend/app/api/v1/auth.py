from fastapi import APIRouter, HTTPException

from app.schemas.auth import (
    LoginRequest,
    Token
)

from app.services.auth_service import auth_service

router = APIRouter(
    prefix="/auth",
    tags=["Authentication"]
)


@router.post(
    "/login",
    response_model=Token
)
def login(credentials: LoginRequest):

    result = auth_service.login(
        credentials.username,
        credentials.password
    )

    if result is None:
        raise HTTPException(
            status_code=401,
            detail="Invalid username or password"
        )

    return result