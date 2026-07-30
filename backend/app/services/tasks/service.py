from typing import Any

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.logging_config import get_logger
from app.services.tasks.models import ProjectTask, TaskSkill, TaskSubmission

logger = get_logger("tasks")


async def create_task(
    db: AsyncSession, company_id: int, data: dict[str, Any]
) -> ProjectTask:
    skills_data = data.pop("skills", [])

    task = ProjectTask(company_id=company_id, **data)
    db.add(task)
    await db.flush()

    for skill_data in skills_data:
        ts = TaskSkill(task_id=task.id, **skill_data)
        db.add(ts)

    await db.flush()

    logger.info(
        "Task created: id=%d company_id=%d title=%s status=%s",
        task.id, company_id, task.title, task.status,
    )

    # Re-query with eager loading for serialization
    result = await db.execute(
        select(ProjectTask)
        .where(ProjectTask.id == task.id)
        .options(
            selectinload(ProjectTask.skills).selectinload(TaskSkill.skill),
            selectinload(ProjectTask.company),
        )
    )
    return result.scalar_one()


async def get_task_by_id(
    db: AsyncSession, task_id: int
) -> ProjectTask | None:
    result = await db.execute(
        select(ProjectTask)
        .where(ProjectTask.id == task_id)
        .options(
            selectinload(ProjectTask.skills).selectinload(TaskSkill.skill),
            selectinload(ProjectTask.company),
        )
        .execution_options(populate_existing=True)
    )
    return result.scalar_one_or_none()


async def get_company_tasks(
    db: AsyncSession, company_id: int
) -> list[ProjectTask]:
    result = await db.execute(
        select(ProjectTask)
        .where(ProjectTask.company_id == company_id)
        .options(
            selectinload(ProjectTask.skills).selectinload(TaskSkill.skill),
            selectinload(ProjectTask.company),
        )
        .order_by(ProjectTask.created_at.desc())
    )
    return list(result.scalars().all())


async def update_task(
    db: AsyncSession, task_id: int, company_id: int, data: dict[str, Any]
) -> ProjectTask | None:
    task = await get_task_by_id(db, task_id)
    if task is None or task.company_id != company_id:
        logger.warning(
            "Update task blocked: task_id=%d company_id=%d (not found or not owner)",
            task_id, company_id,
        )
        return None

    skills_data = data.pop("skills", None)

    for key, value in data.items():
        if value is not None and hasattr(task, key):
            setattr(task, key, value)

    if skills_data is not None:
        # Replace all task skills
        existing = await db.execute(
            select(TaskSkill).where(TaskSkill.task_id == task_id)
        )
        for ts in existing.scalars().all():
            await db.delete(ts)

        for skill_data in skills_data:
            ts = TaskSkill(task_id=task_id, **skill_data)
            db.add(ts)

    await db.flush()

    logger.info("Task updated: id=%d by company=%d", task_id, company_id)

    # Re-query with eager loading
    return await get_task_by_id(db, task_id)


async def update_task_status(
    db: AsyncSession, task_id: int, status: str
) -> ProjectTask | None:
    task = await get_task_by_id(db, task_id)
    if task is None:
        logger.warning("Status update failed: task_id=%d not found", task_id)
        return None
    old_status = task.status
    task.status = status
    await db.flush()

    logger.info(
        "Task status changed: id=%d %s -> %s",
        task_id, old_status, status,
    )

    # Re-query with eager loading
    return await get_task_by_id(db, task_id)


async def list_tasks(
    db: AsyncSession,
    status: str | None = None,
    category_id: int | None = None,
    company_id: int | None = None,
    difficulty: str | None = None,
    format: str | None = None,
    skill_ids: list[int] | None = None,
    search: str | None = None,
    sort: str = "newest",
    offset: int = 0,
    limit: int = 20,
) -> list[ProjectTask]:
    query = (
        select(ProjectTask)
        .options(
            selectinload(ProjectTask.skills).selectinload(TaskSkill.skill),
            selectinload(ProjectTask.company),
        )
    )

    if status:
        query = query.where(ProjectTask.status == status)
    if category_id:
        query = query.where(ProjectTask.category_id == category_id)
    if company_id:
        query = query.where(ProjectTask.company_id == company_id)
    if difficulty:
        query = query.where(ProjectTask.difficulty == difficulty)
    if format:
        query = query.where(ProjectTask.format == format)
    if search:
        query = query.where(
            ProjectTask.title.ilike(f"%{search}%")
            | (ProjectTask.summary.ilike(f"%{search}%"))
        )

    if sort == "deadline":
        query = query.order_by(ProjectTask.deadline.asc().nulls_last())
    elif sort == "popular":
        query = query.order_by(ProjectTask.participant_count.desc())
    else:
        query = query.order_by(ProjectTask.created_at.desc())

    query = query.offset(offset).limit(limit)
    result = await db.execute(query)
    return list(result.scalars().all())


# ── Participants ──


async def get_task_participants(
    db: AsyncSession, task_id: int
) -> list[Any]:
    """Get all active participations for a task with eager-loaded profiles."""
    from app.services.participations.models import Participation

    result = await db.execute(
        select(Participation)
        .where(
            Participation.task_id == task_id,
            Participation.status == "active",
        )
        .options(selectinload(Participation.participant_profile))
    )
    return list(result.scalars().all())


