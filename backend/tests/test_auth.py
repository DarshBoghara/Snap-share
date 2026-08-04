import pytest
from httpx import AsyncClient

@pytest.mark.asyncio
async def test_register_user(client: AsyncClient):
    response = await client.post("/api/v1/auth/register", json={
        "username": "testuser",
        "email": "testuser@example.com",
        "password": "Password123!"
    })
    assert response.status_code == 201
    data = response.json()
    assert "access_token" in data
    assert "refresh_token" in data

@pytest.mark.asyncio
async def test_login_user(client: AsyncClient):
    # Register first
    await client.post("/api/v1/auth/register", json={
        "username": "loginuser",
        "email": "loginuser@example.com",
        "password": "Password123!"
    })

    # Login with username
    res = await client.post("/api/v1/auth/login", json={
        "username_or_email": "loginuser",
        "password": "Password123!"
    })
    assert res.status_code == 200
    assert "access_token" in res.json()
