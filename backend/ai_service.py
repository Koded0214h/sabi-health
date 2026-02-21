# ai_service.py
import os
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

# Set up Gemini
api_key = os.getenv("GOOGLE_API_KEY") or os.getenv("GEMINI_API_KEY")
if api_key:
    genai.configure(api_key=api_key)
    model = genai.GenerativeModel('gemini-1.5-flash')
else:
    model = None

def generate_health_script(user_name: str, lga: str, risk_data: dict) -> str:
    """Generate a preventive health message in Nigerian Pidgin/English."""
    if not model:
        # Fallback if no API key
        return f"Hello {user_name}, this is Sabi Health. There is a high risk in {lga} due to {', '.join(risk_data.get('risks', []))}. Please stay safe."

    risks_str = ", ".join(risk_data.get("risks", []))
    prompt = f"""
    You are 'Sabi Health', a friendly Nigerian health assistant. 
    User Name: {user_name}
    LGA: {lga}
    Risks: {risks_str}
    
    Generate a short, friendly preventive message in authentic Nigerian Pidgin/English.
    Include specific advice based on the risks mentioned (e.g., if Lassa, mention rats/covered food. If rain/malaria, mention nets).
    End by asking if anyone in their house has a fever.
    Keep it under 60 words. Speak like a caring neighbor.
    """
    
    try:
        response = model.generate_content(prompt)
        return response.text.strip()
    except Exception as e:
        print(f"Gemini Error: {e}")
        return f"Nne/Nna, Sabi Health dey call you for {lga}. Risk don high for there. Abeg stay safe!"
