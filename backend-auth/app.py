import os
from contextlib import asynccontextmanager
from urllib.parse import urlencode
from pathlib import Path
from dotenv import load_dotenv

# Load .env file from project root (parent directory)
env_path = Path(__file__).parent.parent / '.env'
load_dotenv(env_path)

from fastapi import Depends, FastAPI, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import RedirectResponse

from db import User, create_db_and_tables, get_user_db, async_session_maker
from fastapi_users.db import SQLAlchemyUserDatabase
from schemas import UserCreate, UserRead, UserUpdate
from users import auth_backend, current_active_user, fastapi_users, get_user_manager
from dependencies import admin_required
from oauth import oauth_clients, FRONTEND_URL
from fastapi_users.password import PasswordHelper
from sqlalchemy import select

password_helper = PasswordHelper()


async def seed_dev_users():
    """Create development test accounts for internal testing"""
    try:
        print("🧪 [Seeding Development Accounts]")
        password_helper = PasswordHelper()

        async with async_session_maker() as session:
            # Define test users
            dev_users = [
                {
                    "email": "thecrow.samuel@gmail.com",
                    "password": "Admin(2026).COM",
                },
                {
                    "email": "artcrow88@gmail.com",
                    "password": "Admin(2077).COM",
                },
            ]

            for user_data in dev_users:
                query = select(User).where(User.email == user_data["email"])
                result = await session.execute(query)
                existing_user = result.unique().scalar_one_or_none()

                # Delete if user already exists
                if existing_user:
                    await session.delete(existing_user)
                    await session.commit()
                    print(f"🗑️ Deleted existing user: {user_data['email']}")

                # Recreate user with hashed password
                hashed_pw = password_helper.hash(user_data["password"])
                new_user = User(
                    email=user_data["email"],
                    hashed_password=hashed_pw,
                    is_active=True,
                    is_verified=True,
                    is_superuser=False,
                )
                session.add(new_user)
                await session.commit()
                print(f"✅ Dev user created: {user_data['email']}")
    except Exception as e:
        print(f"⚠️  Warning: Could not seed dev users: {e}")
        import traceback
        traceback.print_exc()


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Not needed if you setup a migration system like Alembic
    await create_db_and_tables()
    
    # Seed development test accounts
    await seed_dev_users()
    
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

