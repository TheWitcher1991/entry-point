from datetime import datetime

from sqlalchemy import Boolean, DateTime, ForeignKey, Integer, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class ProjectTask(Base):
    __tablename__ = "project_tasks"

    id: Mapped[int] = mapped_column(primary_key=True)
    company_id: Mapped[int] = mapped_column(
        ForeignKey("companies.id"), nullable=False, index=True
    )
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    summary: Mapped[str | None] = mapped_column(Text, nullable=True)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    category_id: Mapped[int | None] = mapped_column(
        Integer, nullable=True
    )
    difficulty: Mapped[str | None] = mapped_column(String(50), nullable=True)
    format: Mapped[str | None] = mapped_column(String(50), nullable=True)  # remote / mixed / onsite
    start_date: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
    deadline: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
    participant_limit: Mapped[int] = mapped_column(Integer, default=1)
    participant_count: Mapped[int] = mapped_column(Integer, default=0)
    status: Mapped[str] = mapped_column(
        String(50), default="draft", index=True
    )
    expected_result: Mapped[str | None] = mapped_column(Text, nullable=True)
    acceptance_criteria: Mapped[str | None] = mapped_column(Text, nullable=True)
    requirements: Mapped[str | None] = mapped_column(Text, nullable=True)
    advantages: Mapped[str | None] = mapped_column(Text, nullable=True)
    materials_links: Mapped[str | None] = mapped_column(Text, nullable=True)
    restrictions: Mapped[str | None] = mapped_column(Text, nullable=True)
    allowed_tools: Mapped[str | None] = mapped_column(Text, nullable=True)
    career_opportunities: Mapped[str | None] = mapped_column(Text, nullable=True)
    portfolio_policy: Mapped[str | None] = mapped_column(Text, nullable=True)
    ip_policy: Mapped[str | None] = mapped_column(Text, nullable=True)
    confidentiality_policy: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    company = relationship("Company", backref="tasks", uselist=False)
    skills = relationship("TaskSkill", back_populates="task", cascade="all, delete-orphan")

    @property
    def company_name(self) -> str | None:
        return self.company.name if self.company else None


class TaskSkill(Base):
    __tablename__ = "task_skills"

    id: Mapped[int] = mapped_column(primary_key=True)
    task_id: Mapped[int] = mapped_column(
        ForeignKey("project_tasks.id"), nullable=False, index=True
    )
    skill_id: Mapped[int] = mapped_column(
        ForeignKey("skills.id"), nullable=False
    )
    level: Mapped[str | None] = mapped_column(String(50), nullable=True)
    is_required: Mapped[bool] = mapped_column(Boolean, default=True)

    task = relationship("ProjectTask", back_populates="skills")
    skill = relationship("Skill", backref="task_skills", uselist=False)

    @property
    def skill_name(self) -> str | None:
        return self.skill.name if self.skill else None


class TaskSubmission(Base):
    __tablename__ = "task_submissions"

    id: Mapped[int] = mapped_column(primary_key=True)
    task_id: Mapped[int] = mapped_column(
        ForeignKey("project_tasks.id"), nullable=False, index=True
    )
    participant_id: Mapped[int] = mapped_column(
        ForeignKey("participant_profiles.id"), nullable=False
    )
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    result_links: Mapped[str | None] = mapped_column(Text, nullable=True)
    status: Mapped[str] = mapped_column(String(50), default="pending")
    review_comment: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    task = relationship("ProjectTask", backref="submissions", uselist=False)
    participant_profile = relationship(
        "ParticipantProfile", backref="submissions", uselist=False
    )
