# Phase 4 — Project Planning Phase

## Overview
This phase defines the project timeline, sprint breakdown, tools selected, and the work distribution plan that guided the development effort.

---

## Project Timeline

| Phase | Duration | Dates (Approx.) |
|-------|----------|-----------------|
| Brainstorming & Ideation | 3 days | Week 1 |
| Requirement Analysis | 3 days | Week 1–2 |
| System Design | 4 days | Week 2 |
| Development — Backend | 7 days | Week 3–4 |
| Development — Frontend | 7 days | Week 4–5 |
| Integration & Testing | 4 days | Week 6 |
| Documentation | 3 days | Week 6–7 |
| Final Demo Preparation | 2 days | Week 7 |

**Total estimated effort: ~7 weeks**

---

## Sprint Breakdown

### Sprint 1 — Foundation (Days 1–7)
- [x] Set up GitHub repository and folder structure
- [x] Initialize FastAPI backend project
- [x] Initialize React + Vite frontend project
- [x] Create Supabase project and run database schema
- [x] Configure CORS and environment variables

### Sprint 2 — Authentication (Days 8–12)
- [x] Implement `/auth/register` endpoint
- [x] Implement `/auth/login` endpoint
- [x] Implement JWT verification dependency
- [x] Build Login and Register pages in React
- [x] Set up `AuthContext` for global auth state

### Sprint 3 — Trip Core (Days 13–19)
- [x] Integrate Grok API in `ai_service.py`
- [x] Implement Demo Mode fallback
- [x] Implement `POST /trips/generate` and `POST /trips/`
- [x] Build `TravelFormPage` with all input fields
- [x] Build `ItineraryPage` to display structured days

### Sprint 4 — Trip Management (Days 20–25)
- [x] Implement `GET /trips/`, `GET /trips/{id}`
- [x] Implement `PUT /trips/{id}`, `DELETE /trips/{id}`
- [x] Implement `POST /trips/{id}/regenerate`
- [x] Build `DashboardPage` with trip cards
- [x] Add inline edit and delete with confirmation

### Sprint 5 — Export & Polish (Days 26–30)
- [x] Implement `GET /trips/{id}/export/pdf` with fpdf2
- [x] Style all pages — responsive, clean UI
- [x] Add loading states and error handling
- [x] End-to-end integration testing
- [x] Final bug fixes

---

## Tools & Technologies Selected

### Development Tools
| Tool | Purpose |
|------|---------|
| VS Code | Primary IDE |
| Git + GitHub | Version control and hosting |
| Postman | API testing during development |
| Supabase Dashboard | Database management and RLS testing |

### Backend Stack
| Technology | Version | Reason |
|------------|---------|--------|
| Python | 3.12+ | AI ecosystem, clean syntax |
| FastAPI | 0.115 | Auto-docs, async, Pydantic |
| Uvicorn | 0.30 | ASGI server |
| Pydantic | 2.x | Data validation & settings |
| Supabase-py | 2.x | Supabase Python client |
| python-jose | 3.x | JWT encoding/decoding |
| bcrypt / passlib | latest | Password hashing |
| fpdf2 | 2.x | PDF generation |
| httpx | 0.27 | Async HTTP client for Grok API |

### Frontend Stack
| Technology | Version | Reason |
|------------|---------|--------|
| React | 18 | Component model, ecosystem |
| Vite | 5 | Fast HMR dev server |
| React Router | 6 | Client-side routing |
| Axios | latest | HTTP client with interceptors |
| CSS Modules / Global CSS | — | Styling |

### Services
| Service | Tier | Purpose |
|---------|------|---------|
| Supabase | Free | PostgreSQL + Auth |
| Grok API (xAI) | Pay-per-use | AI itinerary generation |
| Render.com | Free | Backend deployment |
| Vercel | Free | Frontend deployment |

---

## Risk Register

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Grok API cost overrun | Low | Medium | Demo Mode fallback; rate limiting |
| Supabase RLS misconfiguration | Medium | High | Tested with multiple accounts |
| CORS issues on deployment | Medium | Medium | Explicit `FRONTEND_URL` env var |
| JWT secret leaked | Low | High | .env excluded from git |
| AI generates invalid JSON | Medium | High | Server-side JSON parsing with error handling |

---

## Definition of Done
A feature is considered **done** when:
1. The backend endpoint returns the correct response (tested in Swagger UI)
2. The frontend page renders correctly and handles error states
3. End-to-end flow works in browser
4. No console errors or unhandled exceptions
5. Code is committed to the GitHub repository

---

## Next Phase
→ [Project Development Phase](../5.%20Project%20Development%20Phase/README.md)
