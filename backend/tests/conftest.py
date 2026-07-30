"""Test fixtures with automatic PostgreSQL → SQLite fallback.

Default: PostgreSQL at localhost:5432 (set TEST_DATABASE_URL to customize).
If PostgreSQL is unavailable, falls back to a temporary SQLite file
so tests always run even without Docker.
"""

import os
import tempfile
from collections.abc import AsyncGenerator
from pathlib import Path

import pytest_asyncio
from httpx import ASGITransport, AsyncClient
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

from app.core.database import Base, get_db
from app.main import app

TEST_DATABASE_URL = os.getenv(
    "TEST_DATABASE_URL",
    "postgresql+asyncpg://entrypoint:entrypoint@localhost:5432/entrypoint_test",
)


async def _create_pg_test_database(url: str) -> None:
    """Create the test database on PostgreSQL if it doesn't exist."""
    base_url = url.rsplit("/", 1)[0] + "/postgres"
    engine = create_async_engine(base_url, isolation_level="AUTOCOMMIT")
    db_name = url.rsplit("/", 1)[1]
    try:
        async with engine.connect() as conn:
            result = await conn.execute(
                text(f"SELECT 1 FROM pg_database WHERE datname = '{db_name}'")
            )
            if not result.scalar():
                await conn.execute(text(f"CREATE DATABASE {db_name}"))
    finally:
        await engine.dispose()


@pytest_asyncio.fixture(scope="session")
async def async_engine():
    """Engine — tries PostgreSQL first, falls back to SQLite if unavailable.

    Creates all tables before session, drops after.
    """
    url = TEST_DATABASE_URL
    is_postgres = url.startswith("postgresql")
    fallback_file = None

    if is_postgres:
        # Test if PostgreSQL is actually reachable with a quick connect
        probe_engine = create_async_engine(
            url, echo=False, pool_size=1, max_overflow=0
        )
        try:
            async with probe_engine.connect() as conn:
                await conn.execute(text("SELECT 1"))
            await probe_engine.dispose()
        except Exception:
            await probe_engine.dispose()
            is_postgres = False
            fallback_file = tempfile.NamedTemporaryFile(
                suffix=".db", delete=False
            )
            db_path = fallback_file.name
            fallback_file.close()
            url = f"sqlite+aiosqlite:///{db_path}"
            print(
                f"\nWARNING: PostgreSQL unreachable, "
                f"falling back to SQLite ({db_path}).\n"
                f"  Set TEST_DATABASE_URL for real PG tests.\n"
            )

    if is_postgres:
        await _create_pg_test_database(url)

    engine = create_async_engine(url, echo=False)

    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    yield engine

    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)

    # Clean up SQLite temp file
    if fallback_file is not None:
        db_path = url.replace("sqlite+aiosqlite:///", "")
        try:
            if Path(db_path).exists():
                os.unlink(db_path)
        except OSError:
            pass

    await engine.dispose()


@pytest_asyncio.fixture
async def db_session(
    async_engine,
) -> AsyncGenerator[AsyncSession, None]:
    """Each test gets a session with an open transaction.
    The transaction is rolled back after the test finishes.
    """
    factory = async_sessionmaker(
        async_engine, class_=AsyncSession, expire_on_commit=False
    )
    async with factory() as session:
        await session.begin()
        try:
            yield session
        finally:
            await session.rollback()


@pytest_asyncio.fixture
async def client(
    db_session: AsyncSession,
) -> AsyncGenerator[AsyncClient, None]:
    """Override get_db with the test session."""

    async def _override_get_db():
        yield db_session

    app.dependency_overrides[get_db] = _override_get_db
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac
    app.dependency_overrides.clear()
