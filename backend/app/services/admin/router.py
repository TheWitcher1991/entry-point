from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.services.admin.schemas import AdminUserResponse, UpdateUserStatusRequest
from app.services.admin.service import list_users, update_user_status
from app.services.auth.models import User, UserRole

router = APIRouter(prefix="/admin", tags=["admin"])


def require_admin(current_user: User) -> None:
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required",
        )


@router.get("/users", response_model=list[AdminUserResponse])
async def get_users(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> list[AdminUserResponse]:
    require_admin(current_user)
    users = await list_users(db)
    return [AdminUserResponse.model_validate(u) for u in users]


@router.patch("/users/{user_id}/status", response_model=AdminUserResponse)
async def change_user_status(
    user_id: int,
    body: UpdateUserStatusRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> AdminUserResponse:
    require_admin(current_user)

    if user_id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot change your own status",
        )

    user = await update_user_status(db, user_id, body.status)
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )
    return AdminUserResponse.model_validate(user)
