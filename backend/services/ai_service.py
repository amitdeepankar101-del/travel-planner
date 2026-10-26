"""
services/ai_service.py — OpenRouter AI integration for itinerary generation.

Uses the OpenRouter API (https://openrouter.ai) which is OpenAI-compatible.
Falls back to clearly-labeled demo data if the key is missing or the call fails.
"""

import json
import httpx
from datetime import date, timedelta
from typing import Optional
from models import TripPreferences
from config import settings


OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions"
OPENROUTER_MODEL = "meta-llama/llama-3.3-70b-instruct"


def _build_prompt(prefs: TripPreferences, feedback: Optional[str] = None) -> str:
    days = (prefs.end_date - prefs.start_date).days + 1
    interests_str = ", ".join(prefs.interests) if prefs.interests else "general sightseeing"
    budget_per_day = prefs.budget / days
    feedback_section = f"\n\nUser feedback for regeneration: {feedback}" if feedback else ""

    return f"""You are an expert travel planner. Generate a detailed day-by-day travel itinerary.

Trip details:
- Destination: {prefs.destination}
- Travel dates: {prefs.start_date} to {prefs.end_date} ({days} days)
- Total budget: {prefs.budget} {prefs.currency} (~{budget_per_day:.0f} {prefs.currency}/day)
- Number of travelers: {prefs.num_travelers}
- Travel style: {prefs.travel_style}
- Interests: {interests_str}
- Special requests: {prefs.special_requests or "None"}
{feedback_section}

Return ONLY a valid JSON object with this exact structure (no markdown, no explanation, no code fences):
{{
  "destination": "{prefs.destination}",
  "summary": "2-3 sentence overview of the trip",
  "total_days": {days},
  "budget_summary": {{
    "accommodation": <estimated total cost as number>,
    "transport": <estimated total cost as number>,
    "food": <estimated total cost as number>,
    "activities": <estimated total cost as number>,
    "miscellaneous": <estimated total cost as number>
  }},
  "days": [
    {{
      "day": 1,
      "date": "{prefs.start_date.isoformat()}",
      "title": "Day theme/title",
      "activities": [
        {{
          "time": "09:00 AM",
          "name": "Activity name",
          "description": "What you will do and why it is worth visiting",
          "estimated_cost": <cost per person as number>,
          "tips": "Practical tip for this activity"
        }}
      ],
      "accommodation_note": "Where to stay and approximate cost",
      "meals_note": "Recommended restaurants or food experiences",
      "transport_note": "How to get around this day",
      "day_total_cost": <total cost per person for the day as number>
    }}
  ],
  "general_tips": [
    "Tip 1 about visa/entry requirements",
    "Tip 2 about local customs",
    "Tip 3 about currency/payments",
    "Tip 4 about safety",
    "Tip 5 about best time to visit attractions"
  ],
  "disclaimer": "Costs are estimates only. Prices vary by season and availability. Always verify locally."
}}

Important rules:
- All cost values must be numbers (not strings).
- Include {days} day objects in the "days" array.
- Keep costs realistic for a {prefs.travel_style} traveler.
- Do NOT fabricate specific opening hours or guaranteed availability.
- Return ONLY the JSON. No preamble, no explanation, no markdown fences."""


