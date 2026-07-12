from fastapi import APIRouter

from app.schemas.transaction import (
    TransactionInput,
    FraudScoreResponse,
)

from app.services.fraud_scorer import fraud_scorer


router = APIRouter(
    prefix="/transactions",
    tags=["Transactions"],
)


@router.post(
    "/score",
    response_model=FraudScoreResponse,
)
def score_transaction(payload: TransactionInput):

    result = fraud_scorer.score(payload.model_dump())

    return FraudScoreResponse(
        fraud_probability=result["fraud_probability"],
        is_fraud=result["is_fraud"],
        risk_level=result["risk_level"],
    )