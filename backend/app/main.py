import time
from collections.abc import AsyncGenerator
from contextlib import asynccontextmanager

from fastapi import Depends, FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.database import get_db
from app.core.logging_config import get_logger, setup_logging
from app.services.admin import admin_router
from app.services.applications import applications_router
from app.services.auth import auth_router
from app.services.companies import companies_router
from app.services.directories import directories_router
from app.services.experiences import experiences_router
from app.services.messages import messages_router
from app.services.notifications import notifications_router
from app.services.participants import participants_router
from app.services.participations import participations_router
from app.services.reviews import reviews_router
from app.services.tasks import tasks_router
from app.services.users import users_router

logger = get_logger("entrypoint")


@asynccontextmanager
async def lifespan(_app: FastAPI) -> AsyncGenerator[None]:
    """Startup / shutdown lifecycle."""
    logger.info(
        "App started | %s v%s | log_level=%s",
        settings.PROJECT_NAME,
        "0.1.0",
        settings.LOG_LEVEL,
    )
    yield
    logger.info("App shutting down")


def create_app() -> FastAPI:
    """Application factory — sets up logging, middleware, routes, and handlers."""
    setup_logging()

    app = FastAPI(
        title=settings.PROJECT_NAME,
        version="0.1.0",
        lifespan=lifespan,
    )

    # ── Request / response logging middleware ───────────────────────

    @app.middleware("http")
    async def log_requests(request: Request, call_next):  # type: ignore[no-untyped-def]
        start = time.perf_counter()
        try:
            response = await call_next(request)
            elapsed = int((time.perf_counter() - start) * 1000)
            logger.info(
                "%s %s — %s (%dms)",
                request.method,
                request.url.path,
                response.status_code,
                elapsed,
            )
            return response
        except Exception as exc:
            elapsed = int((time.perf_counter() - start) * 1000)
            logger.exception(
                "%s %s — UNHANDLED (%dms): %s",
                request.method,
                request.url.path,
                elapsed,
                exc,
            )
            return JSONResponse(
                status_code=500,
                content={"detail": "Internal server error"},
            )

    # ── Global exception handler ────────────────────────────────────

    @app.exception_handler(Exception)
    async def unhandled_exception_handler(request: Request, exc: Exception) -> JSONResponse:
        logger.exception(
            "Unhandled exception on %s %s: %s",
            request.method,
            request.url.path,
            exc,
        )
        return JSONResponse(
            status_code=500,
            content={"detail": "Internal server error"},
        )

    # ── CORS ────────────────────────────────────────────────────────

    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.CORS_ORIGINS,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # ── Routers ─────────────────────────────────────────────────────

    app.include_router(admin_router, prefix="/api/v1")
    app.include_router(auth_router, prefix="/api/v1")
    app.include_router(users_router, prefix="/api/v1")
    app.include_router(participants_router, prefix="/api/v1")
    app.include_router(companies_router, prefix="/api/v1")
    app.include_router(directories_router, prefix="/api/v1")
    app.include_router(experiences_router, prefix="/api/v1")
    app.include_router(applications_router, prefix="/api/v1")
    app.include_router(tasks_router, prefix="/api/v1")
    app.include_router(reviews_router, prefix="/api/v1")
    app.include_router(participations_router, prefix="/api/v1")
    app.include_router(messages_router, prefix="/api/v1")
    app.include_router(notifications_router, prefix="/api/v1")

    return app


app = create_app()


@app.get("/health")
async def health() -> dict[str, str]:
    return {"status": "ok"}


@app.get("/api/v1/stats")
async def stats(db: AsyncSession = Depends(get_db)) -> dict[str, int]:
    from sqlalchemy import func, select

    from app.services.auth.models import User
    from app.services.companies.models import Company
    from app.services.reviews.models import Review
    from app.services.tasks.models import ProjectTask

    active_tasks = (
        await db.execute(
            select(func.count(ProjectTask.id)).where(
                ProjectTask.status.in_(["open", "in_progress"])
            )
        )
    ).scalar() or 0

    companies = (
        await db.execute(select(func.count(Company.id)))
    ).scalar() or 0

    participants = (
        await db.execute(
            select(func.count(User.id)).where(User.role == "participant")
        )
    ).scalar() or 0

    completed_tasks = (
        await db.execute(
            select(func.count(ProjectTask.id)).where(ProjectTask.status == "completed")
        )
    ).scalar() or 0

    open_tasks = (
        await db.execute(
            select(func.count(ProjectTask.id)).where(ProjectTask.status == "open")
        )
    ).scalar() or 0

    total_reviews = (
        await db.execute(select(func.count(Review.id)))
    ).scalar() or 0

    return {
        "active_tasks": active_tasks,
        "open_tasks": open_tasks,
        "completed_tasks": completed_tasks,
        "companies": companies,
        "participants": participants,
        "total_reviews": total_reviews,
    }
