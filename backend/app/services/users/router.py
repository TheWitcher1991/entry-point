from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.services.auth.models import User
from app.services.users.schemas import MeResponse
from app.services.users.service import get_me_data

router = APIRouter(prefix="/users", tags=["users"])


@router.get("/me", response_model=MeResponse)
async def get_me(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> MeResponse:
    first_name, last_name, company_name = await get_me_data(db, current_user)
    return MeResponse(
        id=current_user.id,
        email=current_user.email,
        role=current_user.role.value,
        status=current_user.status.value,
        first_name=first_name,
        last_name=last_name,
        company_name=company_name,
    )
