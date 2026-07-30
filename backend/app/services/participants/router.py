from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.services.auth.models import User
from app.services.participants.models import ParticipantProfile
from app.services.participants.schemas import (
    CompletedTaskResponse,
    ParticipantProfileResponse,
    ParticipantProfileUpdate,
)
from app.services.participants.service import (
    get_completed_tasks,
    get_or_create_profile,
    get_profile_by_id,
    update_profile,
)
from app.services.reviews.schemas import ReviewResponse

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


@router.get("/me/completed", response_model=list[CompletedTaskResponse])
async def get_my_completed_tasks(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> list[CompletedTaskResponse]:
    from app.services.participants.service import get_or_create_profile as gcp

    profile = await gcp(db, current_user.id)
    submissions = await get_completed_tasks(db, profile.id)

    result = []
    for sub in submissions:
        task = sub.task
        company = task.company if task else None
        result.append(
            CompletedTaskResponse(
                submission_id=sub.id,
                task_id=sub.task_id,
                task_title=task.title if task else "—",
                task_summary=task.summary if task else None,
                task_difficulty=task.difficulty if task else None,
                company_name=company.name if company else None,
                description=sub.description,
                result_links=sub.result_links,
                review_comment=sub.review_comment,
                completed_at=sub.updated_at,
            )
        )
    return result


@router.get("/me/reviews", response_model=list[ReviewResponse])
async def get_my_reviews(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> list[ReviewResponse]:
    from app.services.reviews.service import get_participant_reviews

    reviews = await get_participant_reviews(db, current_user.id)
    result = []
    for r in reviews:
        company_name = r.company.name if r.company else None
        task_title = r.task.title if r.task else None
        result.append(
            ReviewResponse(
                id=r.id,
                submission_id=r.submission_id,
                company_id=r.company_id,
                participant_id=r.participant_id,
                task_id=r.task_id,
                rating=r.rating,
                text=r.text,
                skills_confirmed=r.skills_confirmed,
                created_at=r.created_at,
                updated_at=r.updated_at,
                company_name=company_name,
                task_title=task_title,
            )
        )
    return result


@router.get("", response_model=list[ParticipantProfileResponse])
async def list_participants(
    search: str | None = Query(None, min_length=2),
    specialty: str | None = Query(None),
    city: str | None = Query(None),
    offset: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
) -> list[ParticipantProfileResponse]:
    """List all participants with optional search and filters."""
    query = select(ParticipantProfile).order_by(ParticipantProfile.created_at.desc())

    if search:
        query = query.where(
            ParticipantProfile.first_name.ilike(f"%{search}%")
            | ParticipantProfile.last_name.ilike(f"%{search}%")
            | ParticipantProfile.specialty.ilike(f"%{search}%")
        )
    if specialty:
        query = query.where(ParticipantProfile.specialty.ilike(f"%{specialty}%"))
    if city:
        query = query.where(ParticipantProfile.city.ilike(f"%{city}%"))

    query = query.offset(offset).limit(limit)
    result = await db.execute(query)
    profiles = result.scalars().all()
    return [ParticipantProfileResponse.model_validate(p) for p in profiles]


@router.get("/{participant_id}", response_model=ParticipantProfileResponse)
async def get_participant_profile(
    participant_id: int,
    db: AsyncSession = Depends(get_db),
) -> ParticipantProfileResponse:
    profile = await get_profile_by_id(db, participant_id)
    if profile is None:
        raise HTTPException(status_code=404, detail="Participant not found")
    return ParticipantProfileResponse.model_validate(profile)


@router.get("/{participant_id}/reviews", response_model=list[ReviewResponse])
async def get_participant_reviews_endpoint(
    participant_id: int,
    db: AsyncSession = Depends(get_db),
) -> list[ReviewResponse]:
    profile = await get_profile_by_id(db, participant_id)
    if profile is None:
        raise HTTPException(status_code=404, detail="Participant not found")

    from app.services.reviews.service import get_participant_reviews

    reviews = await get_participant_reviews(db, participant_id)
    result = []
    for r in reviews:
        company_name = r.company.name if r.company else None
        task_title = r.task.title if r.task else None
        result.append(
            ReviewResponse(
                id=r.id,
                submission_id=r.submission_id,
                company_id=r.company_id,
                participant_id=r.participant_id,
                task_id=r.task_id,
                rating=r.rating,
                text=r.text,
                skills_confirmed=r.skills_confirmed,
                created_at=r.created_at,
                updated_at=r.updated_at,
                company_name=company_name,
                task_title=task_title,
            )
        )
    return result
