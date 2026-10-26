"""
main.py — FastAPI application entry point.

This file:
  1. Creates the FastAPI app
  2. Configures CORS (Cross-Origin Resource Sharing) so the React frontend
     can call the backend from a different port
  3. Registers all routers
  4. Provides health check and API info endpoints
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from config import settings
from routers import auth_router, trips_router, pdf_router

app = FastAPI(
    title="AI Travel Planner API",
    description=(
        "Backend for the Personalized AI Travel Itinerary Planner. "
        "Built with FastAPI, Supabase, and Grok AI."
    ),
    version="1.0.0",
    docs_url="/docs",      # Swagger UI — visit http://localhost:8000/docs
    redoc_url="/redoc",    # ReDoc — visit http://localhost:8000/redoc
)

# ── CORS ──────────────────────────────────────────────────────────────────────
# CORS lets the React app (running on port 5173) call our API (port 8000).
# Without this, the browser blocks the requests.
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.frontend_url, "http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Routers ───────────────────────────────────────────────────────────────────
app.include_router(auth_router.router)
app.include_router(trips_router.router)
app.include_router(pdf_router.router)


# ── Health / Info ─────────────────────────────────────────────────────────────
@app.get("/", tags=["Health"])
async def root():
    return {
        "message": "AI Travel Planner API is running",
        "docs": "/docs",
        "version": "1.0.0",
    }


@app.get("/health", tags=["Health"])
async def health_check():
    return {"status": "ok"}
