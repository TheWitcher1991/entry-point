from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.services.auth.models import User
from app.services.companies.models import Company
from app.services.experiences.service import create_experience_from_review
from app.services.reviews.schemas import ReviewCreate, ReviewResponse
from app.services.reviews.service import (
    create_review,
    get_company_reviews,
    get_participant_reviews,
    get_review_by_submission,
)
from app.services.tasks.models import ProjectTask
from app.services.tasks.service import get_submission_by_id

router = APIRouter(tags=["reviews"])


@router.post(
    "/tasks/{task_id}/submissions/{submission_id}/review",
    response_model=ReviewResponse,
    status_code=201,
)
async def create_submission_review(
    task_id: int,
    submission_id: int,
    body: ReviewCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> ReviewResponse:
    # Verify user is a company
    result = await db.execute(
        select(Company).where(Company.owner_id == current_user.id)
    )
    company = result.scalar_one_or_none()
    if company is None:
        raise HTTPException(
            status_code=403, detail="Only companies can leave reviews"
        )

    # Verify submission exists and belongs to this task
    submission = await get_submission_by_id(db, submission_id)
    if submission is None:
        raise HTTPException(status_code=404, detail="Submission not found")
    if submission.task_id != task_id:
        raise HTTPException(
            status_code=400,
            detail="Submission does not belong to this task",
        )

    # Verify company owns the task
    if submission.task_id:
        task_result = await db.execute(
            select(ProjectTask).where(ProjectTask.id == submission.task_id)
        )
        task = task_result.scalar_one_or_none()
        if task is None or task.company_id != company.id:
            raise HTTPException(
                status_code=403,
                detail="You can only review submissions for your own tasks",
            )

    # Verify submission is approved
    if submission.status != "approved":
        raise HTTPException(
            status_code=400,
            detail="Can only review approved submissions",
        )

    # Check no existing review
    existing = await get_review_by_submission(db, submission_id)
    if existing is not None:
        raise HTTPException(
            status_code=409,
            detail="Review already exists for this submission",
        )

    review = await create_review(
        db=db,
        submission_id=submission_id,
        company_id=company.id,
        participant_id=submission.participant_id,
        task_id=task_id,
        rating=body.rating,
        text=body.text,
        skills_confirmed=body.skills_confirmed,
    )

    # Create verified experience entry
    await create_experience_from_review(
        db=db,
        participant_id=submission.participant_id,
        task_id=task_id,
        company_id=company.id,
        review_id=review.id,
        task_title=task.title if task else "Unknown Task",
        company_name=company.name or "Unknown Company",
        rating=body.rating,
        review_text=body.text,
        skills_confirmed=body.skills_confirmed,
    )

    return ReviewResponse(
        id=review.id,
        submission_id=review.submission_id,
        company_id=review.company_id,
        participant_id=review.participant_id,
        task_id=review.task_id,
        rating=review.rating,
        text=review.text,
        skills_confirmed=review.skills_confirmed,
        created_at=review.created_at,
        updated_at=review.updated_at,
        company_name=company.name,
    )


@router.get(
    "/companies/{company_id}/reviews",
    response_model=list[ReviewResponse],
)
async def list_company_reviews(
    company_id: int,
    db: AsyncSession = Depends(get_db),
) -> list[ReviewResponse]:
    reviews = await get_company_reviews(db, company_id)
    result = []
    for r in reviews:
        p_first = r.participant_profile.first_name if r.participant_profile else None
        p_last = r.participant_profile.last_name if r.participant_profile else None
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
                company_name=None,
                participant_first_name=p_first,
                participant_last_name=p_last,
                task_title=task_title,
            )
        )
    return result


@router.get(
    "/participants/me/reviews",
    response_model=list[ReviewResponse],
)
async def get_my_reviews(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> list[ReviewResponse]:
    from app.services.participants.service import get_or_create_profile as gcp

    profile = await gcp(db, current_user.id)
    reviews = await get_participant_reviews(db, profile.id)
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
