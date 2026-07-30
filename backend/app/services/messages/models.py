from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class TaskMessage(Base):
    """A single message in a task-level conversation between company and participant."""

    __tablename__ = "task_messages"

    id: Mapped[int] = mapped_column(primary_key=True)
    task_id: Mapped[int] = mapped_column(
        ForeignKey("project_tasks.id"), nullable=False, index=True
    )
    sender_id: Mapped[int] = mapped_column(
        ForeignKey("users.id"), nullable=False, index=True
    )
    participant_profile_id: Mapped[int | None] = mapped_column(
        ForeignKey("participant_profiles.id"), nullable=True, index=True,
        comment="Identifies which participant this conversation is with. NULL if system/broadcast.",
    )
    text: Mapped[str] = mapped_column(Text, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )

    # relationships for convenience
    task = relationship("ProjectTask", backref="messages", uselist=False)
    sender = relationship("User", backref="messages_sent", uselist=False)
    participant_profile = relationship(
        "ParticipantProfile", backref="messages", uselist=False
    )
