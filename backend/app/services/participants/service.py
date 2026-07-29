from typing import Any

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.services.participants.models import ParticipantProfile


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
