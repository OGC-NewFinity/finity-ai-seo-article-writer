"""
Script to create or update an admin user
Usage: python create_admin_user.py <email> <password>
"""
import asyncio
import os
import sys

from fastapi_users.password import PasswordHelper
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
from sqlalchemy import select

from app.db import User, Base

# Get database URL from environment
DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql+asyncpg://postgres:postgres@finity-db:5432/finity_auth"
)

# Create async engine and session
engine = create_async_engine(DATABASE_URL)
async_session_maker = async_sessionmaker(engine, expire_on_commit=False)

password_helper = PasswordHelper()


async def create_or_update_admin(email: str, password: str):
    """Create or update a user to be an admin"""
    async with async_session_maker() as session:
        # Check if user exists
        result = await session.execute(
            select(User).where(User.email == email)
        )
        user = result.scalar_one_or_none()
        
        if user:
            print(f"User {email} already exists. Updating to admin...")
            # Update existing user
            user.role = "admin"
            user.is_verified = True
            user.is_active = True
            
            # Update password if provided
            if password:
                hashed_password = password_helper.hash(password)
                user.hashed_password = hashed_password
                print("Password updated.")
            
            await session.commit()
            print(f"✅ User {email} updated to admin successfully!")
        else:
            print(f"Creating new admin user {email}...")
            # Create new user
            hashed_password = password_helper.hash(password)
            
            new_user = User(
                email=email,
                hashed_password=hashed_password,
                role="admin",
                is_verified=True,
                is_active=True
            )
            
            session.add(new_user)
            await session.commit()
            print(f"✅ Admin user {email} created successfully!")
        
        # Verify the user
        result = await session.execute(
            select(User).where(User.email == email)
        )
        user = result.scalar_one()
        print(f"\nUser details:")
        print(f"  Email: {user.email}")
        print(f"  Role: {user.role}")
        print(f"  Verified: {user.is_verified}")
        print(f"  Active: {user.is_active}")


async def main():
    if len(sys.argv) < 3:
        print("Usage: python create_admin_user.py <email> <password>")
        print("Example: python create_admin_user.py admin@example.com mypassword")
        sys.exit(1)
    
    email = sys.argv[1]
    password = sys.argv[2]
    
    await create_or_update_admin(email, password)
    
    # Close the engine
    await engine.dispose()


if __name__ == "__main__":
    asyncio.run(main())
