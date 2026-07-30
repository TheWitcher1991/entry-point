"""
Seed script for reference data (categories, skills) and test data (users, tasks, etc.).

Usage:
    python -m app.seed

Requires an active database with tables created (alembic upgrade head).
"""

import asyncio
import logging

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import async_session_factory, engine
from app.core.security import hash_password
from app.services.auth.models import User, UserRole, UserStatus
from app.services.companies.models import Company
from app.services.participants.models import ParticipantProfile
from app.services.directories.models import Category, Skill
from app.services.tasks.models import ProjectTask, TaskSkill, TaskSubmission
from app.services.applications.models import Application
from app.services.reviews.models import Review

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("seed")

# ── Reference data ───────────────────────────────────────────────

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


async def seed_reference_data(session: AsyncSession) -> dict[str, Category]:
    """Seed categories and skills. Returns category map by name."""
    existing = await session.execute(select(Category).limit(1))
    if existing.scalar_one_or_none():
        logger.info("Reference data already seeded, skipping.")
        # Still build category map for downstream usage
        result = await session.execute(select(Category))
        return {c.name: c for c in result.scalars().all()}

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

    await session.flush()
    logger.info("Reference data seeded: %d categories, %d skills", len(CATEGORIES), len(SKILLS))
    return category_map


# ── Test data ────────────────────────────────────────────────────

TEST_PASSWORD = "test123!"

# fmt: off
COMPANY_USERS = [
    {"email": "company1@test.local", "first_name": "Михаил", "last_name": "Соколов"},
    {"email": "company2@test.local", "first_name": "Елена", "last_name": "Волкова"},
    {"email": "company3@test.local", "first_name": "Дмитрий", "last_name": "Морозов"},
]

PARTICIPANT_USERS = [
    {"email": "participant1@test.local", "first_name": "Иван", "last_name": "Петров"},
    {"email": "participant2@test.local", "first_name": "Анна", "last_name": "Смирнова"},
    {"email": "participant3@test.local", "first_name": "Алексей", "last_name": "Козлов"},
]

COMPANIES = [
    {
        "name": "ТехноКод",
        "description": "IT-аутсорсинг и разработка цифровых продуктов под ключ. Специализируемся на веб- и мобильной разработке, DevOps и автоматизации.",
        "website": "https://techocode.io",
        "city": "Москва",
        "industry": "Информационные технологии",
        "company_size": "50-100",
        "stack": "Python, FastAPI, React, TypeScript, PostgreSQL, Docker, Kubernetes",
    },
    {
        "name": "ДизайнСтудия",
        "description": "Студия продуктового дизайна. Создаём интерфейсы для веба и мобильных приложений, брендинг и айдентику.",
        "website": "https://design-studio.ru",
        "city": "Санкт-Петербург",
        "industry": "Дизайн",
        "company_size": "10-30",
        "stack": "Figma, Adobe Creative Suite, Protopie, After Effects",
    },
    {
        "name": "ДатаПро",
        "description": "Data Science и аналитика для бизнеса. Разрабатываем ML-модели, системы рекомендаций и дашборды.",
        "website": "https://datapro.ai",
        "city": "Казань",
        "industry": "Data Science",
        "company_size": "30-50",
        "stack": "Python, Pandas, Jupyter, SQL, PyTorch, Airflow",
    },
]

PARTICIPANTS = [
    {
        "first_name": "Иван",
        "last_name": "Петров",
        "city": "Москва",
        "bio": "Python-разработчик с опытом работы над высоконагруженными REST API. Участник open-source проектов.",
        "education": "МГУ им. Ломоносова",
        "specialty": "Бэкенд-разработчик",
        "desired_role": "Middle Python-разработчик",
        "github_url": "https://github.com/ivanpetrov",
        "telegram": "@ivanpetrov",
    },
    {
        "first_name": "Анна",
        "last_name": "Смирнова",
        "city": "Санкт-Петербург",
        "bio": "Frontend-разработчик с уклоном в UI/UX. Создаю удобные и красивые интерфейсы.",
        "education": "ИТМО",
        "specialty": "Frontend-разработчик",
        "desired_role": "Senior Frontend-разработчик",
        "github_url": "https://github.com/annasmirnova",
        "telegram": "@annasmir",
    },
    {
        "first_name": "Алексей",
        "last_name": "Козлов",
        "city": "Казань",
        "bio": "DevOps-инженер. Автоматизирую всё, что можно автоматизировать.",
        "education": "КФУ",
        "specialty": "DevOps-инженер",
        "desired_role": "Site Reliability Engineer",
        "github_url": "https://github.com/alexeykozlov",
        "telegram": "@akozlov",
    },
]

