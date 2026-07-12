from sqlalchemy import Column, Integer, Float, String, DateTime
import datetime as dt
from app.core.database import Base

class NotificationLog(Base):
    __tablename__ = "notification_logs"

    id = Column(Integer, primary_key=True, index=True)
    customer_name = Column(String)
    account_number = Column(String)
    transaction_id = Column(String)
    amount = Column(Float)
    merchant = Column(String)
    location = Column(String)
    datetime = Column(DateTime)  # Transaction time
    ml_risk_score = Column(Float)
    behavioural_risk_score = Column(Float)
    shap_summary = Column(String)
    recommendation = Column(String)
    status = Column(String, default="PENDING")  # SENT, FAILED, PENDING
    created_at = Column(DateTime, default=dt.datetime.utcnow)
