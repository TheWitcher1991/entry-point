from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.services.auth.models import User
from app.services.participants.schemas import (
    ParticipantProfileResponse,
    ParticipantProfileUpdate,
)
from app.services.participants.service import get_or_create_profile, update_profile

router = APIRouter(prefix="/participants", tags=["participants"])


@router.get("/me", response_model=ParticipantProfileResponse)
async def get_my_profile(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> ParticipantProfileResponse:
    profile = await get_or_create_profile(db, current_user.id)
    return ParticipantProfileResponse.model_validate(profile)


@router.patch("/me", response_model=ParticipantProfileResponse)
async def update_my_profile(
    body: ParticipantProfileUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> ParticipantProfileResponse:
    profile = await update_profile(db, current_user.id, body.model_dump(exclude_none=True))
    return ParticipantProfileResponse.model_validate(profile)
