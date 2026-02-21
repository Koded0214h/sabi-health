# voice_service.py
# Mock voice service for Sabi Health

def get_voice_url(script: str) -> str:
    """
    Generate audio from script and return URL.
    For MVP, we return a path to a static audio file or a mock URL.
    In production, this would call YarnGPT/Spitch API.
    """
    # Using a placeholder audio for demonstration
    # In a real implementation, we'd use requests to POST the script to the TTS API
    return "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3" 
