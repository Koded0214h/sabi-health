# services/weather.py
import httpx
import asyncio
from datetime import datetime, timedelta

OPEN_METEO_URL = "https://api.open-meteo.com/v1/forecast"

MOCK_RAIN_ENABLED = False

async def get_rainfall(lat: float, lon: float) -> float:
    """
    Fetch total rainfall (mm) in the last 24 hours for given coordinates.
    Returns 0.0 if no data or error.
    """
    if MOCK_RAIN_ENABLED:
        return 25.5
    params = {
        "latitude": lat,
        "longitude": lon,
        "hourly": "precipitation",
        "past_days": 1,
        "timezone": "auto"
    }
    async with httpx.AsyncClient() as client:
        for attempt in range(3):
            try:
                resp = await client.get(OPEN_METEO_URL, params=params, timeout=10.0)
                resp.raise_for_status()
                data = resp.json()
                break  # Success
            except Exception as e:
                print(f"Open-Meteo attempt {attempt + 1} failed: {e}")
                if attempt == 2:
                    return 0.0
                await asyncio.sleep(1) # Simple backoff

    # Extract hourly precipitation for the last 24 hours
    hourly = data.get("hourly", {})
    times = hourly.get("time", [])
    precip = hourly.get("precipitation", [])

    if not times or not precip:
        return 0.0

    # Determine the cutoff time (24 hours ago from now)
    now = datetime.utcnow()
    cutoff = now - timedelta(hours=24)

    total = 0.0
    for t_str, p in zip(times, precip):
        # time format: "2025-02-21T00:00"
        t = datetime.fromisoformat(t_str.replace("Z", "+00:00"))
        if t >= cutoff:
            total += p
    return total