from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime
import time

from app.core.database import get_db
from app.models.in_app_notification import InAppNotification
from app.models.user import User
from app.core.security_dep import get_current_user

router = APIRouter(
    prefix="/monitoring",
    tags=["Observability & Metrics"]
)

# Global metrics cache for request counts (simulating Prometheus counters)
METRICS_CACHE = {
    "total_api_requests": 1420,
    "total_errors": 4,
    "active_sessions": 3,
    "last_ml_inference_latency_ms": 12.4
}

@router.get("/metrics", status_code=200)
def get_metrics(current_user: User = Depends(get_current_user)):
    # Simulating dynamic variance in CPU/Memory usage
    import random
    cpu_pct = round(random.uniform(5.5, 18.2), 1)
    memory_pct = round(random.uniform(34.2, 38.6), 1)
    
    METRICS_CACHE["total_api_requests"] += 1
    
    return {
        "cpu_usage_pct": cpu_pct,
        "memory_usage_pct": memory_pct,
        "total_requests_processed": METRICS_CACHE["total_api_requests"],
        "error_count": METRICS_CACHE["total_errors"],
        "active_sessions_count": METRICS_CACHE["active_sessions"],
        "avg_ml_inference_latency_ms": METRICS_CACHE["last_ml_inference_latency_ms"],
        "uptime_seconds": 18200
    }

@router.get("/notifications", status_code=200)
def get_in_app_notifications(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return db.query(InAppNotification).order_by(InAppNotification.id.desc()).limit(50).all()

@router.put("/notifications/{notif_id}/read", status_code=200)
def mark_notification_read(
    notif_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    notif = db.query(InAppNotification).filter(InAppNotification.id == notif_id).first()
    if not notif:
        raise HTTPException(
            status_code=404,
            detail=f"Notification {notif_id} not found."
        )
        
    notif.read = True
    db.commit()
    return {
        "success": True,
        "message": "Notification marked as read."
    }
