import pytest


@pytest.mark.asyncio
async def test_get_company_unauthenticated(client):
    response = await client.get("/api/v1/companies/me")
    assert response.status_code == 401


@pytest.mark.asyncio
async def test_get_company_creates_on_first_access(client):
    # Register + login
    await client.post("/api/v1/auth/register", json={
        "email": "comp@test.com",
        "password": "password123",
        "role": "company",
    })
    login_resp = await client.post("/api/v1/auth/login", json={
        "email": "comp@test.com",
        "password": "password123",
    })
    token = login_resp.json()["access_token"]

    # Get company (auto-creates)
    response = await client.get("/api/v1/companies/me", headers={
        "Authorization": f"Bearer {token}",
    })
    assert response.status_code == 200
    data = response.json()
    assert data["owner_id"] is not None
    assert data["verification_status"] == "unverified"


@pytest.mark.asyncio
async def test_update_company(client):
    # Register + login
    await client.post("/api/v1/auth/register", json={
        "email": "comp2@test.com",
        "password": "password123",
        "role": "company",
    })
    login_resp = await client.post("/api/v1/auth/login", json={
        "email": "comp2@test.com",
        "password": "password123",
    })
    token = login_resp.json()["access_token"]

    # Update company
    response = await client.patch("/api/v1/companies/me", json={
        "name": "ООО Ромашка",
        "description": "Разрабатываем сайты",
        "city": "Казань",
        "industry": "IT",
        "company_size": "10-50",
    }, headers={
        "Authorization": f"Bearer {token}",
    })
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "ООО Ромашка"
    assert data["description"] == "Разрабатываем сайты"
    assert data["city"] == "Казань"
    assert data["industry"] == "IT"


@pytest.mark.asyncio
async def test_get_company_public(client):
    # Register company
    await client.post("/api/v1/auth/register", json={
        "email": "comp3@test.com",
        "password": "password123",
        "role": "company",
    })
    login_resp = await client.post("/api/v1/auth/login", json={
        "email": "comp3@test.com",
        "password": "password123",
    })
    token = login_resp.json()["access_token"]

    # Update with name
    await client.patch("/api/v1/companies/me", json={
        "name": "ТехноСтарт",
    }, headers={"Authorization": f"Bearer {token}"})

    # Get my company to get the ID
    me = await client.get("/api/v1/companies/me", headers={
        "Authorization": f"Bearer {token}",
    })
    company_id = me.json()["id"]

    # Public access (no auth)
    public = await client.get(f"/api/v1/companies/{company_id}")
    assert public.status_code == 200
    assert public.json()["name"] == "ТехноСтарт"


@pytest.mark.asyncio
async def test_get_company_public_not_found(client):
    response = await client.get("/api/v1/companies/99999")
    assert response.status_code == 404
