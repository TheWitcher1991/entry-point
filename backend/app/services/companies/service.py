from typing import Any

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.services.companies.models import Company


async def get_company(db: AsyncSession, owner_id: int) -> Company | None:
    result = await db.execute(
        select(Company).where(Company.owner_id == owner_id)
    )
    return result.scalar_one_or_none()


async def get_company_by_id(db: AsyncSession, company_id: int) -> Company | None:
    result = await db.execute(select(Company).where(Company.id == company_id))
    return result.scalar_one_or_none()


async def get_or_create_company(db: AsyncSession, owner_id: int) -> Company:
    comp = await get_company(db, owner_id)
    if comp is None:
        comp = Company(owner_id=owner_id)
        db.add(comp)
        await db.flush()
        await db.refresh(comp)
    return comp


async def list_companies(
    db: AsyncSession,
    search: str | None = None,
    offset: int = 0,
    limit: int = 20,
) -> list[Company]:
    query = select(Company).order_by(Company.created_at.desc())

    if search:
        query = query.where(
            Company.name.ilike(f"%{search}%")
            | Company.city.ilike(f"%{search}%")
            | Company.stack.ilike(f"%{search}%")
            | Company.description.ilike(f"%{search}%")
        )

    query = query.offset(offset).limit(limit)
    result = await db.execute(query)
    return list(result.scalars().all())


async def update_company(
    db: AsyncSession, owner_id: int, data: dict[str, Any]
) -> Company:
    comp = await get_or_create_company(db, owner_id)
    for key, value in data.items():
        if value is not None and hasattr(comp, key):
            setattr(comp, key, value)
    await db.flush()
    await db.refresh(comp)
    return comp
