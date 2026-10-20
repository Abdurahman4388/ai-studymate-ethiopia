"""Database session management and connection utilities.

Provides an asynchronous SQLAlchemy engine, session maker, and health inspection.
Supports automatic local SQLite development fallback if PostgreSQL credentials are not yet configured.
"""

import time
import logging
from typing import AsyncGenerator, Dict, Any
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy import text

from app.core.config import settings
from app.models.base import Base

logger = logging.getLogger("studymate.database")

# Primary asynchronous engine
_primary_uri = settings.SQLALCHEMY_DATABASE_URI
_is_sqlite_fallback = False

# We initialize the engine
engine = create_async_engine(
    _primary_uri,
    echo=False,
    future=True,
    pool_pre_ping=True,
)

async_session_factory = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False,
)


async def check_database_connection() -> Dict[str, Any]:
    """Tests the database connection and returns latency or error details."""
    global engine, async_session_factory, _is_sqlite_fallback
    start_time = time.perf_counter()
    try:
        async with engine.connect() as conn:
            result = await conn.execute(text("SELECT 1"))
            val = result.scalar()
            latency = (time.perf_counter() - start_time) * 1000
            return {
                "connected": val == 1,
                "latency_ms": round(latency, 2),
                "error": None,
                "fallback_active": _is_sqlite_fallback,
            }
    except Exception as exc:
        latency = (time.perf_counter() - start_time) * 1000
        error_msg = str(exc)

        # If PostgreSQL failed and we haven't fallen back yet, enable dev SQLite fallback
        if not _is_sqlite_fallback and "sqlite" not in str(engine.url):
            logger.warning(
                "PostgreSQL connection failed (%s). Falling back to local development database (SQLite).",
                error_msg,
            )
            fallback_uri = "sqlite+aiosqlite:///./studymate_dev.db"
            engine = create_async_engine(fallback_uri, echo=False, future=True)
            async_session_factory = async_sessionmaker(
                bind=engine,
                class_=AsyncSession,
                expire_on_commit=False,
                autocommit=False,
                autoflush=False,
            )
            _is_sqlite_fallback = True

            # Initialize tables on fallback database
            async with engine.begin() as conn:
                await conn.run_sync(Base.metadata.create_all)

            return {
                "connected": True,
                "latency_ms": round(latency, 2),
                "error": f"PostgreSQL unavailable ({error_msg[:60]}...). Using local SQLite dev database.",
                "fallback_active": True,
            }

        return {
            "connected": False,
            "latency_ms": round(latency, 2),
            "error": error_msg,
            "fallback_active": _is_sqlite_fallback,
        }


async def init_db():
    """Initializes database schema and tables."""
    # First check connection (and trigger dev fallback if postgres credentials are placeholder)
    status = await check_database_connection()
    if status["connected"]:
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)


async def get_db_session() -> AsyncGenerator[AsyncSession, None]:
    """Dependency that yields an asynchronous database session per request."""
    async with async_session_factory() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()
