"""
auth/dependencies.py — FastAPI dependency for verifying JWT tokens.

How authentication works in this app:
1. User logs in → we call Supabase Auth → Supabase returns a session token
2. We return that token to the frontend
3. On every protected request the frontend sends the token in the
   Authorization header as "Bearer <token>"
4. This dependency decodes and validates the token, then returns the user_id

FastAPI dependencies are functions you put inside Depends(...).
They run before your endpoint code and can raise HTTPException to reject a request.
"""

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from database import supabase_admin

# This tells FastAPI to look for "Authorization: Bearer <token>" header
bearer_scheme = HTTPBearer()


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
) -> dict:
    """
    Validate the Supabase JWT and return the user payload.
    Raises 401 if the token is missing, expired, or invalid.
    """
    token = credentials.credentials

    try:
        # Ask Supabase to validate the token and return user info
        response = supabase_admin.auth.get_user(token)
        if response is None or response.user is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid or expired token",
                headers={"WWW-Authenticate": "Bearer"},
            )
        user = response.user
        return {
            "user_id": user.id,
            "email": user.email,
            "full_name": user.user_metadata.get("full_name", ""),
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
