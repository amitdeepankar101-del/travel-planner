"""
database.py — Supabase client factory.

We create TWO clients:
  • supabase_client  — uses the anon key (respects Row Level Security)
  • supabase_admin   — uses the service-role key (bypasses RLS, use carefully)

Clients are initialized lazily on first use so the app starts even when
Supabase credentials are not yet configured.
"""

from supabase import create_client, Client
from config import settings


_supabase_client: Client | None = None
_supabase_admin: Client | None = None


def get_supabase_client() -> Client:
    """Return an anon-key client that respects RLS (lazy singleton)."""
    global _supabase_client
    if _supabase_client is None:
        _supabase_client = create_client(settings.supabase_url, settings.supabase_anon_key)
    return _supabase_client


def get_supabase_admin() -> Client:
    """Return a service-role client that bypasses RLS (lazy singleton). Use sparingly."""
    global _supabase_admin
    if _supabase_admin is None:
        _supabase_admin = create_client(settings.supabase_url, settings.supabase_service_role_key)
    return _supabase_admin


# Convenience properties — used across the app via: from database import supabase, supabase_admin
class _LazyClient:
    """Proxy that initialises the real client on first attribute access."""
    def __init__(self, factory):
        object.__setattr__(self, "_factory", factory)
        object.__setattr__(self, "_client", None)

    def _get(self):
        if object.__getattribute__(self, "_client") is None:
            object.__setattr__(self, "_client", object.__getattribute__(self, "_factory")())
        return object.__getattribute__(self, "_client")

    def __getattr__(self, name):
        return getattr(self._get(), name)

    def __setattr__(self, name, value):
        setattr(self._get(), name, value)


supabase: Client = _LazyClient(get_supabase_client)
supabase_admin: Client = _LazyClient(get_supabase_admin)
