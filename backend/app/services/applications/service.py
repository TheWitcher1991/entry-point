
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.logging_config import get_logger
from app.services.applications.models import Application
from app.services.tasks.models import ProjectTask

logger = get_logger("applications")


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

    logger.info(
        "Application created: id=%d task_id=%d participant_id=%d",
        app.id, task_id, participant_profile_id,
    )

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
        logger.warning("Status update failed: application_id=%d not found", application_id)
        return None

    old_status = app.status
    app.status = status
    await db.flush()

    logger.info(
        "Application status changed: id=%d %s -> %s",
        application_id, old_status, status,
    )

    # ── Side effects on approval ──
    if status == "approved" and old_status != "approved":
        # Lazy imports to avoid circular dependencies
        from app.services.notifications.service import create_notification
        from app.services.participations.service import create_participation
        from app.services.tasks.service import update_task_status

        # 1. Create participation
        await create_participation(db, app.task_id, app.participant_id)

        # 2. Update task status to "selected" if currently "open"
        task = app.task
        if task is not None and task.status == "open":
            await update_task_status(db, app.task_id, "selected")

        # 3. Increment participant count
        if task is not None:
            task.participant_count = (task.participant_count or 0) + 1

        # 4. Notify participant
        participant_profile = app.participant_profile
        if participant_profile is not None:
            task_title = task.title if task else "the task"
            await create_notification(
                db,
                user_id=participant_profile.user_id,
                type="application_approved",
                title="Application Approved",
                message=f"Your application for '{task_title}' has been approved!",
                link=f"/tasks/{app.task_id}",
            )

            # 5. Send email notification
            from app.services.auth.models import User
            from app.services.notifications.email_service import send_email

            user_result = await db.execute(
                select(User).where(User.id == participant_profile.user_id)
            )
            user = user_result.scalar_one_or_none()
            if user is not None:
                company_name = task.company_name if task else "Компания"
                await send_email(
                    to=user.email,
                    subject="Заявка принята — Точка входа",
                    text=(
                        f"Ваша заявка на задачу \"{task_title}\" принята. "
                        f"Компания {company_name} выбрала вас исполнителем."
                    ),
                )

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
