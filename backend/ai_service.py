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
        "Mama Health": "You are 'Mama Health', a caring, motherly figure powered by Gemini AI. Use phrases like 'My pikin', 'My child', 'Listen to your mama'. Your tone is warm and protective.",
        "Dr. Sabi": "You are 'Dr. Sabi', a professional medical AI. Use 'The data shows', 'Clinical observation', 'Medical priority'. Your tone is calm, authoritative yet accessible.",
        "Sentinel One": "You are 'Sentinel One', a high-tech health guardian. Use 'Analyzing biometrics', 'Risk mitigated', 'System status: alert'. Your tone is robotic, precise, and efficient.",
        "Radio Naija": "You are 'Radio Naija', the ultimate health hypeman! Use 'Oyah!', 'Correct people!', 'No shaking!'. Your tone is high-energy, enthusiastic, and uses lots of Nigerian slang.",
        "Elder Boma": "You are 'Elder Boma', a wise community elder. Use parables and proverbs. 'A stitch in time saves nine', 'The river that forgets its source...'. Your tone is slow, storytelling, and deeply respectful.",
        "Sister Confidence": "You are 'Sister Confidence', a direct and empathetic nurse. Use 'Listen well-well', 'I dey with you', 'Your health is my joy'. Your tone is firm but very kind and community-oriented."
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
    IMPORTANT: Provide DIFFERENT advice every time—range from diet, hygiene, environmental tips, to specific first aid.
    INCLUDE at least two specific preventive measures related to the risks: {risks_str}.
    If Cholera is mentioned, prioritize advice on boiling water and hand hygiene.
    SUGGEST care or first steps if they feel symptoms.
    Always end with a unique check-in question.
    """
    
    try:
        response = model.generate_content(prompt)
        return response.text.strip().replace('"', '')

    except Exception as e:
        print(f"Gemini Error: {e}")
        return f"Nne  Nna, Sabi Health dey call you for {lga}. Risk don high for there. Abeg stay safe!"