# ── Submissions ──


async def create_submission(
    db: AsyncSession,
    task_id: int,
    participant_id: int,
    description: str | None,
    result_links: str | None,
) -> TaskSubmission | None:
    """Create a submission. Task must be 'in_progress' with active participant participation."""
    from app.services.participations.service import is_participant_assigned

    task = await get_task_by_id(db, task_id)
    if task is None or task.status != "in_progress":
        return None

    # Check participant has active participation
    if not await is_participant_assigned(db, task_id, participant_id):
        return None

    # Check for existing pending submission
    existing = await db.execute(
        select(TaskSubmission).where(
            TaskSubmission.task_id == task_id,
            TaskSubmission.participant_id == participant_id,
            TaskSubmission.status == "pending",
        )
    )
    if existing.scalar_one_or_none():
        return None

    sub = TaskSubmission(
        task_id=task_id,
        participant_id=participant_id,
        description=description,
        result_links=result_links,
        status="pending",
    )
    db.add(sub)
    await db.flush()

    logger.info(
        "Submission created: id=%d task_id=%d participant_id=%d",
        sub.id, task_id, participant_id,
    )

    # Notify company about new submission
    from app.services.auth.models import User
    from app.services.notifications.email_service import send_email
    from app.services.notifications.service import create_notification

    if task.company is not None:
        await create_notification(
            db,
            user_id=task.company.owner_id,
            type="submission_received",
            title="New Submission Received",
            message=f"A participant has submitted work for '{task.title}'.",
            link=f"/tasks/{task_id}/submissions",
        )

        # Send email to company owner
        user_result = await db.execute(
            select(User).where(User.id == task.company.owner_id)
        )
        user = user_result.scalar_one_or_none()
        if user is not None:
            await send_email(
                to=user.email,
                subject="Новый отклик — Точка входа",
                text=(
                    f"Участник отправил работу по задаче \"{task.title}\". "
                    f"Перейдите в панель управления, чтобы проверить."
                ),
            )

    # Re-query with eager loading
    result = await db.execute(
        select(TaskSubmission)
        .where(TaskSubmission.id == sub.id)
        .options(selectinload(TaskSubmission.participant_profile))
    )
    return result.scalar_one()


async def get_task_submissions(
    db: AsyncSession, task_id: int
) -> list[TaskSubmission]:
    result = await db.execute(
        select(TaskSubmission)
        .where(TaskSubmission.task_id == task_id)
        .options(selectinload(TaskSubmission.participant_profile))
        .order_by(TaskSubmission.created_at.desc())
    )
    return list(result.scalars().all())


async def get_submission_by_id(
    db: AsyncSession, submission_id: int
) -> TaskSubmission | None:
    """Get a single submission by ID with eager-loaded participant profile."""
    result = await db.execute(
        select(TaskSubmission)
        .where(TaskSubmission.id == submission_id)
        .options(selectinload(TaskSubmission.participant_profile))
    )
    return result.scalar_one_or_none()


async def review_submission(
    db: AsyncSession,
    submission_id: int,
    status: str,
    review_comment: str | None,
) -> TaskSubmission | None:
    from app.services.notifications.service import create_notification
    from app.services.participations.service import get_participation, update_participation_status

    sub = await get_submission_by_id(db, submission_id)
    if sub is None:
        logger.warning("Review failed: submission_id=%d not found", submission_id)
        return None

    sub.status = status
    sub.review_comment = review_comment

    # Update task and participation status based on review
    task = await db.get(ProjectTask, sub.task_id)
    if task is not None:
        if status == "approved":
            task.status = "completed"
            # Update participation status to completed
            part = await get_participation(db, task.id, sub.participant_id)
            if part is not None:
                await update_participation_status(db, part.id, "completed")
            logger.info(
                "Submission approved: id=%d task_id=%d participant_id=%d",
                submission_id, sub.task_id, sub.participant_id,
            )
        elif status == "rejected":
            task.status = "rework"
            logger.info(
                "Submission rejected: id=%d task_id=%d participant_id=%d",
                submission_id, sub.task_id, sub.participant_id,
            )

    await db.flush()

    # Notify participant about review
    if task is not None:
        profile = sub.participant_profile
        if profile is not None:
            title = "Submission Approved" if status == "approved" else "Submission Needs Rework"
            await create_notification(
                db,
                user_id=profile.user_id,
                type="review_created",
                title=title,
                message=f"Your submission for '{task.title}' has been {status}.",
                link=f"/tasks/{task.id}",
            )

            # Send email to participant
            from app.services.auth.models import User
            from app.services.notifications.email_service import send_email

            user_result = await db.execute(
                select(User).where(User.id == profile.user_id)
            )
            user = user_result.scalar_one_or_none()
            if user is not None:
                status_text = "принят" if status == "approved" else "отправлен на доработку"
                await send_email(
                    to=user.email,
                    subject="Результат проверки — Точка входа",
                    text=(
                        f"Ваш отклик по задаче \"{task.title}\" {status_text}."
                    ),
                )

    # Re-query with eager loading
    result = await db.execute(
        select(TaskSubmission)
        .where(TaskSubmission.id == sub.id)
        .options(selectinload(TaskSubmission.participant_profile))
    )
    return result.scalar_one()
