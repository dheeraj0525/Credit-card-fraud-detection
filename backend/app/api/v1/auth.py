from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
import re

from app.core.database import get_db
from app.schemas.auth import LoginRequest, Token, ForgotPasswordRequest, ResetPasswordRequest, RefreshRequest
from app.schemas.user import UserCreate
from app.models.user import User
from app.core.security import hash_password, verify_token, create_access_token, verify_refresh_token, create_refresh_token
from app.services.auth_service import auth_service

router = APIRouter(
    prefix="/auth",
    tags=["Authentication"]
)

def validate_password_strength(password: str) -> bool:
    # Enforces: At least 8 characters, 1 uppercase, 1 lowercase, 1 number, 1 special character
    if len(password) < 8:
        return False
    if not re.search(r"[A-Z]", password):
        return False
    if not re.search(r"[a-z]", password):
        return False
    if not re.search(r"[0-9]", password):
        return False
    if not re.search(r"[!@#$%^&*(),.?\":{}|<>]", password):
        return False
    return True

@router.post(
    "/login",
    response_model=Token
)
def login(credentials: LoginRequest, db: Session = Depends(get_db)):
    result = auth_service.login(
        db,
        credentials.username,
        credentials.password
    )

    if result is None:
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )

    if isinstance(result, dict) and result.get("lockout"):
        raise HTTPException(
            status_code=403,
            detail=f"Account temporarily locked out. Try again in {result['remaining_seconds']} seconds."
        )

    return result

@router.post(
    "/refresh",
    response_model=Token
)
def refresh_token(payload: RefreshRequest, db: Session = Depends(get_db)):
    token_data = verify_refresh_token(payload.refresh_token)
    if not token_data:
        raise HTTPException(
            status_code=401,
            detail="Invalid or expired refresh token."
        )

    email = token_data.get("sub")
    user = db.query(User).filter(User.email == email).first()
    if not user or not user.is_active:
        raise HTTPException(
            status_code=401,
            detail="User associated with token not found or inactive."
        )

    role = "ADMIN" if user.is_admin else ("ANALYST" if "analyst" in user.email.lower() else "USER")

    new_access = create_access_token(data={"sub": user.email, "role": role})
    new_refresh = create_refresh_token(data={"sub": user.email})

    return {
        "access_token": new_access,
        "refresh_token": new_refresh,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "email": user.email,
            "is_admin": user.is_admin,
            "role": role
        }
    }

@router.post(
    "/register",
    status_code=201
)
def register(user_in: UserCreate, db: Session = Depends(get_db)):
    exists = db.query(User).filter(User.email == user_in.email).first()
    if exists:
        raise HTTPException(
            status_code=400,
            detail="A user with this email address already exists."
        )

    if not validate_password_strength(user_in.password):
        raise HTTPException(
            status_code=400,
            detail="Password is too weak. It must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character."
        )

    new_user = User(
        email=user_in.email,
        hashed_password=hash_password(user_in.password),
        is_admin=False,
        is_active=True
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    return {
        "success": True,
        "message": "Registration successful",
        "email": new_user.email
    }

@router.post(
    "/forgot-password",
    status_code=200
)
def forgot_password(payload: ForgotPasswordRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == payload.email).first()
    if not user:
        raise HTTPException(
            status_code=404,
            detail="No account associated with this email address was found."
        )

    reset_token = create_access_token(
        data={"sub": user.email, "type": "reset"}
    )

    return {
        "success": True,
        "message": "Password reset token generated successfully.",
        "reset_token": reset_token
    }

@router.post(
    "/reset-password",
    status_code=200
)
def reset_password(payload: ResetPasswordRequest, db: Session = Depends(get_db)):
    token_data = verify_token(payload.token)
    if not token_data or token_data.get("type") != "reset":
        raise HTTPException(
            status_code=400,
            detail="The password reset link is invalid or has expired."
        )

    if not validate_password_strength(payload.new_password):
        raise HTTPException(
            status_code=400,
            detail="Password is too weak. It must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character."
        )

    email = token_data.get("sub")
    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise HTTPException(
            status_code=404,
            detail="User account associated with this token was not found."
        )

    user.hashed_password = hash_password(payload.new_password)
    db.commit()

    return {
        "success": True,
        "message": "Your password has been successfully reset."
    }