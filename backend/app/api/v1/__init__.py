from .auth import router as auth_router
from .transactions import router as transaction_router
from .analytics import router as analytics_router
from .admin import router as admin_router
from .alert import router as alert_router
from .user import router as user_router

def register_v1_routes(app):
    app.include_router(auth_router)
    app.include_router(user_router)
    app.include_router(transaction_router)
    app.include_router(analytics_router)
    app.include_router(alert_router)
    app.include_router(admin_router)