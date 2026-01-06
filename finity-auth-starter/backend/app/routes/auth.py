from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from fastapi.responses import RedirectResponse
import httpx
import urllib.parse
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
import secrets
from app.core.database import get_db
from app.core.security import (
    verify_password,
    get_password_hash,
    create_access_token,
    create_refresh_token,
    decode_token
)
from app.models.user import User, UserRole
from app.models.oauth_connection import OAuthConnection
from app.models.token import Token as TokenModel
from app.schemas.auth import (
    RegisterRequest,
    LoginRequest,
    Token,
    PasswordResetRequest,
    PasswordResetConfirm
)
from app.schemas.user import UserResponse
from app.services.email_service import EmailService
from app.services.oauth_service import OAuthService
from app.core.config import settings

router = APIRouter()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")


def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
) -> User:
    """Get current authenticated user."""
    payload = decode_token(token)
    if payload is None or payload.get("type") != "access":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials"
        )
    
    user_id = payload.get("user_id")
    user = db.query(User).filter(User.id == user_id).first()
    if user is None or not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found or inactive"
        )
    return user


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register(request: RegisterRequest, db: Session = Depends(get_db)):
    """Register a new user."""
    # Check if user agreed to terms
    if not request.agreed_to_terms:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You must agree to the Privacy Policy, Terms of Service, and Return & Refund Policy"
        )
    
    # Check if user already exists
    existing_user = db.query(User).filter(User.email == request.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Check username if provided
    if request.username:
        existing_username = db.query(User).filter(User.username == request.username).first()
        if existing_username:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Username already taken"
            )
    
    # Create new user
    hashed_password = get_password_hash(request.password)
    user = User(
        email=request.email,
        username=request.username or None,
        full_name=request.full_name,
        hashed_password=hashed_password,
        is_verified=False
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    
    # Create email verification token
    verification_token = secrets.token_urlsafe(32)
    token_expires = datetime.utcnow() + timedelta(hours=24)
    db_token = TokenModel(
        user_id=user.id,
        token=verification_token,
        token_type="email_verification",
        expires_at=token_expires
    )
    db.add(db_token)
    db.commit()
    
    # Send welcome email
    EmailService.send_welcome_email(user.email, user.username or user.email, verification_token)
    
    return user


@router.post("/login", response_model=Token)
async def login(request: LoginRequest, db: Session = Depends(get_db)):
    """Login with email and password."""
    user = db.query(User).filter(User.email == request.email).first()
    if not user or not user.hashed_password:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )
    
    if not verify_password(request.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is inactive"
        )
    
    # Create tokens
    access_token = create_access_token(data={"user_id": user.id, "email": user.email})
    refresh_token = create_refresh_token(data={"user_id": user.id})
    
    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer"
    }


@router.post("/refresh", response_model=Token)
async def refresh_token(refresh_token: str, db: Session = Depends(get_db)):
    """Refresh access token using refresh token."""
    payload = decode_token(refresh_token)
    if payload is None or payload.get("type") != "refresh":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token"
        )
    
    user_id = payload.get("user_id")
    user = db.query(User).filter(User.id == user_id).first()
    if not user or not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found or inactive"
        )
    
    # Create new tokens
    access_token = create_access_token(data={"user_id": user.id, "email": user.email})
    new_refresh_token = create_refresh_token(data={"user_id": user.id})
    
    return {
        "access_token": access_token,
        "refresh_token": new_refresh_token,
        "token_type": "bearer"
    }


@router.post("/forgot-password")
async def forgot_password(request: PasswordResetRequest, db: Session = Depends(get_db)):
    """Request password reset."""
    user = db.query(User).filter(User.email == request.email).first()
    if not user:
        # Don't reveal if email exists
        return {"message": "If the email exists, a password reset link has been sent"}
    
    # Create password reset token
    reset_token = secrets.token_urlsafe(32)
    token_expires = datetime.utcnow() + timedelta(hours=1)
    db_token = TokenModel(
        user_id=user.id,
        token=reset_token,
        token_type="password_reset",
        expires_at=token_expires
    )
    db.add(db_token)
    db.commit()
    
    # Send password reset email
    EmailService.send_password_reset_email(user.email, reset_token)
    
    return {"message": "If the email exists, a password reset link has been sent"}


@router.post("/reset-password")
async def reset_password(request: PasswordResetConfirm, db: Session = Depends(get_db)):
    """Reset password with token."""
    token_record = db.query(TokenModel).filter(
        TokenModel.token == request.token,
        TokenModel.token_type == "password_reset",
        TokenModel.is_used == False,
        TokenModel.expires_at > datetime.utcnow()
    ).first()
    
    if not token_record:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired reset token"
        )
    
    user = db.query(User).filter(User.id == token_record.user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Update password
    user.hashed_password = get_password_hash(request.new_password)
    token_record.is_used = True
    db.commit()
    
    return {"message": "Password has been reset successfully"}


@router.post("/verify-email")
async def verify_email(token: str, db: Session = Depends(get_db)):
    """Verify email address with token."""
    token_record = db.query(TokenModel).filter(
        TokenModel.token == token,
        TokenModel.token_type == "email_verification",
        TokenModel.is_used == False,
        TokenModel.expires_at > datetime.utcnow()
    ).first()
    
    if not token_record:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired verification token"
        )
    
    user = db.query(User).filter(User.id == token_record.user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    user.is_verified = True
    token_record.is_used = True
    db.commit()
    
    return {"message": "Email verified successfully"}


@router.get("/social/{provider}")
async def social_login_initiate(provider: str):
    """Initiate OAuth login for a provider."""
    valid_providers = ["google", "facebook", "discord", "twitter"]
    if provider not in valid_providers:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid provider. Must be one of: {', '.join(valid_providers)}"
        )
    
    auth_url = OAuthService.get_oauth_authorization_url(provider)
    if not auth_url:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"OAuth not configured for {provider}"
        )
    
    return {"authorization_url": auth_url}


