from datetime import datetime
from typing import Annotated

from pydantic import BaseModel, StringConstraints


class MessageCreate(BaseModel):
    text: Annotated[str, StringConstraints(min_length=1, max_length=5000)]
    participant_profile_id: int | None = None


class MessageResponse(BaseModel):
    id: int
    task_id: int
    sender_id: int
    sender_first_name: str | None = None
    sender_last_name: str | None = None
    sender_role: str | None = None
    participant_profile_id: int | None = None
    text: str
    created_at: datetime

    model_config = {"from_attributes": True}