# Tasks: (company_index, title, summary, description, category_name, difficulty, format, skills)
TASKS_DATA = [
    (
        0,  # ТехноКод
        "Разработать REST API для каталога товаров",
        "Спроектировать и реализовать REST API для интернет-магазина на FastAPI.",
        "Необходимо разработать API для каталога товаров с возможностью поиска, фильтрации и пагинации. "
        "Требуется реализовать эндпоинты для CRUD товаров, категорий, поиск по названию и описанию. "
        "Документация через Swagger/OpenAPI обязательна.\n\n"
        "Ожидаемый результат: репозиторий с кодом на FastAPI, миграции Alembic, тесты.",
        "Backend-разработка", "medium", "remote",
        [("Python", True), ("FastAPI", True), ("PostgreSQL", True), ("REST API", True)],
    ),
    (
        0,  # ТехноКод
        "Написать автотесты для микросервиса аутентификации",
        "Покрыть тестами микросервис регистрации и входа.",
        "Микросервис уже написан на FastAPI. Нужно покрыть его автотестами: unit-тесты для сервисного слоя, "
        "интеграционные тесты для эндпоинтов. Особое внимание — негативным сценариям.\n\n"
        "Использовать pytest + httpx. Минимальное покрытие — 85%.",
        "Тестирование (QA)", "easy", "remote",
        [("Python", True), ("FastAPI", False), ("REST API", True), ("Postman", False)],
    ),
    (
        1,  # ДизайнСтудия
        "Разработать дизайн лендинга для финтех-продукта",
        "Создать современный лендинг для сервиса управления личными финансами.",
        "Нужен дизайн лендинга в Figma: главный экран, блок преимуществ, тарифы, форма обратной связи. "
        "Стиль — минималистичный, технологичный. Цветовая схема — тёмная тема с акцентными зелёными элементами. "
        "Обязательно адаптивная версия для мобильных.\n\n"
        "Требуется: Figma, UI Kit, прототип навигации.",
        "Дизайн", "medium", "remote",
        [("Figma", True), ("UI/UX", True), ("Лендинги", True)],
    ),
    (
        1,  # ДизайнСтудия
        "Создать UI Kit для мобильного приложения доставки",
        "Разработать набор компонентов для мобильного приложения службы доставки.",
        "Необходимо спроектировать UI Kit в Figma: кнопки, карточки, табы, формы, навигация, модальные окна. "
        "Все компоненты в светлой и тёмной темах. Атомарный дизайн-подход.\n\n"
        "Итог: библиотека компонентов с описанием состояний (default, hover, pressed, disabled).",
        "Дизайн", "hard", "remote",
        [("Figma", True), ("UI/UX", True)],
    ),
    (
        2,  # ДатаПро
        "Разработать модель прогнозирования оттока клиентов",
        "Построить ML-модель для предсказания оттока клиентов телеком-оператора.",
        "Дана выборка из 50 000 записей клиентов телеком-оператора. Задача — построить модель, "
        "которая предсказывает вероятность оттока клиента в течение следующего месяца.\n\n"
        "Требуется: EDA, feature engineering, обучение и сравнение 3+ моделей, "
        "оптимизация гиперпараметров, интерпретация результатов.\n\n"
        "Метрики качества: ROC-AUC ≥ 0.85, Precision ≥ 0.75.",
        "Data Science и ML", "hard", "remote",
        [("Python (ML)", True), ("Pandas", True), ("SQL", False)],
    ),
    (
        2,  # ДатаПро
        "Анализ пользовательских данных мобильного приложения",
        "Провести анализ поведения пользователей и подготовить дашборд.",
        "Есть сырые данные событий мобильного приложения (10 млн строк). "
        "Нужно: очистить данные, построить воронки конверсии, выделить ключевые метрики, "
        "подготовить дашборд в Metabase/Tableau.\n\n"
        "Результат: отчёт с инсайтами и рекомендациями, дашборд с KPI.",
        "Аналитика", "medium", "remote",
        [("SQL", True), ("Анализ данных", True), ("Pandas", True)],
    ),
]

