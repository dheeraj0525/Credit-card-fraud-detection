from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel
from datetime import datetime

from app.core.database import get_db
from app.models.case_management import FraudCase
from app.models.transaction import Transaction
from app.models.user import User
from app.core.security_dep import get_current_user

router = APIRouter(
    prefix="/cases",
    tags=["Fraud Cases Management"]
)

class CaseUpdateInput(BaseModel):
    assigned_to: str
    status: str
    notes: str

@router.get("", status_code=200)
def get_cases(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    cases = db.query(FraudCase).all()
    results = []
    
    # Enrich with transaction details
    for case in cases:
        tx = db.query(Transaction).filter(Transaction.id == case.transaction_id).first()
        results.append({
            "id": case.id,
            "transaction_id": case.transaction_id,
            "assigned_to": case.assigned_to,
            "status": case.status,
            "notes": case.notes,
            "updated_at": case.updated_at,
            "amount": tx.amount if tx else 0.0,
            "fraud_probability": tx.fraud_probability if tx else 0.0
        })
    return results

@router.put("/{case_id}", status_code=200)
def update_case(
    case_id: int,
    payload: CaseUpdateInput,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    case = db.query(FraudCase).filter(FraudCase.id == case_id).first()
    if not case:
        raise HTTPException(
            status_code=404,
            detail=f"Case ID {case_id} not found."
        )
        
    case.assigned_to = payload.assigned_to
    case.status = payload.status
    case.notes = payload.notes
    case.updated_at = datetime.utcnow()
    
    # Auto update corresponding transaction status if closing case
    tx = db.query(Transaction).filter(Transaction.id == case.transaction_id).first()
    if tx:
        if case.status == "CLOSED_FRAUD":
            tx.status = "FLAGGED_FRAUD"
        elif case.status == "CLOSED_RESOLVED":
            tx.status = "APPROVED"
        tx.comments = f"Case closed. Analyst notes: {case.notes}"
        tx.audited_by = current_user.email

    db.commit()
    return {
        "success": True,
        "message": f"Successfully updated case status to {case.status}.",
        "case": {
            "id": case.id,
            "status": case.status,
            "assigned_to": case.assigned_to
        }
    }
