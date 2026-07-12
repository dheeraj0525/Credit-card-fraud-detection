from fastapi import APIRouter

from app.api.v1.transactions import router as transaction_router
from app.api.v1.auth import router as auth_router
from app.api.v1.analytics import router as analytics_router
from app.api.v1.admin import router as admin_router
from app.api.v1.alert import router as alert_router
from app.api.v1.user import router as user_router
from app.api.v1.bank_analysis import router as bank_router
from app.api.v1.notifications import router as notification_router

api_router = APIRouter(prefix="/api")

api_router.include_router(auth_router)
api_router.include_router(transaction_router)
api_router.include_router(analytics_router)
api_router.include_router(admin_router)
api_router.include_router(alert_router)
api_router.include_router(user_router)
api_router.include_router(bank_router)
api_router.include_router(notification_router)