# Applications: (participant_index, task_index, status)
APPLICATIONS_DATA = [
    (0, 0, "approved"),   # Иван → API ТехноКод
    (2, 1, "approved"),   # Алексей → Тесты ТехноКод
    (1, 2, "pending"),    # Анна → Лендинг ДизайнСтудия
    (1, 3, "approved"),   # Анна → UI Kit ДизайнСтудия
    (0, 4, "pending"),    # Иван → ML ДатаПро
    (2, 5, "approved"),   # Алексей → Анализ ДатаПро
]

# Submissions: (task_index, participant_index, description, status, review_comment)
SUBMISSIONS_DATA = [
    (0, 0,
     "Реализовал FastAPI приложение с 15 эндпоинтами. Добавил миграции Alembic, "
     "тесты с покрытием 92%, Swagger-документацию. Код выложен на GitHub.",
     "approved",
     "Отличная работа! API чистое, тесты покрывают основные сценарии. Принимаем."),
    (1, 2,
     "Написал 40+ тестов для микросервиса аутентификации: unit-тесты для сервиса, "
     "интеграционные для эндпоинтов. Покрытие — 88%.",
     "pending",
     None),
    (3, 1,
     "Разработал UI Kit из 40+ компонентов в светлой и тёмной темах. "
     "Добавил документацию по использованию, примеры состояний для каждого компонента.",
     "approved",
     "Отличный UI Kit! Особенно понравилась проработка тёмной темы. Принимаем."),
    (5, 2,
     "Провёл полный анализ данных: очистка, воронки конверсии, RFM-сегментация. "
     "Подготовил дашборд в Metabase с 12 ключевыми метриками.",
     "pending",
     None),
]

# Reviews: (task_index, participant_index, rating, text, skills_confirmed)
REVIEWS_DATA = [
    (0, 0, 5,
     "Иван отлично справился с задачей! Быстро разобрался в требованиях, "
     "предложил хорошие архитектурные решения. Рекомендуем к сотрудничеству.",
     "Python, FastAPI, PostgreSQL, REST API"),
    (3, 1, 5,
     "Анна проявила глубокое понимание дизайн-систем. Компоненты аккуратные, "
     "продуманные, отлично подходят для дальнейшего использования.",
     "Figma, UI/UX"),
]
# fmt: on


