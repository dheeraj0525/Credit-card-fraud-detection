from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.schemas.transaction import TransactionInput, FraudScoreResponse
from app.services.fraud_scorer import fraud_scorer
from app.services.transaction_service import save_transaction

router = APIRouter(
    prefix="/transactions",
    tags=["Transactions"],
)

@router.post(
    "/score",
    response_model=FraudScoreResponse,
)
def score_transaction(payload: TransactionInput, db: Session = Depends(get_db)):
    result = fraud_scorer.score(payload.model_dump())

    # Save transaction details in database
    tx_data = {
        "amount": payload.Amount,
        "fraud_probability": result["fraud_probability"],
        "risk_level": result["risk_level"]
    }
    save_transaction(db, tx_data)

    return FraudScoreResponse(
        fraud_probability=result["fraud_probability"],
        is_fraud=result["is_fraud"],
        risk_level=result["risk_level"],
    )