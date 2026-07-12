from sqlalchemy import Column, Integer, String, DateTime
from datetime import datetime
from app.core.database import Base

class WatchList(Base):
    __tablename__ = "watchlist"

    id = Column(Integer, primary_key=True, index=True)
    identifier = Column(String, unique=True, index=True)
    reason = Column(String)
    added_at = Column(DateTime, default=datetime.utcnow)
