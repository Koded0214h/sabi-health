from pydantic import BaseModel, Field
from typing import Optional
import uuid
from sqlalchemy import Column, String, Integer, Text, BigInteger
from sqlalchemy.orm import declarative_base

Base = declarative_base()

class DBUser(Base):
    __tablename__ = "users"
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String, nullable=False)
    phone = Column(BigInteger, unique=True, nullable=False)
    lga = Column(String, nullable=False)
    hashed_password = Column(String, nullable=False)
    ai_personality = Column(String, default="Mama Health")  # Custom field for personal guardian

class DBLog(Base):
    __tablename__ = "logs"
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, nullable=False)
    timestamp = Column(String, nullable=False)
    risk_type = Column(String)
    script = Column(Text)
    audio_url = Column(String, nullable=True)
    response = Column(String)

class DBMessage(Base):
    __tablename__ = "messages"
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, nullable=False)
    timestamp = Column(String, nullable=False)
    title = Column(String, nullable=False)
    content = Column(Text, nullable=False)
    type = Column(String) # "rain", "outbreak", "prediction", "alert"
    is_read = Column(Integer, default=0)

class DBSymptom(Base):
    __tablename__ = "symptoms"
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, nullable=False)
    timestamp = Column(String, nullable=False)
    fever = Column(Integer, default=0) # 0 or 1
    cough = Column(Integer, default=0)
    headache = Column(Integer, default=0)
    fatigue = Column(Integer, default=0)
    diarrhea = Column(Integer, default=0)
    vomiting = Column(Integer, default=0)
    notes = Column(Text, nullable=True)

class UserBase(BaseModel):
    name: str
    phone: int
    lga: str
    ai_personality: Optional[str] = "Mama Health"

class UserCreate(UserBase):
    password: str

class User(UserBase):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    
    class Config:
        from_attributes = True

class UserResponse(BaseModel):
    response: str
    lat: Optional[float] = None
    lon: Optional[float] = None

class SymptomLog(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    timestamp: Optional[str] = None
    fever: int = 0
    cough: int = 0
    headache: int = 0
    fatigue: int = 0
    diarrhea: int = 0
    vomiting: int = 0
    notes: Optional[str] = None
    lat: Optional[float] = None
    lon: Optional[float] = None

    class Config:
        from_attributes = True

class Log(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    timestamp: str
    risk_type: Optional[str] = None
    script: Optional[str] = None
    audio_url: Optional[str] = None
    response: Optional[str] = None

    class Config:
        from_attributes = True

class LogRequest(BaseModel):
    user_id: str
    risk_type: str
    script: str

class UserLogin(BaseModel):
    phone: int
    password: str

class MessageBase(BaseModel):
    user_id: str
    title: str
    content: str
    type: str # "rain", "outbreak", "prediction", "alert"

class MessageCreate(MessageBase):
    pass

class Message(MessageBase):
    id: str
    timestamp: str
    is_read: int

    class Config:
        from_attributes = True
