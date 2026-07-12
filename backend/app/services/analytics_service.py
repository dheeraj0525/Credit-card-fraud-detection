from sqlalchemy.orm import Session
from sqlalchemy import func
from app.models.transaction import Transaction

def fraud_summary(db: Session):
    total = db.query(func.count(Transaction.id)).scalar()
    high_risk = db.query(func.count(Transaction.id)) \
        .filter(Transaction.risk_level == "HIGH") \
        .scalar()

    avg_fraud_score = db.query(
        func.avg(Transaction.fraud_probability)
    ).scalar()

    return {
        "total_transactions": total,
        "high_risk_transactions": high_risk,
        "average_fraud_probability": round(avg_fraud_score or 0, 3)
    }