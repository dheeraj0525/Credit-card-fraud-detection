from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
from datetime import datetime

from app.core.database import get_db
from app.models.user import User
from app.models.transaction import Transaction
from app.models.audit_log import AuditLog
from app.core.security_dep import get_admin_user, get_current_user

router = APIRouter(prefix="/admin", tags=["Admin Control Panel"])

class ReviewInput(BaseModel):
    status: str      # FLAGGED_FRAUD, FALSE_POSITIVE, APPROVED
    comments: str

@router.get("/health")
def system_health():
    return {
        "api_status": "UP",
        "ml_model": "xgboost_v1.pkl",
        "version": "1.0.0"
    }

@router.get("/audit-logs", status_code=200)
def get_audit_logs(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_admin_user)
):
    return db.query(AuditLog).order_by(AuditLog.id.desc()).limit(200).all()

@router.get("/model-performance", status_code=200)
def get_model_performance(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return {
        "version": "xgboost_v1.pkl",
        "roc_auc": 0.965,
        "accuracy": 0.999,
        "precision": 0.887,
        "recall": 0.825,
        "confusion_matrix": {
            "tp": 85,
            "fn": 15,
            "fp": 11,
            "tn": 56860
        }
    }

@router.get("/fraud-rules", status_code=200)
def get_fraud_rules(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return [
        {
            "id": 1,
            "name": "Excessive Single Amount",
            "condition": "Transaction Amount > $10,000.00",
            "score_boost": 0.35,
            "status": "ACTIVE"
        },
        {
            "id": 2,
            "name": "Impossible Velocity (Travel)",
            "condition": "Location mismatch within 1 hour interval",
            "score_boost": 0.50,
            "status": "ACTIVE"
        },
        {
            "id": 3,
            "name": "New Merchant Anomaly",
            "condition": "Merchant not found in historical profiles",
            "score_boost": 0.15,
            "status": "ACTIVE"
        },
        {
            "id": 4,
            "name": "Spike Frequency Deviation",
            "condition": "More than 5 transactions in 10 minutes",
            "score_boost": 0.40,
            "status": "ACTIVE"
        }
    ]

@router.put("/transactions/{tx_id}/review", status_code=200)
def review_transaction(
    tx_id: int,
    payload: ReviewInput,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    tx = db.query(Transaction).filter(Transaction.id == tx_id).first()
    if not tx:
        raise HTTPException(
            status_code=404,
            detail=f"Transaction ID {tx_id} not found."
        )

    # 1. Update review status
    tx.status = payload.status
    tx.comments = payload.comments
    tx.audited_by = current_user.email

    # 2. Add audit log entry
    log_msg = f"User {current_user.email} audited Transaction {tx_id} as {payload.status}."
    audit_entry = AuditLog(action=log_msg)
    db.add(audit_entry)

    db.commit()
    db.refresh(tx)

    return {
        "success": True,
        "message": f"Successfully reviewed transaction {tx_id} as {payload.status}.",
        "transaction": tx
    }