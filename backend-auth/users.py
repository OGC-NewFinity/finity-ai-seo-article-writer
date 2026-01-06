import os
import uuid

from fastapi import Depends, Request
from fastapi_users import BaseUserManager, FastAPIUsers, UUIDIDMixin, models
from fastapi_users.authentication import (
    AuthenticationBackend,
    BearerTransport,
    JWTStrategy,
)
from fastapi_users.db import SQLAlchemyUserDatabase

from db import User, get_user_db
from email_service import send_verification_email, send_password_reset_email

SECRET = os.getenv("SECRET", "your-super-secret-jwt-key-change-this-in-production")
USERS_VERIFICATION_TOKEN_SECRET = os.getenv("USERS_VERIFICATION_TOKEN_SECRET", SECRET)
USERS_RESET_PASSWORD_TOKEN_SECRET = os.getenv("USERS_RESET_PASSWORD_TOKEN_SECRET", SECRET)
JWT_LIFETIME_SECONDS = int(os.getenv("JWT_ACCESS_TOKEN_EXPIRE_MINUTES", "30")) * 60


class UserManager(UUIDIDMixin, BaseUserManager[User, uuid.UUID]):
    reset_password_token_secret = USERS_RESET_PASSWORD_TOKEN_SECRET
    verification_token_secret = USERS_VERIFICATION_TOKEN_SECRET

    async def on_after_register(self, user: User, request: Request | None = None):
        print(f"User {user.id} has registered.")
        # Automatically request verification email for new users
        if not user.is_verified:
            try:
                await self.request_verify(user, request)
            except Exception as e:
                # User might already be verified or other error
                print(f"Could not send verification email on registration: {e}")

    async def on_after_forgot_password(
        self, user: User, token: str, request: Request | None = None
    ):
        print(f"User {user.id} has forgot their password. Reset token: {token}")
        await send_password_reset_email(user.email, token)

    async def on_after_request_verify(
        self, user: User, token: str, request: Request | None = None
    ):
        print(f"Verification requested for user {user.id}. Verification token: {token}")
        await send_verification_email(user.email, token)


async def get_user_manager(user_db: SQLAlchemyUserDatabase = Depends(get_user_db)):
    yield UserManager(user_db)


bearer_transport = BearerTransport(tokenUrl="auth/jwt/login")


def get_jwt_strategy() -> JWTStrategy[models.UP, models.ID]:
    return JWTStrategy(secret=SECRET, lifetime_seconds=JWT_LIFETIME_SECONDS)


auth_backend = AuthenticationBackend(
    name="jwt",
    transport=bearer_transport,
    get_strategy=get_jwt_strategy,
)

fastapi_users = FastAPIUsers[User, uuid.UUID](get_user_manager, [auth_backend])

current_active_user = fastapi_users.current_user(active=True)
