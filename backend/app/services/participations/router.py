from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.services.auth.models import User, UserRole
from app.services.participants.models import ParticipantProfile
from app.services.participations.schemas import ParticipationResponse
from app.services.participations.service import get_participant_active_tasks

router = APIRouter(prefix="/participations", tags=["participations"])


async def _get_participant_profile(
    db: AsyncSession, user_id: int
) -> ParticipantProfile | None:
    result = await db.execute(
        select(ParticipantProfile).where(ParticipantProfile.user_id == user_id)
    )
    return result.scalar_one_or_none()


@router.get("/my", response_model=list[ParticipationResponse])
async def get_my_participations(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> list[ParticipationResponse]:
    if current_user.role != UserRole.PARTICIPANT:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Participant access required",
        )

    profile = await _get_participant_profile(db, current_user.id)
    if profile is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Complete your participant profile first",
        )

    participations = await get_participant_active_tasks(db, profile.id)
    return [ParticipationResponse.model_validate(p) for p in participations]
