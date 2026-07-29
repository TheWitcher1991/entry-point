from datetime import datetime

from pydantic import BaseModel, ConfigDict


class CategoryResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    direction: str | None = None
    is_active: bool
    created_at: datetime
    updated_at: datetime


class CategoryCreate(BaseModel):
    name: str
    direction: str | None = None


class CategoryUpdate(BaseModel):
    name: str | None = None
    direction: str | None = None
    is_active: bool | None = None


class SkillResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    category_id: int | None = None
    is_active: bool
    created_at: datetime
    updated_at: datetime


class SkillCreate(BaseModel):
    name: str
    category_id: int | None = None


class SkillUpdate(BaseModel):
    name: str | None = None
    category_id: int | None = None
    is_active: bool | None = None
