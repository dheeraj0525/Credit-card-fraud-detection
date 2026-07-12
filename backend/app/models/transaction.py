from sqlalchemy import Column, Integer, Float, String, DateTime
from app.core.database import Base
from datetime import datetime

class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(Integer, primary_key=True)
    amount = Column(Float)
    fraud_probability = Column(Float)
    risk_level = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Audit & Review Fields
    status = Column(String, default="PENDING_REVIEW")  # PENDING_REVIEW, FLAGGED_FRAUD, FALSE_POSITIVE, APPROVED
    comments = Column(String, default="")
    audited_by = Column(String, default="")