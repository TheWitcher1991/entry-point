from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.services.notifications.models import Notification


async def create_notification(
    db: AsyncSession,
    user_id: int,
    type: str,
    title: str,
    message: str,
    link: str | None = None,
) -> Notification:
    """Create a new notification for a user."""
    notif = Notification(
        user_id=user_id,
        type=type,
        title=title,
        message=message,
        link=link,
    )
    db.add(notif)
    await db.flush()
    await db.refresh(notif)
    return notif


async def get_user_notifications(
    db: AsyncSession,
    user_id: int,
    unread_only: bool = False,
    limit: int = 50,
) -> list[Notification]:
    """Get notifications for a user, newest first."""
    query = (
        select(Notification)
        .where(Notification.user_id == user_id)
        .order_by(Notification.created_at.desc())
        .limit(limit)
    )
    if unread_only:
        query = query.where(Notification.is_read == False)  # noqa: E712

    result = await db.execute(query)
    return list(result.scalars().all())


async def mark_as_read(db: AsyncSession, notification_id: int) -> Notification | None:
    """Mark a single notification as read."""
    notif = await db.get(Notification, notification_id)
    if notif is None:
        return None
    notif.is_read = True
    await db.flush()
    await db.refresh(notif)
    return notif


async def mark_all_as_read(db: AsyncSession, user_id: int) -> int:
    """Mark all notifications for a user as read. Returns count of updated rows."""
    result = await db.execute(
        select(Notification).where(
            Notification.user_id == user_id,
            Notification.is_read == False,  # noqa: E712
        )
    )
    notifs = result.scalars().all()
    for n in notifs:
        n.is_read = True
    await db.flush()
    return len(notifs)


async def get_unread_count(db: AsyncSession, user_id: int) -> int:
    """Get the number of unread notifications for a user."""
    result = await db.execute(
        select(func.count(Notification.id)).where(
            Notification.user_id == user_id,
            Notification.is_read == False,  # noqa: E712
        )
    )
    return result.scalar() or 0
