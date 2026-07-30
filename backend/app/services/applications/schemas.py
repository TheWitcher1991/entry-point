from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class ApplicationCreate(BaseModel):
    task_id: int
    cover_letter: str | None = Field(None, max_length=2000)


class ApplicationResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    task_id: int
    participant_id: int
    cover_letter: str | None = None
    status: str
    created_at: datetime
    updated_at: datetime
    task_title: str | None = None
    participant_first_name: str | None = None
    participant_last_name: str | None = None


class ApplicationStatusUpdate(BaseModel):
    status: str = Field(
        pattern=r"^(pending|review|approved|rejected|withdrawn)$"
    )
