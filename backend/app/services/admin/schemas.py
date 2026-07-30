from datetime import datetime

from pydantic import BaseModel, Field

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


class AdminTaskResponse(BaseModel):
    id: int
    company_id: int
    title: str
    summary: str | None = None
    difficulty: str | None = None
    status: str
    company_name: str | None = None
    created_at: datetime

    model_config = {"from_attributes": True}


class AdminCompanyResponse(BaseModel):
    id: int
    owner_id: int
    name: str | None = None
    description: str | None = None
    website: str | None = None
    city: str | None = None
    industry: str | None = None
    company_size: str | None = None
    verification_status: str
    created_at: datetime
    updated_at: datetime
    owner_email: str | None = None

    model_config = {"from_attributes": True}


class UpdateCompanyVerificationRequest(BaseModel):
    verification_status: str = Field(..., pattern=r"^(unverified|verified|rejected)$")
