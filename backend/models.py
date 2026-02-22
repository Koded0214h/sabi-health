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
    phone = Column(BigInteger, nullable=False)
    lga = Column(String, nullable=False)
    hashed_password = Column(String, nullable=False)

class DBLog(Base):
    __tablename__ = "logs"
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, nullable=False)
    timestamp = Column(String, nullable=False)
    risk_type = Column(String)
    script = Column(Text)
    response = Column(String)

class UserBase(BaseModel):
    name: str
    phone: int
    lga: str  # Local Government Area

class UserCreate(UserBase):
    password: str

class User(UserBase):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    
    class Config:
        from_attributes = True

class Log(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    timestamp: str
    risk_type: Optional[str] = None
    script: Optional[str] = None
    response: Optional[str] = None

    class Config:
        from_attributes = True
