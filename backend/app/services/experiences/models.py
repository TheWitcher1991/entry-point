from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, Integer, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class VerifiedExperience(Base):
    """Подтверждённый опыт — центральный артефакт MVP.

    Автоматически создаётся, когда компания оставляет отзыв
    по принятой работе участника.
    """

    __tablename__ = "verified_experiences"

    id: Mapped[int] = mapped_column(primary_key=True)
    participant_id: Mapped[int] = mapped_column(
        ForeignKey("participant_profiles.id"), nullable=False, index=True
    )
    task_id: Mapped[int] = mapped_column(
        ForeignKey("project_tasks.id"), nullable=False
    )
    company_id: Mapped[int] = mapped_column(
        ForeignKey("companies.id"), nullable=False, index=True
    )
    review_id: Mapped[int] = mapped_column(
        ForeignKey("reviews.id"), nullable=False, unique=True
    )
    task_title: Mapped[str] = mapped_column(String(255), nullable=False)
    company_name: Mapped[str] = mapped_column(String(255), nullable=False)
    rating: Mapped[int] = mapped_column(Integer, nullable=False)
    review_text: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )

    participant_profile = relationship(
        "ParticipantProfile", backref="verified_experiences", uselist=False
    )
    task = relationship("ProjectTask", backref="verified_experiences", uselist=False)
    company = relationship("Company", backref="verified_experiences", uselist=False)
    review = relationship("Review", backref="verified_experience", uselist=False)

    skills = relationship(
        "VerifiedSkill", back_populates="experience", cascade="all, delete-orphan"
    )


class VerifiedSkill(Base):
    """Подтверждённый навык в рамках VerifiedExperience."""

    __tablename__ = "verified_skills"

    id: Mapped[int] = mapped_column(primary_key=True)
    experience_id: Mapped[int] = mapped_column(
        ForeignKey("verified_experiences.id"), nullable=False, index=True
    )
    skill_name: Mapped[str] = mapped_column(String(255), nullable=False)

    experience = relationship("VerifiedExperience", back_populates="skills")
