from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.transaction import Transaction

router = APIRouter(prefix="/alerts", tags=["Alerts"])

@router.get("/high-risk")
def high_risk_alerts(db: Session = Depends(get_db)):
    return (
        db.query(Transaction)
        .filter(Transaction.risk_level == "High")
        .order_by(Transaction.created_at.desc())
        .all()
    )