@router.get("/social/{provider}/callback")
async def social_login_callback(
    provider: str,
    code: str = None,
    error: str = None,
    db: Session = Depends(get_db)
):
    """Handle OAuth callback and create/login user."""
    
    valid_providers = ["google", "facebook", "discord", "twitter"]
    if provider not in valid_providers:
        return RedirectResponse(f"{settings.FRONTEND_URL}/login?error=invalid_provider")
    
    if error:
        return RedirectResponse(f"{settings.FRONTEND_URL}/login?error={error}")
    
    if not code:
        return RedirectResponse(f"{settings.FRONTEND_URL}/login?error=no_code")
    
    # Exchange code for access token
    client_ids = {
        "google": settings.GOOGLE_CLIENT_ID,
        "facebook": settings.FACEBOOK_CLIENT_ID,
        "discord": settings.DISCORD_CLIENT_ID,
        "twitter": settings.TWITTER_CLIENT_ID
    }
    
    client_secrets = {
        "google": settings.GOOGLE_CLIENT_SECRET,
        "facebook": settings.FACEBOOK_CLIENT_SECRET,
        "discord": settings.DISCORD_CLIENT_SECRET,
        "twitter": settings.TWITTER_CLIENT_SECRET
    }
    
    redirect_uris = {
        "google": f"{settings.BACKEND_URL}/api/auth/social/google/callback",
        "facebook": f"{settings.BACKEND_URL}/api/auth/social/facebook/callback",
        "discord": f"{settings.BACKEND_URL}/api/auth/social/discord/callback",
        "twitter": f"{settings.BACKEND_URL}/api/auth/social/twitter/callback"
    }
    
    try:
        async with httpx.AsyncClient() as client:
            # Exchange code for access token
            token_data = {
                "code": code,
                "client_id": client_ids[provider],
                "client_secret": client_secrets[provider],
                "redirect_uri": redirect_uris[provider],
                "grant_type": "authorization_code"
            }
            
            token_urls = {
                "google": "https://oauth2.googleapis.com/token",
                "facebook": "https://graph.facebook.com/v18.0/oauth/access_token",
                "discord": "https://discord.com/api/oauth2/token",
                "twitter": "https://api.twitter.com/2/oauth2/token"
            }
            
            token_response = await client.post(
                token_urls[provider],
                data=token_data,
                headers={"Content-Type": "application/x-www-form-urlencoded"}
            )
            
            if token_response.status_code != 200:
                return RedirectResponse(f"{settings.FRONTEND_URL}/login?error=token_exchange_failed")
            
            token_json = token_response.json()
            access_token = token_json.get("access_token")
            
            if not access_token:
                return RedirectResponse(f"{settings.FRONTEND_URL}/login?error=no_access_token")
            
            # Get user info
            user_info = None
            if provider == "google":
                user_info = await OAuthService.get_google_user_info(access_token)
            elif provider == "facebook":
                user_info = await OAuthService.get_facebook_user_info(access_token)
            elif provider == "discord":
                user_info = await OAuthService.get_discord_user_info(access_token)
            elif provider == "twitter":
                user_info = await OAuthService.get_twitter_user_info(access_token)
            
            if not user_info or not user_info.get("email"):
                return RedirectResponse(f"{settings.FRONTEND_URL}/login?error=user_info_failed")
            
            # Find or create user
            user = db.query(User).filter(User.email == user_info["email"]).first()
            
            if not user:
                # Create new user
                user = User(
                    email=user_info["email"],
                    username=user_info.get("name", "").replace(" ", "").lower()[:30] or None,
                    full_name=user_info.get("name"),
                    is_verified=True,
                    hashed_password=None
                )
                db.add(user)
                db.commit()
                db.refresh(user)
            
            # Create or update OAuth connection
            oauth_conn = db.query(OAuthConnection).filter(
                OAuthConnection.user_id == user.id,
                OAuthConnection.provider == provider
            ).first()
            
            if not oauth_conn:
                oauth_conn = OAuthConnection(
                    user_id=user.id,
                    provider=provider,
                    provider_user_id=user_info["provider_user_id"],
                    email=user_info["email"]
                )
                db.add(oauth_conn)
                db.commit()
            
            # Create tokens
            access_token_jwt = create_access_token(data={"user_id": user.id, "email": user.email})
            refresh_token_jwt = create_refresh_token(data={"user_id": user.id})
            
            # Redirect to frontend with tokens
            tokens = urllib.parse.quote(f"{access_token_jwt}|{refresh_token_jwt}")
            return RedirectResponse(f"{settings.FRONTEND_URL}/login?oauth_success=true&tokens={tokens}")
            
    except Exception as e:
        print(f"[OAuth] Error in callback: {e}")
        return RedirectResponse(f"{settings.FRONTEND_URL}/login?error=oauth_error")


@router.get("/me", response_model=UserResponse)
async def get_current_user_info(current_user: User = Depends(get_current_user)):
    """Get current user information."""
    return current_user


@router.post("/logout")
async def logout(current_user: User = Depends(get_current_user)):
    """Logout user (client should discard tokens)."""
    return {"message": "Logged out successfully"}
