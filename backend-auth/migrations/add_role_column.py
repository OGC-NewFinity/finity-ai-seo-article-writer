"""
Simple migration script to add 'role' column to users table.
Run this once to update existing database.

Usage:
    python migrations/add_role_column.py
"""
import asyncio
import os
import sys
from sqlalchemy import text
from sqlalchemy.ext.asyncio import create_async_engine

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql+asyncpg://postgres:postgres@auth-db:5432/finity_auth")


async def migrate():
    """Add role column to users table if it doesn't exist."""
    engine = create_async_engine(DATABASE_URL)
    
    async with engine.begin() as conn:
        # Check if column exists
        check_query = text("""
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name='user' AND column_name='role'
        """)
        result = await conn.execute(check_query)
        column_exists = result.fetchone() is not None
        
        if not column_exists:
            print("Adding 'role' column to 'user' table...")
            # Add role column with default value
            alter_query = text("""
                ALTER TABLE "user" 
                ADD COLUMN role VARCHAR DEFAULT 'user' NOT NULL
            """)
            await conn.execute(alter_query)
            print("✅ Successfully added 'role' column!")
        else:
            print("✅ 'role' column already exists. Skipping migration.")
    
    await engine.dispose()


if __name__ == "__main__":
    print("Running migration: add_role_column")
    asyncio.run(migrate())
    print("Migration complete!")
