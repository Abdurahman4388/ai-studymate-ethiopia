"""Pydantic schemas for User and UserProfile."""

import uuid
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, EmailStr, Field, ConfigDict


class UserProfileBase(BaseModel):
    interface_language: str = Field(default="en", description="Preferred interface language (en, am, om)")
    ai_response_language: str = Field(default="en", description="Preferred AI response language (en, am, om)")
    university: Optional[str] = Field(default=None, description="Optional university or college name")
    department: Optional[str] = Field(default=None, description="Optional field of study")
    academic_year: Optional[int] = Field(default=None, ge=1, le=8, description="Current academic year")


class UserProfileResponse(UserProfileBase):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    created_at: datetime
    updated_at: datetime


class UserBase(BaseModel):
    email: EmailStr
    full_name: str = Field(..., min_length=2, max_length=255)


class UserCreate(UserBase):
    password: str = Field(..., min_length=6, max_length=128)
    interface_language: str = Field(default="en")
    ai_response_language: str = Field(default="en")
    university: Optional[str] = None
    department: Optional[str] = None
    academic_year: Optional[int] = None


class UserResponse(UserBase):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    role: str
    is_active: bool
    created_at: datetime
    profile: Optional[UserProfileResponse] = None
