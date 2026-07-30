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


@pytest.mark.asyncio
async def test_admin_stats(
    client: AsyncClient, db_session: AsyncSession
) -> None:
    """Admin can get detailed platform statistics."""
    from app.core.security import hash_password

    admin = User(
        email="adminstats@test.com",
        password_hash=hash_password("Admin123!"),
        role=UserRole.ADMIN,
        status=UserStatus.ACTIVE,
    )
    db_session.add(admin)
    await db_session.flush()

    response = await client.post(
        "/api/v1/auth/login",
        json={"email": "adminstats@test.com", "password": "Admin123!"},
    )
    token = response.json()["access_token"]

    resp = await client.get(
        "/api/v1/admin/stats",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert resp.status_code == 200
    data = resp.json()
    assert "total_users" in data
    assert "participants" in data
    assert "companies" in data
    assert "total_tasks" in data
    assert "tasks_draft" in data
    assert "tasks_moderation" in data
    assert "tasks_completed" in data


@pytest.mark.asyncio
async def test_admin_stats_requires_admin(
    client: AsyncClient
) -> None:
    """Non-admin users cannot access admin stats."""
    token, _ = await _register_participant(client, "statsuser@test.com")
    resp = await client.get(
        "/api/v1/admin/stats",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert resp.status_code == 403


@pytest.mark.asyncio
async def test_admin_list_companies(
    client: AsyncClient, db_session: AsyncSession
) -> None:
    """Admin can list all companies."""
    from app.core.security import hash_password

    admin = User(
        email="admincomp@test.com",
        password_hash=hash_password("Admin123!"),
        role=UserRole.ADMIN,
        status=UserStatus.ACTIVE,
    )
    db_session.add(admin)
    await db_session.flush()

    # Create a company via registration + patch profile
    comp_resp = await client.post(
        "/api/v1/auth/register",
        json={
            "email": "testcomp@test.com",
            "password": "password123",
            "role": "company",
        },
    )
    comp_token = comp_resp.json()["access_token"]
    await client.patch(
        "/api/v1/companies/me",
        json={"name": "Test Corp"},
        headers={"Authorization": f"Bearer {comp_token}"},
    )

    response = await client.post(
        "/api/v1/auth/login",
        json={"email": "admincomp@test.com", "password": "Admin123!"},
    )
    token = response.json()["access_token"]

    resp = await client.get(
        "/api/v1/admin/companies",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert resp.status_code == 200
    data = resp.json()
    assert len(data) >= 1


@pytest.mark.asyncio
async def test_admin_update_company_verification(
    client: AsyncClient, db_session: AsyncSession
) -> None:
    """Admin can change company verification status."""
    from app.core.security import hash_password

    admin = User(
        email="adminverif@test.com",
        password_hash=hash_password("Admin123!"),
        role=UserRole.ADMIN,
        status=UserStatus.ACTIVE,
    )
    db_session.add(admin)
    await db_session.flush()

    # Register a company
    comp_resp = await client.post(
        "/api/v1/auth/register",
        json={
            "email": "verifcomp@test.com",
            "password": "password123",
            "role": "company",
        },
    )
    comp_token = comp_resp.json()["access_token"]
    await client.patch(
        "/api/v1/companies/me",
        json={"name": "Verif Corp"},
        headers={"Authorization": f"Bearer {comp_token}"},
    )

    # Get company list to find ID
    response = await client.post(
        "/api/v1/auth/login",
        json={"email": "adminverif@test.com", "password": "Admin123!"},
    )
    token = response.json()["access_token"]

    companies_resp = await client.get(
        "/api/v1/admin/companies",
        headers={"Authorization": f"Bearer {token}"},
    )
    companies = companies_resp.json()
    comp_id = companies[0]["id"]

    # Verify
    resp = await client.patch(
        f"/api/v1/admin/companies/{comp_id}/verification",
        json={"verification_status": "verified"},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert resp.status_code == 200
    assert resp.json()["verification_status"] == "verified"

    # Reject
    resp = await client.patch(
        f"/api/v1/admin/companies/{comp_id}/verification",
        json={"verification_status": "rejected"},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert resp.status_code == 200
    assert resp.json()["verification_status"] == "rejected"

    # Unverify
    resp = await client.patch(
        f"/api/v1/admin/companies/{comp_id}/verification",
        json={"verification_status": "unverified"},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert resp.status_code == 200
    assert resp.json()["verification_status"] == "unverified"


async def _register_participant(client, email: str) -> tuple[str, int]:
    """Helper: register a participant and return (token, user_id)."""
    data = await client.post(
        "/api/v1/auth/register",
        json={"email": email, "password": "password123", "role": "participant"},
    )
    assert data.status_code == 201
    return data.json()["access_token"], data.json().get("user_id", 0)
