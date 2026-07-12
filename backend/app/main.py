from fastapi import FastAPI, HTTPException, Depends
from fastapi.responses import FileResponse, JSONResponse
from pydantic import BaseModel
import os
import uvicorn
import logging
from contextlib import asynccontextmanager
from sqlalchemy.orm import Session

from app.services.fraud_scorer import fraud_scorer
from app.services.transaction_service import save_transaction
from app.core.database import get_db
from app.api.router import api_router

# ----------------------------------
# Logging Setup
# ----------------------------------
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("fraudsense")

# ----------------------------------
# Lifespan Context Manager (DB initialization & seeding)
# ----------------------------------
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize DB tables
    logger.info("Initializing database tables...")
    from app.core.database import engine, Base
    import app.models  # ensure models are registered
    Base.metadata.create_all(bind=engine)

    # Seed Admin User
    from app.core.database import SessionLocal
    from app.models.user import User
    from app.core.security import hash_password

    db = SessionLocal()
    try:
        admin_email = "admin@fraudsense.com"
        exists = db.query(User).filter(User.email == admin_email).first()
        if not exists:
            admin_user = User(
                email=admin_email,
                hashed_password=hash_password("admin123"),
                is_admin=True,
                is_active=True
            )
            db.add(admin_user)
            db.commit()
            logger.info("Default admin user seeded successfully.")
        else:
            logger.info("Admin user already exists.")
    except Exception as e:
        logger.error(f"Error during db seeding: {e}")
    finally:
        db.close()

    yield

# ----------------------------------
# FastAPI App
# ----------------------------------
app = FastAPI(
    title="Credit Card Fraud Detection API",
    description="ML-powered fraud detection using XGBoost",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
    lifespan=lifespan
)

# Register Router (defined AFTER app initialization to prevent NameError)
app.include_router(api_router)

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
def predict_fraud(transaction: TransactionInput, db: Session = Depends(get_db)):
    try:
        result = fraud_scorer.score(transaction.model_dump())
        
        # Save prediction results to database
        tx_data = {
            "amount": transaction.Amount,
            "fraud_probability": result["fraud_probability"],
            "risk_level": result["risk_level"]
        }
        save_transaction(db, tx_data)

        return {
            "success": True,
            "result": result
        }

    except ValueError as e:
        logger.warning(f"Validation error in predict: {e}")
        raise HTTPException(status_code=400, detail=str(e))

    except Exception as e:
        logger.error(f"Internal server error in predict: {e}")
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