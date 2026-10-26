# Phase 3 — Project Design Phase

## Overview
This phase covers the architecture, database schema, UI wireframes, and API contract designed before coding began.

---

## System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                        CLIENT                           │
│           React 18 + Vite  (localhost:5173)             │
│  Pages: Landing | Login | Register | Dashboard |        │
│         TravelForm | Itinerary                          │
└──────────────────────┬──────────────────────────────────┘
                       │ HTTP / JSON (proxied via Vite)
                       ▼
┌─────────────────────────────────────────────────────────┐
│                     BACKEND API                         │
│            FastAPI + Uvicorn  (localhost:8000)          │
│                                                         │
│  Routers:  /auth  |  /trips  |  /trips/{id}/export/pdf │
│  Services: AI Service (Grok API / Demo fallback)        │
│  Auth:     JWT Verification Dependency                  │
└────────────┬─────────────────────────┬──────────────────┘
             │                         │
             ▼                         ▼
┌────────────────────┐     ┌───────────────────────────┐
│   Supabase Auth    │     │  Supabase PostgreSQL DB    │
│  (JWT + user mgmt) │     │  Tables: users, trips      │
│                    │     │  RLS: per-user isolation   │
└────────────────────┘     └───────────────────────────┘
                                        │
                                        ▼
                            ┌─────────────────────┐
                            │     Grok API (xAI)  │
                            │  grok-3-mini model  │
                            └─────────────────────┘
```

---

## Database Design

### Entity Relationship Diagram (Text)

```
users (managed by Supabase Auth)
  id UUID PK
  email TEXT UNIQUE
  full_name TEXT
  created_at TIMESTAMP

trips
  id UUID PK
  user_id UUID FK → users.id  [CASCADE DELETE]
  title TEXT
  destination TEXT
  start_date DATE
  end_date DATE
  budget TEXT
  travel_style TEXT
  interests TEXT[]
  itinerary JSONB
  notes TEXT
  created_at TIMESTAMP
```

### RLS Policies
```sql
-- users can only SELECT their own row
CREATE POLICY "Users can view own profile"
  ON users FOR SELECT USING (auth.uid() = id);

-- trips: full CRUD only for owner
CREATE POLICY "Users manage own trips"
  ON trips FOR ALL USING (auth.uid() = user_id);
```

---

## API Design

### Base URL: `http://localhost:8000`

#### Auth Endpoints
| Method | Path | Request Body | Response |
|--------|------|--------------|----------|
| POST | `/auth/register` | `{email, password, full_name}` | `{access_token, user}` |
| POST | `/auth/login` | `{email, password}` | `{access_token, user}` |
| GET | `/auth/me` | — (Bearer token) | `{id, email, full_name}` |

#### Trips Endpoints
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/trips/generate` | ✅ | Preview AI plan (not saved) |
| POST | `/trips/` | ✅ | Generate + save trip |
| GET | `/trips/` | ✅ | List all user trips |
| GET | `/trips/{id}` | ✅ | Get single trip |
| PUT | `/trips/{id}` | ✅ | Update title/notes/itinerary |
| DELETE | `/trips/{id}` | ✅ | Delete trip |
| POST | `/trips/{id}/regenerate` | ✅ | New AI itinerary for existing trip |
| GET | `/trips/{id}/export/pdf` | ✅ | Download PDF |

---

## Frontend Component Architecture

```
App.jsx  (Router)
├── LandingPage.jsx          — Marketing / hero page
├── LoginPage.jsx            — Email + password form
├── RegisterPage.jsx         — Registration form
├── DashboardPage.jsx        — Trip cards grid
├── TravelFormPage.jsx       — Trip planning form
└── ItineraryPage.jsx        — Day-by-day itinerary view

Shared Components:
├── Navbar.jsx               — Navigation + logout
└── ProtectedRoute.jsx       — Auth guard wrapper

Context:
└── AuthContext.jsx          — Global auth state (user, token, login, logout)

Lib:
└── api.js                   — Axios instance with JWT interceptor
```

---

## Itinerary JSON Schema

```json
{
  "summary": "string — 2-3 sentence trip overview",
  "total_estimated_cost": "string — e.g. $1,200–$1,500",
  "days": [
    {
      "day": 1,
      "date": "2024-06-01",
      "theme": "string — day title",
      "morning": "string — morning activity",
      "afternoon": "string — afternoon activity",
      "evening": "string — evening activity",
      "accommodation": "string — where to stay",
      "estimated_cost": "string — daily cost estimate",
      "tips": "string — local tips"
    }
  ]
}
```

---

## UI Wireframes (Text)

### Landing Page
```
[ LOGO ]  [ Login ]  [ Register ]
─────────────────────────────────
      "Plan your perfect trip
         with AI in seconds"
      [ Get Started ]
─────────────────────────────────
   Feature 1  |  Feature 2  |  Feature 3
```

### Dashboard
```
[ Navbar ]
  Hi, {Name}!          [ + Plan New Trip ]
  ─────────────────────────────
  [ Trip Card ]  [ Trip Card ]  [ Trip Card ]
   Destination    Destination    Destination
   Dates          Dates          Dates
   [ View ]       [ View ]       [ View ]
```

### Travel Form
```
[ Navbar ]
  Plan Your Trip
  ─────────────────────────────
  Destination: [___________]
  Start Date:  [___________]
  End Date:    [___________]
  Budget:      [ Dropdown  ]
  Style:       [ Dropdown  ]
  Interests:   [x] Beach [x] Culture [ ] Adventure
               [           Generate Itinerary          ]
```

---

## Security Design
- Passwords: **bcrypt** hashed by Supabase Auth
- Tokens: **HS256 JWT**, 7-day expiry, signed with `SECRET_KEY`
- CORS: restricted to `FRONTEND_URL` only
- Supabase **Row Level Security** prevents cross-user data access
- `.env` file excluded from version control via `.gitignore`

---

## Next Phase
→ [Project Planning Phase](../4.%20Project%20Planning%20Phase/README.md)
