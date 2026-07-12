from app.core.security import (
    verify_password,
    create_access_token,
    hash_password
)

fake_user = {
    "id": 1,
    "username": "admin",
    "password": hash_password("admin123"),
    "role": "admin"
}


class AuthService:

    def login(self, username: str, password: str):

        if username != fake_user["username"]:
            return None

        if not verify_password(password, fake_user["password"]):
            return None

        token = create_access_token(
            {
                "sub": username,
                "role": fake_user["role"]
            }
        )

        return {
            "access_token": token,
            "token_type": "bearer",
            "user": {
                "id": fake_user["id"],
                "username": fake_user["username"],
                "role": fake_user["role"]
            }
        }


auth_service = AuthService()