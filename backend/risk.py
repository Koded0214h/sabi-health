# risk.py
import requests
from lga_coords import get_coords_for_lga

# Mock hotspots from PRD
MOCK_HOTSPOTS = ["Kano", "Lagos", "Benue", "Maiduguri"]

def get_rainfall_24h(lat: float, lon: float) -> float:
    """Fetch total rainfall in the last 24h from Open-Meteo."""
    try:
        url = f"https://api.open-meteo.com/v1/forecast?latitude={lat}&longitude={lon}&daily=precipitation_sum&timezone=auto"
        response = requests.get(url, timeout=5)
        data = response.json()
        if "daily" in data and "precipitation_sum" in data["daily"]:
            # Today's forecast/current rainfall
            return data["daily"]["precipitation_sum"][0]
    except Exception as e:
        print(f"Error fetching weather: {e}")
    return 0.0

def check_risk_for_lga(lga: str) -> dict:
    """Return risk assessment for an LGA."""
    coords = get_coords_for_lga(lga)
    rainfall = get_rainfall_24h(coords["lat"], coords["lon"])
    
    is_hotspot = lga in MOCK_HOTSPOTS
    high_rain = rainfall > 15.0
    
    risk_level = "LOW"
    risks = []
    
    if is_hotspot:
        risk_level = "HIGH"
        risks.append("Lassa fever hotspot")
    if high_rain:
        risk_level = "HIGH"
        risks.append(f"Heavy rain ({rainfall}mm) - Malaria spike risk")
        
    return {
        "level": risk_level,
        "rainfall": rainfall,
        "risks": risks,
        "lga": lga
    }