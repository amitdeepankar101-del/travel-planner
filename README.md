# AI Travel Planner — BTech CSE Major Project

A full-stack **Personalized AI Travel Itinerary Planner** built with:
- **Frontend**: React 18 + Vite
- **Backend**: Python FastAPI
- **Database & Auth**: Supabase (PostgreSQL + Supabase Auth)
- **AI**: Grok API (xAI)
- **PDF Export**: fpdf2

---

## 📁 Project Phase Folders

This repository is organized into **8 project phase folders**, each containing a detailed `README.md` documenting that phase of the project lifecycle:

| # | Folder | Description |
|---|--------|-------------|
| 1 | [Brainstorming and Ideation](./1.%20Brainstorming%20and%20Ideation/README.md) | Problem statement, idea exploration, technology selection |
| 2 | [Requirement Analysis](./2.%20Requirement%20Analysis/README.md) | Functional & non-functional requirements, use cases, data models |
| 3 | [Project Design Phase](./3.%20Project%20Design%20Phase/README.md) | System architecture, database design, API contract, UI wireframes |
| 4 | [Project Planning Phase](./4.%20Project%20Planning%20Phase/README.md) | Timeline, sprint breakdown, tools selected, risk register |
| 5 | [Project Development Phase](./5.%20Project%20Development%20Phase/README.md) | Implementation details, module walkthrough, code structure |
| 6 | [Project Testing](./6.%20Project%20Testing/README.md) | Test cases, E2E flows, security tests, bug log |
| 7 | [Project Documentation](./7.%20Project%20Documentation/README.md) | Full API reference, env config, deployment guide, glossary |
| 8 | [Project Demonstration](./8.%20Project%20Demonstration/README.md) | Demo script, feature showcase, examiner checklist |

---

## Table of Contents

