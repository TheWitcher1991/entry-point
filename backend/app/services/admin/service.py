from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.services.auth.models import User, UserStatus
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
