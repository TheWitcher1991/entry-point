from datetime import datetime

from pydantic import BaseModel, ConfigDict


class ParticipantProfileResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    first_name: str | None = None
    last_name: str | None = None
    avatar_url: str | None = None
    city: str | None = None
    bio: str | None = None
    education: str | None = None
    specialty: str | None = None
    graduation_year: int | None = None
    desired_role: str | None = None
    github_url: str | None = None
    telegram: str | None = None
    portfolio_url: str | None = None
    resume_url: str | None = None
    availability_status: str | None = None
    created_at: datetime
    updated_at: datetime


class ParticipantProfileUpdate(BaseModel):
    first_name: str | None = None
    last_name: str | None = None
    avatar_url: str | None = None
    city: str | None = None
    bio: str | None = None
    education: str | None = None
    specialty: str | None = None
    graduation_year: int | None = None
    desired_role: str | None = None
    github_url: str | None = None
    telegram: str | None = None
    portfolio_url: str | None = None
    resume_url: str | None = None
    availability_status: str | None = None
