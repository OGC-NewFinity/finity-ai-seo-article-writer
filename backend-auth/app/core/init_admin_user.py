"""
Initialize admin user on application startup.

This script checks if an admin user exists in the database and creates one
if it doesn't exist, using credentials from environment variables.
"""
import logging
import bcrypt
from sqlalchemy.orm import Session
from app.core.database import SessionLocal
from app.core.config import settings
from app.models.user import User, UserRole

logger = logging.getLogger(__name__)


def init_admin_user() -> None:
    """
    Initialize admin user if it doesn't exist.
    
    Reads ADMIN_EMAIL and ADMIN_PASSWORD from environment variables.
    Creates an admin user with role=admin, is_active=True, is_verified=True.
    """
    # Check if admin credentials are provided
    if not settings.ADMIN_EMAIL or not settings.ADMIN_PASSWORD:
        logger.warning("⚠️  ADMIN_EMAIL or ADMIN_PASSWORD not set in environment. Skipping admin user creation.")
        return
    
    # Debug: Log password length (without showing the actual password)
    password_len = len(settings.ADMIN_PASSWORD)
    password_bytes = len(settings.ADMIN_PASSWORD.encode('utf-8'))
    logger.info(f"Admin password length: {password_len} chars, {password_bytes} bytes")
    
    db: Session = SessionLocal()
    try:
        # Check if admin user already exists
        existing_admin = db.query(User).filter(
            User.email == settings.ADMIN_EMAIL,
            User.role == UserRole.ADMIN
        ).first()
        
        if existing_admin:
            logger.info("✅ Admin user already exists.")
            return
        
        # Check if email is already used by a non-admin user
        existing_user = db.query(User).filter(User.email == settings.ADMIN_EMAIL).first()
        if existing_user:
            logger.warning(f"⚠️  Email {settings.ADMIN_EMAIL} already exists but is not an admin. Skipping admin creation.")
            return
        
        # Create admin user
        # Bcrypt has a 72-byte limit, so truncate if necessary
        password = settings.ADMIN_PASSWORD.strip()  # Remove any whitespace
        password_bytes = password.encode('utf-8')
        if len(password_bytes) > 72:
            logger.warning(f"⚠️  Password exceeds 72 bytes ({len(password_bytes)} bytes), truncating to 72 bytes.")
            # Truncate to 72 bytes, handling UTF-8 encoding properly
            password = password_bytes[:72].decode('utf-8', errors='ignore')
        
        logger.info(f"Creating admin user with email: {settings.ADMIN_EMAIL}")
        # Use bcrypt directly to avoid passlib compatibility issues
        password_bytes = password.encode('utf-8')
        if len(password_bytes) > 72:
            password_bytes = password_bytes[:72]
        hashed_password = bcrypt.hashpw(password_bytes, bcrypt.gensalt()).decode('utf-8')
        admin_user = User(
            email=settings.ADMIN_EMAIL,
            username=None,  # Admin can set username later if needed
            full_name="System Administrator",
            hashed_password=hashed_password,
            is_active=True,
            is_verified=True,  # Admin is auto-verified
            role=UserRole.ADMIN
        )
        
        db.add(admin_user)
        db.commit()
        db.refresh(admin_user)
        
        logger.info("✅ Admin user created successfully.")
        
    except Exception as e:
        db.rollback()
        logger.error(f"❌ Failed to create admin user: {str(e)}")
        raise
    finally:
        db.close()
