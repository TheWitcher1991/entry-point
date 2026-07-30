from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class TaskSkillResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    task_id: int
    skill_id: int
    skill_name: str | None = None
    level: str | None = None
    is_required: bool = True


class TaskSkillCreate(BaseModel):
    skill_id: int
    level: str | None = None
    is_required: bool = True


class TaskResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    company_id: int
    company_name: str | None = None
    title: str
    summary: str | None = None
    description: str | None = None
    category_id: int | None = None
    difficulty: str | None = None
    format: str | None = None
    start_date: datetime | None = None
    deadline: datetime | None = None
    participant_limit: int = 1
    participant_count: int = 0
    status: str = "draft"
    expected_result: str | None = None
    acceptance_criteria: str | None = None
    requirements: str | None = None
    advantages: str | None = None
    materials_links: str | None = None
    restrictions: str | None = None
    allowed_tools: str | None = None
    career_opportunities: str | None = None
    portfolio_policy: str | None = None
    ip_policy: str | None = None
    confidentiality_policy: str | None = None
    created_at: datetime
    updated_at: datetime
    skills: list[TaskSkillResponse] = []


class TaskCreate(BaseModel):
    title: str = Field(min_length=3, max_length=255)
    summary: str | None = Field(None, max_length=500)
    description: str | None = None
    category_id: int | None = None
    difficulty: str | None = None
    format: str | None = None
    status: str = Field(default="draft")
    start_date: datetime | None = None
    deadline: datetime | None = None
    participant_limit: int = Field(default=1, ge=1, le=3)
    expected_result: str | None = None
    acceptance_criteria: str | None = None
    requirements: str | None = None
    advantages: str | None = None
    materials_links: str | None = None
    restrictions: str | None = None
    allowed_tools: str | None = None
    career_opportunities: str | None = None
    portfolio_policy: str | None = None
    ip_policy: str | None = None
    confidentiality_policy: str | None = None
    skills: list[TaskSkillCreate] = []


class TaskUpdate(BaseModel):
    title: str | None = Field(None, min_length=3, max_length=255)
    summary: str | None = None
    description: str | None = None
    category_id: int | None = None
    difficulty: str | None = None
    format: str | None = None
    start_date: datetime | None = None
    deadline: datetime | None = None
    participant_limit: int | None = Field(None, ge=1, le=3)
    expected_result: str | None = None
    acceptance_criteria: str | None = None
    requirements: str | None = None
    advantages: str | None = None
    materials_links: str | None = None
    restrictions: str | None = None
    allowed_tools: str | None = None
    career_opportunities: str | None = None
    portfolio_policy: str | None = None
    ip_policy: str | None = None
    confidentiality_policy: str | None = None
    skills: list[TaskSkillCreate] | None = None


class TaskListItem(BaseModel):
    """Краткая версия задачи для каталога."""
    model_config = ConfigDict(from_attributes=True)

    id: int
    company_id: int
    company_name: str | None = None
    title: str
    summary: str | None = None
    category_id: int | None = None
    difficulty: str | None = None
    format: str | None = None
    deadline: datetime | None = None
    participant_limit: int = 1
    participant_count: int = 0
    status: str
    career_opportunities: str | None = None
    created_at: datetime
    skills: list[TaskSkillResponse] = []


class TaskStatusUpdate(BaseModel):
    status: str = Field(
        pattern=r"^(draft|moderation|revision|published|open|selected|"
        r"in_progress|review|rework|completed|cancelled|archived|blocked)$"
    )


# ── Submissions ──


class SubmissionCreate(BaseModel):
    description: str | None = Field(None, max_length=5000)
    result_links: str | None = Field(None, max_length=2000)


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


class SubmissionReview(BaseModel):
    status: str = Field(pattern=r"^(approved|rejected)$")
    review_comment: str | None = Field(None, max_length=2000)
