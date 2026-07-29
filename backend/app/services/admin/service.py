from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.services.auth.models import User, UserStatus


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
