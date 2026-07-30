from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class Application(Base):
    __tablename__ = "applications"

    id: Mapped[int] = mapped_column(primary_key=True)
    task_id: Mapped[int] = mapped_column(
        ForeignKey("project_tasks.id"), nullable=False, index=True
    )
    participant_id: Mapped[int] = mapped_column(
        ForeignKey("participant_profiles.id"), nullable=False, index=True
    )
    cover_letter: Mapped[str | None] = mapped_column(Text, nullable=True)
    status: Mapped[str] = mapped_column(
        String(50), default="pending", index=True
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    task = relationship("ProjectTask", backref="applications", uselist=False)
    participant_profile = relationship(
        "ParticipantProfile", backref="applications", uselist=False
    )