def _get_demo_itinerary(prefs: TripPreferences) -> dict:
    days = (prefs.end_date - prefs.start_date).days + 1
    day_list = []
    for i in range(days):
        current_date = prefs.start_date + timedelta(days=i)
        day_list.append({
            "day": i + 1,
            "date": current_date.isoformat(),
            "title": f"[DEMO] Day {i + 1} in {prefs.destination}",
            "activities": [
                {
                    "time": "09:00 AM",
                    "name": "[DEMO] Morning exploration",
                    "description": "This is demo data. Connect your OpenRouter API key to generate a real itinerary.",
                    "estimated_cost": round(prefs.budget / days / prefs.num_travelers / 4, 2),
                    "tips": "Set OPENROUTER_API_KEY in backend/.env to generate AI itineraries.",
                },
                {
                    "time": "02:00 PM",
                    "name": "[DEMO] Afternoon activity",
                    "description": "Sample afternoon activity placeholder.",
                    "estimated_cost": round(prefs.budget / days / prefs.num_travelers / 4, 2),
                    "tips": "Get a free OpenRouter API key at https://openrouter.ai/",
                },
            ],
            "accommodation_note": "[DEMO] Sample hotel",
            "meals_note": "[DEMO] Sample restaurant recommendations",
            "transport_note": "[DEMO] Sample transport notes",
            "day_total_cost": round(prefs.budget / days / prefs.num_travelers, 2),
        })

    total_per_category = round(prefs.budget / 5, 2)
    return {
        "destination": prefs.destination,
        "summary": f"[DEMO MODE] This is a sample itinerary for {prefs.destination}. "
                   f"To generate real AI itineraries, set your OPENROUTER_API_KEY in backend/.env.",
        "total_days": days,
        "budget_summary": {
            "accommodation": total_per_category,
            "transport": total_per_category,
            "food": total_per_category,
            "activities": total_per_category,
            "miscellaneous": total_per_category,
        },
        "days": day_list,
        "general_tips": [
            "[DEMO] This is placeholder data.",
            "[DEMO] Add your OpenRouter API key to see real itineraries.",
            "[DEMO] Get a free key at https://openrouter.ai/",
        ],
        "disclaimer": "DEMO MODE: This is sample data, not a real AI-generated itinerary.",
    }


async def generate_itinerary(
    prefs: TripPreferences, feedback: Optional[str] = None
) -> dict:
    """
    Call OpenRouter API and return a parsed itinerary dict.
    Falls back to demo data if API key is missing or call fails.
    """
    api_key = settings.openrouter_api_key

    if not api_key or api_key == "your-openrouter-api-key-here":
        return _get_demo_itinerary(prefs)

    prompt = _build_prompt(prefs, feedback)

    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
        "HTTP-Referer": "http://localhost:5173",
        "X-Title": "AI Travel Planner",
    }

    payload = {
        "model": OPENROUTER_MODEL,
        "messages": [
            {"role": "user", "content": prompt}
        ],
        "temperature": 0.7,
        "max_tokens": 8192,
    }

    try:
        async with httpx.AsyncClient(timeout=90.0) as client:
            response = await client.post(OPENROUTER_API_URL, headers=headers, json=payload)

            if response.status_code == 429:
                demo = _get_demo_itinerary(prefs)
                demo["summary"] = "[Rate limited] " + demo["summary"]
                return demo

            if response.status_code in (401, 403):
                demo = _get_demo_itinerary(prefs)
                demo["summary"] = "[Invalid API key] " + demo["summary"]
                return demo

            response.raise_for_status()
            data = response.json()

            # Extract text from OpenRouter (OpenAI-compatible) response structure
            content = data["choices"][0]["message"]["content"]

            # Strip markdown fences if present
            content = content.strip()
            if content.startswith("```"):
                content = content.split("```")[1]
                if content.startswith("json"):
                    content = content[4:]
            content = content.strip()

            itinerary_dict = json.loads(content)

            if "days" not in itinerary_dict:
                raise ValueError("Missing 'days' key in AI response")

            return itinerary_dict

    except json.JSONDecodeError:
        demo = _get_demo_itinerary(prefs)
        demo["summary"] = "[AI returned invalid JSON, showing demo] " + demo["summary"]
        return demo
    except httpx.TimeoutException:
        demo = _get_demo_itinerary(prefs)
        demo["summary"] = "[AI request timed out, showing demo] " + demo["summary"]
        return demo
    except Exception as e:
        demo = _get_demo_itinerary(prefs)
        demo["summary"] = f"[AI unavailable ({type(e).__name__}), showing demo] {demo['summary']}"
        return demo
