# main.py
import os
import uuid
from datetime import datetime

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, BackgroundTasks, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from twilio.rest import Client
from twilio.twiml.voice_response import VoiceResponse

from data import users_db, logs_db
from models import UserCreate, User, Log
from services import lga_coords, weather, risk, hotspots, tts

load_dotenv()  # Load environment variables from .env file

# Twilio configuration
TWILIO_ACCOUNT_SID = os.getenv("TWILIO_ACCOUNT_SID")
TWILIO_AUTH_TOKEN = os.getenv("TWILIO_AUTH_TOKEN")
TWILIO_PHONE_NUMBER = os.getenv("TWILIO_PHONE_NUMBER")
DOMAIN = os.getenv("DOMAIN", "http://localhost:8000")

app = FastAPI(title="Sabi Health API")

# Mount static audio directory
app.mount("/audio", StaticFiles(directory="audio"), name="audio")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Twilio client (if credentials present)
twilio_client = None
if TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN and TWILIO_PHONE_NUMBER:
    twilio_client = Client(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)
    print("✅ Twilio client initialized")
else:
    print("⚠️ Twilio credentials missing – using simulation")

# ----------------------------------------------------------------------
# Core endpoints
# ----------------------------------------------------------------------
@app.post("/register", response_model=User)
def register_user(user: UserCreate):
    new_user = User(**user.dict())
    users_db[new_user.id] = new_user
    return new_user

@app.get("/users")
def list_users():
    return list(users_db.values())

@app.get("/logs")
def get_logs():
    return logs_db

