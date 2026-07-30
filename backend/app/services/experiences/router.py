from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.services.auth.models import User
from app.services.experiences.schemas import (
    VerifiedExperienceListResponse,
    VerifiedExperienceResponse,
    VerifiedSkillResponse,
)
from app.services.experiences.service import (
    get_experience_by_id,
    get_participant_experiences,
)
from app.services.participants.service import get_or_create_profile

router = APIRouter(tags=["experiences"])


@router.get(
    "/participants/me/experiences",
    response_model=list[VerifiedExperienceListResponse],
)
async def get_my_experiences(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> list[VerifiedExperienceListResponse]:
    """Get all verified experiences for the current participant."""
    profile = await get_or_create_profile(db, current_user.id)
    experiences = await get_participant_experiences(db, profile.id)

    result = []
    for exp in experiences:
        skills_list = [
            VerifiedSkillResponse(
                id=s.id, experience_id=s.experience_id, skill_name=s.skill_name
            )
            for s in exp.skills
        ]
        result.append(
            VerifiedExperienceListResponse(
                id=exp.id,
                participant_id=exp.participant_id,
                task_id=exp.task_id,
                company_id=exp.company_id,
                task_title=exp.task_title,
                company_name=exp.company_name,
                rating=exp.rating,
                review_text=exp.review_text,
                created_at=exp.created_at,
                skills=skills_list,
            )
        )
    return result


@router.get(
    "/participants/{participant_id}/experiences",
    response_model=list[VerifiedExperienceListResponse],
)
async def get_public_experiences(
    participant_id: int,
    db: AsyncSession = Depends(get_db),
) -> list[VerifiedExperienceListResponse]:
    """Get public verified experiences for a participant profile."""
    from app.services.participants.models import ParticipantProfile

    # Check participant exists
    result = await db.execute(
        select(ParticipantProfile).where(ParticipantProfile.id == participant_id)
    )
    profile = result.scalar_one_or_none()
    if profile is None:
        raise HTTPException(status_code=404, detail="Participant not found")

    experiences = await get_participant_experiences(db, participant_id)
    return [
        VerifiedExperienceListResponse(
            id=exp.id,
            participant_id=exp.participant_id,
            task_id=exp.task_id,
            company_id=exp.company_id,
            task_title=exp.task_title,
            company_name=exp.company_name,
            rating=exp.rating,
            review_text=exp.review_text,
            created_at=exp.created_at,
            skills=[
                VerifiedSkillResponse(
                    id=s.id, experience_id=s.experience_id, skill_name=s.skill_name
                )
                for s in exp.skills
            ],
        )
        for exp in experiences
    ]


@router.get(
    "/experiences/{experience_id}",
    response_model=VerifiedExperienceResponse,
)
async def get_experience(
    experience_id: int,
    db: AsyncSession = Depends(get_db),
) -> VerifiedExperienceResponse:
    """Get a single verified experience by ID."""
    exp = await get_experience_by_id(db, experience_id)
    if exp is None:
        raise HTTPException(status_code=404, detail="Experience not found")

    return VerifiedExperienceResponse(
        id=exp.id,
        participant_id=exp.participant_id,
        task_id=exp.task_id,
        company_id=exp.company_id,
        review_id=exp.review_id,
        task_title=exp.task_title,
        company_name=exp.company_name,
        rating=exp.rating,
        review_text=exp.review_text,
        created_at=exp.created_at,
        skills=[
            VerifiedSkillResponse(
                id=s.id, experience_id=s.experience_id, skill_name=s.skill_name
            )
            for s in exp.skills
        ],
    )
