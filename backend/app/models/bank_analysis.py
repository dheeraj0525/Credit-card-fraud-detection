from sqlalchemy import Column, Integer, Float, String, DateTime
from app.core.database import Base

class BankTransaction(Base):
    __tablename__ = "bank_transactions"

    id = Column(Integer, primary_key=True, index=True)
    customer_id = Column(String, index=True)
    date = Column(DateTime)
    amount = Column(Float)
    merchant = Column(String)
    location = Column(String)
    time = Column(String)  # Time of day (e.g., "14:30")


class BehaviouralProfile(Base):
    __tablename__ = "behavioural_profiles"

    id = Column(Integer, primary_key=True, index=True)
    customer_id = Column(String, unique=True, index=True)
    avg_spending = Column(Float, default=0.0)
    max_spending = Column(Float, default=0.0)
    min_spending = Column(Float, default=0.0)
    avg_daily_spending = Column(Float, default=0.0)
    avg_monthly_spending = Column(Float, default=0.0)
    common_merchants = Column(String, default="[]")  # JSON string serialized list
    common_locations = Column(String, default="[]")  # JSON string serialized list
    common_times = Column(String, default="[]")      # JSON string serialized list
    weekend_ratio = Column(Float, default=0.0)       # Ratio of weekend to total spending
    tx_frequency = Column(Float, default=0.0)        # Average transactions per week