async def seed_test_data(_category_map: dict[str, Category]) -> None:
    """Seed test users, tasks, applications, submissions, reviews."""
    logger.info("Seeding test data...")

    async with async_session_factory() as session:
        # ── Check if already seeded ─────────────────────────────
        existing = await session.execute(
            select(User).where(User.email == "company1@test.local")
        )
        if existing.scalar_one_or_none():
            logger.info("Test data already seeded, skipping.")
            return

        # ── Fetch skill lookup ──────────────────────────────────
        skill_result = await session.execute(select(Skill))
        all_skills: list[Skill] = list(skill_result.scalars().all())
        skill_by_name: dict[str, Skill] = {s.name: s for s in all_skills}

        # ── Create company users + profiles ─────────────────────
        company_user_ids: list[int] = []
        for i, cu in enumerate(COMPANY_USERS):
            user = User(
                email=cu["email"],
                password_hash=hash_password(TEST_PASSWORD),
                role=UserRole.COMPANY,
                status=UserStatus.ACTIVE,
            )
            session.add(user)
            await session.flush()
            await session.refresh(user)
            company_user_ids.append(user.id)

            comp = COMPANIES[i]
            company = Company(
                owner_id=user.id,
                name=comp["name"],
                description=comp["description"],
                website=comp["website"],
                city=comp["city"],
                industry=comp["industry"],
                company_size=comp["company_size"],
                stack=comp["stack"],
            )
            session.add(company)
            await session.flush()
            await session.refresh(company)

        logger.info("Created %d companies", len(COMPANIES))

        # ── Fetch all companies ─────────────────────────────────
        companies_result = await session.execute(select(Company))
        companies: list[Company] = list(companies_result.scalars().all())

        # ── Create participant users + profiles ─────────────────
        participant_profile_ids: list[int] = []
        for i, pu in enumerate(PARTICIPANT_USERS):
            user = User(
                email=pu["email"],
                password_hash=hash_password(TEST_PASSWORD),
                role=UserRole.PARTICIPANT,
                status=UserStatus.ACTIVE,
            )
            session.add(user)
            await session.flush()
            await session.refresh(user)

            p = PARTICIPANTS[i]
            profile = ParticipantProfile(
                user_id=user.id,
                first_name=p["first_name"],
                last_name=p["last_name"],
                city=p["city"],
                bio=p["bio"],
                education=p["education"],
                specialty=p["specialty"],
                desired_role=p["desired_role"],
                github_url=p["github_url"],
                telegram=p["telegram"],
            )
            session.add(profile)
            await session.flush()
            await session.refresh(profile)
            participant_profile_ids.append(profile.id)

        logger.info("Created %d participants", len(PARTICIPANTS))

        # ── Create tasks ────────────────────────────────────────
        task_ids: list[int] = []
        for t in TASKS_DATA:
            company_idx, title, summary, desc, cat_name, difficulty, fmt, skills = t
            company = companies[company_idx]

            # Find category id
            cat = _category_map.get(cat_name)

            task = ProjectTask(
                company_id=company.id,
                title=title,
                summary=summary,
                description=desc,
                category_id=cat.id if cat else None,
                difficulty=difficulty,
                format=fmt,
                status="active",
                participant_limit=3,
                participant_count=0,
            )
            session.add(task)
            await session.flush()
            await session.refresh(task)
            task_ids.append(task.id)

            # Add task skills
            for skill_name, is_required in skills:
                skill = skill_by_name.get(skill_name)
                if skill:
                    ts = TaskSkill(
                        task_id=task.id,
                        skill_id=skill.id,
                        level=difficulty,
                        is_required=is_required,
                    )
                    session.add(ts)

        await session.flush()
        logger.info("Created %d tasks", len(TASKS_DATA))

        # ── Create applications ─────────────────────────────────
        app_ids: list[int] = []
        for a in APPLICATIONS_DATA:
            part_idx, task_idx, status = a
            app = Application(
                task_id=task_ids[task_idx],
                participant_id=participant_profile_ids[part_idx],
                cover_letter=f"Привет! Хочу поработать над этой задачей. "
                             f"У меня есть релевантный опыт.",
                status=status,
            )
            session.add(app)
            await session.flush()
            await session.refresh(app)
            app_ids.append(app.id)

        logger.info("Created %d applications", len(APPLICATIONS_DATA))

        # ── Create submissions ──────────────────────────────────
        sub_ids: list[int] = []
        for s in SUBMISSIONS_DATA:
            task_idx, part_idx, description, status, review_comment = s
            sub = TaskSubmission(
                task_id=task_ids[task_idx],
                participant_id=participant_profile_ids[part_idx],
                description=description,
                result_links="https://github.com/test-user/repo",
                status=status,
                review_comment=review_comment,
            )
            session.add(sub)
            await session.flush()
            await session.refresh(sub)
            sub_ids.append(sub.id)

            # If approved, update task participant_count and status
            if status == "approved":
                task = await session.get(ProjectTask, task_ids[task_idx])
                if task:
                    task.participant_count = (task.participant_count or 0) + 1
                    task.status = "completed"

        await session.flush()
        logger.info("Created %d submissions", len(SUBMISSIONS_DATA))

        # ── Fetch submissions for review mapping ────────────────
        submissions_result = await session.execute(
            select(TaskSubmission)
            .where(TaskSubmission.status == "approved")
            .order_by(TaskSubmission.id)
        )
        approved_subs: list[TaskSubmission] = list(submissions_result.scalars().all())

        # ── Create reviews ──────────────────────────────────────
        for i, r in enumerate(REVIEWS_DATA):
            task_idx, part_idx, rating, text, skills_confirmed = r
            if i >= len(approved_subs):
                break
            sub = approved_subs[i]
            company = companies[TASKS_DATA[task_idx][0]]

            review = Review(
                submission_id=sub.id,
                company_id=company.id,
                participant_id=participant_profile_ids[part_idx],
                task_id=task_ids[task_idx],
                rating=rating,
                text=text,
                skills_confirmed=skills_confirmed,
            )
            session.add(review)

        await session.commit()

    logger.info(
        "Test data seeded: %d companies, %d participants, %d tasks, "
        "%d applications, %d submissions, %d reviews",
        len(COMPANIES),
        len(PARTICIPANTS),
        len(TASKS_DATA),
        len(APPLICATIONS_DATA),
        len(SUBMISSIONS_DATA),
        len(REVIEWS_DATA),
    )


# ── Main ─────────────────────────────────────────────────────────

async def seed() -> None:
    async with async_session_factory() as session:
        category_map = await seed_reference_data(session)
        await session.commit()

    await seed_test_data(category_map)


async def main() -> None:
    try:
        await seed()
    finally:
        await engine.dispose()


if __name__ == "__main__":
    asyncio.run(main())
