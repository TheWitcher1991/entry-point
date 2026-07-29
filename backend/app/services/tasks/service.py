from typing import Any

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.services.tasks.models import ProjectTask, TaskSkill


async def create_task(
    db: AsyncSession, company_id: int, data: dict[str, Any]
) -> ProjectTask:
    skills_data = data.pop("skills", [])

    task = ProjectTask(company_id=company_id, **data)
    db.add(task)
    await db.flush()
    await db.refresh(task)

    for skill_data in skills_data:
        ts = TaskSkill(task_id=task.id, **skill_data)
        db.add(ts)

    await db.flush()
    await db.refresh(task)
    return task


async def get_task_by_id(
    db: AsyncSession, task_id: int
) -> ProjectTask | None:
    result = await db.execute(
        select(ProjectTask)
        .where(ProjectTask.id == task_id)
        .options(selectinload(ProjectTask.skills))
    )
    return result.scalar_one_or_none()


async def get_company_tasks(
    db: AsyncSession, company_id: int
) -> list[ProjectTask]:
    result = await db.execute(
        select(ProjectTask)
        .where(ProjectTask.company_id == company_id)
        .options(selectinload(ProjectTask.skills))
        .order_by(ProjectTask.created_at.desc())
    )
    return list(result.scalars().all())


async def update_task(
    db: AsyncSession, task_id: int, company_id: int, data: dict[str, Any]
) -> ProjectTask | None:
    task = await get_task_by_id(db, task_id)
    if task is None or task.company_id != company_id:
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
    await db.refresh(task)
    return task


async def update_task_status(
    db: AsyncSession, task_id: int, status: str
) -> ProjectTask | None:
    task = await get_task_by_id(db, task_id)
    if task is None:
        return None
    task.status = status
    await db.flush()
    await db.refresh(task)
    return task


async def list_tasks(
    db: AsyncSession,
    status: str | None = None,
    category_id: int | None = None,
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
        .options(selectinload(ProjectTask.skills))
    )

    if status:
        query = query.where(ProjectTask.status == status)
    if category_id:
        query = query.where(ProjectTask.category_id == category_id)
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
