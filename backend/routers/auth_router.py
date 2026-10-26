"""
routers/auth_router.py — Registration and login endpoints.

Endpoints:
  POST /auth/register  — Create a new account
  POST /auth/login     — Sign in and get an access token
  GET  /auth/me        — Get current user profile (requires token)
"""

from fastapi import APIRouter, HTTPException, status, Depends
from models import RegisterRequest, LoginRequest, TokenResponse, MessageResponse
from database import supabase
from auth.dependencies import get_current_user

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/register", response_model=MessageResponse, status_code=201)
async def register(body: RegisterRequest):
    """
    Create a new user account via Supabase Auth.

    Supabase handles password hashing and email uniqueness automatically.
    After registration, the user should check their email for a confirmation
    link (if email confirmation is enabled in your Supabase project settings).
    """
    try:
        response = supabase.auth.sign_up(
            {
                "email": body.email,
                "password": body.password,
                "options": {
                    "data": {"full_name": body.full_name}
                },
            }
        )
        if response.user is None:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Registration failed. The email may already be in use.",
            )
        return {"message": "Account created! Check your email to confirm your address."}
    except HTTPException:
        raise
    except Exception as e:
        error_msg = str(e)
        if "already registered" in error_msg.lower() or "already been registered" in error_msg.lower():
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="An account with this email already exists.",
            )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Registration error: {error_msg}",
        )


@router.post("/login", response_model=TokenResponse)
async def login(body: LoginRequest):
    """
    Sign in and receive an access token.

    The token is a Supabase JWT. Store it in the frontend (localStorage or
    a state manager) and send it as 'Authorization: Bearer <token>' on every
    authenticated request.
    """
    try:
        response = supabase.auth.sign_in_with_password(
            {"email": body.email, "password": body.password}
        )
        if response.user is None or response.session is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password.",
            )
        return TokenResponse(
            access_token=response.session.access_token,
            user_id=str(response.user.id),
            email=response.user.email,
            full_name=response.user.user_metadata.get("full_name", ""),
        )
    except HTTPException:
        raise
    except Exception as e:
        error_msg = str(e)
        if "invalid" in error_msg.lower() or "credentials" in error_msg.lower():
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password.",
            )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Login error: {error_msg}",
        )


@router.get("/me")
async def get_me(current_user: dict = Depends(get_current_user)):
    """Return the currently logged-in user's profile."""
    return current_user
