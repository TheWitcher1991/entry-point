from datetime import datetime

from pydantic import BaseModel, ConfigDict


class VerifiedSkillResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    experience_id: int
    skill_name: str


class VerifiedExperienceResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    participant_id: int
    task_id: int
    company_id: int
    review_id: int
    task_title: str
    company_name: str
    rating: int
    review_text: str | None = None
    created_at: datetime
    skills: list[VerifiedSkillResponse] = []


class VerifiedExperienceListResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    participant_id: int
    task_id: int
    company_id: int
    task_title: str
    company_name: str
    rating: int
    review_text: str | None = None
    created_at: datetime
    skills: list[VerifiedSkillResponse] = []
