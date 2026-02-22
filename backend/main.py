# main.py
import os
import uuid
from datetime import datetime

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, BackgroundTasks, Form, Depends, Body
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from twilio.rest import Client
from twilio.twiml.voice_response import VoiceResponse

from data import AsyncSessionLocal, init_db
from models import UserCreate, User, Log, DBUser, DBLog
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from services import lga_coords, weather, risk, hotspots, tts
import ai_service
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

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

@app.on_event("startup")
async def startup_event():
    await init_db()
    print("🚀 Database initialized")

# Dependency to get DB session
async def get_db():
    async with AsyncSessionLocal() as session:
        yield session

# ----------------------------------------------------------------------
# Core endpoints
# ----------------------------------------------------------------------
@app.post("/register", response_model=User)
async def register_user(user: UserCreate, db: AsyncSession = Depends(get_db)):
    hashed_password = get_password_hash(user.password)
    db_user = DBUser(**user.dict(exclude={"password"}), hashed_password=hashed_password)
    db.add(db_user)
    await db.commit()
    await db.refresh(db_user)
    return User.from_orm(db_user)

@app.post("/login", response_model=User)
async def login_user(user_login: UserLogin, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(DBUser).where(DBUser.phone == user_login.phone))
    user = result.scalar_one_or_none()

    if not user:
        raise HTTPException(status_code=400, detail="Incorrect phone number or password")
    
    if not verify_password(user_login.password, user.hashed_password):
        raise HTTPException(status_code=400, detail="Incorrect phone number or password")
    
    return User.from_orm(user)

@app.get("/users", response_model=list[User])
async def list_users(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(DBUser))
    users = result.scalars().all()
    return [User.from_orm(u) for u in users]

@app.post("/log", response_model=Log)
async def create_log(log_data: LogRequest, db: AsyncSession = Depends(get_db)):
    db_log = DBLog(
        id=str(uuid.uuid4()),
        user_id=log_data.user_id,
        timestamp=datetime.utcnow().isoformat(),
        risk_type=log_data.risk_type,
        script=log_data.script,
        response=None
    )
    db.add(db_log)
    await db.commit()
    await db.refresh(db_log)
    return Log.from_orm(db_log)

@app.get("/logs", response_model=list[Log])
async def get_logs(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(DBLog))
    logs = result.scalars().all()
    return [Log.from_orm(l) for l in logs]

@app.get("/risk-check/{user_id}")
async def check_user_risk(user_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(DBUser).where(DBUser.id == user_id))
    user = result.scalar_one_or_none()
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
async def generate_health_message(user_name: str, lga: str, risk_level: str, rainfall: float):
    hotspot_info = hotspots.get_hotspot_info(lga)
    risks = []
    if hotspot_info:
        risks.append(hotspot_info["disease"])
    if rainfall > risk.RAINFALL_THRESHOLD:
        risks.append("malaria (heavy rain)")
    
    risk_data = {"risks": risks, "level": risk_level}
    
    # Generate script via Gemini
    script = ai_service.generate_health_script(user_name, lga, risk_data)

    # Convert to speech via YarnGPT
    audio_url = await tts.text_to_speech(script, voice="Idera")
    return script, audio_url

@app.post("/generate-message")
async def generate_message(user_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(DBUser).where(DBUser.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    coords = await lga_coords.get_coordinates(user.lga)
    if not coords:
        raise HTTPException(status_code=404, detail=f"Coordinates not found for LGA: {user.lga}")
        
    rainfall = await weather.get_rainfall(coords[0], coords[1])
    risk_level = risk.check_risk_for_lga(user.lga, rainfall)
    
    script, audio_url = await generate_health_message(user.name, user.lga, risk_level, rainfall)
    return {"user_id": user_id, "script": script, "audio_url": audio_url}

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
async def call_user(user_id: str, background_tasks: BackgroundTasks, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(DBUser).where(DBUser.id == user_id))
    user = result.scalar_one_or_none()
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
    script, audio_url = await generate_health_message(user.name, user.lga, risk_level, rainfall)

    call_id = str(uuid.uuid4())
    db_log = DBLog(
        id=call_id,
        user_id=user_id,
        timestamp=datetime.utcnow().isoformat(),
        risk_type=risk_level,
        script=script,
        response=None
    )
    db.add(db_log)
    await db.commit()

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

class LogRequest(BaseModel):
    user_id: str
    risk_type: str
    script: str

class UserLogin(BaseModel):
    phone: int
    password: str

@app.post("/respond/{call_id}")
async def record_response(
    call_id: str,
    Digits: str = Form(None),
    payload: UserResponse = Body(None),
    db: AsyncSession = Depends(get_db)
):
    # Fetch log entry from DB
    result = await db.execute(select(DBLog).where(DBLog.id == call_id))
    log_entry = result.scalar_one_or_none()
    
    if not log_entry:
        if payload is not None:
             raise HTTPException(status_code=404, detail="Call log not found")
        else:
             twiml_response = VoiceResponse()
             twiml_response.say("Sorry, we couldn't find your call record.")
             twiml_response.hangup()
             return str(twiml_response)

    # Simulation mode: JSON payload
    if payload is not None:
        log_entry.response = payload.response
        await db.commit()
        return {"status": "ok", "message": "Response recorded"}

    else:
        # Twilio webhook (form-encoded)
        twiml_response = VoiceResponse()
        
        HEALTH_CENTERS = {
            "kano": "Kano General Hospital, Bompai Road, Kano",
            "lagos": "Lagos Island Maternity Hospital, Campbell Street, Lagos",
            "abuja": "Asokoro District Hospital, Binji Garden, Abuja",
            "benue": "Federal Medical Centre, Makurdi, Benue",
            "sokoto": "Usmanu Danfodiyo University Teaching Hospital, Sokoto",
            "kaduna": "Barau Dikko Teaching Hospital, Lafia Road, Kaduna",
            "maiduguri": "State Specialist Hospital, Maiduguri, Borno",
            "enugu": "Enugu State University Teaching Hospital, Parklane, Enugu"
        }
        
        # We need to fetch the user to get the LGA
        user_result = await db.execute(select(DBUser).where(DBUser.id == log_entry.user_id))
        user = user_result.scalar_one_or_none()
        lga = user.lga.lower() if user else "unknown"
        health_center = HEALTH_CENTERS.get(lga, "the nearest primary health center")

        if Digits == "1":
            log_entry.response = "fever"
            twiml_response.say(f"Please visit {health_center} immediately for a check-up. Stay safe.")
        elif Digits == "2":
            log_entry.response = "fine"
            twiml_response.say("Thank you. Stay safe and follow preventive measures.")
        else:
            twiml_response.say("We didn't receive a valid response. Goodbye.")
        
        await db.commit()
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

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)