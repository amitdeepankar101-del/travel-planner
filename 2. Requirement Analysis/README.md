# Phase 2 — Requirement Analysis

## Overview
This phase defines all functional and non-functional requirements gathered from the project concept, ensuring the development team has a clear specification to build against.

---

## Stakeholders
| Stakeholder | Role |
|-------------|------|
| Student Developer | Builder & maintainer of the project |
| End Users (Travelers) | Register, plan, and manage trips |
| Examiner / Evaluator | Assesses project completeness |

---

## Functional Requirements

### Authentication Module
| ID | Requirement |
|----|-------------|
| FR-01 | Users shall be able to register with name, email, and password |
| FR-02 | Users shall be able to log in and receive a JWT token |
| FR-03 | All protected routes shall reject unauthenticated requests |
| FR-04 | Users shall only be able to access their own data |

### Trip Planning Module
| ID | Requirement |
|----|-------------|
| FR-05 | Users shall be able to submit a trip planning form with destination, start date, end date, budget, travel style, and interests |
| FR-06 | The system shall call an AI API to generate a structured day-by-day itinerary |
| FR-07 | The system shall fall back to demo data if the AI API key is unavailable |
| FR-08 | Generated itineraries shall include: daily activities, estimated costs, accommodation, transportation, and food recommendations |

### Trip Management Module
| ID | Requirement |
|----|-------------|
| FR-09 | Users shall be able to view a dashboard listing all their saved trips |
| FR-10 | Users shall be able to view the full detail of any saved trip |
| FR-11 | Users shall be able to edit the title and notes of a saved trip |
| FR-12 | Users shall be able to delete a saved trip with confirmation |
| FR-13 | Users shall be able to regenerate the AI itinerary for an existing trip with optional feedback |

### Export Module
| ID | Requirement |
|----|-------------|
| FR-14 | Users shall be able to download a formatted PDF of any itinerary |
| FR-15 | The PDF shall include trip title, destination, dates, budget, and full day-by-day itinerary |

---

## Non-Functional Requirements

| ID | Category | Requirement |
|----|----------|-------------|
| NFR-01 | Security | Passwords shall be hashed using bcrypt |
| NFR-02 | Security | JWTs shall expire after 7 days |
| NFR-03 | Security | Database rows shall be isolated per user via Supabase RLS |
| NFR-04 | Performance | AI generation shall complete within 30 seconds under normal conditions |
| NFR-05 | Usability | The UI shall be fully responsive on desktop and mobile |
| NFR-06 | Reliability | Demo Mode shall ensure 100% uptime for core flows without a paid API key |
| NFR-07 | Maintainability | Code shall follow PEP 8 (backend) and ESLint (frontend) standards |
| NFR-08 | Documentation | API shall expose auto-generated Swagger docs at `/docs` |

---

## Use Case Diagram (Text)

```
[User]
  |
  |-- Register / Login
  |-- Plan New Trip
  |     |-- Fill Form
  |     |-- View AI Itinerary
  |-- Manage Trips
  |     |-- View Dashboard
  |     |-- Edit Trip
  |     |-- Delete Trip
  |     |-- Regenerate Itinerary
  |-- Export PDF
```

---

## Data Requirements

### Users Table
| Field | Type | Notes |
|-------|------|-------|
| id | UUID | Primary key, from Supabase Auth |
| email | TEXT | Unique |
| full_name | TEXT | Display name |
| created_at | TIMESTAMP | Auto-set |

### Trips Table
| Field | Type | Notes |
|-------|------|-------|
| id | UUID | Primary key |
| user_id | UUID | FK → users, RLS enforced |
| title | TEXT | Trip name |
| destination | TEXT | Target location |
| start_date | DATE | |
| end_date | DATE | |
| budget | TEXT | e.g. "moderate" |
| travel_style | TEXT | e.g. "adventure" |
| interests | TEXT[] | Array of interests |
| itinerary | JSONB | AI-generated structured data |
| notes | TEXT | User free-form notes |
| created_at | TIMESTAMP | Auto-set |

---

## Constraints
- Must use **free/low-cost services only** (student project budget)
- Must work **without the Grok API key** (demo mode fallback)
- Trip duration capped at **30 days**
- Must deploy on **free hosting tiers** (Render + Vercel)

---

## Next Phase
→ [Project Design Phase](../3.%20Project%20Design%20Phase/README.md)
