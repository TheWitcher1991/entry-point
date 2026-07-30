from datetime import datetime

from pydantic import BaseModel, ConfigDict


class CompanyResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    owner_id: int
    name: str | None = None
    logo_url: str | None = None
    description: str | None = None
    website: str | None = None
    city: str | None = None
    industry: str | None = None
    company_size: str | None = None
    stack: str | None = None
    contact_name: str | None = None
    contact_position: str | None = None
    verification_status: str
    created_at: datetime
    updated_at: datetime


class CompanyListItem(BaseModel):
    """Публичная краткая информация о компании для каталога."""
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str | None = None
    description: str | None = None
    city: str | None = None
    industry: str | None = None
    stack: str | None = None
    company_size: str | None = None
    verification_status: str
    logo_url: str | None = None
    created_at: datetime


class CompanyUpdate(BaseModel):
    name: str | None = None
    logo_url: str | None = None
    description: str | None = None
    website: str | None = None
    city: str | None = None
    industry: str | None = None
    company_size: str | None = None
    stack: str | None = None
    contact_name: str | None = None
    contact_position: str | None = None
