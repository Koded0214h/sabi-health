import asyncio
from sqlalchemy import text
from data import engine

async def apply_migration():
    async with engine.begin() as conn:
        print("Applying migration: adding diarrhea and vomiting to symptoms table...")
        try:
            await conn.execute(text("ALTER TABLE symptoms ADD COLUMN diarrhea INTEGER DEFAULT 0"))
            print("Added 'diarrhea' column.")
        except Exception as e:
            if "already exists" in str(e).lower():
                print("'diarrhea' column already exists.")
            else:
                print(f"Error adding 'diarrhea': {e}")

        try:
            await conn.execute(text("ALTER TABLE symptoms ADD COLUMN vomiting INTEGER DEFAULT 0"))
            print("Added 'vomiting' column.")
        except Exception as e:
            if "already exists" in str(e).lower():
                print("'vomiting' column already exists.")
            else:
                print(f"Error adding 'vomiting': {e}")
                
    print("Migration check complete.")

if __name__ == "__main__":
    asyncio.run(apply_migration())
