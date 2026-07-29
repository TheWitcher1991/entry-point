from pydantic import BaseModel


class MeResponse(BaseModel):
    id: int
    email: str
    role: str
    status: str
    first_name: str | None = None
    last_name: str | None = None
    company_name: str | None = None