1. [Project Phase Folders](#-project-phase-folders)
2. [Project Structure](#project-structure)
3. [Prerequisites](#prerequisites)
4. [Supabase Setup](#supabase-setup)
5. [Backend Setup](#backend-setup)
6. [Frontend Setup](#frontend-setup)
7. [Running the Application](#running-the-application)
8. [API Documentation](#api-documentation)
9. [Environment Variables Reference](#environment-variables-reference)
10. [Demo Mode](#demo-mode)
11. [Testing the End-to-End Flow](#testing-the-end-to-end-flow)
12. [Deployment](#deployment)
13. [Known Limitations](#known-limitations)

---

## Project Structure

```
travel-planner/
├── 1. Brainstorming and Ideation/   # Phase 1 — ideas, problem statement
├── 2. Requirement Analysis/         # Phase 2 — functional & non-functional reqs
├── 3. Project Design Phase/         # Phase 3 — architecture, DB, API design
├── 4. Project Planning Phase/       # Phase 4 — timeline, sprints, tools
├── 5. Project Development Phase/    # Phase 5 — implementation walkthrough
├── 6. Project Testing/              # Phase 6 — test cases, E2E flows, bugs
├── 7. Project Documentation/        # Phase 7 — API ref, env config, deployment
├── 8. Project Demonstration/        # Phase 8 — demo script, examiner checklist
├── backend/
│   ├── main.py                  # FastAPI app entry point
│   ├── config.py                # Environment variable config (pydantic-settings)
│   ├── database.py              # Supabase client factory
│   ├── models.py                # Pydantic request/response models
│   ├── requirements.txt         # Python dependencies
│   ├── .env.example             # Template for your .env file
│   ├── auth/
│   │   └── dependencies.py      # JWT verification dependency
│   ├── routers/
│   │   ├── auth_router.py       # /auth/register, /auth/login, /auth/me
│   │   ├── trips_router.py      # /trips/ CRUD + AI generation
│   │   └── pdf_router.py        # /trips/{id}/export/pdf
│   └── services/
│       └── ai_service.py        # Grok API integration + demo fallback
├── frontend/
│   ├── index.html
│   ├── vite.config.js
│   ├── package.json
│   └── src/
│       ├── main.jsx             # React entry point
│       ├── App.jsx              # Routing configuration
│       ├── index.css            # Global styles
│       ├── lib/
│       │   └── api.js           # Axios instance with auth interceptor
│       ├── context/
│       │   └── AuthContext.jsx  # Global auth state (React Context)
│       ├── components/
│       │   ├── Navbar.jsx
│       │   └── ProtectedRoute.jsx
│       └── pages/
│           ├── LandingPage.jsx
│           ├── LoginPage.jsx
│           ├── RegisterPage.jsx
│           ├── DashboardPage.jsx
│           ├── TravelFormPage.jsx
│           └── ItineraryPage.jsx
└── supabase_schema.sql          # Database schema + RLS policies
```

---

## Prerequisites

Before starting, install these tools:

| Tool | Version | Download |
|------|---------|----------|
| Python | 3.10 or newer | https://python.org |
| Node.js | 18 or newer | https://nodejs.org |
| Git | Any | https://git-scm.com |

**Free accounts you need:**
| Service | Cost | URL |
|---------|------|-----|
| Supabase | Free tier | https://supabase.com |
| Grok API (xAI) | Paid — ~$0.30/million tokens | https://console.x.ai |

> **Note on Grok API cost**: Grok-3-mini is very cheap. Generating one itinerary uses approximately 2,000–4,000 tokens (~$0.001–$0.003). The app works in **Demo Mode** without any API key during development.

---

## Supabase Setup

### Step 1: Create a Project

1. Go to https://supabase.com and sign up (free)
2. Click **New Project**
3. Choose a name (e.g., `travel-planner`) and a strong database password
4. Select the region closest to you
5. Wait ~2 minutes for the project to initialize

### Step 2: Run the Database Schema

1. In your Supabase project, click **SQL Editor** in the left sidebar
2. Click **New Query**
3. Open `travel-planner/supabase_schema.sql` from this project
4. Copy the entire contents and paste into the SQL Editor
5. Click **Run** (green button)
6. You should see: `Success. No rows returned`

### Step 3: Disable Email Confirmation (for development)

By default Supabase requires email confirmation before login. To skip this during development:

1. Go to **Authentication** → **Providers** → **Email**
2. Toggle **OFF** "Confirm email"
3. Click Save

> Re-enable this in production.

### Step 4: Get Your API Keys

1. Go to **Settings** → **API**
2. Copy:
   - **Project URL** → `SUPABASE_URL`
   - **anon public** key → `SUPABASE_ANON_KEY`
   - **service_role secret** key → `SUPABASE_SERVICE_ROLE_KEY`

---

## Backend Setup

### Step 1: Create the .env file

```bash
cd travel-planner/backend
copy .env.example .env
```

Open `.env` and fill in your values:

```env
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=eyJ...your-anon-key...
SUPABASE_SERVICE_ROLE_KEY=eyJ...your-service-role-key...
GROK_API_KEY=xai-...your-grok-key...
SECRET_KEY=any-random-32-character-string-here
FRONTEND_URL=http://localhost:5173
```

### Step 2: Create a virtual environment

```bash
# Windows
cd travel-planner/backend
python -m venv venv
venv\Scripts\activate

# macOS/Linux
cd travel-planner/backend
python3 -m venv venv
source venv/bin/activate
```

### Step 3: Install dependencies

```bash
pip install -r requirements.txt
```

### Step 4: Start the backend server

```bash
uvicorn main:app --reload --port 8000
```

You should see:
```
INFO:     Uvicorn running on http://127.0.0.1:8000
INFO:     Application startup complete.
```

Visit http://localhost:8000/docs to see the interactive API documentation.

---

## Frontend Setup

Open a **second terminal** (keep the backend running in the first one).

### Step 1: Install dependencies

```bash
cd travel-planner/frontend
npm install
```

### Step 2: Start the frontend dev server

```bash
npm run dev
```

You should see:
```
  VITE v5.x.x  ready in xxx ms
  ➜  Local:   http://localhost:5173/
```

Open http://localhost:5173 in your browser.

---

## Running the Application

You need **two terminals** running simultaneously:

**Terminal 1 — Backend:**
```bash
cd travel-planner/backend
venv\Scripts\activate   # or: source venv/bin/activate
uvicorn main:app --reload --port 8000
```

**Terminal 2 — Frontend:**
```bash
cd travel-planner/frontend
npm run dev
```

Then open: **http://localhost:5173**

---

## API Documentation

The FastAPI backend auto-generates interactive API docs:

- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

### Endpoint Summary

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/auth/register` | No | Create account |
| POST | `/auth/login` | No | Login, get JWT token |
| GET | `/auth/me` | Yes | Get current user |
| POST | `/trips/generate` | Yes | Preview AI itinerary (no save) |
| POST | `/trips/` | Yes | Generate + save trip |
| GET | `/trips/` | Yes | List all my trips |
| GET | `/trips/{id}` | Yes | Get a specific trip |
| PUT | `/trips/{id}` | Yes | Update title/notes/itinerary |
| DELETE | `/trips/{id}` | Yes | Delete a trip |
| POST | `/trips/{id}/regenerate` | Yes | Regenerate AI itinerary |
| GET | `/trips/{id}/export/pdf` | Yes | Download PDF |

---

## Environment Variables Reference

### Backend (`backend/.env`)

| Variable | Required | Description |
|----------|----------|-------------|
| `SUPABASE_URL` | Yes | Your Supabase project URL |
| `SUPABASE_ANON_KEY` | Yes | Supabase anon/public key |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | Supabase service role key (keep secret!) |
| `GROK_API_KEY` | No* | Grok API key from console.x.ai |
| `SECRET_KEY` | Yes | Random string for JWT signing |
| `FRONTEND_URL` | No | Frontend URL for CORS (default: http://localhost:5173) |

*Without GROK_API_KEY, the app runs in Demo Mode.

### Frontend (`frontend/.env`)

| Variable | Default | Description |
|----------|---------|-------------|
| `VITE_API_BASE_URL` | `/api` | Backend API base URL (proxied via Vite) |

---

## Demo Mode

**You don't need a Grok API key to test the app.**

If `GROK_API_KEY` is not set or is set to the placeholder value, the backend automatically returns clearly-labeled **Demo Mode** itineraries. These are sample data that let you test the entire user flow:
- Register → Login → Fill form → View itinerary → Edit → Delete → Export PDF

Demo mode responses are labeled with `[DEMO]` in the summary and a prominent badge in the UI.

---

## Testing the End-to-End Flow

Follow these steps to verify everything works:

1. **Register**: Go to http://localhost:5173/register, create an account
2. **Login**: Sign in at http://localhost:5173/login
3. **Plan a trip**: Click "Plan New Trip", fill in the form, click "Generate My Itinerary"
4. **View itinerary**: The itinerary page loads automatically after generation
5. **Edit title**: Click "Edit", change the title, click "Save"
6. **Regenerate**: Click "Regenerate", add optional feedback, confirm
7. **Export PDF**: Click "Export PDF" — a PDF file downloads
8. **Dashboard**: Click "Dashboard" — your trip appears
9. **Delete**: Click "Delete" on the trip card or itinerary page, confirm

If all steps work, the project is complete.

---

## Deployment

### Backend (Render.com — Free Tier)

1. Push your code to GitHub
2. Go to https://render.com, create a new **Web Service**
3. Connect your GitHub repo, set root directory to `travel-planner/backend`
4. Set build command: `pip install -r requirements.txt`
5. Set start command: `uvicorn main:app --host 0.0.0.0 --port $PORT`
6. Add all environment variables from `.env`

### Frontend (Vercel — Free Tier)

1. Go to https://vercel.com, import your GitHub repo
2. Set root directory to `travel-planner/frontend`
3. Set environment variable: `VITE_API_BASE_URL=https://your-render-app.onrender.com`
4. Deploy

Update `FRONTEND_URL` in the backend env vars to your Vercel URL.

---

## Known Limitations

| Limitation | Details |
|-----------|---------|
| AI cost estimates | Estimates are AI-generated approximations, not real prices |
| No real-time data | Opening hours, availability, and prices are not live |
| No map integration | Route optimization and maps are not included |
| Grok rate limits | If you hit the API rate limit, demo data is returned automatically |
| Email confirmation | Supabase may require email confirmation; disable it during development |
| PDF fonts | fpdf2 uses basic fonts; special characters are replaced with `?` |
| 30-day limit | Trips cannot exceed 30 days (configurable in `models.py`) |
