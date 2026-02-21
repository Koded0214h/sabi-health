from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from models import UserCreate, User, Log
from data import users_db, logs_db
from risk import check_risk_for_lga
from ai_service import generate_health_script
from voice_service import get_voice_url
from datetime import datetime
import uuid

app = FastAPI(title="Sabi Health API")

# Enable CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, restrict to frontend domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/register", response_model=User)
def register_user(user: UserCreate):
    """Register a new user."""
    # Check if phone already exists? Optional for MVP
    new_user = User(**user.dict())
    users_db[new_user.id] = new_user
    return new_user

@app.get("/risk-check/{user_id}")
def check_user_risk(user_id: str):
    """Get current risk level for a user based on their LGA."""
    user = users_db.get(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    risk_data = check_risk_for_lga(user.lga)
    return {"user_id": user_id, "risk": risk_data}

@app.get("/trigger-call/{user_id}")
def trigger_call(user_id: str):
    """Generate script and audio URL for a health call."""
    user = users_db.get(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    risk_data = check_risk_for_lga(user.lga)
    script = generate_health_script(user.name, user.lga, risk_data)
    audio_url = get_voice_url(script)
    
    # Create an initial log entry
    log_entry = Log(
        user_id=user_id,
        timestamp=datetime.now().isoformat(),
        risk_type=risk_data["level"],
        script=script
    )
    logs_db.append(log_entry.dict())
    
    return {
        "user": user,
        "risk_data": risk_data,
        "script": script,
        "audio_url": audio_url,
        "log_id": log_entry.id
    }

@app.post("/respond")
def log_response(response_data: dict):
    """Log the user's response to the call."""
    # response_data should have log_id and response ("fever" or "fine")
    log_id = response_data.get("log_id")
    response_text = response_data.get("response")
    
    for log in logs_db:
        if log["id"] == log_id:
            log["response"] = response_text
            # If fever, we could add referral logic here
            referral = ""
            if response_text == "fever":
                referral = "Please visit the nearest Primary Health Center in " + log.get("lga", "your area")
            return {"status": "success", "referral": referral}
            
    return {"status": "error", "message": "Log entry not found"}

@app.get("/users")
def list_users():
    """Return all registered users (for dashboard)."""
    return list(users_db.values())

@app.get("/logs")
def get_logs():
    """Return all call logs."""
    return logs_db

# Optional: root endpoint
@app.get("/")
def root():
    return {"message": "Sabi Health API is running"}