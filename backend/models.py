# models.py
from pydantic import BaseModel, Field
from typing import Optional
import uuid

class UserBase(BaseModel):
    name: str
    phone: str
    lga: str  # Local Government Area

class UserCreate(UserBase):
    pass

class User(UserBase):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))

class Log(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    timestamp: str
    risk_type: Optional[str] = None
    script: Optional[str] = None
    response: Optional[str] = None