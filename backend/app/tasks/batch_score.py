from sqlalchemy.orm import Session
from app.services.fraud_scorer import fraud_scorer
from app.services.transaction_service import save_transaction

def batch_score_transactions(db: Session, transactions: list):
    results = []

    for tx in transactions:
        # Call the score method on the fraud_scorer singleton instance
        score = fraud_scorer.score(tx)

        tx_data = {
            "amount": tx.get("Amount", tx.get("amount", 0.0)),
            "fraud_probability": score["fraud_probability"],
            "risk_level": score["risk_level"]
        }

        saved_tx = save_transaction(db, tx_data)
        results.append(saved_tx)

    return results