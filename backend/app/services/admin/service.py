from typing import Any

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.services.auth.models import User, UserRole, UserStatus
from app.services.companies.models import Company
from app.services.tasks.models import ProjectTask


async def list_users(db: AsyncSession) -> list[User]:
    result = await db.execute(select(User).order_by(User.id))
    return list(result.scalars().all())


async def update_user_status(
    db: AsyncSession, user_id: int, status: UserStatus
) -> User | None:
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if user is None:
        return None
    user.status = status
    await db.flush()
    await db.refresh(user)
    return user


async def get_all_tasks(
    db: AsyncSession,
    status: str | None = None,
    skip: int = 0,
    limit: int = 50,
) -> list[ProjectTask]:
    """Get all tasks for admin moderation, with company name eager-loaded."""
    query = (
        select(ProjectTask)
        .options(selectinload(ProjectTask.company))
        .order_by(ProjectTask.created_at.desc())
    )
    if status:
        query = query.where(ProjectTask.status == status)
    query = query.offset(skip).limit(limit)
    result = await db.execute(query)
    return list(result.scalars().all())


async def get_all_companies(db: AsyncSession) -> list[Company]:
    """Get all companies with owner info."""
    result = await db.execute(
        select(Company)
        .options(selectinload(Company.owner))
        .order_by(Company.created_at.desc())
    )
    return list(result.scalars().all())


async def update_company_verification(
    db: AsyncSession, company_id: int, status: str
) -> Company | None:
    result = await db.execute(
        select(Company)
        .where(Company.id == company_id)
        .options(selectinload(Company.owner))
    )
    company = result.scalar_one_or_none()
    if company is None:
        return None
    company.verification_status = status
    await db.flush()
    await db.refresh(company)
    return company


async def get_admin_stats(db: AsyncSession) -> dict[str, Any]:
    """Get detailed platform statistics for admin dashboard."""
    total_users = (
        await db.execute(select(func.count(User.id)))
    ).scalar() or 0

    total_companies = (
        await db.execute(select(func.count(Company.id)))
    ).scalar() or 0

    total_tasks = (
        await db.execute(select(func.count(ProjectTask.id)))
    ).scalar() or 0

    tasks_by_status = {}
    for status in ("draft", "moderation", "published", "open",
                    "in_progress", "review", "completed", "blocked"):
        count = (
            await db.execute(
                select(func.count(ProjectTask.id)).where(ProjectTask.status == status)
            )
        ).scalar() or 0
        tasks_by_status[f"tasks_{status}"] = count

    participants = (
        await db.execute(
            select(func.count(User.id)).where(User.role == UserRole.PARTICIPANT)
        )
    ).scalar() or 0

    admins = (
        await db.execute(
            select(func.count(User.id)).where(User.role == UserRole.ADMIN)
        )
    ).scalar() or 0

    company_users = (
        await db.execute(
            select(func.count(User.id)).where(User.role == UserRole.COMPANY)
        )
    ).scalar() or 0

    verified_companies = (
        await db.execute(
            select(func.count(Company.id)).where(Company.verification_status == "verified")
        )
    ).scalar() or 0

    return {
        "total_users": total_users,
        "participants": participants,
        "companies": total_companies,
        "verified_companies": verified_companies,
        "company_users": company_users,
        "admins": admins,
        "total_tasks": total_tasks,
        **tasks_by_status,
    }
