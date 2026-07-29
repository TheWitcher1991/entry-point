import pytest


@pytest.mark.asyncio
async def test_register_success(client):
    response = await client.post("/api/v1/auth/register", json={
        "email": "test@test.com",
        "password": "password123",
        "role": "participant",
    })
    assert response.status_code == 201
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"


@pytest.mark.asyncio
async def test_register_duplicate_email(client):
    await client.post("/api/v1/auth/register", json={
        "email": "dup@test.com",
        "password": "password123",
        "role": "participant",
    })
    response = await client.post("/api/v1/auth/register", json={
        "email": "dup@test.com",
        "password": "password123",
        "role": "participant",
    })
    assert response.status_code == 400
    assert "already" in response.json()["detail"].lower()


@pytest.mark.asyncio
async def test_register_invalid_role(client):
    response = await client.post("/api/v1/auth/register", json={
        "email": "badrole@test.com",
        "password": "password123",
        "role": "superadmin",
    })
    assert response.status_code == 422
    body = response.json()["detail"]
    detail = body[0] if isinstance(body, list) else body
    assert "role" in str(detail).lower()


@pytest.mark.asyncio
async def test_login_success(client):
    await client.post("/api/v1/auth/register", json={
        "email": "login@test.com",
        "password": "password123",
        "role": "company",
    })
    response = await client.post("/api/v1/auth/login", json={
        "email": "login@test.com",
        "password": "password123",
    })
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"


@pytest.mark.asyncio
async def test_login_wrong_password(client):
    await client.post("/api/v1/auth/register", json={
        "email": "wrongpw@test.com",
        "password": "password123",
        "role": "participant",
    })
    response = await client.post("/api/v1/auth/login", json={
        "email": "wrongpw@test.com",
        "password": "wrongpassword",
    })
    assert response.status_code == 401


@pytest.mark.asyncio
async def test_login_nonexistent_user(client):
    response = await client.post("/api/v1/auth/login", json={
        "email": "nobody@test.com",
        "password": "password123",
    })
    assert response.status_code == 401


@pytest.mark.asyncio
async def test_get_me_authenticated(client):
    # Register
    await client.post("/api/v1/auth/register", json={
        "email": "me@test.com",
        "password": "password123",
        "role": "participant",
    })
    # Login
    login_resp = await client.post("/api/v1/auth/login", json={
        "email": "me@test.com",
        "password": "password123",
    })
    token = login_resp.json()["access_token"]

    # Get me
    response = await client.get("/api/v1/users/me", headers={
        "Authorization": f"Bearer {token}",
    })
    assert response.status_code == 200
    data = response.json()
    assert data["email"] == "me@test.com"
    assert data["role"] == "participant"
    assert data["status"] == "active"


@pytest.mark.asyncio
async def test_get_me_unauthenticated(client):
    response = await client.get("/api/v1/users/me")
    assert response.status_code == 401
