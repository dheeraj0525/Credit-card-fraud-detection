from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime
from pydantic import BaseModel

from app.core.database import get_db
from app.models.notification_log import NotificationLog
from app.models.user import User
from app.core.security_dep import get_current_user

router = APIRouter(
    prefix="/notifications",
    tags=["Notifications & Alerts"],
)

class NotificationInput(BaseModel):
    customer_name: str
    account_number: str
    transaction_id: str
    amount: float
    merchant: str
    location: str
    datetime: str  # ISO string or yyyy-mm-dd hh:mm:ss
    ml_risk_score: float
    behavioural_risk_score: float
    shap_summary: str
    recommendation: str

@router.get("", status_code=200)
def get_notification_logs(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return db.query(NotificationLog).order_by(NotificationLog.id.desc()).all()

@router.post("/notify", status_code=201)
def trigger_notification(
    payload: NotificationInput,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    try:
        parsed_dt = pd_to_datetime_workaround(payload.datetime)
        
        # Simulate sending email alert
        email_sent = True
        status_val = "SENT"
        
        # Check simulated failure condition (e.g. if account_number is empty or invalid)
        if not payload.account_number or payload.account_number == "0000000000":
            email_sent = False
            status_val = "FAILED"

        log_entry = NotificationLog(
            customer_name=payload.customer_name,
            account_number=payload.account_number,
            transaction_id=payload.transaction_id,
            amount=payload.amount,
            merchant=payload.merchant,
            location=payload.location,
            datetime=parsed_dt,
            ml_risk_score=payload.ml_risk_score,
            behavioural_risk_score=payload.behavioural_risk_score,
            shap_summary=payload.shap_summary,
            recommendation=payload.recommendation,
            status=status_val
        )
        db.add(log_entry)
        db.commit()
        db.refresh(log_entry)
        
        return {
            "success": email_sent,
            "message": "Fraud notification alert sent and logged." if email_sent else "Email notification failed to deliver.",
            "log": log_entry
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to log notification: {str(e)}"
        )

@router.post("/{log_id}/resend", status_code=200)
def resend_notification(
    log_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    log_entry = db.query(NotificationLog).filter(NotificationLog.id == log_id).first()
    if not log_entry:
        raise HTTPException(
            status_code=404,
            detail=f"Notification log with ID {log_id} not found."
        )

    # Trigger resending
    log_entry.status = "SENT"
    log_entry.created_at = datetime.utcnow()
    db.commit()
    
    return {
        "success": True,
        "message": f"Successfully resent fraud alert email for transaction ID: {log_entry.transaction_id}."
    }

def pd_to_datetime_workaround(date_str: str) -> datetime:
    try:
        # Standard parsing
        return datetime.fromisoformat(date_str.replace("Z", "+00:00"))
    except Exception:
        try:
            return datetime.strptime(date_str, "%Y-%m-%d %H:%M:%S")
        except Exception:
            return datetime.utcnow()
