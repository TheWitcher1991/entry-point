from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.services.auth.models import User
from app.services.messages.models import TaskMessage


async def get_task_messages(
    db: AsyncSession,
    task_id: int,
    participant_profile_id: int | None = None,
    limit: int = 100,
) -> list[TaskMessage]:
    """Get messages for a task, optionally filtered by participant."""
    query = (
        select(TaskMessage)
        .options(
            selectinload(TaskMessage.sender).selectinload(User.participant_profile),
            selectinload(TaskMessage.sender).selectinload(User.company),
        )
        .where(TaskMessage.task_id == task_id)
        .order_by(TaskMessage.created_at.asc())
    )
    if participant_profile_id is not None:
        query = query.where(
            TaskMessage.participant_profile_id == participant_profile_id
        )
    result = await db.execute(query.limit(limit))
    return list(result.scalars().all())


async def create_message(
    db: AsyncSession,
    task_id: int,
    sender_id: int,
    text: str,
    participant_profile_id: int | None = None,
) -> TaskMessage:
    """Create a new message."""
    message = TaskMessage(
        task_id=task_id,
        sender_id=sender_id,
        text=text,
        participant_profile_id=participant_profile_id,
    )
    db.add(message)
    await db.flush()

    # Reload with sender + profile relationships eagerly loaded
    result = await db.execute(
        select(TaskMessage)
        .options(
            selectinload(TaskMessage.sender).selectinload(User.participant_profile),
            selectinload(TaskMessage.sender).selectinload(User.company),
        )
        .where(TaskMessage.id == message.id)
    )
    return result.scalar_one()
