# services/tts.py
import os
import uuid
import httpx
import aiofiles
from pathlib import Path

YARNGPT_URL = "https://yarngpt.ai/api/v1/tts"
AUDIO_DIR = Path("audio")  # Creates folder in project root
AUDIO_DIR.mkdir(exist_ok=True)

async def text_to_speech(text: str, voice: str = "Idera") -> str:
    """
    Convert text to speech using YarnGPT API.
    Returns a public URL (domain + /audio/filename).
    """
    api_key = os.getenv("YARNGPT_API_KEY")
    domain = os.getenv("DOMAIN", "http://localhost:8000")

    if not api_key:
        # Fallback for development – return placeholder
        print("⚠️ YARNGPT_API_KEY not set – using placeholder audio URL")
        return "https://example.com/audio.mp3"

    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }
    payload = {
        "text": text,
        "voice": voice,
        "response_format": "mp3"
    }

    async with httpx.AsyncClient(timeout=30.0) as client:
        resp = await client.post(YARNGPT_URL, json=payload, headers=headers)
        resp.raise_for_status()
        audio_data = resp.content

    filename = f"{uuid.uuid4()}.mp3"
    file_path = AUDIO_DIR / filename

    async with aiofiles.open(file_path, 'wb') as f:
        await f.write(audio_data)

    audio_url = f"{domain}/audio/{filename}"
    return audio_url