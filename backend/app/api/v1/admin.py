from fastapi import APIRouter

router = APIRouter(prefix="/admin", tags=["Admin"])

@router.get("/health")
def system_health():
    return {
        "api_status": "UP",
        "ml_model": "xgboost_v1.pkl",
        "version": "1.0.0"
    }