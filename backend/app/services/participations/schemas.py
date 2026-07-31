from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class ParticipationResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    task_id: int
    participant_id: int
    status: str
    created_at: datetime


class ParticipantsResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    participant_id: int
    status: str
    created_at: datetime
    participant_first_name: str | None = None
    participant_last_name: str | None = None
    participant_avatar_url: str | None = None


class ParticipantStatusUpdate(BaseModel):
    status: str = Field(pattern=r"^(active|completed)$")
