import pytest


@pytest.mark.asyncio
async def test_get_profile_unauthenticated(client):
    response = await client.get("/api/v1/participants/me")
    assert response.status_code == 401


@pytest.mark.asyncio
async def test_get_profile_creates_on_first_access(client):
    # Register + login
    await client.post("/api/v1/auth/register", json={
        "email": "part@test.com",
        "password": "password123",
        "role": "participant",
    })
    login_resp = await client.post("/api/v1/auth/login", json={
        "email": "part@test.com",
        "password": "password123",
    })
    token = login_resp.json()["access_token"]

    # Get profile (auto-creates)
    response = await client.get("/api/v1/participants/me", headers={
        "Authorization": f"Bearer {token}",
    })
    assert response.status_code == 200
    data = response.json()
    assert data["user_id"] is not None
    assert data["availability_status"] == "active"


@pytest.mark.asyncio
async def test_update_profile(client):
    # Register + login
    await client.post("/api/v1/auth/register", json={
        "email": "part2@test.com",
        "password": "password123",
        "role": "participant",
    })
    login_resp = await client.post("/api/v1/auth/login", json={
        "email": "part2@test.com",
        "password": "password123",
    })
    token = login_resp.json()["access_token"]

    # Update profile
    response = await client.patch("/api/v1/participants/me", json={
        "first_name": "Иван",
        "last_name": "Петров",
        "city": "Москва",
        "bio": "Junior developer",
        "github_url": "https://github.com/ivan",
    }, headers={
        "Authorization": f"Bearer {token}",
    })
    assert response.status_code == 200
    data = response.json()
    assert data["first_name"] == "Иван"
    assert data["last_name"] == "Петров"
    assert data["city"] == "Москва"
    assert data["bio"] == "Junior developer"
    assert data["github_url"] == "https://github.com/ivan"


@pytest.mark.asyncio
async def test_partial_update_profile(client):
    # Register + login
    await client.post("/api/v1/auth/register", json={
        "email": "part3@test.com",
        "password": "password123",
        "role": "participant",
    })
    login_resp = await client.post("/api/v1/auth/login", json={
        "email": "part3@test.com",
        "password": "password123",
    })
    token = login_resp.json()["access_token"]

    # Set name
    await client.patch("/api/v1/participants/me", json={
        "first_name": "Анна",
    }, headers={
        "Authorization": f"Bearer {token}",
    })

    # Get profile and verify only name is set
    response = await client.get("/api/v1/participants/me", headers={
        "Authorization": f"Bearer {token}",
    })
    data = response.json()
    assert data["first_name"] == "Анна"
    assert data["last_name"] is None
    assert data["bio"] is None
