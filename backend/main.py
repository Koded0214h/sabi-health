# main.py
import os
import uuid
from datetime import datetime

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, BackgroundTasks, Form, Depends, Body, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from twilio.rest import Client
from twilio.twiml.voice_response import VoiceResponse

from data import AsyncSessionLocal, init_db
from models import UserCreate, User, Log, DBUser, DBLog, SymptomLog, DBSymptom, UserResponse, LogRequest, UserLogin, DBMessage, Message, MessageCreate
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from services import lga_coords, weather, risk, hotspots, tts, health_centers, prediction_service, health_tips
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

app.mount("/audio", StaticFiles(directory="audio"), name="audio")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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

async def get_db():
    async with AsyncSessionLocal() as session:
        yield session

@app.post("/register", response_model=User)
async def register_user(user: UserCreate, db: AsyncSession = Depends(get_db)):
    try:
        existing_user = await db.execute(select(DBUser).where(DBUser.phone == user.phone))
        if existing_user.scalar_one_or_none():
            raise HTTPException(status_code=400, detail="Phone number already registered")

        hashed_password = get_password_hash(user.password)
        db_user = DBUser(**user.dict(exclude={"password"}), hashed_password=hashed_password)
        db.add(db_user)
        await db.commit()
        await db.refresh(db_user)
        return User.from_orm(db_user)
    except Exception as e:
        await db.rollback()
        if isinstance(e, HTTPException):
            raise e
        print(f"Registration error: {e}")
        raise HTTPException(status_code=500, detail=f"Registration failed: {str(e)}")

@app.post("/login", response_model=User)
async def login_user(user_login: UserLogin, db: AsyncSession = Depends(get_db)):
    try:
        result = await db.execute(select(DBUser).where(DBUser.phone == user_login.phone))
        users = result.scalars().all()

        if not users:
            raise HTTPException(status_code=401, detail="Incorrect phone number or password")
        
        user = users[0]
        if not verify_password(user_login.password, user.hashed_password):
            raise HTTPException(status_code=401, detail="Incorrect phone number or password")
        
        return User.from_orm(user)
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        print(f"Login error: {e}")
        raise HTTPException(status_code=500, detail="Internal server error during login")

