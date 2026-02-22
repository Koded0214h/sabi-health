# ai_service.py
import os
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

# Set up Gemini
api_key = os.getenv("GOOGLE_API_KEY") or os.getenv("GEMINI_API_KEY")
if api_key:
    genai.configure(api_key=api_key)
    model = genai.GenerativeModel('models/gemini-2.0-flash')
else:
    model = None

def generate_health_script(user_name: str, lga: str, risk_data: dict, personality: str = "Mama Health") -> str:
    """Generate a preventive health message in Nigerian Pidgin/English with a specific personality."""
    if not model:
        # Fallback if no API key
        return f"Hello {user_name}, this is your health assistant. There's risk in {lga}. Abeg stay safe!"

    risks_str = ", ".join(risk_data.get("risks", []))
    
    personality_prompts = {
        "Mama Health": "You are 'Mama Health', a caring, motherly figure powered by Gemini AI. Use 'Pikin', 'My child', 'In-law'.",
        "Dr. Sabi": "You are 'Dr. Sabi', a Gemini-powered medical professional. Use 'According to research', 'Science check'.",
        "Sentinel One": "You are 'Sentinel One', a high-tech Gemini proactive health guardian. Use 'Data indicates', 'Preemptive safety protocol'."
    }
    
    selected_personality = personality_prompts.get(personality, personality_prompts["Mama Health"])
    
    prompt = f"""
    {selected_personality}
    Location: {lga}
    User: {user_name}
    Risks: {risks_str}
    
    TASK: Give a short proactive health warning (under 80 words).
    State clearly that this is an AI-assisted health check powered by Gemini.
    MIX Nigerian Pidgin with English as is natural for your personality.
    INCLUDE at least two specific preventive measures related to the risks provided.
    SUGGEST care or first steps if they feel symptoms (e.g., using specific local health center info if implied, or general advice like 'drink plenty water' or 'see doctor').
    Always end with a check-in question like: "How your body dey?" or "Status check?".
    """
    
    try:
        response = model.generate_content(prompt)
        return response.text.strip().replace('"', '')

    except Exception as e:
        print(f"Gemini Error: {e}")
        return f"Nne/Nna, Sabi Health dey call you for {lga}. Risk don high for there. Abeg stay safe!"
