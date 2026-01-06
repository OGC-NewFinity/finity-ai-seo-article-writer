"""Quick script to verify admin user"""
import asyncio
import os
from sqlalchemy import select
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker
from db import User

DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql+asyncpg://postgres:postgres@finity-db:5432/finity_auth"
)

engine = create_async_engine(DATABASE_URL)
async_session_maker = async_sessionmaker(engine, expire_on_commit=False)


async def verify_user(email: str):
    async with async_session_maker() as session:
        result = await session.execute(
            select(User).where(User.email == email)
        )
        user = result.scalar_one_or_none()
        
        if user:
            print(f"✅ User found:")
            print(f"   Email: {user.email}")
            print(f"   Role: {user.role}")
            print(f"   Verified: {user.is_verified}")
            print(f"   Active: {user.is_active}")
        else:
            print(f"❌ User {email} not found")
        
        await engine.dispose()


if __name__ == "__main__":
    import sys
    email = sys.argv[1] if len(sys.argv) > 1 else "ogcnewfinity@gmail.com"
    asyncio.run(verify_user(email))
