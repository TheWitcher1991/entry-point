from typing import Any

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.services.directories.models import Category, Skill

# ── Categories ──

async def get_categories(
    db: AsyncSession, only_active: bool = True
) -> list[Category]:
    stmt = select(Category).order_by(Category.name)
    if only_active:
        stmt = stmt.where(Category.is_active.is_(True))
    result = await db.execute(stmt)
    return list(result.scalars().all())


async def create_category(db: AsyncSession, name: str, direction: str | None = None) -> Category:
    cat = Category(name=name, direction=direction)
    db.add(cat)
    await db.flush()
    await db.refresh(cat)
    return cat


async def update_category(
    db: AsyncSession, category_id: int, data: dict[str, Any]
) -> Category | None:
    result = await db.execute(select(Category).where(Category.id == category_id))
    cat = result.scalar_one_or_none()
    if cat is None:
        return None
    for key, value in data.items():
        if value is not None and hasattr(cat, key):
            setattr(cat, key, value)
    await db.flush()
    await db.refresh(cat)
    return cat


# ── Skills ──

async def get_skills(
    db: AsyncSession, only_active: bool = True
) -> list[Skill]:
    stmt = select(Skill).order_by(Skill.name)
    if only_active:
        stmt = stmt.where(Skill.is_active.is_(True))
    result = await db.execute(stmt)
    return list(result.scalars().all())


async def create_skill(
    db: AsyncSession, name: str, category_id: int | None = None
) -> Skill:
    skill = Skill(name=name, category_id=category_id)
    db.add(skill)
    await db.flush()
    await db.refresh(skill)
    return skill


async def update_skill(
    db: AsyncSession, skill_id: int, data: dict[str, Any]
) -> Skill | None:
    result = await db.execute(select(Skill).where(Skill.id == skill_id))
    skill = result.scalar_one_or_none()
    if skill is None:
        return None
    for key, value in data.items():
        if value is not None and hasattr(skill, key):
            setattr(skill, key, value)
    await db.flush()
    await db.refresh(skill)
    return skill
