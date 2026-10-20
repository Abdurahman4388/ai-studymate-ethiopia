"""Test fixtures for pytest."""

import os
os.environ.setdefault("DISABLE_SQLALCHEMY_CEXT", "1")

import pytest
import pytest_asyncio
from httpx import AsyncClient, ASGITransport
from app.main import app


@pytest_asyncio.fixture
async def client():
    """Asynchronous test client using ASGI transport."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://testserver") as ac:
        yield ac
