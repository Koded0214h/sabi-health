from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from models import UserCreate, User
from data import users_db, logs_db
from risk import check_risk_for_lga
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
    risk = check_risk_for_lga(user.lga)
    return {"user_id": user_id, "risk": risk}

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