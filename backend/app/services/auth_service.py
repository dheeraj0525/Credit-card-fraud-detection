from sqlalchemy.orm import Session
import time
from app.models.user import User
from app.core.security import verify_password, create_access_token, create_refresh_token

class AuthService:
    def __init__(self):
        # In-memory store: email -> [consecutive_failed_attempts, lockout_timestamp]
        self.failed_attempts = {}

    def login(self, db: Session, email: str, password: str):
        email_clean = email.lower().strip()
        now = time.time()

        # Check account lockout
        if email_clean in self.failed_attempts:
            attempts, lockout_time = self.failed_attempts[email_clean]
            if attempts >= 5:
                if now - lockout_time < 900:  # 15 minutes
                    return {
                        "lockout": True, 
                        "remaining_seconds": int(900 - (now - lockout_time))
                    }
                else:
                    # Cooloff period has expired, reset counter
                    self.failed_attempts[email_clean] = [0, 0.0]

        # Fetch user
        user = db.query(User).filter(User.email == email).first()
        if not user or not verify_password(password, user.hashed_password) or not user.is_active:
            # Track failed attempt
            if email_clean not in self.failed_attempts:
                self.failed_attempts[email_clean] = [0, 0.0]
            
            self.failed_attempts[email_clean][0] += 1
            if self.failed_attempts[email_clean][0] >= 5:
                self.failed_attempts[email_clean][1] = now
            return None

        # Reset failed attempts on success
        if email_clean in self.failed_attempts:
            self.failed_attempts[email_clean] = [0, 0.0]

        # Map role dynamically: ADMIN, ANALYST, or USER
        if user.is_admin:
            role = "ADMIN"
        elif "analyst" in user.email.lower():
            role = "ANALYST"
        else:
            role = "USER"

        # Create both access and refresh tokens
        access_token = create_access_token(
            data={"sub": user.email, "role": role}
        )
        refresh_token = create_refresh_token(
            data={"sub": user.email}
        )

        return {
            "access_token": access_token,
            "refresh_token": refresh_token,
            "token_type": "bearer",
            "user": {
                "id": user.id,
                "email": user.email,
                "is_admin": user.is_admin,
                "role": role
            }
        }

auth_service = AuthService()