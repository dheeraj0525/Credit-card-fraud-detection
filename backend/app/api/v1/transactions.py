from fastapi import APIRouter, Depends, UploadFile, File, HTTPException, status
from sqlalchemy.orm import Session
import pandas as pd
import io

from app.core.database import get_db
from app.schemas.transaction import TransactionInput, FraudScoreResponse
from app.services.fraud_scorer import fraud_scorer, FEATURE_COLUMNS
from app.services.transaction_service import save_transaction
from app.tasks.batch_score import batch_score_transactions
from app.models.user import User
from app.models.transaction import Transaction
from app.core.security_dep import get_current_user

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

@router.post(
    "/upload",
    status_code=200
)
def upload_transactions(file: UploadFile = File(...), db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    # 1. Validate file extension
    if not file.filename.endswith(".csv"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid file format. Please upload a CSV file."
        )

    try:
        # 2. Read file contents
        contents = file.file.read()
        df = pd.read_csv(io.BytesIO(contents))
        
        # 3. Check for required features
        missing_cols = set(FEATURE_COLUMNS) - set(df.columns)
        if missing_cols:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"CSV file is missing required columns: {sorted(list(missing_cols))}"
            )

        # 4. Convert dataframe rows to records
        records = df.to_dict(orient="records")
        if not records:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="The uploaded CSV file contains no transaction records."
            )

        # Limit batch size to prevent server timeout
        if len(records) > 5000:
            records = records[:5000]
            truncated = True
        else:
            truncated = False

        # 5. Score transactions in batch
        scored_txs = batch_score_transactions(db, records)

        # 6. Calculate summary counts
        total_scored = len(scored_txs)
        total_fraud = sum(1 for tx in scored_txs if tx.risk_level == "HIGH")

        return {
            "success": True,
            "filename": file.filename,
            "total_records_processed": total_scored,
            "fraud_alerts_detected": total_fraud,
            "truncated": truncated,
            "message": f"Successfully processed {total_scored} transactions."
        }

    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error processing CSV: {str(e)}"
        )

@router.get(
    "/history",
    status_code=200
)
def get_transaction_history(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    # Return last 150 transaction evaluations, ordered by id desc
    return (
        db.query(Transaction)
        .order_by(Transaction.id.desc())
        .limit(150)
        .all()
    )