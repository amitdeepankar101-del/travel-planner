# Phase 5 — Project Development Phase

## Overview
This phase documents the actual implementation — the key code modules built, architectural decisions made during coding, and a walkthrough of every major component.

---

## Repository Structure

```
travel-planner/
├── .gitignore
├── README.md
├── start.bat                          ← One-click startup script (Windows)
├── supabase_schema.sql                ← Full DB schema + RLS policies
│
├── backend/
│   ├── main.py                        ← FastAPI app, CORS, router registration
│   ├── config.py                      ← Pydantic Settings (env vars)
│   ├── database.py                    ← Supabase client factory
│   ├── models.py                      ← All Pydantic request/response models
│   ├── requirements.txt               ← Python dependencies
│   ├── .env.example                   ← Environment variable template
│   ├── auth/
│   │   └── dependencies.py            ← get_current_user JWT dependency
│   ├── routers/
│   │   ├── auth_router.py             ← /auth/register, /auth/login, /auth/me
│   │   ├── trips_router.py            ← /trips/ CRUD + /regenerate
│   │   └── pdf_router.py              ← /trips/{id}/export/pdf
│   └── services/
│       └── ai_service.py              ← Grok API call + demo fallback
│
└── frontend/
    ├── index.html
    ├── vite.config.js                 ← Dev proxy → localhost:8000
    ├── package.json
    └── src/
        ├── main.jsx
        ├── App.jsx                    ← Route definitions
        ├── index.css
        ├── lib/
        │   └── api.js                 ← Axios instance + auth interceptor
        ├── context/
        │   └── AuthContext.jsx        ← Login/logout/user state
        ├── components/
        │   ├── Navbar.jsx
        │   └── ProtectedRoute.jsx
        └── pages/
            ├── LandingPage.jsx
            ├── LoginPage.jsx
            ├── RegisterPage.jsx
            ├── DashboardPage.jsx
            ├── TravelFormPage.jsx
            └── ItineraryPage.jsx
```

---

## Backend — Key Implementation Details

### `config.py` — Environment Settings
Uses `pydantic-settings` to read all environment variables with type safety and defaults.

```python
class Settings(BaseSettings):
    supabase_url: str
    supabase_anon_key: str
    supabase_service_role_key: str
    grok_api_key: str = ""
    secret_key: str
    frontend_url: str = "http://localhost:5173"
```

### `main.py` — FastAPI Entry Point
- Mounts all routers with prefixes (`/auth`, `/trips`)
- Configures CORS to allow only `FRONTEND_URL`
- Adds a `/health` endpoint for deployment health checks

### `auth/dependencies.py` — JWT Guard
Every protected route depends on `get_current_user`:
```python
async def get_current_user(token: str = Depends(oauth2_scheme)):
    # Decodes JWT, extracts user_id, queries Supabase users table
    # Raises HTTP 401 if token is invalid or expired
```

### `services/ai_service.py` — AI Generation
1. Builds a structured prompt with all trip parameters
2. Calls `https://api.x.ai/v1/chat/completions` (Grok API)
3. Parses the JSON response into the `ItineraryData` schema
4. Falls back to demo data if `GROK_API_KEY` is missing/invalid

### `routers/pdf_router.py` — PDF Export
Uses `fpdf2` to build a multi-page PDF:
- Cover page: trip title, destination, dates, budget
- One section per day: theme, morning/afternoon/evening, accommodation, tips
- Returns as `StreamingResponse` with `application/pdf` content type

---

## Frontend — Key Implementation Details

### `lib/api.js` — Axios Instance
```javascript
// Request interceptor — automatically attaches Bearer token
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
```

### `context/AuthContext.jsx` — Auth State
Provides `{ user, token, login, logout, loading }` to the entire app via React Context. Persists token in `localStorage` and rehydrates on page refresh.

### `TravelFormPage.jsx` — Trip Planning Form
Collects:
- Destination (text)
- Start Date / End Date (date pickers)
- Budget (dropdown: budget / moderate / luxury)
- Travel Style (dropdown: adventure / cultural / relaxation / family / business)
- Interests (multi-select checkboxes: beaches, history, food, nature, shopping, nightlife, museums, sports)

### `ItineraryPage.jsx` — Itinerary Display
- Renders each day as an expandable card
- Shows morning / afternoon / evening activities
- Inline edit mode for title and notes
- Regenerate with optional feedback textarea
- PDF download button

---

## Database Schema

```sql
-- Run this in Supabase SQL Editor
CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  email TEXT NOT NULL,
  full_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.trips (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  destination TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  budget TEXT,
  travel_style TEXT,
  interests TEXT[],
  itinerary JSONB,
  notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Row Level Security
ALTER TABLE public.trips ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own trips"
  ON public.trips FOR ALL USING (auth.uid() = user_id);
```

---

## Development Milestones Achieved

| Milestone | Status | Notes |
|-----------|--------|-------|
| Project scaffolded | ✅ Done | Backend + Frontend initialized |
| Supabase connected | ✅ Done | Auth + DB working |
| User registration/login | ✅ Done | JWT flow complete |
| AI itinerary generation | ✅ Done | Grok API + Demo Mode |
| Trip CRUD | ✅ Done | Full create/read/update/delete |
| Trip regeneration | ✅ Done | With user feedback |
| PDF export | ✅ Done | fpdf2, server-side |
| Responsive UI | ✅ Done | Works on desktop & mobile |
| Deployment config | ✅ Done | Render + Vercel ready |

---

## Next Phase
→ [Project Testing](../6.%20Project%20Testing/README.md)
