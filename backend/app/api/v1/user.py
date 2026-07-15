from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.core.database import get_db
from app.models.user import User
from app.schemas.user import UserOut
from app.core.dependencies import get_admin_user

router = APIRouter(prefix="/users", tags=["Users"])

@router.get("/", response_model=List[UserOut])
def list_users(db: Session = Depends(get_db), current_user: User = Depends(get_admin_user)):
    return db.query(User).all()

@router.put("/{user_id}/block")
def block_user(user_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_admin_user)):
    # SQLAlchemy 2.0 style retrieval
    user = db.get(User, user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    user.is_active = False
    db.commit()
    return {"message": f"User {user.email} blocked successfully"}