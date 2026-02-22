import asyncio
from sqlalchemy import text
from data import engine

async def run_migration():
    print("Checking database schema...")
    async with engine.connect() as conn:
        # Check logs table for audio_url
        print("Checking 'logs' table for 'audio_url' column...")
        result = await conn.execute(text("SELECT column_name FROM information_schema.columns WHERE table_name='logs' AND column_name='audio_url'"))
        column_exists = result.fetchone()
        
        if not column_exists:
            print("Adding missing 'audio_url' column to 'logs' table...")
            await conn.execute(text("ALTER TABLE logs ADD COLUMN audio_url VARCHAR"))
            await conn.commit()
            print("Added 'audio_url' column to 'logs' table.")
        else:
            print("'audio_url' column already exists in 'logs' table.")

        # Also check users table for ai_personality just in case
        print("Checking 'users' table for 'ai_personality' column...")
        result = await conn.execute(text("SELECT column_name FROM information_schema.columns WHERE table_name='users' AND column_name='ai_personality'"))
        column_exists = result.fetchone()
        
        if not column_exists:
            print("Adding missing 'ai_personality' column to 'users' table...")
            await conn.execute(text("ALTER TABLE users ADD COLUMN ai_personality VARCHAR DEFAULT 'Mama Health'"))
            await conn.commit()
            print("Added 'ai_personality' column to 'users' table.")
        else:
            print("'ai_personality' column already exists in 'users' table.")

    print("\nMigration check complete.")

if __name__ == "__main__":
    asyncio.run(run_migration())
