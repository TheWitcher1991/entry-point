from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.logging_config import get_logger
from app.services.experiences.models import VerifiedExperience, VerifiedSkill

logger = get_logger("experiences")


async def create_experience_from_review(
    db: AsyncSession,
    *,
    participant_id: int,
    task_id: int,
    company_id: int,
    review_id: int,
    task_title: str,
    company_name: str,
    rating: int,
    review_text: str | None,
    skills_confirmed: str | None,
) -> VerifiedExperience:
    """Create a VerifiedExperience (and VerifiedSkills) from a review."""
    experience = VerifiedExperience(
        participant_id=participant_id,
        task_id=task_id,
        company_id=company_id,
        review_id=review_id,
        task_title=task_title,
        company_name=company_name,
        rating=rating,
        review_text=review_text,
    )
    db.add(experience)
    await db.flush()

    # Parse skills_confirmed as comma-separated names
    if skills_confirmed:
        for skill_name in (s.strip() for s in skills_confirmed.split(",") if s.strip()):
            vs = VerifiedSkill(
                experience_id=experience.id,
                skill_name=skill_name,
            )
            db.add(vs)

    await db.flush()

    logger.info(
        "Experience created: participant_id=%d task_id=%d review_id=%d skills=%s",
        participant_id, task_id, review_id, skills_confirmed,
    )

    # Re-query with eager-loaded skills
    result = await db.execute(
        select(VerifiedExperience)
        .where(VerifiedExperience.id == experience.id)
        .options(selectinload(VerifiedExperience.skills))
    )
    return result.scalar_one()


async def get_participant_experiences(
    db: AsyncSession,
    participant_id: int,
) -> list[VerifiedExperience]:
    """Get all verified experiences for a participant."""
    result = await db.execute(
        select(VerifiedExperience)
        .where(VerifiedExperience.participant_id == participant_id)
        .options(selectinload(VerifiedExperience.skills))
        .order_by(VerifiedExperience.created_at.desc())
    )
    return list(result.scalars().all())


async def get_experience_by_id(
    db: AsyncSession,
    experience_id: int,
) -> VerifiedExperience | None:
    result = await db.execute(
        select(VerifiedExperience)
        .where(VerifiedExperience.id == experience_id)
        .options(selectinload(VerifiedExperience.skills))
    )
    return result.scalar_one_or_none()


async def update_experience_from_review(
    db: AsyncSession,
    *,
    review_id: int,
    rating: int,
    review_text: str | None,
    skills_confirmed: str | None,
) -> VerifiedExperience | None:
    """Sync the verified experience when a review is edited."""
    result = await db.execute(
        select(VerifiedExperience)
        .where(VerifiedExperience.review_id == review_id)
        .options(selectinload(VerifiedExperience.skills))
    )
    experience = result.scalar_one_or_none()
    if experience is None:
        return None

    experience.rating = rating
    experience.review_text = review_text

    for skill in list(experience.skills):
        await db.delete(skill)
    if skills_confirmed:
        for skill_name in (s.strip() for s in skills_confirmed.split(",") if s.strip()):
            db.add(VerifiedSkill(experience_id=experience.id, skill_name=skill_name))

    await db.flush()
    logger.info(
        "Experience updated: experience_id=%d review_id=%d rating=%d",
        experience.id, review_id, rating,
    )
    return experience


async def delete_experience_by_review(
    db: AsyncSession,
    *,
    review_id: int,
) -> None:
    """Remove the verified experience (and its skills) when a review is deleted."""
    result = await db.execute(
        select(VerifiedExperience)
        .where(VerifiedExperience.review_id == review_id)
        .options(selectinload(VerifiedExperience.skills))
    )
    experience = result.scalar_one_or_none()
    if experience is None:
        return

    for skill in list(experience.skills):
        await db.delete(skill)
    await db.delete(experience)
    await db.flush()
    logger.info("Experience deleted: review_id=%d", review_id)
