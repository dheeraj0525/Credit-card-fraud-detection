from sqlalchemy.orm import Session
from app.services.fraud_scorer import score_transaction
from app.services.transaction_service import save_transaction

def batch_score_transactions(db: Session, transactions: list):
    results = []

    for tx in transactions:
        score = score_transaction(tx)

        tx_data = {
            "amount": tx["amount"],
            "fraud_probability": score["fraud_probability"],
            "risk_level": score["risk_level"]
        }

        saved_tx = save_transaction(db, tx_data)
        results.append(saved_tx)

    return results