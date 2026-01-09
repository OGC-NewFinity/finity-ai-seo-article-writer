import os
import httpx
from contextlib import asynccontextmanager
from pathlib import Path
from dotenv import load_dotenv

# Load .env file from project root (parent directory)
env_path = Path(__file__).parent.parent / '.env'
load_dotenv(env_path)

from fastapi import Depends, FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import RedirectResponse

from db import User, create_db_and_tables, get_user_db
from fastapi_users.db import SQLAlchemyUserDatabase
from schemas import UserCreate, UserRead, UserUpdate
from users import auth_backend, current_active_user, fastapi_users, get_user_manager
from dependencies import admin_required
from oauth import oauth_clients, FRONTEND_URL

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan manager - handles startup and shutdown"""
    await create_db_and_tables()
    yield


app = FastAPI(lifespan=lifespan)

# Add CORS middleware to allow frontend requests
cors_origins_str = os.getenv("BACKEND_CORS_ORIGINS", os.getenv("CORS_ORIGINS", "http://localhost:5173,http://localhost:3000"))
cors_origins = [origin.strip() for origin in cors_origins_str.split(",")]
app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include auth router
app.include_router(
    fastapi_users.get_auth_router(auth_backend), prefix="/auth/jwt", tags=["auth"]
)
app.include_router(
    fastapi_users.get_register_router(UserRead, UserCreate),
    prefix="/auth",
    tags=["auth"],
)
app.include_router(
    fastapi_users.get_reset_password_router(),
    prefix="/auth",
    tags=["auth"],
)
app.include_router(
    fastapi_users.get_verify_router(UserRead),
    prefix="/auth",
    tags=["auth"],
)
app.include_router(
    fastapi_users.get_users_router(UserRead, UserUpdate),
    prefix="/users",
    tags=["users"],
)

# OAuth Routes
from fastapi_users.authentication import CookieTransport
from users import get_jwt_strategy, get_user_manager
from db import get_user_db

SECRET = os.getenv("SECRET", "your-super-secret-jwt-key-change-this-in-production")

# Create OAuth backends for each provider
oauth_backends = {}
for provider_name, oauth_client in oauth_clients.items():
    # Use cookie transport for OAuth
    cookie_transport = CookieTransport(cookie_max_age=3600)
    from fastapi_users.authentication import AuthenticationBackend
    oauth_backends[provider_name] = AuthenticationBackend(
        name=provider_name,
        transport=cookie_transport,
        get_strategy=get_jwt_strategy,
    )

# OAuth authorize endpoints
@app.get("/auth/{provider}")
async def oauth_authorize(provider: str, request: Request):
    """Initiate OAuth flow for a provider"""
    if provider not in oauth_clients:
        error_msg = f"OAuth provider '{provider}' not configured"
        return {"error": error_msg}
    
    oauth_client = oauth_clients[provider]
    
    # Determine redirect URI
    redirect_uri = f"{str(request.base_url).rstrip('/')}/auth/{provider}/callback"
    
    # For Discord, use DISCORD_REDIRECT_URI if set, otherwise use dynamic
    if provider == "discord":
        from services.oauth.discord_oauth import DiscordOAuthService
        if isinstance(oauth_client, DiscordOAuthService):
            discord_redirect_uri = os.getenv("DISCORD_REDIRECT_URI", "")
            if discord_redirect_uri and discord_redirect_uri.strip():
                redirect_uri = discord_redirect_uri.strip()
            # Update the service's redirect URI
            oauth_client.redirect_uri = redirect_uri
    
    # Generate authorization URL
    # For Discord, use custom service method
    if provider == "discord" and isinstance(oauth_client, DiscordOAuthService):
        authorization_url = oauth_client.get_authorization_url()
    else:
        # For other providers (Google, etc.), use httpx-oauth method
        authorization_url = await oauth_client.get_authorization_url(
            redirect_uri=redirect_uri,
        )
    
    # Redirect to OAuth provider
    return RedirectResponse(url=authorization_url)

# OAuth callback endpoints
@app.get("/auth/{provider}/callback")
async def oauth_callback(
    provider: str,
    request: Request,
    code: str | None = None,
    state: str | None = None,
    error: str | None = None,
    user_db: SQLAlchemyUserDatabase = Depends(get_user_db),
):
    """Handle OAuth callback from provider"""
    # Handle OAuth errors from provider
    if error:
        error_msg = error
        if error == "access_denied":
            error_msg = "user_denied"
        elif error == "invalid_request":
            error_msg = "invalid_request"
        error_url = f"{FRONTEND_URL}/login?error={error_msg}"
        return RedirectResponse(url=error_url)
    
    # Validate provider is configured
    if provider not in oauth_clients:
        error_url = f"{FRONTEND_URL}/login?error=provider_not_configured"
        return RedirectResponse(url=error_url)
    
    # Validate authorization code
    if not code or not code.strip():
        error_url = f"{FRONTEND_URL}/login?error=missing_code"
        return RedirectResponse(url=error_url)
    
    oauth_client = oauth_clients[provider]
    
    # Determine redirect URI
    callback_redirect_uri = f"{str(request.base_url).rstrip('/')}/auth/{provider}/callback"
    
    # For Discord, use DISCORD_REDIRECT_URI if set, otherwise use dynamic
    if provider == "discord":
        from services.oauth.discord_oauth import DiscordOAuthService
        if isinstance(oauth_client, DiscordOAuthService):
            # Update redirect URI if not set or use the one from .env
            discord_redirect_uri = os.getenv("DISCORD_REDIRECT_URI", "")
            if discord_redirect_uri and discord_redirect_uri.strip():
                callback_redirect_uri = discord_redirect_uri.strip()
            # Update the service's redirect URI
            oauth_client.redirect_uri = callback_redirect_uri
    
    try:
        # Handle Discord OAuth with custom implementation
        if provider == "discord" and isinstance(oauth_client, DiscordOAuthService):
            from services.oauth.discord_oauth import DiscordOAuthService
            
            # Exchange code for access token
            access_token_response = await oauth_client.exchange_code_for_token(code)
            access_token = access_token_response["access_token"]
            
            # Fetch Discord user info (id, username, email, avatar)
            discord_user_info = await oauth_client.get_user_info(access_token)
            
            # Extract user data
            discord_id = discord_user_info["id"]
            discord_username = discord_user_info["username"]
            user_email = discord_user_info["email"]
            discord_avatar = discord_user_info.get("avatar")
            discord_discriminator = discord_user_info.get("discriminator", "0")
            
            # Validate email is available
            if not user_email:
                error_url = f"{FRONTEND_URL}/login?error=email_not_available"
                return RedirectResponse(url=error_url)
            
            # Get or create user
            async for user_manager in get_user_manager(user_db):
                user = None
                
                # Check if user exists by OAuth account (Discord ID)
                try:
                    user = await user_manager.get_by_oauth_account(provider, discord_id)
                except Exception:
                    user = None
                
                if not user:
                    # Check if user exists by email
                    try:
                        user = await user_manager.get_by_email(user_email)
                        # Link Discord OAuth account to existing user
                        await user_db.add_oauth_account(user, provider, discord_id)
                    except Exception:
                        # Create new user with random password (OAuth users don't use password)
                        import secrets
                        from schemas import UserCreate
                        random_password = secrets.token_urlsafe(32)
                        
                        # Create UserCreate object for OAuth user
                        user_create = UserCreate(
                            email=user_email,
                            password=random_password,
                            is_verified=True  # Discord verifies emails
                        )
                        
                        # Skip password validation for OAuth users
                        original_validate = user_manager.validate_password
                        async def skip_validation(password, user):
                            pass
                        
                        user_manager.validate_password = skip_validation
                        try:
                            user = await user_manager.create(user_create)
                            await user_db.add_oauth_account(user, provider, discord_id)
                        finally:
                            # Restore original validation
                            user_manager.validate_password = original_validate
                
                # Generate JWT token
                jwt_strategy = get_jwt_strategy()
                token = await jwt_strategy.write_token(user)
                
                # Redirect to frontend with token
                token_url = f"{FRONTEND_URL}/login?token={token}"
                return RedirectResponse(url=token_url)
        
        # Handle other OAuth providers (Google, etc.) with httpx-oauth
        else:
            # Exchange code for access token
            access_token_response = await oauth_client.get_access_token(
                code,
                callback_redirect_uri,
            )
            
            # Get user info from OAuth provider
            user_id, user_email = await oauth_client.get_id_email(
                access_token_response["access_token"]
            )
            
            # Get or create user using proper dependency injection
            async for user_manager in get_user_manager(user_db):
                # Check if user exists by OAuth account
                user = None
                try:
                    user = await user_manager.get_by_oauth_account(provider, user_id)
                except Exception:
                    user = None
                
                if not user:
                    # Check if user exists by email
                    try:
                        user = await user_manager.get_by_email(user_email)
                        # Link OAuth account to existing user
                        await user_db.add_oauth_account(user, provider, user_id)
                    except Exception:
                        # Create new user with random password (OAuth users don't use password)
                        import secrets
                        from schemas import UserCreate
                        random_password = secrets.token_urlsafe(32)
                        
                        # Create UserCreate object for OAuth user
                        user_create = UserCreate(
                            email=user_email,
                            password=random_password,
                            is_verified=True  # OAuth providers verify emails
                        )
                        
                        # Skip password validation for OAuth users
                        original_validate = user_manager.validate_password
                        async def skip_validation(password, user):
                            pass
                        
                        user_manager.validate_password = skip_validation
                        try:
                            user = await user_manager.create(user_create)
                            await user_db.add_oauth_account(user, provider, user_id)
                        finally:
                            # Restore original validation
                            user_manager.validate_password = original_validate
                
                # Generate JWT token
                jwt_strategy = get_jwt_strategy()
                token = await jwt_strategy.write_token(user)
                
                # Redirect to frontend with token
                token_url = f"{FRONTEND_URL}/login?token={token}"
                return RedirectResponse(url=token_url)
                
    except ValueError as e:
        # Handle validation errors
        error_url = f"{FRONTEND_URL}/login?error=validation_error"
        return RedirectResponse(url=error_url)
    except httpx.HTTPStatusError as e:
        # Handle HTTP errors from OAuth API
        if e.response.status_code == 400:
            error_msg = "invalid_code"
        elif e.response.status_code == 401:
            error_msg = "invalid_token"
        else:
            error_msg = "oauth_failed"
        error_url = f"{FRONTEND_URL}/login?error={error_msg}"
        return RedirectResponse(url=error_url)
    except Exception:
        # Handle all other errors - do not expose error details
        error_url = f"{FRONTEND_URL}/login?error=oauth_failed"
        return RedirectResponse(url=error_url)


@app.get("/authenticated-route")
async def authenticated_route(user: User = Depends(current_active_user)):
    return {"message": f"Hello {user.email}!"}


@app.get("/admin/panel")
async def admin_panel(admin_user: User = Depends(admin_required)):
    """Admin-only endpoint. Only accessible to users with role='admin'."""
    return {"message": "Welcome, Admin!", "user": admin_user.email, "role": admin_user.role}


# Resend verification email endpoint
@app.post("/auth/resend-verification")
async def resend_verification(
    email: str,
    user_db: SQLAlchemyUserDatabase = Depends(get_user_db),
):
    """
    Resend verification email to a user.
    Usage: POST /auth/resend-verification?email=user@example.com
    """
    try:
        # Get user manager
        async for user_manager in get_user_manager(user_db):
            # Find user by email
            try:
                user = await user_manager.get_by_email(email)
            except Exception:
                return {"success": False, "message": "User not found"}
            
            # Check if already verified
            if user.is_verified:
                return {"success": False, "message": "Email is already verified"}
            
            # Request verification
            try:
                await user_manager.request_verify(user, None)
                return {"success": True, "message": "Verification email sent"}
            except Exception:
                return {"success": False, "message": "Failed to send verification email"}
    except Exception:
        return {"success": False, "message": "Internal server error"}


# Test email endpoint - Only available in development mode
@app.post("/email/test")
async def test_email(email: str):
    """
    Test endpoint to send a test email.
    Only available when ENABLE_TEST_ENDPOINTS is set to 'true' in .env
    Usage: POST /email/test?email=your@email.com
    """
    # Check if test endpoints are enabled
    enable_test_endpoints = os.getenv("ENABLE_TEST_ENDPOINTS", "false").lower() == "true"
    if not enable_test_endpoints:
        return {"success": False, "message": "Test endpoints are disabled"}
    
    from email_service import send_email, SMTP_CONFIG_VALID, EMAILS_ENABLED, SMTP_CONFIG_WARNINGS
    
    # Check SMTP configuration first
    if not EMAILS_ENABLED:
        return {"success": False, "message": "Email functionality is disabled"}
    
    if not SMTP_CONFIG_VALID:
        return {
            "success": False,
            "message": "SMTP configuration is invalid",
            "warnings": SMTP_CONFIG_WARNINGS
        }
    
    html_content = """
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .success { color: #16a34a; font-weight: bold; }
        </style>
    </head>
    <body>
        <div class="container">
            <h2>Test Email</h2>
            <p class="success">✅ Email service is working correctly!</p>
            <p>This is a test email from your Nova‑XFinity AI Article Writer application.</p>
            <p>If you received this email, your SMTP configuration is correct.</p>
        </div>
    </body>
    </html>
    """
    
    text_content = """
    Test Email
    
    ✅ Email service is working correctly!
    
    This is a test email from your Nova‑XFinity AI SEO Article Writer application.
    If you received this email, your SMTP configuration is correct.
    """
    
    try:
        result = await send_email(
            to_email=email,
            subject="Test Email - Nova‑XFinity AI",
            html_content=html_content,
            text_content=text_content,
        )
        
        if result:
            return {"success": True, "message": "Test email sent successfully"}
        else:
            return {"success": False, "message": "Failed to send test email"}
    except Exception:
        return {"success": False, "message": "Failed to send test email"}
