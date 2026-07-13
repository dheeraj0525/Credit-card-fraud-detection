from sqlalchemy import Column, Integer, String, DateTime
from datetime import datetime
from app.core.database import Base

class FraudCase(Base):
    __tablename__ = "fraud_cases"

    id = Column(Integer, primary_key=True, index=True)
    transaction_id = Column(Integer, index=True)
    assigned_to = Column(String, default="")  # Analyst email
    status = Column(String, default="OPEN")    # OPEN, UNDER_INVESTIGATION, CLOSED_RESOLVED, CLOSED_FRAUD
    notes = Column(String, default="")        # Discussion / logs notes
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
