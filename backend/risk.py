# risk.py
# Simple stub for risk engine - will be expanded later
MOCK_HOTSPOTS = ["Kano", "Lagos", "Benue"]  # Example LGAs

def check_risk_for_lga(lga: str) -> str:
    """Return 'HIGH' if LGA is in mock hotspots, else 'LOW'."""
    if lga in MOCK_HOTSPOTS:
        return "HIGH"
    return "LOW"