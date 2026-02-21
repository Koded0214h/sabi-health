# data.py
from models import User, Log
from typing import Dict, List

# In-memory storage
users_db: Dict[str, User] = {}
logs_db: List[Log] = []