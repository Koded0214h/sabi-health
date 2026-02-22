from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.interval import IntervalTrigger
import os
import atexit
import asyncio
import httpx
from data import AsyncSessionLocal
from models import DBUser
from sqlalchemy import select

async def get_all_user_ids():
    async with AsyncSessionLocal() as session:
        result = await session.execute(select(DBUser.id))
        return result.scalars().all()

async def check_user_and_call(user_id: str):
    domain = os.getenv("DOMAIN", "https://sabi-health.onrender.com/")
    async with httpx.AsyncClient() as client:
        try:
            resp = await client.put(f"{domain}/call-user/{user_id}")
            resp.raise_for_status()
            print(f"Scheduled call for user {user_id}: {resp.json()}")
        except Exception as e:
            print(f"Failed scheduled call for user {user_id}: {e}")

def run_scheduled_checks():
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    try:
        user_ids = loop.run_until_complete(get_all_user_ids())
        tasks = [check_user_and_call(uid) for uid in user_ids]
        if tasks:
            loop.run_until_complete(asyncio.gather(*tasks))
    finally:
        loop.close()

scheduler = BackgroundScheduler()
scheduler.start()
scheduler.add_job(
    func=run_scheduled_checks,
    trigger=IntervalTrigger(hours=1),
    id='hourly_risk_check',
    name='Check all users every hour',
    replace_existing=True
)

atexit.register(lambda: scheduler.shutdown())