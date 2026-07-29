from datetime import datetime

from pydantic import BaseModel

from app.services.auth.models import UserRole, UserStatus


class AdminUserResponse(BaseModel):
    id: int
    email: str
    role: UserRole
    status: UserStatus
    email_verified_at: datetime | None = None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class UpdateUserStatusRequest(BaseModel):
    status: UserStatus
