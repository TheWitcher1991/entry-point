from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.services.auth.models import User
from app.services.participants.schemas import (
    CompletedTaskResponse,
    ParticipantProfileResponse,
    ParticipantProfileUpdate,
)
from app.services.participants.service import (
    get_completed_tasks,
    get_or_create_profile,
    update_profile,
)

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
