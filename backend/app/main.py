from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.services.admin import admin_router
from app.services.auth import auth_router
from app.services.companies import companies_router
from app.services.directories import directories_router
from app.services.participants import participants_router
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
app.include_router(tasks_router, prefix="/api/v1")


@app.get("/health")
async def health() -> dict[str, str]:
    return {"status": "ok"}
