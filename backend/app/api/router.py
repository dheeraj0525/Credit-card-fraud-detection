from fastapi import APIRouter

from app.api.v1.transactions import router as transaction_router
from app.api.v1.auth import router as auth_router
from app.api.v1.analytics import router as analytics_router
from app.api.v1.admin import router as admin_router
from app.api.v1.alert import router as alert_router
from app.api.v1.user import router as user_router
from app.api.v1.bank_analysis import router as bank_router
from app.api.v1.notifications import router as notification_router
from app.api.v1.config import router as config_router
from app.api.v1.cases import router as cases_router
from app.api.v1.model_monitoring import router as model_monitoring_router
from app.api.v1.files import router as files_router
from app.api.v1.monitoring import router as monitoring_router

api_router = APIRouter(prefix="/api")

api_router.include_router(auth_router)
api_router.include_router(transaction_router)
api_router.include_router(analytics_router)
api_router.include_router(admin_router)
api_router.include_router(alert_router)
api_router.include_router(user_router)
api_router.include_router(bank_router)
api_router.include_router(notification_router)
api_router.include_router(config_router)
api_router.include_router(cases_router)
api_router.include_router(model_monitoring_router)
api_router.include_router(files_router)
api_router.include_router(monitoring_router)