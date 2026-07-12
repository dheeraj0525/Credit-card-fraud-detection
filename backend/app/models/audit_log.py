from sqlalchemy import Column, Integer, String, DateTime
from app.core.database import Base
from datetime import datetime

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True)
    action = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)