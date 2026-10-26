"""
routers/trips_router.py — Trip CRUD and AI generation endpoints.

Endpoints:
  POST   /trips/generate          — Generate a new AI itinerary (not saved yet)
  POST   /trips/                  — Save a new trip to the database
  GET    /trips/                  — List all trips for the current user
  GET    /trips/{trip_id}         — Get a single trip
  PUT    /trips/{trip_id}         — Update trip title, notes, or itinerary
  DELETE /trips/{trip_id}         — Delete a trip
  POST   /trips/{trip_id}/regenerate — Regenerate the AI itinerary for an existing trip

Every endpoint is protected: the user must send a valid token.
Users can only access their OWN trips (enforced by Supabase RLS + our checks).
"""

from fastapi import APIRouter, HTTPException, status, Depends
from models import (
    TripPreferences,
    TripCreate,
    TripUpdate,
    TripResponse,
    RegenerateRequest,
    MessageResponse,
)
from auth.dependencies import get_current_user
from database import supabase_admin
from services.ai_service import generate_itinerary
from datetime import datetime, timezone
import uuid

router = APIRouter(prefix="/trips", tags=["Trips"])


def _now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def _row_to_trip_response(row: dict) -> TripResponse:
    """Convert a raw Supabase row dict to a TripResponse model."""
    return TripResponse(
        id=row["id"],
        user_id=row["user_id"],
        title=row.get("title", "Untitled Trip"),
        destination=row["destination"],
        start_date=row["start_date"],
        end_date=row["end_date"],
        budget=row["budget"],
        currency=row.get("currency", "USD"),
        num_travelers=row["num_travelers"],
        travel_style=row["travel_style"],
        interests=row.get("interests", []),
        special_requests=row.get("special_requests"),
        itinerary=row.get("itinerary"),
        notes=row.get("notes"),
        created_at=row["created_at"],
        updated_at=row["updated_at"],
    )


# ── Generate (no save) ────────────────────────────────────────────────────────

@router.post("/generate")
async def generate_itinerary_preview(
    body: TripCreate,
    current_user: dict = Depends(get_current_user),
):
    """
    Generate an AI itinerary but do NOT save it yet.
    The frontend shows a preview; the user can then save, discard, or regenerate.
    """
    itinerary = await generate_itinerary(body.preferences)
    return {"itinerary": itinerary, "preferences": body.preferences.model_dump(mode="json")}


# ── Create (save) ─────────────────────────────────────────────────────────────

@router.post("/", response_model=TripResponse, status_code=201)
async def create_trip(
    body: TripCreate,
    current_user: dict = Depends(get_current_user),
):
    """
    Generate an AI itinerary AND save the trip to the database.
    Returns the saved trip with its database ID.
    """
    prefs = body.preferences
    itinerary = await generate_itinerary(prefs)

    destination = prefs.destination.strip().title()
    title = f"{destination} — {prefs.start_date.strftime('%b %Y')}"

    row = {
        "id": str(uuid.uuid4()),
        "user_id": current_user["user_id"],
        "title": title,
        "destination": destination,
        "start_date": prefs.start_date.isoformat(),
        "end_date": prefs.end_date.isoformat(),
        "budget": prefs.budget,
        "currency": prefs.currency,
        "num_travelers": prefs.num_travelers,
        "travel_style": prefs.travel_style,
        "interests": prefs.interests,
        "special_requests": prefs.special_requests,
        "itinerary": itinerary,
        "notes": None,
        "created_at": _now_iso(),
        "updated_at": _now_iso(),
    }

    try:
        result = supabase_admin.table("trips").insert(row).execute()
        if not result.data:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to save trip to database.",
            )
        return _row_to_trip_response(result.data[0])
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Database error: {str(e)}",
        )


# ── List ──────────────────────────────────────────────────────────────────────

@router.get("/", response_model=list[TripResponse])
async def list_trips(current_user: dict = Depends(get_current_user)):
    """Return all trips belonging to the current user, newest first."""
    try:
        result = (
            supabase_admin.table("trips")
            .select("*")
            .eq("user_id", current_user["user_id"])
            .order("created_at", desc=True)
            .execute()
        )
        return [_row_to_trip_response(row) for row in result.data]
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Database error: {str(e)}",
        )


# ── Get single ────────────────────────────────────────────────────────────────

@router.get("/{trip_id}", response_model=TripResponse)
async def get_trip(trip_id: str, current_user: dict = Depends(get_current_user)):
    """Get a single trip. Returns 404 if not found or doesn't belong to user."""
    try:
        result = (
            supabase_admin.table("trips")
            .select("*")
            .eq("id", trip_id)
            .eq("user_id", current_user["user_id"])
            .single()
            .execute()
        )
        if not result.data:
            raise HTTPException(status_code=404, detail="Trip not found.")
        return _row_to_trip_response(result.data)
    except HTTPException:
        raise
    except Exception as e:
        if "not found" in str(e).lower() or "PGRST116" in str(e):
            raise HTTPException(status_code=404, detail="Trip not found.")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Database error: {str(e)}",
        )


# ── Update ────────────────────────────────────────────────────────────────────

@router.put("/{trip_id}", response_model=TripResponse)
async def update_trip(
    trip_id: str,
    body: TripUpdate,
    current_user: dict = Depends(get_current_user),
):
    """Update title, notes, or itinerary of an existing trip."""
    # Only send fields that were actually provided
    update_data = body.model_dump(exclude_none=True)
    if not update_data:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No fields provided to update.",
        )
    update_data["updated_at"] = _now_iso()

    try:
        result = (
            supabase_admin.table("trips")
            .update(update_data)
            .eq("id", trip_id)
            .eq("user_id", current_user["user_id"])
            .execute()
        )
        if not result.data:
            raise HTTPException(status_code=404, detail="Trip not found.")
        return _row_to_trip_response(result.data[0])
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Database error: {str(e)}",
        )


# ── Delete ────────────────────────────────────────────────────────────────────

@router.delete("/{trip_id}", response_model=MessageResponse)
async def delete_trip(trip_id: str, current_user: dict = Depends(get_current_user)):
    """Permanently delete a trip."""
    try:
        result = (
            supabase_admin.table("trips")
            .delete()
            .eq("id", trip_id)
            .eq("user_id", current_user["user_id"])
            .execute()
        )
        if not result.data:
            raise HTTPException(status_code=404, detail="Trip not found.")
        return {"message": "Trip deleted successfully."}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Database error: {str(e)}",
        )


# ── Regenerate ────────────────────────────────────────────────────────────────

@router.post("/{trip_id}/regenerate", response_model=TripResponse)
async def regenerate_itinerary(
    trip_id: str,
    body: RegenerateRequest,
    current_user: dict = Depends(get_current_user),
):
    """
    Generate a brand-new itinerary for an existing trip using updated
    preferences and optional user feedback, then save it.
    """
    new_itinerary = await generate_itinerary(body.preferences, body.feedback)

    try:
        result = (
            supabase_admin.table("trips")
            .update({"itinerary": new_itinerary, "updated_at": _now_iso()})
            .eq("id", trip_id)
            .eq("user_id", current_user["user_id"])
            .execute()
        )
        if not result.data:
            raise HTTPException(status_code=404, detail="Trip not found.")
        return _row_to_trip_response(result.data[0])
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Database error: {str(e)}",
        )
