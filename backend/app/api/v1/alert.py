from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.transaction import Transaction
from app.models.user import User
from app.core.security_dep import get_current_user

router = APIRouter(prefix="/alerts", tags=["Alerts"])

@router.get("/high-risk")
def high_risk_alerts(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return (
        db.query(Transaction)
        .filter(Transaction.risk_level == "HIGH")
        .order_by(Transaction.created_at.desc())
        .all()
    )