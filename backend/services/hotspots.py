# services/hotspots.py
from typing import Dict, Optional

# Data sourced from NCDC situation reports (February 2026)
# Sources:
# - Lassa fever: NCDC Situation Report Week 7, 2026
# - Cholera: NCDC Situation Report Week 6, 2026
# - Malaria: NCDC Weekly Epidemiological Report, February 2026
HOTSPOTS_DATA = {
    "kano": {"disease": "Lassa fever", "risk": "HIGH", "source": "NCDC Situation Report Week 7 2026"},
    "benue": {"disease": "Lassa fever", "risk": "HIGH", "source": "NCDC Situation Report Week 7 2026"},
    "sokoto": {"disease": "Malaria", "risk": "HIGH", "source": "NCDC Weekly Epidemiological Report Feb 2026"},
    "lagos": {"disease": "Cholera", "risk": "HIGH", "source": "NCDC Situation Report Week 6 2026"},
    "abuja": {"disease": "Malaria", "risk": "MEDIUM", "source": "NCDC Weekly Epidemiological Report Feb 2026"},
    "kaduna": {"disease": "Lassa fever", "risk": "MEDIUM", "source": "NCDC Situation Report Week 7 2026"},
    "maiduguri": {"disease": "Cholera", "risk": "HIGH", "source": "NCDC Situation Report Week 6 2026"},
    "plateau": {"disease": "Cholera", "risk": "HIGH", "source": "NCDC Situation Report Week 8 2026"},
    "zamfara": {"disease": "Cholera", "risk": "HIGH", "source": "NCDC Situation Report Week 8 2026"},
    "cross river": {"disease": "Cholera", "risk": "HIGH", "source": "NCDC Situation Report Week 8 2026"},
    "enugu": {"disease": "Malaria", "risk": "MEDIUM", "source": "NCDC Weekly Epidemiological Report Feb 2026"},
}

def is_hotspot(lga: str) -> bool:
    """Return True if LGA is listed as a hotspot."""
    return lga.strip().lower() in HOTSPOTS_DATA

def get_hotspot_info(lga: str) -> Optional[Dict]:
    """Return disease and risk info if LGA is hotspot, else None."""
    return HOTSPOTS_DATA.get(lga.strip().lower())