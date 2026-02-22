# services/prediction_service.py
import random
from datetime import datetime, timedelta

def generate_weekly_prediction(lga: str, current_rainfall: float) -> dict:
    """
    Generate a mock weekly health prediction based on LGA and rainfall.
    """
    diseases = ["Malaria", "Cholera", "Lassa Fever", "Typhoid"]
    
    # Simple logic: if rainfall is high, prioritize Water-borne/Mosquito diseases
    if current_rainfall > 15.0:
        primary_risk = random.choice(["Malaria", "Cholera"])
        risk_level = "HIGH"
    else:
        primary_risk = random.choice(diseases)
        risk_level = "MODERATE" if random.random() > 0.5 else "LOW"
        
    next_week = (datetime.utcnow() + timedelta(days=7)).strftime("%B %d, %Y")
    
    predictions = {
        "lga": lga,
        "week_starting": datetime.utcnow().strftime("%B %d, %Y"),
        "predicted_risk": primary_risk,
        "risk_level": risk_level,
        "confidence": f"{random.randint(70, 95)}%",
        "summary": f"Based on environmental data and historical trends in {lga}, we expect a {risk_level.lower()} potential for {primary_risk} outbreaks for the week ending {next_week}.",
        "recommendation": f"Ensure you have {primary_risk.lower()} preventive measures in place. Clean gutters and stay hydrated."
    }
    
    return predictions
