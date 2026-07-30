from datetime import datetime

from pydantic import BaseModel, Field


class ReviewCreate(BaseModel):
    rating: int = Field(..., ge=1, le=5)
    text: str | None = Field(None, max_length=3000)
    skills_confirmed: str | None = Field(None, max_length=1000)


class ReviewResponse(BaseModel):
    id: int
    submission_id: int
    company_id: int
    participant_id: int
    task_id: int
    rating: int
    text: str | None = None
    skills_confirmed: str | None = None
    created_at: datetime
    updated_at: datetime

    # relations
    company_name: str | None = None
    participant_first_name: str | None = None
    participant_last_name: str | None = None
    task_title: str | None = None

    model_config = {"from_attributes": True}
