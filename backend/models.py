"""
models.py — All Pydantic models for request/response validation.

Pydantic checks every field's type at runtime, so if the frontend sends
wrong data you get a clear 422 error instead of a cryptic crash.
"""

from __future__ import annotations
from datetime import date
from typing import Optional, List
from pydantic import BaseModel, EmailStr, field_validator, model_validator
import re


# ── Auth ──────────────────────────────────────────────────────────────────────

class RegisterRequest(BaseModel):
    email: EmailStr
    password: str
    full_name: str

    @field_validator("password")
    @classmethod
    def password_strength(cls, v: str) -> str:
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters")
        return v

    @field_validator("full_name")
    @classmethod
    def name_not_empty(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("Full name cannot be empty")
        return v.strip()


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user_id: str
    email: str
    full_name: Optional[str] = None


# ── Trip / Itinerary ───────────────────────────────────────────────────────────

class TripPreferences(BaseModel):
    """Data collected from the travel form."""
    destination: str
    start_date: date
    end_date: date
    budget: float           # Total budget in USD
    currency: str = "USD"
    num_travelers: int
    interests: List[str]    # e.g. ["beaches", "food", "history"]
    travel_style: str       # "budget" | "mid-range" | "luxury"
    special_requests: Optional[str] = None

    @field_validator("destination")
    @classmethod
    def destination_not_empty(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("Destination cannot be empty")
        return v.strip()

    @field_validator("num_travelers")
    @classmethod
    def travelers_positive(cls, v: int) -> int:
        if v < 1:
            raise ValueError("Number of travelers must be at least 1")
        if v > 50:
            raise ValueError("Number of travelers cannot exceed 50")
        return v

    @field_validator("budget")
    @classmethod
    def budget_positive(cls, v: float) -> float:
        if v <= 0:
            raise ValueError("Budget must be a positive number")
        return v

    @field_validator("travel_style")
    @classmethod
    def valid_travel_style(cls, v: str) -> str:
        allowed = {"budget", "mid-range", "luxury"}
        if v.lower() not in allowed:
            raise ValueError(f"travel_style must be one of {allowed}")
        return v.lower()

    @model_validator(mode="after")
    def end_after_start(self) -> "TripPreferences":
        if self.end_date < self.start_date:
            raise ValueError("end_date must be on or after start_date")
        days = (self.end_date - self.start_date).days + 1
        if days > 30:
            raise ValueError("Trip duration cannot exceed 30 days")
        return self


class Activity(BaseModel):
    time: str               # e.g. "09:00 AM"
    name: str
    description: str
    estimated_cost: float   # Per person in chosen currency
    tips: Optional[str] = None


class DayPlan(BaseModel):
    day: int
    date: str               # ISO date string
    title: str              # e.g. "Arrival & Exploration"
    activities: List[Activity]
    accommodation_note: Optional[str] = None
    meals_note: Optional[str] = None
    transport_note: Optional[str] = None
    day_total_cost: float


class ItineraryContent(BaseModel):
    """The structured AI-generated itinerary."""
    destination: str
    summary: str
    total_days: int
    budget_summary: dict    # {"transport": X, "accommodation": X, ...}
    days: List[DayPlan]
    general_tips: List[str]
    disclaimer: str = (
        "Costs are estimates only. Prices, availability, and timings may vary. "
        "Always verify with local sources before traveling."
    )


class TripCreate(BaseModel):
    preferences: TripPreferences


class TripUpdate(BaseModel):
    """Allows partial updates — every field is optional."""
    title: Optional[str] = None
    notes: Optional[str] = None
    itinerary: Optional[dict] = None   # full ItineraryContent as dict


class TripResponse(BaseModel):
    id: str
    user_id: str
    title: str
    destination: str
    start_date: str
    end_date: str
    budget: float
    currency: str
    num_travelers: int
    travel_style: str
    interests: List[str]
    special_requests: Optional[str]
    itinerary: Optional[dict]
    notes: Optional[str]
    created_at: str
    updated_at: str


# ── AI Request/Response ────────────────────────────────────────────────────────

class RegenerateRequest(BaseModel):
    preferences: TripPreferences
    feedback: Optional[str] = None   # User's notes on what to change


# ── Generic ────────────────────────────────────────────────────────────────────

class MessageResponse(BaseModel):
    message: str
