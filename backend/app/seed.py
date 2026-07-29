"""
Seed script for reference data (categories and skills).

Usage:
    python -m app.seed

Requires an active database with tables created (alembic upgrade head).
"""

import asyncio
import logging

from sqlalchemy import select

from app.core.database import async_session_factory, engine
from app.services.directories.models import Category, Skill

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("seed")

CATEGORIES = [
    {"name": "Backend-разработка", "direction": "Разработка"},
    {"name": "Frontend-разработка", "direction": "Разработка"},
    {"name": "Мобильная разработка", "direction": "Разработка"},
    {"name": "DevOps и инфраструктура", "direction": "Инфраструктура"},
    {"name": "Тестирование (QA)", "direction": "Тестирование"},
    {"name": "Дизайн", "direction": "Дизайн"},
    {"name": "Data Science и ML", "direction": "Data"},
    {"name": "Аналитика", "direction": "Data"},
    {"name": "Информационная безопасность", "direction": "Безопасность"},
    {"name": "Управление проектами", "direction": "Менеджмент"},
]

SKILLS = [
    # Backend
    {"name": "Python", "category_name": "Backend-разработка"},
    {"name": "FastAPI", "category_name": "Backend-разработка"},
    {"name": "Django", "category_name": "Backend-разработка"},
    {"name": "Node.js", "category_name": "Backend-разработка"},
    {"name": "Go", "category_name": "Backend-разработка"},
    {"name": "PostgreSQL", "category_name": "Backend-разработка"},
    {"name": "Redis", "category_name": "Backend-разработка"},
    {"name": "REST API", "category_name": "Backend-разработка"},
    {"name": "GraphQL", "category_name": "Backend-разработка"},
    {"name": "Docker", "category_name": "Backend-разработка"},
    # Frontend
    {"name": "React", "category_name": "Frontend-разработка"},
    {"name": "Next.js", "category_name": "Frontend-разработка"},
    {"name": "TypeScript", "category_name": "Frontend-разработка"},
    {"name": "Vue.js", "category_name": "Frontend-разработка"},
    {"name": "Tailwind CSS", "category_name": "Frontend-разработка"},
    {"name": "HTML/CSS", "category_name": "Frontend-разработка"},
    {"name": "JavaScript", "category_name": "Frontend-разработка"},
    # Mobile
    {"name": "Flutter", "category_name": "Мобильная разработка"},
    {"name": "React Native", "category_name": "Мобильная разработка"},
    {"name": "Swift", "category_name": "Мобильная разработка"},
    {"name": "Kotlin", "category_name": "Мобильная разработка"},
    # DevOps
    {"name": "Docker", "category_name": "DevOps и инфраструктура"},
    {"name": "Kubernetes", "category_name": "DevOps и инфраструктура"},
    {"name": "CI/CD", "category_name": "DevOps и инфраструктура"},
    {"name": "Linux", "category_name": "DevOps и инфраструктура"},
    {"name": "Terraform", "category_name": "DevOps и инфраструктура"},
    {"name": "AWS", "category_name": "DevOps и инфраструктура"},
    # QA
    {"name": "Selenium", "category_name": "Тестирование (QA)"},
    {"name": "Playwright", "category_name": "Тестирование (QA)"},
    {"name": "Cypress", "category_name": "Тестирование (QA)"},
    {"name": "Postman", "category_name": "Тестирование (QA)"},
    {"name": "Автотесты", "category_name": "Тестирование (QA)"},
    # Design
    {"name": "Figma", "category_name": "Дизайн"},
    {"name": "UI/UX", "category_name": "Дизайн"},
    {"name": "Adobe Photoshop", "category_name": "Дизайн"},
    {"name": "Лендинги", "category_name": "Дизайн"},
    # Data
    {"name": "Python (ML)", "category_name": "Data Science и ML"},
    {"name": "Pandas", "category_name": "Data Science и ML"},
    {"name": "SQL", "category_name": "Data Science и ML"},
    {"name": "Jupyter", "category_name": "Data Science и ML"},
    {"name": "Анализ данных", "category_name": "Аналитика"},
    # Security
    {"name": "Информационная безопасность", "category_name": "Информационная безопасность"},
    {"name": "Pentest", "category_name": "Информационная безопасность"},
    # Management
    {"name": "Agile/Scrum", "category_name": "Управление проектами"},
    {"name": "Jira", "category_name": "Управление проектами"},
]


async def seed() -> None:
    logger.info("Seeding reference data...")

    async with async_session_factory() as session:
        # Check if already seeded
        existing = await session.execute(select(Category).limit(1))
        if existing.scalar_one_or_none():
            logger.info("Database already seeded, skipping.")
            return

        # Create categories
        category_map: dict[str, Category] = {}
        for cat_data in CATEGORIES:
            category = Category(name=cat_data["name"], direction=cat_data.get("direction"))
            session.add(category)
            category_map[category.name] = category
        await session.flush()

        for category in category_map.values():
            await session.refresh(category)

        # Create skills
        for skill_data in SKILLS:
            skill_cat: Category | None = category_map.get(skill_data["category_name"])
            skill = Skill(
                name=skill_data["name"],
                category_id=skill_cat.id if skill_cat else None,
            )
            session.add(skill)

        await session.commit()

    logger.info("Seed complete: %d categories, %d skills", len(CATEGORIES), len(SKILLS))


async def main() -> None:
    try:
        await seed()
    finally:
        await engine.dispose()


if __name__ == "__main__":
    asyncio.run(main())
