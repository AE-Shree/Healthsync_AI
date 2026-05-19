import re
from datetime import datetime, timezone
from typing import List, Optional

from beanie import Document, Indexed
from pydantic import BaseModel, EmailStr, field_validator


class User(Document):
    email: Indexed(EmailStr, unique=True)
    hashed_password: str
    full_name: Optional[str] = None
    is_active: bool = True
    role: str = "patient"  # "patient" | "doctor" | "admin"
    created_at: datetime = datetime.now(timezone.utc)

    # Explicit consent-based sharing list
    allowed_access_list: List[str] = []

    class Settings:
        name = "users"


# ── Request / Response models ─────────────────────────────────────────

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    full_name: Optional[str] = None

    @field_validator("password")
    @classmethod
    def validate_password(cls, v: str) -> str:
        errors = []
        if len(v) < 8:
            errors.append("at least 8 characters")
        if not re.search(r"[A-Z]", v):
            errors.append("at least one uppercase letter")
        if not re.search(r"\d", v):
            errors.append("at least one number")
        if errors:
            raise ValueError("Password must have " + ", ".join(errors))
        return v


class UserResponse(BaseModel):
    email: EmailStr
    full_name: Optional[str] = None
    role: str
    is_active: bool
