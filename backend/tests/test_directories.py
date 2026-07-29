import pytest

from app.core.security import hash_password
from app.services.auth.models import User, UserRole, UserStatus


@pytest.mark.asyncio
async def test_list_categories_public(client):
    """Anyone can list categories."""
    response = await client.get("/api/v1/directories/categories")
    assert response.status_code == 200
    assert response.json() == []


@pytest.mark.asyncio
async def test_create_category_requires_admin(client):
    """Non-admin users cannot create categories."""
    # Register as participant
    await client.post("/api/v1/auth/register", json={
        "email": "partcat@test.com",
        "password": "password123",
        "role": "participant",
    })
    login_resp = await client.post("/api/v1/auth/login", json={
        "email": "partcat@test.com",
        "password": "password123",
    })
    token = login_resp.json()["access_token"]

    response = await client.post("/api/v1/directories/categories", json={
        "name": "Test Category",
    }, headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 403


@pytest.mark.asyncio
async def test_admin_can_create_and_list_categories(client, db_session):
    """Admin can create categories and they appear in listing."""
    # Create admin user directly
    admin = User(
        email="admin@test.com",
        password_hash=hash_password("admin123"),
        role=UserRole.ADMIN,
        status=UserStatus.ACTIVE,
    )
    db_session.add(admin)
    await db_session.flush()
    await db_session.refresh(admin)

    # Login
    login_resp = await client.post("/api/v1/auth/login", json={
        "email": "admin@test.com",
        "password": "admin123",
    })
    token = login_resp.json()["access_token"]

    # Create category
    response = await client.post("/api/v1/directories/categories", json={
        "name": "Backend",
        "direction": "Разработка",
    }, headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 201
    data = response.json()
    assert data["name"] == "Backend"
    assert data["is_active"] is True

    # List categories
    list_resp = await client.get("/api/v1/directories/categories")
    assert list_resp.status_code == 200
    names = [c["name"] for c in list_resp.json()]
    assert "Backend" in names


@pytest.mark.asyncio
async def test_list_skills_public(client):
    """Anyone can list skills."""
    response = await client.get("/api/v1/directories/skills")
    assert response.status_code == 200
    assert response.json() == []


@pytest.mark.asyncio
async def test_create_skill_requires_admin(client):
    """Non-admin users cannot create skills."""
    await client.post("/api/v1/auth/register", json={
        "email": "partskill@test.com",
        "password": "password123",
        "role": "participant",
    })
    login_resp = await client.post("/api/v1/auth/login", json={
        "email": "partskill@test.com",
        "password": "password123",
    })
    token = login_resp.json()["access_token"]

    response = await client.post("/api/v1/directories/skills", json={
        "name": "Python",
    }, headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 403


@pytest.mark.asyncio
async def test_admin_can_create_skills(client, db_session):
    """Admin can create skills."""
    admin = User(
        email="admin2@test.com",
        password_hash=hash_password("admin123"),
        role=UserRole.ADMIN,
        status=UserStatus.ACTIVE,
    )
    db_session.add(admin)
    await db_session.flush()
    await db_session.refresh(admin)

    login_resp = await client.post("/api/v1/auth/login", json={
        "email": "admin2@test.com",
        "password": "admin123",
    })
    token = login_resp.json()["access_token"]

    response = await client.post("/api/v1/directories/skills", json={
        "name": "Python",
    }, headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 201
    data = response.json()
    assert data["name"] == "Python"
    assert data["is_active"] is True
