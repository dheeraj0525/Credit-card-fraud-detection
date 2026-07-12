from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.schemas.auth import LoginRequest, Token
from app.schemas.user import UserCreate
from app.models.user import User
from app.core.security import hash_password
from app.services.auth_service import auth_service

router = APIRouter(
    prefix="/auth",
    tags=["Authentication"]
)

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

    return result

@router.post(
    "/register",
    status_code=201
)
def register(user_in: UserCreate, db: Session = Depends(get_db)):
    # Check if user already exists
    exists = db.query(User).filter(User.email == user_in.email).first()
    if exists:
        raise HTTPException(
            status_code=400,
            detail="A user with this email address already exists."
        )

    # Create new active non-admin user
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