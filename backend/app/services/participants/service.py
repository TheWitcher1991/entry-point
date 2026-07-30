from typing import Any

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.services.participants.models import ParticipantProfile
from app.services.tasks.models import ProjectTask, TaskSubmission


async def get_profile(
    db: AsyncSession, user_id: int
) -> ParticipantProfile | None:
    result = await db.execute(
        select(ParticipantProfile).where(ParticipantProfile.user_id == user_id)
    )
    return result.scalar_one_or_none()


async def get_or_create_profile(
    db: AsyncSession, user_id: int
) -> ParticipantProfile:
    profile = await get_profile(db, user_id)
    if profile is None:
        profile = ParticipantProfile(user_id=user_id)
        db.add(profile)
        await db.flush()
        await db.refresh(profile)
    return profile


async def update_profile(
    db: AsyncSession, user_id: int, data: dict[str, Any]
) -> ParticipantProfile:
    profile = await get_or_create_profile(db, user_id)
    for key, value in data.items():
        if value is not None and hasattr(profile, key):
            setattr(profile, key, value)
    await db.flush()
    await db.refresh(profile)
    return profile


async def get_profile_by_id(
    db: AsyncSession, profile_id: int
) -> ParticipantProfile | None:
    """Get participant profile by primary key id."""
    result = await db.execute(
        select(ParticipantProfile).where(ParticipantProfile.id == profile_id)
    )
    return result.scalar_one_or_none()


async def get_completed_tasks(
    db: AsyncSession, participant_profile_id: int
) -> list[TaskSubmission]:
    """Get all approved submissions for the participant with task + company info."""
    result = await db.execute(
        select(TaskSubmission)
        .where(
            TaskSubmission.participant_id == participant_profile_id,
            TaskSubmission.status == "approved",
        )
        .options(
            selectinload(TaskSubmission.task).selectinload(ProjectTask.company),
        )
        .order_by(TaskSubmission.created_at.desc())
    )
    return list(result.scalars().all())
