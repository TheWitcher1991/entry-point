from fastapi import APIRouter, Depends

from app.core.dependencies import get_current_user
from app.services.auth.models import User
from app.services.users.schemas import MeResponse

router = APIRouter(prefix="/users", tags=["users"])


@router.get("/me", response_model=MeResponse)
async def get_me(current_user: User = Depends(get_current_user)) -> MeResponse:
    return MeResponse(
        id=current_user.id,
        email=current_user.email,
        role=current_user.role.value,
        status=current_user.status.value,
    )
