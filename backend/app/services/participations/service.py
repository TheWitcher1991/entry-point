from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.services.participations.models import Participation


async def create_participation(
    db: AsyncSession, task_id: int, participant_id: int
) -> Participation:
    """Create a new participation with status 'active'."""
    part = Participation(
        task_id=task_id,
        participant_id=participant_id,
        status="active",
    )
    db.add(part)
    await db.flush()
    await db.refresh(part)
    return part


async def get_participation(
    db: AsyncSession, task_id: int, participant_id: int
) -> Participation | None:
    """Get participation by task + participant."""
    result = await db.execute(
        select(Participation).where(
            Participation.task_id == task_id,
            Participation.participant_id == participant_id,
        )
    )
    return result.scalar_one_or_none()


async def get_active_participations_for_task(
    db: AsyncSession, task_id: int
) -> list[Participation]:
    """List all active participations for a task."""
    result = await db.execute(
        select(Participation)
        .where(
            Participation.task_id == task_id,
            Participation.status == "active",
        )
        .order_by(Participation.created_at.desc())
    )
    return list(result.scalars().all())


async def get_participant_active_tasks(
    db: AsyncSession, participant_id: int
) -> list[Participation]:
    """Get all active participations with eager-loaded task for a participant."""
    result = await db.execute(
        select(Participation)
        .where(
            Participation.participant_id == participant_id,
            Participation.status == "active",
        )
        .options(selectinload(Participation.task))
        .order_by(Participation.created_at.desc())
    )
    return list(result.scalars().all())


async def update_participation_status(
    db: AsyncSession, participation_id: int, status: str
) -> Participation | None:
    """Update participation status."""
    part = await db.get(Participation, participation_id)
    if part is None:
        return None
    part.status = status
    await db.flush()
    await db.refresh(part)
    return part


async def is_participant_assigned(
    db: AsyncSession, task_id: int, participant_id: int
) -> bool:
    """Check if a participant has an active participation for this task."""
    result = await db.execute(
        select(Participation).where(
            Participation.task_id == task_id,
            Participation.participant_id == participant_id,
            Participation.status == "active",
        )
    )
    return result.scalar_one_or_none() is not None