@app.get("/profile/{user_id}", response_model=User)
async def get_user_profile(user_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(DBUser).where(DBUser.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
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

@app.get("/health-centers")
async def list_health_centers():
    return health_centers.HEALTH_CENTERS

@app.get("/me/{user_id}")
async def get_me(user_id: str, db: AsyncSession = Depends(get_db)):
    user_result = await db.execute(select(DBUser).where(DBUser.id == user_id))
    user = user_result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    log_result = await db.execute(select(DBLog).where(DBLog.user_id == user_id).order_by(DBLog.timestamp.desc()))
    logs = log_result.scalars().all()

    symptom_result = await db.execute(select(DBSymptom).where(DBSymptom.user_id == user_id).order_by(DBSymptom.timestamp.desc()))
    symptoms = symptom_result.scalars().all()
    
    base_score = 100
    
    coords = await lga_coords.get_coordinates(user.lga)
    risk_level = "LOW"
    rainfall = 0
    if coords:
        rainfall = await weather.get_rainfall(coords[0], coords[1])
        risk_level = risk.check_risk_for_lga(user.lga, rainfall)
    
    if risk_level == "HIGH": base_score -= 30
    elif risk_level == "MEDIUM": base_score -= 15
    
    recent_symptoms = symptoms[:3]
    for s in recent_symptoms:
        if s.fever: base_score -= 10
        if s.cough: base_score -= 5
        if getattr(s, 'diarrhea', 0): base_score -= 15
        if getattr(s, 'vomiting', 0): base_score -= 10
    
    return {
        "user": User.from_orm(user),
        "logs": [Log.from_orm(l) for l in logs],
        "symptoms": [SymptomLog.from_orm(s) for s in symptoms],
        "health_score": max(0, base_score),
        "current_risk": risk_level,
        "rainfall_mm": rainfall
    }

@app.post("/symptoms")
async def log_symptoms(data: SymptomLog, db: AsyncSession = Depends(get_db)):
    db_symptom = DBSymptom(
        user_id=data.user_id,
        timestamp=datetime.utcnow().isoformat(),
        fever=data.fever,
        cough=data.cough,
        headache=data.headache,
        fatigue=data.fatigue,
        diarrhea=data.diarrhea,
        vomiting=data.vomiting,
        notes=data.notes
    )
    db.add(db_symptom)
    
    hospital_data = None
    if data.fever:
        if data.lat and data.lon:
            hospital_data = health_centers.get_closest_hospital(data.lat, data.lon)
        else:
            result = await db.execute(select(DBUser).where(DBUser.id == data.user_id))
            user = result.scalar_one_or_none()
            if user:
                hospital_data = health_centers.get_nearest_health_center(user.lga)
            
    await db.commit()
    await db.refresh(db_symptom)
    
    return {
        "symptom": SymptomLog.from_orm(db_symptom),
        "hospital": hospital_data,
        "lat": data.lat,
        "lon": data.lon
    }



async def generate_health_message(user_name: str, lga: str, risk_level: str, rainfall: float, personality: str = "Mama Health", generate_audio: bool = True):
    hotspot_info = hotspots.get_hotspot_info(lga)
    risks = []
    if hotspot_info:
        risks.append(hotspot_info["disease"])
    if rainfall > risk.RAINFALL_THRESHOLD:
        risks.append("malaria (heavy rain)")
    if rainfall > risk.CHOLERA_RAINFALL_THRESHOLD:
        risks.append("cholera (contamination risk from flooding)")
    
    risk_data = {"risks": risks, "level": risk_level}
    
    script = ai_service.generate_health_script(user_name, lga, risk_data, personality)

    audio_url = None
    if generate_audio:
        # Convert to speech via YarnGPT
        audio_url = await tts.text_to_speech(script, voice="Idera")
    return script, audio_url

@app.post("/generate-message")
async def generate_message(user_id: str, generate_audio: bool = False, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(DBUser).where(DBUser.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    coords = await lga_coords.get_coordinates(user.lga)
    if not coords:
        raise HTTPException(status_code=404, detail=f"Coordinates not found for LGA: {user.lga}")
        
    rainfall = await weather.get_rainfall(coords[0], coords[1])
    risk_level = risk.check_risk_for_lga(user.lga, rainfall)
    
    script, audio_url = await generate_health_message(user.name, user.lga, risk_level, rainfall, user.ai_personality, generate_audio=generate_audio)
    return {"user_id": user_id, "script": script, "audio_url": audio_url}


# ----------------------------------------------------------------------
# TwiML generator (uses audio if available)
# ----------------------------------------------------------------------
def generate_twiml(script: str, audio_url: str = None, call_id: str = None) -> str:
    response = VoiceResponse()
    if audio_url:
        response.play(audio_url)
    else:
        response.say(script, voice="Polly.Amy-Neural", language="en-US")

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
@app.put("/call-user/{user_id}")
async def call_user(user_id: str, background_tasks: BackgroundTasks, force: bool = False, db: AsyncSession = Depends(get_db)):
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

    if risk_level == "LOW" and not force:
        return {
            "status": "ok",
            "risk": risk_level,
            "message": f"No significant risk detected for {user.lga} (rainfall: {rainfall:.1f}mm)."
        }

    # If Twilio is available, generate audio for it (or we could use Polly exclusively)
    # The user said "we dont have to save the audio file", so let's skip YarnGPT entirely for now
    # and rely on Twilio Polly for real calls and Web Speech API for simulations.
    script, audio_url = await generate_health_message(
        user.name, user.lga, risk_level, rainfall, user.ai_personality, generate_audio=True
    )


    call_id = str(uuid.uuid4())
    db_log = DBLog(
        id=call_id,
        user_id=user_id,
        timestamp=datetime.utcnow().isoformat(),
        risk_type=risk_level,
        script=script,
        audio_url=audio_url,
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


@app.post("/respond/{call_id}")
async def record_response(
    call_id: str,
    request: Request,
    db: AsyncSession = Depends(get_db)
):
    # Fetch log entry from DB
    result = await db.execute(select(DBLog).where(DBLog.id == call_id))
    log_entry = result.scalar_one_or_none()
    
    # Try to parse body as JSON first (Simulation mode)
    payload_data = None
    is_json = False
    if "application/json" in request.headers.get("content-type", ""):
        try:
            payload_data = await request.json()
            is_json = True
        except:
            pass

    if not log_entry:
        if is_json:
             raise HTTPException(status_code=404, detail="Call log not found")
        else:
             twiml_response = VoiceResponse()
             twiml_response.say("Sorry, we couldn't find your call record.")
             twiml_response.hangup()
             return str(twiml_response)

    # Simulation mode: JSON payload
    if is_json and payload_data:
        response_type = payload_data.get("response")
        log_entry.response = response_type
        
        hospital_data = None
        if response_type == "fever":
            if payload_data.get("lat") and payload_data.get("lon"):
                hospital_data = health_centers.get_closest_hospital(payload_data["lat"], payload_data["lon"])
            else:
                user_result = await db.execute(select(DBUser).where(DBUser.id == log_entry.user_id))
                user = user_result.scalar_one_or_none()
                if user:
                    hospital_data = health_centers.get_nearest_health_center(user.lga)
        
        await db.commit()
        return {
            "status": "ok", 
            "message": "Response recorded",
            "hospital": hospital_data
        }

    else:
        # Twilio webhook (form-encoded)
        form_data = await request.form()
        Digits = form_data.get("Digits")
        
        twiml_response = VoiceResponse()
        
        # We need to fetch the user to get the LGA
        user_result = await db.execute(select(DBUser).where(DBUser.id == log_entry.user_id))
        user = user_result.scalar_one_or_none()
        lga = user.lga if user else "unknown"
        
        hospital_data = health_centers.get_nearest_health_center(lga)
        recommendation = hospital_data["recommendation"] if hospital_data else health_centers.get_default_recommendation()

        if Digits == "1":
            log_entry.response = "fever"
            twiml_response.say(f"{recommendation} Stay safe.")
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

# ----------------------------------------------------------------------
# Mock Rain & Messages
# ----------------------------------------------------------------------

@app.get("/mock-rain")
async def get_mock_rain_status():
    return {"enabled": weather.MOCK_RAIN_ENABLED}

@app.post("/mock-rain")
async def toggle_mock_rain(
    enabled: bool = Body(embed=True), 
    user_id: str = Body(None, embed=True),
    db: AsyncSession = Depends(get_db)
):
    weather.MOCK_RAIN_ENABLED = enabled
    
    if user_id and enabled:
        msg = DBMessage(
            user_id=user_id,
            timestamp=datetime.utcnow().isoformat(),
            title="Heavy Rain Detected (Simulated)",
            content="Heavy rain is fall-ing! Abeg clean your environment and clear gutters to avoid malaria and cholera.",
            type="rain"
        )
        db.add(msg)
        await db.commit()
        
    return {"status": "ok", "enabled": enabled}

@app.get("/messages/{user_id}", response_model=list[Message])
async def get_user_messages(user_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(DBMessage).where(DBMessage.user_id == user_id).order_by(DBMessage.timestamp.desc())
    )
    messages = result.scalars().all()
    return [Message.from_orm(m) for m in messages]

@app.post("/messages", response_model=Message)
async def create_message(msg_data: MessageCreate, db: AsyncSession = Depends(get_db)):
    db_msg = DBMessage(
        user_id=msg_data.user_id,
        timestamp=datetime.utcnow().isoformat(),
        title=msg_data.title,
        content=msg_data.content,
        type=msg_data.type
    )
    db.add(db_msg)
    await db.commit()
    await db.refresh(db_msg)
    return Message.from_orm(db_msg)

@app.post("/predict-weekly/{user_id}")
async def predict_weekly(user_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(DBUser).where(DBUser.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    coords = await lga_coords.get_coordinates(user.lga)
    rainfall = await weather.get_rainfall(coords[0], coords[1]) if coords else 0.0
    
    prediction = prediction_service.generate_weekly_prediction(user.lga, rainfall)
    
    # Save as a message
    db_msg = DBMessage(
        user_id=user_id,
        timestamp=datetime.utcnow().isoformat(),
        title=f"Weekly Prediction: {prediction['predicted_risk']} Outlook",
        content=prediction['summary'] + " " + prediction['recommendation'],
        type="prediction"
    )
    db.add(db_msg)
    await db.commit()
    
    return prediction

@app.post("/chat")
async def chat_with_sabi(message: str = Body(..., embed=True), user_id: str = Body(None, embed=True), db: AsyncSession = Depends(get_db)):
    user_name = "Member"
    personality = "Mama Health"
    lga = "Lagos"
    
    if user_id:
        result = await db.execute(select(DBUser).where(DBUser.id == user_id))
        user = result.scalar_one_or_none()
        if user:
            user_name = user.name
            personality = user.ai_personality
            lga = user.lga

    prompt = f"""
    You are {personality}, a health guardian powered by Gemini AI.
    User Name: {user_name}
    User Location (LGA): {lga}
    
    User says: {message}
    
    TASK: Respond to the user's health query or greeting in a culturally relevant Nigerian way (mix Pidgin and English).
    Be helpful, preventive, and caring. Keep the response under 100 words.
    Use Nigerian proverbs or slang where appropriate for your personality.
    Always state that you are an AI assistant.
    """
    
    try:
        response = ai_service.model.generate_content(prompt)
        return {"response": response.text.strip().replace('"', '')}
    except Exception as e:
        print(f"Chat Error: {e}")
        return {"response": "Abeg, my brain small-small reset. Ask me again later, my pikin."}

@app.post("/generate-cultural-tip/{user_id}")
async def generate_cultural_tip(user_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(DBUser).where(DBUser.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    tip = health_tips.get_random_tip()
    
    # Save as a message
    db_msg = DBMessage(
        user_id=user_id,
        timestamp=datetime.utcnow().isoformat(),
        title=f"Sabi Tip: {tip['title']}",
        content=tip['content'],
        type="tip"
    )
    db.add(db_msg)
    await db.commit()
    await db.refresh(db_msg)
    
    return {"status": "ok", "message": Message.from_orm(db_msg)}

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