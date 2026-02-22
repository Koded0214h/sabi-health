# services/risk.py
from services.hotspots import is_hotspot

RAINFALL_THRESHOLD = 15.0  # mm in last 24h
CHOLERA_RAINFALL_THRESHOLD = 20.0 # mm in last 24h

def check_risk_for_lga(lga: str, rainfall: float) -> str:
    """
    Return 'HIGH' if LGA is a hotspot OR rainfall exceeds threshold.
    Otherwise return 'LOW'.
    """
    if is_hotspot(lga) or rainfall > RAINFALL_THRESHOLD:
        return "HIGH"
    return "LOW"