# Phase 6 — Project Testing

## Overview
This phase covers all testing activities performed to validate correctness, security, performance, and end-to-end functionality of the AI Travel Planner.

---

## Testing Strategy

| Type | Tool / Method | Scope |
|------|--------------|-------|
| Manual API Testing | Swagger UI, Postman | All backend endpoints |
| Frontend E2E Testing | Manual browser walkthrough | All user flows |
| Unit Testing | pytest (Python) | Service layer, models |
| Integration Testing | Supabase Dashboard + Postman | DB + Auth |
| Security Testing | Manual | JWT, RLS, CORS |
| Demo Mode Testing | Manual | Fallback without API key |

---

## Backend API Test Cases

### Authentication

| Test ID | Endpoint | Input | Expected | Result |
|---------|----------|-------|----------|--------|
| TC-01 | POST `/auth/register` | Valid email + password | 200, returns token + user | ✅ Pass |
| TC-02 | POST `/auth/register` | Duplicate email | 400, "Email already registered" | ✅ Pass |
| TC-03 | POST `/auth/register` | Missing password | 422 Validation Error | ✅ Pass |
| TC-04 | POST `/auth/login` | Correct credentials | 200, returns token | ✅ Pass |
| TC-05 | POST `/auth/login` | Wrong password | 401 Unauthorized | ✅ Pass |
| TC-06 | GET `/auth/me` | Valid Bearer token | 200, user object | ✅ Pass |
| TC-07 | GET `/auth/me` | No token | 401 Unauthorized | ✅ Pass |
| TC-08 | GET `/auth/me` | Expired token | 401 Unauthorized | ✅ Pass |

### Trip Management

| Test ID | Endpoint | Input | Expected | Result |
|---------|----------|-------|----------|--------|
| TC-09 | POST `/trips/` | Valid form data + token | 201, trip with itinerary | ✅ Pass |
| TC-10 | POST `/trips/` | No token | 401 Unauthorized | ✅ Pass |
| TC-11 | POST `/trips/` | Invalid dates (end < start) | 422 Validation Error | ✅ Pass |
| TC-12 | GET `/trips/` | Valid token | 200, array of trips | ✅ Pass |
| TC-13 | GET `/trips/{id}` | Own trip ID | 200, trip detail | ✅ Pass |
| TC-14 | GET `/trips/{id}` | Another user's trip ID | 404 Not Found (RLS) | ✅ Pass |
| TC-15 | PUT `/trips/{id}` | Updated title | 200, updated trip | ✅ Pass |
| TC-16 | DELETE `/trips/{id}` | Own trip ID | 204 No Content | ✅ Pass |
| TC-17 | POST `/trips/{id}/regenerate` | With feedback text | 200, new itinerary | ✅ Pass |
| TC-18 | GET `/trips/{id}/export/pdf` | Own trip ID | 200, PDF binary | ✅ Pass |

### Demo Mode

| Test ID | Scenario | Expected | Result |
|---------|----------|----------|--------|
| TC-19 | No `GROK_API_KEY` set | Demo itinerary returned, marked `[DEMO]` | ✅ Pass |
| TC-20 | Invalid API key | Demo fallback triggered, no crash | ✅ Pass |

---

## Frontend End-to-End Test Flows

### Flow 1: New User Registration & First Trip
```
1. Navigate to http://localhost:5173
2. Click "Get Started" → Register page
3. Enter name, email, password → Click Register
4. ✅ Redirected to Dashboard
5. Click "Plan New Trip"
6. Enter: Destination="Paris", 5-day trip, Budget=Moderate, Style=Cultural
7. Click "Generate My Itinerary"
8. ✅ Itinerary page loads with 5 days
9. ✅ Each day shows morning, afternoon, evening
10. ✅ Summary and total cost visible
```
**Result: ✅ Pass**

### Flow 2: Edit & Save Trip
```
1. On itinerary page, click "Edit"
2. Change title to "Paris Dream Trip"
3. Add notes: "Remember Eiffel Tower tickets"
4. Click "Save"
5. ✅ Page refreshes with updated title
6. ✅ Notes preserved
```
**Result: ✅ Pass**

### Flow 3: Regenerate Itinerary
```
1. Click "Regenerate"
2. Enter feedback: "More museums, fewer restaurants"
3. Confirm
4. ✅ New itinerary generated
5. ✅ Previous itinerary replaced
```
**Result: ✅ Pass**

### Flow 4: PDF Export
```
1. Click "Export PDF"
2. ✅ PDF file downloads automatically
3. ✅ PDF contains: title, destination, dates, budget, all days
```
**Result: ✅ Pass**

### Flow 5: Dashboard & Delete
```
1. Navigate to Dashboard
2. ✅ Trip card appears with destination and dates
3. Click "Delete" on the card
4. ✅ Confirmation dialog appears
5. Click "Confirm"
6. ✅ Card removed from dashboard
```
**Result: ✅ Pass**

### Flow 6: Security — Cross-User Data Access
```
1. Register User A, create a trip, note the trip ID
2. Log in as User B
3. Manually call GET /trips/{trip_id_from_user_a}
4. ✅ Returns 404 (Supabase RLS blocks access)
```
**Result: ✅ Pass**

---

## Security Test Results

| Security Check | Method | Result |
|---------------|--------|--------|
| Password stored in plaintext | Check Supabase Auth users table | ✅ bcrypt hashed |
| JWT can be tampered | Modify token payload manually | ✅ 401 returned |
| Cross-user trip access | Manual API call | ✅ RLS blocks, 404 |
| CORS allows all origins | Check response headers | ✅ Only FRONTEND_URL allowed |
| `.env` committed to git | Check git log | ✅ .gitignore excludes it |
| SQL injection via trip ID | Pass `'; DROP TABLE trips;--` as ID | ✅ Supabase parameterized queries |

---

## Performance Observations

| Scenario | Response Time | Notes |
|----------|--------------|-------|
| Login | < 500ms | Supabase Auth latency |
| Generate 5-day trip (Grok API) | 8–15 seconds | LLM inference time |
| Generate 5-day trip (Demo Mode) | < 100ms | Static data |
| Load dashboard (5 trips) | < 300ms | Supabase query |
| PDF export | < 1 second | fpdf2 local generation |

---

## Known Bugs Fixed During Testing

| Bug | Description | Fix |
|-----|-------------|-----|
| BUG-01 | PDF crashed on special characters | Replaced unsupported chars with ASCII |
| BUG-02 | Dashboard showed trips from all users | Added `user_id` filter in Supabase query |
| BUG-03 | Token not cleared on logout | Added `localStorage.removeItem('token')` in `logout()` |
| BUG-04 | Regenerate silently failed with no feedback | Added error toast notification |
| BUG-05 | Date validation allowed end < start on form | Added client-side date validation |

---

## Next Phase
→ [Project Documentation](../7.%20Project%20Documentation/README.md)
