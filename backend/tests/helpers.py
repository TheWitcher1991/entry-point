"""Shared test helpers — register users and create test data."""

from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import hash_password
from app.services.auth.models import User, UserRole, UserStatus


async def register_user(
    client: AsyncClient,
    email: str,
    password: str = "password123",
    role: str = "participant",
) -> dict:
    """Register a user and return the full JSON response."""
    resp = await client.post(
        "/api/v1/auth/register",
        json={"email": email, "password": password, "role": role},
    )
    assert resp.status_code == 201, f"Register failed: {resp.text}"
    return resp.json()


async def login_user(
    client: AsyncClient,
    email: str,
    password: str = "password123",
) -> str:
    """Login and return an access token."""
    resp = await client.post(
        "/api/v1/auth/login",
        json={"email": email, "password": password},
    )
    assert resp.status_code == 200, f"Login failed: {resp.text}"
    return resp.json()["access_token"]


async def create_admin(db_session: AsyncSession, email: str = "admin@test.com") -> User:
    """Insert an admin user directly into the database."""
    admin = User(
        email=email,
        password_hash=hash_password("admin123"),
        role=UserRole.ADMIN,
        status=UserStatus.ACTIVE,
    )
    db_session.add(admin)
    await db_session.flush()
    await db_session.refresh(admin)
    return admin


async def register_participant(
    client: AsyncClient,
    email: str = "part@test.com",
) -> tuple[str, int]:
    """Register a participant, return (token, user_id)."""
    data = await register_user(client, email=email, role="participant")
    token = data["access_token"]
    user_id = data.get("user_id", 0)
    return token, user_id


async def register_company(
    client: AsyncClient,
    email: str = "comp@test.com",
) -> tuple[str, int]:
    """Register a company user, return (token, user_id)."""
    data = await register_user(client, email=email, role="company")
    token = data["access_token"]
    user_id = data.get("user_id", 0)

    # Update company profile with a name so that company_name is set
    await client.patch(
        "/api/v1/companies/me",
        json={"name": f"Company {email}", "city": "Moscow", "stack": "Python, React"},
        headers={"Authorization": f"Bearer {token}"},
    )
    return token, user_id


async def ensure_participant_profile(
    client: AsyncClient, token: str
) -> dict:
    """Ensure participant profile exists (auto-creates on GET /participants/me)."""
    resp = await client.get(
        "/api/v1/participants/me",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert resp.status_code == 200
    return resp.json()
