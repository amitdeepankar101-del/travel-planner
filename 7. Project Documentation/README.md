# Phase 7 — Project Documentation

## Overview
This phase consolidates all project documentation — setup guides, API reference, architecture decisions, and deployment instructions — into a single reference.

---

## Quick Links

| Document | Location |
|----------|----------|
| Main README & Setup Guide | [README.md](../README.md) |
| Database Schema | [supabase_schema.sql](../supabase_schema.sql) |
| Backend Environment Template | [backend/.env.example](../backend/.env.example) |
| API Interactive Docs (Swagger) | http://localhost:8000/docs (when running) |
| API ReDoc | http://localhost:8000/redoc (when running) |

---

## Project Summary

**Project Name:** AI Travel Planner
**Type:** BTech CSE Major Project
**Stack:** React + FastAPI + Supabase + Grok AI

The AI Travel Planner is a full-stack web application that allows users to generate personalized, day-by-day travel itineraries using AI. Users authenticate securely, fill in a trip planning form, and receive a detailed itinerary from the Grok (xAI) language model. Trips can be saved, edited, regenerated with custom feedback, and exported as PDF.

---

## Module Documentation

### Backend Modules

#### `backend/config.py`
Loads all application settings from environment variables using `pydantic-settings`.

| Setting | Type | Required | Default | Description |
|---------|------|----------|---------|-------------|
| `SUPABASE_URL` | str | Yes | — | Supabase project URL |
| `SUPABASE_ANON_KEY` | str | Yes | — | Supabase anon/public key |
| `SUPABASE_SERVICE_ROLE_KEY` | str | Yes | — | Supabase service role key |
| `GROK_API_KEY` | str | No | `""` | Grok API key (xAI) |
| `SECRET_KEY` | str | Yes | — | JWT signing secret |
| `FRONTEND_URL` | str | No | `http://localhost:5173` | CORS allowed origin |

#### `backend/database.py`
Provides two Supabase clients:
- `get_supabase_client()` — uses anon key (for user-context operations)
- `get_admin_client()` — uses service role key (bypasses RLS for admin ops)

#### `backend/models.py`
All Pydantic models for request validation and response serialization:

| Model | Direction | Description |
|-------|-----------|-------------|
| `UserRegister` | Request | Email, password, full_name |
| `UserLogin` | Request | Email, password |
| `UserResponse` | Response | id, email, full_name |
| `TripCreate` | Request | All trip planning form fields |
| `TripUpdate` | Request | title, notes, itinerary (all optional) |
| `TripResponse` | Response | Full trip object |
| `DayItinerary` | Nested | Single day plan |
| `ItineraryData` | Nested | Summary + list of DayItinerary |

#### `backend/auth/dependencies.py`
FastAPI dependency `get_current_user`:
1. Extracts Bearer token from `Authorization` header
2. Decodes JWT using `SECRET_KEY`
3. Queries `users` table in Supabase
4. Returns `UserResponse` or raises `HTTP 401`

#### `backend/services/ai_service.py`
`generate_itinerary(trip_data: TripCreate) -> ItineraryData`
- Builds a structured prompt
- Calls Grok API at `https://api.x.ai/v1/chat/completions`
- Parses JSON response
- Falls back to `_generate_demo_itinerary()` if API unavailable

#### `backend/routers/auth_router.py`
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/auth/register` | POST | Create user in Supabase Auth + users table |
| `/auth/login` | POST | Authenticate, return JWT |
| `/auth/me` | GET | Return current user (protected) |

#### `backend/routers/trips_router.py`
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/trips/generate` | POST | Generate preview (not saved) |
| `/trips/` | POST | Generate + save trip |
| `/trips/` | GET | List user's trips |
| `/trips/{id}` | GET | Get single trip |
| `/trips/{id}` | PUT | Update trip |
| `/trips/{id}` | DELETE | Delete trip |
| `/trips/{id}/regenerate` | POST | Regenerate itinerary |

#### `backend/routers/pdf_router.py`
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/trips/{id}/export/pdf` | GET | Generate and stream PDF |

---

### Frontend Modules

#### `src/lib/api.js`
Axios instance configured with:
- `baseURL`: `/api` (proxied to `localhost:8000` via Vite)
- Request interceptor: injects `Authorization: Bearer <token>`
- Response interceptor: handles 401 by clearing token and redirecting to login

#### `src/context/AuthContext.jsx`
React Context providing:
- `user` — current logged-in user object
- `token` — JWT stored in localStorage
- `login(email, password)` — calls API, stores token
- `logout()` — clears token, redirects to landing
- `loading` — true while checking stored token on startup

#### `src/pages/TravelFormPage.jsx`
Form inputs:
- `destination` — free text
- `start_date`, `end_date` — HTML date inputs
- `budget` — select: budget / moderate / luxury
- `travel_style` — select: adventure / cultural / relaxation / family / business
- `interests` — checkbox group: beaches, history, food, nature, shopping, nightlife, museums, sports

#### `src/pages/ItineraryPage.jsx`
Features:
- Day-by-day accordion cards
- Edit mode (title + notes)
- Regenerate with feedback
- Delete with confirmation modal
- PDF export button

---

## Environment Setup Reference

### Backend `.env`
```env
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
GROK_API_KEY=xai-...           # Optional — app works in Demo Mode without this
SECRET_KEY=your-32-char-random-string
FRONTEND_URL=http://localhost:5173
```

### Frontend `.env` (optional)
```env
VITE_API_BASE_URL=/api
```

---

## Deployment Documentation

### Backend — Render.com
1. Push to GitHub
2. New Web Service → connect repo
3. Root directory: `travel-planner/backend`
4. Build command: `pip install -r requirements.txt`
5. Start command: `uvicorn main:app --host 0.0.0.0 --port $PORT`
6. Add all env vars from `.env`

### Frontend — Vercel
1. Import GitHub repo at vercel.com
2. Root directory: `travel-planner/frontend`
3. Add env var: `VITE_API_BASE_URL=https://your-render-app.onrender.com`
4. Deploy
5. Update `FRONTEND_URL` in backend env vars to Vercel URL

---

## Glossary

| Term | Definition |
|------|------------|
| JWT | JSON Web Token — stateless auth token |
| RLS | Row Level Security — Postgres feature to isolate data per user |
| Grok API | xAI's LLM API, used here for itinerary generation |
| Demo Mode | Fallback mode returning static itinerary data when no API key is set |
| fpdf2 | Python PDF generation library |
| Supabase | Open-source Firebase alternative: PostgreSQL + Auth + Storage |

---

## Next Phase
→ [Project Demonstration](../8.%20Project%20Demonstration/README.md)
