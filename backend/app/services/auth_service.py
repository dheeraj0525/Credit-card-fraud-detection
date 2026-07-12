from sqlalchemy.orm import Session
from app.models.user import User
from app.core.security import verify_password, create_access_token

class AuthService:
    def login(self, db: Session, email: str, password: str):
        # Fetch user from the database
        user = db.query(User).filter(User.email == email).first()
        if not user:
            return None

        # Verify password against hash
        if not verify_password(password, user.hashed_password):
            return None

        # Check if the account is active
        if not user.is_active:
            return None

        role = "ADMIN" if user.is_admin else "USER"
        token = create_access_token(
            data={
                "sub": user.email,
                "role": role
            }
        )

        return {
            "access_token": token,
            "token_type": "bearer",
            "user": {
                "id": user.id,
                "email": user.email,
                "is_admin": user.is_admin
            }
        }

auth_service = AuthService()