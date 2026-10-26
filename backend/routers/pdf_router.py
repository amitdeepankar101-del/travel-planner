"""
routers/pdf_router.py — Export an itinerary as a PDF file.

Endpoint:
  GET /trips/{trip_id}/export/pdf  — Returns a downloadable PDF

We use fpdf2 (pure-Python, no external dependencies).
"""

from fastapi import APIRouter, HTTPException, Depends
from fastapi.responses import StreamingResponse
from fpdf import FPDF
from database import supabase_admin
from auth.dependencies import get_current_user
import io

router = APIRouter(prefix="/trips", tags=["Export"])


class ItineraryPDF(FPDF):
    """Custom PDF class with a styled header and footer."""

    def __init__(self, title: str):
        super().__init__()
        self.doc_title = title

    def header(self):
        self.set_font("Helvetica", "B", 16)
        self.set_fill_color(59, 130, 212)   # accent blue
        self.set_text_color(255, 255, 255)
        self.cell(0, 14, self.doc_title, align="C", fill=True, new_x="LMARGIN", new_y="NEXT")
        self.ln(4)
        self.set_text_color(0, 0, 0)

    def footer(self):
        self.set_y(-15)
        self.set_font("Helvetica", "I", 8)
        self.set_text_color(128, 128, 128)
        self.cell(0, 10, f"Page {self.page_no()} | AI Travel Planner — For planning purposes only", align="C")


def _safe_text(text) -> str:
    """Convert any value to a safe string for PDF rendering."""
    if text is None:
        return ""
    return str(text).encode("latin-1", "replace").decode("latin-1")


