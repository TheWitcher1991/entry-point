from fastapi import Depends, FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.database import get_db
from app.services.admin import admin_router
from app.services.applications import applications_router
from app.services.auth import auth_router
from app.services.companies import companies_router
from app.services.directories import directories_router
from app.services.notifications import notifications_router
from app.services.participants import participants_router
from app.services.participations import participations_router
from app.services.reviews import reviews_router
from app.services.tasks import tasks_router
from app.services.users import users_router

app = FastAPI(
    title=settings.PROJECT_NAME,
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(admin_router, prefix="/api/v1")
app.include_router(auth_router, prefix="/api/v1")
app.include_router(users_router, prefix="/api/v1")
app.include_router(participants_router, prefix="/api/v1")
app.include_router(companies_router, prefix="/api/v1")
app.include_router(directories_router, prefix="/api/v1")
app.include_router(applications_router, prefix="/api/v1")
app.include_router(tasks_router, prefix="/api/v1")
app.include_router(reviews_router, prefix="/api/v1")
app.include_router(participations_router, prefix="/api/v1")
app.include_router(notifications_router, prefix="/api/v1")


@app.get("/health")
async def health() -> dict[str, str]:
    return {"status": "ok"}


@app.get("/api/v1/stats")
async def stats(db: AsyncSession = Depends(get_db)) -> dict[str, int]:
    from sqlalchemy import func, select

    from app.services.auth.models import User
    from app.services.companies.models import Company
    from app.services.tasks.models import ProjectTask

    active_tasks = (
        await db.execute(
            select(func.count(ProjectTask.id)).where(ProjectTask.status == "active")
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

    return {
        "active_tasks": active_tasks,
        "companies": companies,
        "participants": participants,
    }
