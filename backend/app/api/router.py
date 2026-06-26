from fastapi import APIRouter

from app.api.v1.transactions import router as transaction_router
from app.api.v1.auth import router as auth_router
from app.api.v1.analytics import router as analytics_router

api_router = APIRouter(prefix="/api")

api_router.include_router(transaction_router, prefix="/transactions", tags=["Transactions"])
api_router.include_router(auth_router, prefix="/auth", tags=["Auth"])
api_router.include_router(analytics_router, prefix="/analytics", tags=["Analytics"])