def _build_pdf(trip: dict) -> bytes:
    itinerary = trip.get("itinerary") or {}
    title = trip.get("title", "Travel Itinerary")

    pdf = ItineraryPDF(title)
    pdf.set_auto_page_break(auto=True, margin=15)
    pdf.add_page()
    pdf.set_font("Helvetica", size=11)

    # ── Trip Summary ──────────────────────────────────────────────────────────
    pdf.set_font("Helvetica", "B", 13)
    pdf.cell(0, 8, "Trip Overview", new_x="LMARGIN", new_y="NEXT")
    pdf.set_font("Helvetica", size=10)
    pdf.set_fill_color(247, 248, 250)

    details = [
        ("Destination", trip.get("destination", "")),
        ("Dates", f"{trip.get('start_date','')} → {trip.get('end_date','')}"),
        ("Travelers", str(trip.get("num_travelers", ""))),
        ("Budget", f"{trip.get('budget', '')} {trip.get('currency', 'USD')}"),
        ("Style", trip.get("travel_style", "").title()),
        ("Interests", ", ".join(trip.get("interests", []))),
    ]

    for label, value in details:
        pdf.set_font("Helvetica", "B", 10)
        pdf.cell(42, 7, _safe_text(label + ":"), fill=True)
        pdf.set_font("Helvetica", size=10)
        pdf.cell(0, 7, _safe_text(value), fill=True, new_x="LMARGIN", new_y="NEXT")

    # ── Summary ───────────────────────────────────────────────────────────────
    if itinerary.get("summary"):
        pdf.ln(4)
        pdf.set_font("Helvetica", "B", 12)
        pdf.cell(0, 8, "Summary", new_x="LMARGIN", new_y="NEXT")
        pdf.set_font("Helvetica", size=10)
        pdf.multi_cell(0, 6, _safe_text(itinerary["summary"]))

    # ── Budget Summary ────────────────────────────────────────────────────────
    budget_summary = itinerary.get("budget_summary", {})
    if budget_summary:
        pdf.ln(4)
        pdf.set_font("Helvetica", "B", 12)
        pdf.cell(0, 8, "Estimated Budget Breakdown", new_x="LMARGIN", new_y="NEXT")
        pdf.set_font("Helvetica", size=10)
        currency = trip.get("currency", "USD")
        total = 0
        for category, amount in budget_summary.items():
            total += float(amount or 0)
            pdf.cell(60, 7, _safe_text(category.title() + ":"))
            pdf.cell(0, 7, _safe_text(f"{amount} {currency}"), new_x="LMARGIN", new_y="NEXT")
        pdf.set_font("Helvetica", "B", 10)
        pdf.cell(60, 7, "Total Estimated:")
        pdf.cell(0, 7, _safe_text(f"{total:.2f} {currency}"), new_x="LMARGIN", new_y="NEXT")

    # ── Day Plans ─────────────────────────────────────────────────────────────
    for day in itinerary.get("days", []):
        pdf.add_page()
        pdf.set_fill_color(59, 130, 212)
        pdf.set_text_color(255, 255, 255)
        pdf.set_font("Helvetica", "B", 12)
        day_header = f"Day {day.get('day')} — {day.get('date', '')} | {day.get('title', '')}"
        pdf.cell(0, 10, _safe_text(day_header), fill=True, new_x="LMARGIN", new_y="NEXT")
        pdf.set_text_color(0, 0, 0)
        pdf.ln(2)

        # Activities
        for activity in day.get("activities", []):
            pdf.set_font("Helvetica", "B", 11)
            act_header = f"  {activity.get('time', '')} — {activity.get('name', '')}"
            pdf.cell(0, 8, _safe_text(act_header), new_x="LMARGIN", new_y="NEXT")
            pdf.set_font("Helvetica", size=10)
            pdf.multi_cell(0, 6, _safe_text("  " + activity.get("description", "")))
            cost = activity.get("estimated_cost", 0)
            pdf.cell(0, 6, _safe_text(f"  Estimated cost: {cost} {trip.get('currency','USD')} per person"), new_x="LMARGIN", new_y="NEXT")
            if activity.get("tips"):
                pdf.set_text_color(100, 100, 100)
                pdf.cell(0, 6, _safe_text(f"  Tip: {activity['tips']}"), new_x="LMARGIN", new_y="NEXT")
                pdf.set_text_color(0, 0, 0)
            pdf.ln(2)

        # Day notes
        pdf.set_fill_color(247, 248, 250)
        pdf.set_font("Helvetica", "I", 10)
        notes = [
            ("Accommodation", day.get("accommodation_note")),
            ("Meals", day.get("meals_note")),
            ("Transport", day.get("transport_note")),
        ]
        for label, note in notes:
            if note:
                pdf.cell(40, 6, _safe_text(label + ":"), fill=True)
                pdf.multi_cell(0, 6, _safe_text(str(note)), fill=True)

        pdf.set_font("Helvetica", "B", 10)
        total_cost = day.get("day_total_cost", 0)
        pdf.cell(0, 8, _safe_text(f"Day Total (per person): {total_cost} {trip.get('currency','USD')}"), new_x="LMARGIN", new_y="NEXT")

    # ── General Tips ──────────────────────────────────────────────────────────
    tips = itinerary.get("general_tips", [])
    if tips:
        pdf.add_page()
        pdf.set_font("Helvetica", "B", 13)
        pdf.cell(0, 10, "General Travel Tips", new_x="LMARGIN", new_y="NEXT")
        pdf.set_font("Helvetica", size=10)
        for tip in tips:
            pdf.multi_cell(0, 7, _safe_text(f"• {tip}"))

    # ── Disclaimer ────────────────────────────────────────────────────────────
    disclaimer = itinerary.get("disclaimer", "")
    if disclaimer:
        pdf.ln(6)
        pdf.set_font("Helvetica", "I", 9)
        pdf.set_text_color(128, 128, 128)
        pdf.multi_cell(0, 6, _safe_text(disclaimer))

    return pdf.output()


@router.get("/{trip_id}/export/pdf")
async def export_trip_pdf(
    trip_id: str,
    current_user: dict = Depends(get_current_user),
):
    """Export a trip itinerary as a downloadable PDF file."""
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
    except HTTPException:
        raise
    except Exception as e:
        if "PGRST116" in str(e) or "not found" in str(e).lower():
            raise HTTPException(status_code=404, detail="Trip not found.")
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

    trip = result.data
    pdf_bytes = _build_pdf(trip)

    safe_title = trip.get("title", "itinerary").replace(" ", "_").replace("/", "-")
    filename = f"{safe_title}.pdf"

    return StreamingResponse(
        io.BytesIO(pdf_bytes),
        media_type="application/pdf",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )
