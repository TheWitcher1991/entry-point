from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.services.auth.models import User
from app.services.companies.models import Company
from app.services.participants.models import ParticipantProfile


async def get_user_by_id(db: AsyncSession, user_id: int) -> User | None:
    result = await db.execute(select(User).where(User.id == user_id))
    return result.scalar_one_or_none()


async def get_me_data(
    db: AsyncSession, user: User
) -> tuple[str | None, str | None, str | None]:
    """Get first_name, last_name, company_name for the current user."""
    first_name: str | None = None
    last_name: str | None = None
    company_name: str | None = None

    if user.role.value == "participant":
        profile_result = await db.execute(
            select(ParticipantProfile).where(ParticipantProfile.user_id == user.id)
        )
        profile: ParticipantProfile | None = profile_result.scalar_one_or_none()
        if profile:
            first_name = profile.first_name
            last_name = profile.last_name
    elif user.role.value == "company":
        company_result = await db.execute(
            select(Company).where(Company.owner_id == user.id)
        )
        company: Company | None = company_result.scalar_one_or_none()
        if company:
            company_name = company.name

    return first_name, last_name, company_name
