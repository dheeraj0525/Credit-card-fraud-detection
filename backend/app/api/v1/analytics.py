from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.services.analytics_service import fraud_summary
from app.models.user import User
from app.core.dependencies import get_current_user

router = APIRouter(tags=["Analytics"])

@router.get("/stats")
def stats(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return fraud_summary(db)