@app.get("/risk-check/{user_id}")
async def check_user_risk(user_id: str):
    user = users_db.get(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    coords = await lga_coords.get_coordinates(user.lga)
    if not coords:
        return {"user_id": user_id, "error": "Coordinates not found"}
    rainfall = await weather.get_rainfall(coords[0], coords[1])
    risk_level = risk.check_risk_for_lga(user.lga, rainfall)
    return {"user_id": user_id, "risk": risk_level, "rainfall_mm": rainfall}

# ----------------------------------------------------------------------
# Message generation (with YarnGPT)
# ----------------------------------------------------------------------
async def generate_health_message(lga: str, risk_level: str, rainfall: float):
    hotspot_info = hotspots.get_hotspot_info(lga)
    disease = hotspot_info["disease"] if hotspot_info else "unknown"
    script = f"Good evening! I see say {lga} dey inside {risk_level} risk area. "
    if disease != "unknown":
        script += f"We dey see {disease} for your area. "
    if rainfall > risk.RAINFALL_THRESHOLD:
        script += f"Heavy rain fit cause mosquito to plenty. "
    script += "Make sure you cover your food well well, use your mosquito net, and if anybody get fever, go hospital quick quick. Anybody dey sick for your house?"

    # Convert to speech via YarnGPT
    audio_url = await tts.text_to_speech(script, voice="Idera")
    return script, audio_url

# ----------------------------------------------------------------------
# TwiML generator (uses audio if available)
# ----------------------------------------------------------------------
def generate_twiml(script: str, audio_url: str = None, call_id: str = None) -> str:
    response = VoiceResponse()
    if audio_url:
        response.play(audio_url)
    else:
        response.say(script, voice="Polly.Joanna", language="en-US")

    if call_id:
        gather = response.gather(
            num_digits=1,
            action=f"{DOMAIN}/respond/{call_id}",
            method="POST",
            timeout=5
        )
        gather.say("If you have fever, press 1. If you are fine, press 2.")
        response.say("We didn't receive any response. Goodbye.")
    response.hangup()
    return str(response)

# ----------------------------------------------------------------------
# Call initiation (Twilio + simulation fallback)
# ----------------------------------------------------------------------
@app.post("/call-user/{user_id}")
async def call_user(user_id: str, background_tasks: BackgroundTasks):
    user = users_db.get(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    coords = await lga_coords.get_coordinates(user.lga)
    if not coords:
        return {"status": "error", "message": f"Coordinates not found for LGA: {user.lga}"}

    lat, lon = coords
    rainfall = await weather.get_rainfall(lat, lon)
    risk_level = risk.check_risk_for_lga(user.lga, rainfall)

    if risk_level == "LOW":
        return {
            "status": "ok",
            "risk": risk_level,
            "message": f"No significant risk detected for {user.lga} (rainfall: {rainfall:.1f}mm)."
        }

    # Generate script and audio
    script, audio_url = await generate_health_message(user.lga, risk_level, rainfall)

    call_id = str(uuid.uuid4())
    log_entry = Log(
        id=call_id,
        user_id=user_id,
        timestamp=datetime.utcnow().isoformat(),
        risk_type=risk_level,
        script=script,
        response=None
    )
    logs_db.append(log_entry)

    # If Twilio is available, place real call
    if twilio_client:
        try:
            twiml = generate_twiml(script, audio_url, call_id)
            call = twilio_client.calls.create(
                twiml=twiml,
                to=user.phone,
                from_=TWILIO_PHONE_NUMBER,
                status_callback=f"{DOMAIN}/call-status/{call_id}",
                status_callback_event=["completed", "answered"]
            )
            return {
                "status": "call_initiated",
                "method": "twilio",
                "call_sid": call.sid,
                "call_id": call_id,
                "risk": risk_level,
                "rainfall_mm": rainfall,
                "script": script
            }
        except Exception as e:
            print(f"Twilio call failed: {e}")
            # Fall through to simulation

    # Simulation fallback
    return {
        "status": "call_initiated",
        "method": "simulation",
        "risk": risk_level,
        "rainfall_mm": rainfall,
        "audio_url": audio_url,
        "script": script,
        "call_id": call_id
    }

# ----------------------------------------------------------------------
# Response webhook (handles both Twilio DTMF and simulation JSON)
# ----------------------------------------------------------------------

from fastapi import Form, Body
from pydantic import BaseModel

class UserResponse(BaseModel):
    response: str

@app.post("/respond/{call_id}")
async def record_response(
    call_id: str,
    Digits: str = Form(None),
    payload: UserResponse = Body(None)
):
    # Simulation mode: JSON payload
    if payload is not None:
        for log in logs_db:
            if log.id == call_id:
                log.response = payload.response
                return {"status": "ok", "message": "Response recorded"}
        raise HTTPException(status_code=404, detail="Call log not found")

    else:
        # Twilio webhook (form-encoded) – only reached if payload is None
        twiml_response = VoiceResponse()
        log_entry = next((log for log in logs_db if log.id == call_id), None)
        if not log_entry:
            twiml_response.say("Sorry, we couldn't find your call record.")
            twiml_response.hangup()
            return str(twiml_response)

        if Digits == "1":
            log_entry.response = "fever"
            health_center = "Kano General Hospital, Bompai Road, Kano"
            twiml_response.say(f"Please visit {health_center} immediately for a check-up. Stay safe.")
        elif Digits == "2":
            log_entry.response = "fine"
            twiml_response.say("Thank you. Stay safe and follow preventive measures.")
        else:
            twiml_response.say("We didn't receive a valid response. Goodbye.")
    twiml_response.hangup()
    return str(twiml_response)

# =====================

@app.post("/call-status/{call_id}")
async def call_status(call_id: str, CallStatus: str = None, **kwargs):
    print(f"Call {call_id} status: {CallStatus}")
    return {"status": "ok"}

# ----------------------------------------------------------------------
# Test endpoints (unchanged)
# ----------------------------------------------------------------------
@app.get("/test-rainfall")
async def test_rainfall(lga: str):
    coords = await lga_coords.get_coordinates(lga)
    if not coords:
        raise HTTPException(status_code=404, detail=f"LGA '{lga}' not found")
    lat, lon = coords
    rainfall = await weather.get_rainfall(lat, lon)
    return {"lga": lga, "rainfall_mm": rainfall}

@app.get("/test-coordinates")
async def test_coordinates(lga: str):
    coords = await lga_coords.get_coordinates(lga)
    if coords:
        return {"lga": lga, "coordinates": coords}
    return {"lga": lga, "error": "Coordinates not found"}

@app.get("/test-hotspot")
async def test_hotspot(lga: str):
    info = hotspots.get_hotspot_info(lga)
    if info:
        return {"lga": lga, "is_hotspot": True, "details": info}
    return {"lga": lga, "is_hotspot": False}

@app.get("/test-risk")
async def test_risk(lga: str):
    coords = await lga_coords.get_coordinates(lga)
    if not coords:
        return {"lga": lga, "error": "Coordinates not found"}
    rainfall = await weather.get_rainfall(coords[0], coords[1])
    risk_level = risk.check_risk_for_lga(lga, rainfall)
    return {
        "lga": lga,
        "coordinates": coords,
        "rainfall_mm": rainfall,
        "is_hotspot": hotspots.is_hotspot(lga),
        "risk": risk_level
    }

@app.get("/")
def root():
    return {"message": "Sabi Health API is running"}

# ----------------------------------------------------------------------
# Optional scheduler
# ----------------------------------------------------------------------
try:
    import scheduler
except ImportError:
    print("Scheduler not found – background tasks disabled")