
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.services.applications.models import Application
from app.services.tasks.models import ProjectTask


async def create_application(
    db: AsyncSession,
    participant_profile_id: int,
    task_id: int,
    cover_letter: str | None,
) -> Application | None:
    """Create a new application. Returns None if task doesn't exist."""
    task = await db.get(ProjectTask, task_id)
    if task is None:
        return None

    app = Application(
        task_id=task_id,
        participant_id=participant_profile_id,
        cover_letter=cover_letter,
        status="pending",
    )
    db.add(app)
    await db.flush()

    # Re-query with eager loading to avoid lazy load issues with aiosqlite
    result = await db.execute(
        select(Application)
        .where(Application.id == app.id)
        .options(selectinload(Application.task))
    )
    return result.scalar_one_or_none()


async def get_application_by_id(
    db: AsyncSession, application_id: int
) -> Application | None:
    result = await db.execute(
        select(Application)
        .where(Application.id == application_id)
        .options(selectinload(Application.task), selectinload(Application.participant_profile))
    )
    return result.scalar_one_or_none()


async def get_my_applications(
    db: AsyncSession, participant_profile_id: int
) -> list[Application]:
    """Get all applications for a participant."""
    result = await db.execute(
        select(Application)
        .where(Application.participant_id == participant_profile_id)
        .options(selectinload(Application.task))
        .order_by(Application.created_at.desc())
    )
    return list(result.scalars().all())


async def get_task_applications(
    db: AsyncSession, task_id: int
) -> list[Application]:
    """Get all applications for a specific task."""
    result = await db.execute(
        select(Application)
        .where(Application.task_id == task_id)
        .options(selectinload(Application.participant_profile))
        .order_by(Application.created_at.desc())
    )
    return list(result.scalars().all())


async def update_application_status(
    db: AsyncSession, application_id: int, status: str
) -> Application | None:
    app = await get_application_by_id(db, application_id)
    if app is None:
        return None
    app.status = status
    await db.flush()
    await db.refresh(app)
    return app


async def get_applications_for_company_tasks(
    db: AsyncSession, company_id: int
) -> list[Application]:
    """Get all applications for all tasks owned by a company."""
    result = await db.execute(
        select(Application)
        .join(ProjectTask, Application.task_id == ProjectTask.id)
        .where(ProjectTask.company_id == company_id)
        .options(
            selectinload(Application.task),
            selectinload(Application.participant_profile),
        )
        .order_by(Application.created_at.desc())
    )
    return list(result.scalars().all())
