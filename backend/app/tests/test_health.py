"""Automated tests for health and root endpoints."""

import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_root_endpoint(client: AsyncClient):
    """Verifies root endpoint returns 200 and project metadata."""
    response = await client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert "AI StudyMate Ethiopia" in data["message"]
    assert "documentation" in data
    assert "supported_languages" in data
    assert set(["en", "am", "om"]).issubset(set(data["supported_languages"]))


@pytest.mark.asyncio
async def test_health_ping_endpoint(client: AsyncClient):
    """Verifies ping liveness probe returns 200 and 'pong'."""
    response = await client.get("/api/v1/health/ping")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert data["message"] == "pong"
    assert "timestamp" in data


@pytest.mark.asyncio
async def test_health_endpoint_structure(client: AsyncClient):
    """Verifies detailed health diagnostics schema and fields."""
    response = await client.get("/api/v1/health")
    assert response.status_code == 200
    data = response.json()
    assert "status" in data
    assert data["status"] in ["online", "degraded"]
    assert "database" in data
    assert "connected" in data["database"]
    assert "storage" in data
    assert data["storage"]["accessible"] is True
    assert data["supported_languages"] == ["en", "am", "om"]
    assert data["ai_provider"] in ["mock", "gemini", "openai"]


@pytest.mark.asyncio
async def test_cors_headers(client: AsyncClient):
    """Verifies CORS origin allow headers."""
    response = await client.options(
        "/api/v1/health",
        headers={
            "Origin": "http://localhost:3000",
            "Access-Control-Request-Method": "GET",
        },
    )
    assert response.status_code == 200
    assert response.headers.get("access-control-allow-origin") == "http://localhost:3000"
