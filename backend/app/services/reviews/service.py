from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.services.reviews.models import Review


async def create_review(
    db: AsyncSession,
    submission_id: int,
    company_id: int,
    participant_id: int,
    task_id: int,
    rating: int,
    text: str | None,
    skills_confirmed: str | None,
) -> Review:
    review = Review(
        submission_id=submission_id,
        company_id=company_id,
        participant_id=participant_id,
        task_id=task_id,
        rating=rating,
        text=text,
        skills_confirmed=skills_confirmed,
    )
    db.add(review)
    await db.flush()
    await db.refresh(review)
    return review


async def get_review_by_submission(
    db: AsyncSession, submission_id: int
) -> Review | None:
    result = await db.execute(
        select(Review).where(Review.submission_id == submission_id)
    )
    return result.scalar_one_or_none()


async def get_company_reviews(
    db: AsyncSession, company_id: int
) -> list[Review]:
    result = await db.execute(
        select(Review)
        .where(Review.company_id == company_id)
        .options(
            selectinload(Review.participant_profile),
            selectinload(Review.task),
        )
        .order_by(Review.created_at.desc())
    )
    return list(result.scalars().all())


async def get_participant_reviews(
    db: AsyncSession, participant_id: int
) -> list[Review]:
    result = await db.execute(
        select(Review)
        .where(Review.participant_id == participant_id)
        .options(
            selectinload(Review.company),
            selectinload(Review.task),
        )
        .order_by(Review.created_at.desc())
    )
    return list(result.scalars().all())
