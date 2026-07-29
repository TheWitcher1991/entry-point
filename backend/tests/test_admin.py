import pytest
from httpx import AsyncClient
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.services.auth.models import User, UserRole, UserStatus


@pytest.mark.asyncio
async def test_list_users_requires_admin(
    client: AsyncClient, db_session: AsyncSession
) -> None:
    """Non-admin users cannot list all users."""
    # Register a participant
    response = await client.post(
        "/api/v1/auth/register",
        json={
            "email": "user@test.com",
            "password": "Test123!",
            "role": "participant",
        },
    )
    token = response.json()["access_token"]

    # Try to list users
    response = await client.get(
        "/api/v1/admin/users",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 403
    assert "Admin access required" in response.text


@pytest.mark.asyncio
async def test_admin_can_list_users(
    client: AsyncClient, db_session: AsyncSession
) -> None:
    """Admin can list all registered users."""
    # Register a participant and a company first
    for i, role in enumerate(["participant", "company"]):
        await client.post(
            "/api/v1/auth/register",
            json={
                "email": f"user{i}@test.com",
                "password": "Test123!",
                "role": role,
            },
        )

    # Create admin user directly
    from app.core.security import hash_password

    admin = User(
        email="admin@test.com",
        password_hash=hash_password("Admin123!"),
        role=UserRole.ADMIN,
        status=UserStatus.ACTIVE,
    )
    db_session.add(admin)
    await db_session.flush()
    await db_session.refresh(admin)

    # Get admin token
    response = await client.post(
        "/api/v1/auth/login",
        json={"email": "admin@test.com", "password": "Admin123!"},
    )
    token = response.json()["access_token"]

    # List users
    response = await client.get(
        "/api/v1/admin/users",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 200
    data = response.json()
    # Should have at least 3 users (participant, company, admin)
    assert len(data) >= 3
    emails = [u["email"] for u in data]
    assert "user0@test.com" in emails
    assert "user1@test.com" in emails
    assert "admin@test.com" in emails


@pytest.mark.asyncio
async def test_admin_can_block_user(
    client: AsyncClient, db_session: AsyncSession
) -> None:
    """Admin can change user status to blocked."""
    # Register a participant
    await client.post(
        "/api/v1/auth/register",
        json={
            "email": "victim@test.com",
            "password": "Test123!",
            "role": "participant",
        },
    )

    # Create admin
    from app.core.security import hash_password

    admin = User(
        email="admin2@test.com",
        password_hash=hash_password("Admin123!"),
        role=UserRole.ADMIN,
        status=UserStatus.ACTIVE,
    )
    db_session.add(admin)
    await db_session.flush()
    await db_session.refresh(admin)

    # Get admin token
    response = await client.post(
        "/api/v1/auth/login",
        json={"email": "admin2@test.com", "password": "Admin123!"},
    )
    token = response.json()["access_token"]

    # Get victim's id
    result = await db_session.execute(
        select(User).where(User.email == "victim@test.com")
    )
    victim = result.scalar_one()

    # Block the victim
    response = await client.patch(
        f"/api/v1/admin/users/{victim.id}/status",
        headers={"Authorization": f"Bearer {token}"},
        json={"status": "blocked"},
    )
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "blocked"

    # Verify victim can no longer login
    response = await client.post(
        "/api/v1/auth/login",
        json={"email": "victim@test.com", "password": "Test123!"},
    )
    assert response.status_code == 401


@pytest.mark.asyncio
async def test_admin_cannot_block_self(
    client: AsyncClient, db_session: AsyncSession
) -> None:
    """Admin cannot change their own status."""
    # Create admin
    from app.core.security import hash_password

    admin = User(
        email="admin3@test.com",
        password_hash=hash_password("Admin123!"),
        role=UserRole.ADMIN,
        status=UserStatus.ACTIVE,
    )
    db_session.add(admin)
    await db_session.flush()
    await db_session.refresh(admin)

    # Get admin token
    response = await client.post(
        "/api/v1/auth/login",
        json={"email": "admin3@test.com", "password": "Admin123!"},
    )
    token = response.json()["access_token"]

    # Try to block self
    response = await client.patch(
        f"/api/v1/admin/users/{admin.id}/status",
        headers={"Authorization": f"Bearer {token}"},
        json={"status": "blocked"},
    )
    assert response.status_code == 400
    assert "Cannot change your own status" in response.text