# Add logging middleware for auth endpoints (placed BEFORE routers)
@app.middleware("http")
async def log_auth_requests(request, call_next):
    """Log authentication requests for debugging"""
    # Log request info (without reading body to avoid breaking request)
    if request.url.path == "/auth/jwt/login" and request.method == "POST":
        print(f"\n🔐 === LOGIN REQUEST DEBUG ===")
        print(f"   Method: {request.method}")
        print(f"   Path: {request.url.path}")
        print(f"   Origin: {request.headers.get('origin', 'N/A')}")
        print(f"   Cookie header: {request.headers.get('cookie', 'N/A')}")
        print(f"   Content-Type: {request.headers.get('content-type', 'N/A')}")
    
    response = await call_next(request)
    
    # Log response info
    if request.url.path == "/auth/jwt/login" and request.method == "POST":
        print(f"✅ === LOGIN RESPONSE DEBUG ===")
        print(f"   Status: {response.status_code}")
        print(f"   Set-Cookie header: {response.headers.get('set-cookie', 'N/A')}")
        print(f"   Access-Control-Allow-Credentials: {response.headers.get('access-control-allow-credentials', 'N/A')}")
        print(f"   Content-Type: {response.headers.get('content-type', 'N/A')}")
        print(f"==============================\n")
    
    return response

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
    print(f"🚀 OAuth Authorize Request - Provider: {provider}")
    print(f"   Available providers: {list(oauth_clients.keys())}")
    
    if provider not in oauth_clients:
        error_msg = f"OAuth provider '{provider}' not configured. Available: {list(oauth_clients.keys())}"
        print(f"❌ {error_msg}")
        return {"error": error_msg}
    
    oauth_client = oauth_clients[provider]
    redirect_uri = f"{str(request.base_url).rstrip('/')}/auth/{provider}/callback"
    print(f"   Redirect URI: {redirect_uri}")
    
    # Generate authorization URL
    authorization_url = await oauth_client.get_authorization_url(
        redirect_uri=redirect_uri,
    )
    print(f"   Authorization URL generated: {authorization_url[:100]}...")
    
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
    print(f"🔁 OAuth Callback Triggered: {request.url}")
    print(f"   Provider: {provider}")
    print(f"   Code: {code[:20] + '...' if code else 'None'}")
    print(f"   Error: {error}")
    print(f"   State: {state}")
    
    if error:
        # Redirect to frontend with error
        error_url = f"{FRONTEND_URL}/login?error={error}"
        return RedirectResponse(url=error_url)
    
    if provider not in oauth_clients:
        error_url = f"{FRONTEND_URL}/login?error=provider_not_configured"
        return RedirectResponse(url=error_url)
    
    if not code:
        error_url = f"{FRONTEND_URL}/login?error=missing_code"
        return RedirectResponse(url=error_url)
    
    oauth_client = oauth_clients[provider]
    
    try:
        # Exchange code for access token
        access_token_response = await oauth_client.get_access_token(
            code,
            f"{str(request.base_url).rstrip('/')}/auth/{provider}/callback",
        )
        
        # Get user info from OAuth provider
        print(f"📥 Exchanging code for access token...")
        user_id, user_email = await oauth_client.get_id_email(
            access_token_response["access_token"]
        )
        print(f"✅ User info retrieved - ID: {user_id}, Email: {user_email}")
        
        # Get or create user using proper dependency injection
        async for user_manager in get_user_manager(user_db):
            # Check if user exists by OAuth account
            user = None
            try:
                user = await user_manager.get_by_oauth_account(provider, user_id)
                print(f"✅ Found existing OAuth account for {provider}")
            except Exception as e:
                print(f"ℹ️  No existing OAuth account found: {e}")
                user = None
            
            if not user:
                # Check if user exists by email
                try:
                    user = await user_manager.get_by_email(user_email)
                    print(f"✅ Found existing user by email, linking OAuth account...")
                    # Link OAuth account to existing user
                    await user_db.add_oauth_account(user, provider, user_id)
                    print(f"✅ OAuth account added for: {user.email}")
                except Exception as e:
                    print(f"ℹ️  No existing user found, creating new user...")
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
                    # Override the validate_password method temporarily
                    original_validate = user_manager.validate_password
                    async def skip_validation(password, user):
                        print("✅ Skipping password validation (OAuth user)")
                        pass
                    
                    user_manager.validate_password = skip_validation
                    try:
                        user = await user_manager.create(user_create)
                        await user_db.add_oauth_account(user, provider, user_id)
                        print(f"✅ OAuth account added for: {user.email}")
                        print(f"✅ New user created and OAuth account linked")
                    finally:
                        # Restore original validation
                        user_manager.validate_password = original_validate
            
            # Generate JWT token
            jwt_strategy = get_jwt_strategy()
            token = await jwt_strategy.write_token(user)
            print(f"✅ JWT token generated successfully")
            print(f"🔐 JWT issued for: {user.id}")
            
            # Redirect to frontend with token
            token_url = f"{FRONTEND_URL}/login?tokens={token}"
            print(f"🔄 Redirecting to: {token_url}")
            return RedirectResponse(url=token_url)
    except Exception as e:
        print(f"❌ OAuth callback error: {e}")
        import traceback
        traceback.print_exc()
        error_url = f"{FRONTEND_URL}/login?error=oauth_failed"
        print(f"🔄 Redirecting to error URL: {error_url}")
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
    print(f"🔄 Resend verification request for: {email}")
    
    try:
        # Get user manager
        async for user_manager in get_user_manager(user_db):
            # Find user by email
            try:
                user = await user_manager.get_by_email(email)
            except Exception as e:
                print(f"❌ User not found: {email}")
                return {"success": False, "message": "User not found"}
            
            # Check if already verified
            if user.is_verified:
                print(f"ℹ️  User {email} is already verified")
                return {"success": False, "message": "Email is already verified"}
            
            # Request verification
            try:
                await user_manager.request_verify(user, None)
                print(f"✅ Verification email resent to {email}")
                return {"success": True, "message": f"Verification email sent to {email}"}
            except Exception as e:
                print(f"❌ Failed to send verification email: {e}")
                import traceback
                traceback.print_exc()
                return {"success": False, "message": "Failed to send verification email"}
    except Exception as e:
        print(f"❌ Error in resend verification: {e}")
        import traceback
        traceback.print_exc()
        return {"success": False, "message": "Internal server error"}


# Test email endpoint
@app.post("/email/test")
async def test_email(email: str):
    """
    Test endpoint to send a test email.
    Usage: POST /email/test?email=your@email.com
    """
    from email_service import send_email, SMTP_CONFIG_VALID, EMAILS_ENABLED, SMTP_CONFIG_WARNINGS
    
    print(f"🧪 Test email endpoint called for: {email}")
    
    # Check SMTP configuration first
    if not EMAILS_ENABLED:
        error_msg = "EMAILS_ENABLED is set to false. Email functionality is disabled."
        print(f"❌ {error_msg}")
        return {"success": False, "message": error_msg}
    
    if not SMTP_CONFIG_VALID:
        error_msg = "SMTP configuration is invalid. Cannot send test email."
        print(f"❌ {error_msg}")
        print(f"   Warnings: {', '.join(SMTP_CONFIG_WARNINGS)}")
        return {
            "success": False,
            "message": error_msg,
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
            <p>This is a test email from your Finity AI SEO Article Writer application.</p>
            <p>If you received this email, your SMTP configuration is correct.</p>
        </div>
    </body>
    </html>
    """
    
    text_content = """
    Test Email
    
    ✅ Email service is working correctly!
    
    This is a test email from your Finity AI SEO Article Writer application.
    If you received this email, your SMTP configuration is correct.
    """
    
    try:
        result = await send_email(
            to_email=email,
            subject="Test Email - Finity AI",
            html_content=html_content,
            text_content=text_content,
        )
        
        if result:
            print(f"✅ Test email sent successfully to {email}")
            return {"success": True, "message": f"Test email sent successfully to {email}"}
        else:
            error_msg = f"Failed to send test email to {email}. Check server logs for details."
            print(f"❌ {error_msg}")
            return {"success": False, "message": error_msg}
    except Exception as e:
        error_msg = f"Exception while sending test email: {str(e)}"
        print(f"❌ {error_msg}")
        import traceback
        print(f"   Full traceback:")
        print(f"   {traceback.format_exc()}")
        return {"success": False, "message": error_msg}
