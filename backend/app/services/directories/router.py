from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.services.auth.models import User, UserRole
from app.services.directories.schemas import (
    CategoryCreate,
    CategoryResponse,
    CategoryUpdate,
    SkillCreate,
    SkillResponse,
    SkillUpdate,
)
from app.services.directories.service import (
    create_category,
    create_skill,
    get_categories,
    get_skills,
    update_category,
    update_skill,
)

router = APIRouter(prefix="/directories", tags=["directories"])


def require_admin(current_user: User) -> None:
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required",
        )


# ── Categories ──


@router.get("/categories", response_model=list[CategoryResponse])
async def list_categories(
    db: AsyncSession = Depends(get_db),
) -> list[CategoryResponse]:
    cats = await get_categories(db)
    return [CategoryResponse.model_validate(c) for c in cats]


@router.post(
    "/categories",
    response_model=CategoryResponse,
    status_code=status.HTTP_201_CREATED,
)
async def create_category_endpoint(
    body: CategoryCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> CategoryResponse:
    require_admin(current_user)
    cat = await create_category(db, body.name, body.direction)
    return CategoryResponse.model_validate(cat)


@router.patch("/categories/{category_id}", response_model=CategoryResponse)
async def update_category_endpoint(
    category_id: int,
    body: CategoryUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> CategoryResponse:
    require_admin(current_user)
    cat = await update_category(db, category_id, body.model_dump(exclude_none=True))
    if cat is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Category not found",
        )
    return CategoryResponse.model_validate(cat)


# ── Skills ──


@router.get("/skills", response_model=list[SkillResponse])
async def list_skills(
    db: AsyncSession = Depends(get_db),
) -> list[SkillResponse]:
    skills = await get_skills(db)
    return [SkillResponse.model_validate(s) for s in skills]


@router.post(
    "/skills",
    response_model=SkillResponse,
    status_code=status.HTTP_201_CREATED,
)
async def create_skill_endpoint(
    body: SkillCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> SkillResponse:
    require_admin(current_user)
    skill = await create_skill(db, body.name, body.category_id)
    return SkillResponse.model_validate(skill)


@router.patch("/skills/{skill_id}", response_model=SkillResponse)
async def update_skill_endpoint(
    skill_id: int,
    body: SkillUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> SkillResponse:
    require_admin(current_user)
    skill = await update_skill(db, skill_id, body.model_dump(exclude_none=True))
    if skill is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Skill not found",
        )
    return SkillResponse.model_validate(skill)
