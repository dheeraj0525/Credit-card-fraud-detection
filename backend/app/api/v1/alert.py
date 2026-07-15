from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel
from datetime import datetime

from app.core.database import get_db
from app.models.transaction import Transaction
from app.models.wachlist import WatchList
from app.models.user import User
from app.core.dependencies import get_current_user

router = APIRouter(prefix="/alerts", tags=["Alerts"])

class WatchlistCreate(BaseModel):
    identifier: str
    reason: str

@router.get("/high-risk")
def high_risk_alerts(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return (
        db.query(Transaction)
        .filter(Transaction.risk_level == "HIGH")
        .order_by(Transaction.created_at.desc())
        .all()
    )

@router.get("/watchlist")
def get_watchlist(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return db.query(WatchList).order_by(WatchList.added_at.desc()).all()

@router.post("/watchlist", status_code=201)
def add_to_watchlist(payload: WatchlistCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    exists = db.query(WatchList).filter(WatchList.identifier == payload.identifier).first()
    if exists:
        raise HTTPException(status_code=400, detail="Identifier is already on the watchlist")
    
    entry = WatchList(
        identifier=payload.identifier,
        reason=payload.reason,
        added_at=datetime.utcnow()
    )
    db.add(entry)
    db.commit()
    db.refresh(entry)
    return entry

@router.delete("/watchlist/{entry_id}")
def delete_from_watchlist(entry_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    entry = db.query(WatchList).filter(WatchList.id == entry_id).first()
    if not entry:
        raise HTTPException(status_code=404, detail="Watchlist entry not found")
    db.delete(entry)
    db.commit()
    return {"success": True, "message": "Watchlist entry removed successfully"}