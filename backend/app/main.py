from fastapi import FastAPI, HTTPException
from fastapi.responses import FileResponse, JSONResponse
from pydantic import BaseModel
import os
import uvicorn

from app.services.fraud_scorer import fraud_scorer
from app.api.router import api_router

app.include_router(api_router)
# ----------------------------------
# FastAPI App
# ----------------------------------
app = FastAPI(
    title="Credit Card Fraud Detection API",
    description="ML-powered fraud detection using XGBoost",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json"
)

# ----------------------------------
# Root
# ----------------------------------
@app.get("/")
def root():
    return {
        "service": "fraud-detection",
        "status": "running"
    }

# ----------------------------------
# Health Check
# ----------------------------------
@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "model_loaded": True
    }

# ----------------------------------
# Favicon
# ----------------------------------
@app.get("/favicon.ico", include_in_schema=False)
def favicon():
    favicon_path = os.path.join(
        os.path.dirname(__file__),
        "static",
        "favicon.ico"
    )

    if os.path.exists(favicon_path):
        return FileResponse(favicon_path)

    return JSONResponse(status_code=204, content={})

# ----------------------------------
# Input Schema
# ----------------------------------
class TransactionInput(BaseModel):
    Time: float
    V1: float
    V2: float
    V3: float
    V4: float
    V5: float
    V6: float
    V7: float
    V8: float
    V9: float
    V10: float
    V11: float
    V12: float
    V13: float
    V14: float
    V15: float
    V16: float
    V17: float
    V18: float
    V19: float
    V20: float
    V21: float
    V22: float
    V23: float
    V24: float
    V25: float
    V26: float
    V27: float
    V28: float
    Amount: float

# ----------------------------------
# Fraud Prediction
# ----------------------------------
@app.post("/predict")
def predict_fraud(transaction: TransactionInput):
    try:
        result = fraud_scorer.score(transaction.dict())
        return {
            "success": True,
            "result": result
        }

    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Internal server error: {str(e)}"
        )

# ----------------------------------
# Local Run
# ----------------------------------
if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True
    )