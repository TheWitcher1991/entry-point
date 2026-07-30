from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.services.auth.models import User
from app.services.companies.schemas import CompanyListItem, CompanyResponse, CompanyUpdate
from app.services.companies.service import (
    get_company_by_id,
    get_or_create_company,
    list_companies,
    update_company,
)

router = APIRouter(prefix="/companies", tags=["companies"])


@router.get("/me", response_model=CompanyResponse)
async def get_my_company(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> CompanyResponse:
    comp = await get_or_create_company(db, current_user.id)
    return CompanyResponse.model_validate(comp)


@router.patch("/me", response_model=CompanyResponse)
async def update_my_company(
    body: CompanyUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> CompanyResponse:
    comp = await update_company(db, current_user.id, body.model_dump(exclude_none=True))
    return CompanyResponse.model_validate(comp)


@router.get("", response_model=list[CompanyListItem])
async def list_all_companies(
    search: str | None = None,
    offset: int = 0,
    limit: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
) -> list[CompanyListItem]:
    companies = await list_companies(db, search=search, offset=offset, limit=limit)
    return [CompanyListItem.model_validate(c) for c in companies]


@router.get("/{company_id}", response_model=CompanyResponse)
async def get_company_public(
    company_id: int,
    db: AsyncSession = Depends(get_db),
) -> CompanyResponse:
    comp = await get_company_by_id(db, company_id)
    if comp is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Company not found",
        )
    return CompanyResponse.model_validate(comp)
