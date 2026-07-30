from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class SubmissionResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    task_id: int
    participant_id: int
    description: str | None = None
    result_links: str | None = None
    status: str = "pending"
    review_comment: str | None = None
    created_at: datetime
    updated_at: datetime
    participant_first_name: str | None = None
    participant_last_name: str | None = None


class SubmissionCreate(BaseModel):
    description: str | None = Field(None, max_length=5000)
    result_links: str | None = Field(None, max_length=2000)


class SubmissionReview(BaseModel):
    status: str = Field(pattern=r"^(approved|rejected)$")
    review_comment: str | None = Field(None, max_length=2000)
