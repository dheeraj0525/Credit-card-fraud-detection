from sqlalchemy.orm import Session
from app.models.transaction import Transaction

def save_transaction(db: Session, data: dict):
    tx = Transaction(**data)
    db.add(tx)
    db.commit()
    db.refresh(tx)
    return tx