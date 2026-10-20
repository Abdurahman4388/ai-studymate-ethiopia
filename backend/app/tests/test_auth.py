import uuid
import pytest
from httpx import AsyncClient
from app.core.database import init_db


@pytest.mark.asyncio
async def test_auth_workflow(client: AsyncClient):
    """Verifies end-to-end registration, login, and profile retrieval."""
    # Ensure tables are ready
    await init_db()

    unique_email = f"student_test_{uuid.uuid4().hex[:8]}@aau.edu.et"

    # 1. Register a new student
    register_payload = {
        "email": unique_email,
        "password": "SecurePassword123!",
        "full_name": "Abebe Bekele",
        "interface_language": "am",
        "ai_response_language": "am",
        "university": "Addis Ababa University",
        "department": "Computer Science",
        "academic_year": 3,
    }

    reg_resp = await client.post("/api/v1/auth/register", json=register_payload)
    assert reg_resp.status_code == 201, reg_resp.text
    reg_data = reg_resp.json()
    assert "access_token" in reg_data
    assert reg_data["user"]["email"] == unique_email
    assert reg_data["user"]["full_name"] == "Abebe Bekele"
    assert reg_data["user"]["profile"]["university"] == "Addis Ababa University"
    assert reg_data["user"]["profile"]["interface_language"] == "am"

    token = reg_data["access_token"]

    # 2. Reject duplicate registration
    dup_resp = await client.post("/api/v1/auth/register", json=register_payload)
    assert dup_resp.status_code == 400
    assert "already exists" in dup_resp.json()["detail"]

    # 3. Login with valid credentials
    login_resp = await client.post(
        "/api/v1/auth/login",
        json={"email": unique_email, "password": "SecurePassword123!"},
    )
    assert login_resp.status_code == 200
    login_data = login_resp.json()
    assert "access_token" in login_data
    assert login_data["user"]["email"] == unique_email

    # 4. Reject invalid password
    bad_login = await client.post(
        "/api/v1/auth/login",
        json={"email": unique_email, "password": "WrongPassword"},
    )
    assert bad_login.status_code == 401

    # 5. Access /me with valid token
    me_resp = await client.get(
        "/api/v1/auth/me",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert me_resp.status_code == 200
    me_data = me_resp.json()
    assert me_data["email"] == unique_email
    assert me_data["full_name"] == "Abebe Bekele"

    # 6. Reject unauthenticated /me
    unauth_resp = await client.get("/api/v1/auth/me")
    assert unauth_resp.status_code == 401
