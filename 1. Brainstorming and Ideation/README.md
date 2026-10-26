# Phase 1 — Brainstorming and Ideation

## Overview
This phase captures the initial spark of the project — problem identification, idea exploration, and feasibility thinking before any formal requirements were written.

---

## Problem Statement
Planning a personalized travel itinerary is time-consuming and overwhelming. Travelers spend hours browsing blogs, forums, and booking sites to piece together a coherent day-by-day plan. The goal was to automate this with AI.

---

## Initial Ideas Explored

| Idea | Description | Feasibility |
|------|-------------|-------------|
| AI Itinerary Generator | Use an LLM to generate day-by-day trip plans | ✅ High |
| Real-time Flight/Hotel Search | Integrate with live booking APIs | ❌ Complex + costly |
| Collaborative Trip Planning | Multi-user trip boards | 🟡 Out of scope for MVP |
| PDF Export | Export polished itineraries as PDF | ✅ High |
| Map Integration | Visual route on a map | 🟡 Future scope |

---

## Core Concept Chosen
A **personalized AI travel planner** that:
- Takes user inputs (destination, dates, budget, style, interests)
- Generates a structured day-by-day itinerary using an LLM
- Lets users save, edit, regenerate, and export plans as PDF
- Requires user authentication so data is private and persistent

---

## Technology Brainstorm

### AI Backend
- **Grok API (xAI)** — chosen for cost-efficiency and quality
- OpenAI GPT-4 — considered but more expensive
- Google Gemini — alternative option

### Frontend Framework
- **React + Vite** — fast dev server, modern component model
- Next.js — considered, overkill for SPA

### Backend API
- **FastAPI (Python)** — auto-generated docs, async, Pydantic validation
- Express.js — considered but Python preferred for AI ecosystem

### Database & Auth
- **Supabase** — free tier, PostgreSQL + Auth out of the box, Row Level Security

---

## Mind Map (Text Representation)

```
AI Travel Planner
├── User
│   ├── Register / Login
│   └── My Trips Dashboard
├── Trip Planning
│   ├── Input Form (destination, dates, budget, style)
│   ├── AI Generation (Grok API)
│   └── Itinerary View
├── Trip Management
│   ├── Save / Edit / Delete
│   └── Regenerate with Feedback
└── Export
    └── PDF Download
```

---

## Key Decisions Made in This Phase
1. **Full-stack web app** (not mobile) for faster development
2. **Demo Mode** fallback — app works without a paid API key
3. **Supabase RLS** for data isolation between users
4. **fpdf2** for server-side PDF generation (no frontend dependency)

---

## Next Phase
→ [Requirement Analysis](../2.%20Requirement%20Analysis/README.md)
