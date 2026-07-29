"""Test fixtures for backend tests.

Uses SQLite file-based database for reliable test isolation.
Each test gets a fresh database file.
"""
import os
import tempfile
from collections.abc import AsyncGenerator

import pytest_asyncio
from httpx import ASGITransport, AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

from app.core.database import Base, get_db
from app.main import app


@pytest_asyncio.fixture
async def async_engine():
    """Create a file-based SQLite engine for each test.

    File-based database avoids the per-connection isolation issue
    of in-memory SQLite databases.
    """
    tmpfile = tempfile.NamedTemporaryFile(suffix=".db", delete=False)
    db_path = tmpfile.name
    tmpfile.close()

    engine = create_async_engine(f"sqlite+aiosqlite:///{db_path}", echo=False)

    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    yield engine

    await engine.dispose()
    os.unlink(db_path)


@pytest_asyncio.fixture
async def db_session(async_engine) -> AsyncGenerator[AsyncSession, None]:
    """Create an isolated session with rollback after test."""
    session_factory = async_sessionmaker(
        async_engine, class_=AsyncSession, expire_on_commit=False
    )
    async with session_factory() as session:
        async with session.begin():
            yield session
            await session.rollback()


@pytest_asyncio.fixture
async def client(db_session: AsyncSession) -> AsyncGenerator[AsyncClient, None]:
    """Override get_db with the test session."""

    async def override_get_db():
        yield db_session

    app.dependency_overrides[get_db] = override_get_db
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac
    app.dependency_overrides.clear()
