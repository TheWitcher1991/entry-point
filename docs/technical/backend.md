# Backend

> **Stack:** FastAPI, Python 3.12, SQLAlchemy 2.0 (async), asyncpg, Alembic, Redis 7

---

## Commands

```sh
uvicorn app.main:app --reload              # Dev → http://localhost:8000
alembic revision --autogenerate -m "msg"   # Create migration
alembic upgrade head                       # Apply migrations
ruff check .                               # Linter
ruff check . --fix                         # Auto-fix
mypy app                                   # Type check
pytest                                     # Tests (87+)
python -m app.seed                         # Seed data
```

**Before commit:** `ruff check . && mypy app`

---

## Modular monolith

```
app/
├── core/
│   ├── config.py           # pydantic-settings (reads .env)
│   ├── database.py         # Async engine, Base, get_db
│   ├── security.py         # JWT + bcrypt
│   ├── dependencies.py     # get_current_user
│   └── logging_config.py   # Centralised logger setup
├── services/
│   ├── auth/               # Registration, login, JWT
│   ├── users/              # User profiles
│   ├── participants/       # Participant profiles + completed tasks
│   ├── companies/          # Company profiles
│   ├── tasks/              # CRUD + submissions + reviews
│   ├── applications/       # Applications + approval flow
│   ├── participations/     # Task-participant bindings
│   ├── reviews/            # Ratings and reviews
│   ├── notifications/      # In-app + email notifications
│   ├── directories/        # Skills & categories reference
│   └── admin/              # User management, task moderation
└── main.py                 # FastAPI app factory
```

Each service follows the same internal structure:

| File | Responsibility |
|------|----------------|
| `models.py` | SQLAlchemy model |
| `schemas.py` | Pydantic request/response |
| `service.py` | Business logic (no HTTP) |
| `router.py` | `APIRouter` + route handlers |

---

## Key conventions

| Rule | Detail |
|------|--------|
| **Service isolation** | Services never import each other directly. Cross-module data via models or core. |
| **Core = infrastructure** | No business logic in `core/`. Only DB, JWT, config, logging. |
| **Statuses = strings** | All statuses (task, application, submission) are plain strings. Validated by regex in schemas where needed. |
| **Auth** | JWT (HS256, bcrypt), token in `Authorization: Bearer`, 24h expiry. |
| **DB** | Async SQLAlchemy 2.0 + asyncpg. Alembic for migrations. |
| **Logging** | Centralised via `core/logging_config.py`. HTTP logging middleware. |

---

## Logging

All services log key operations:

| Service | Events logged |
|---------|---------------|
| `auth` | Registration, login, failed attempts |
| `tasks` | Create, update, status change, submit, review |
| `applications` | Create, status change |
| `email` | Send attempts, failures |

Format: `2026-07-30 19:09:51  INFO      auth      User registered: id=1 ...`

Configure level via `LOG_LEVEL` in `.env` (default: `INFO`).

---

## Testing

- `pytest` with `pytest-asyncio` for async tests
- `httpx.AsyncClient` with `ASGITransport` for integration tests
- `conftest.py` auto-detects PostgreSQL → falls back to `aiosqlite` (SQLite)
- Per-test transaction rollback (isolated tests)
- 87+ tests covering all services

---

## Seed data

```sh
python -m app.seed
```

Creates: 3 companies, 3 participants, 6 tasks, applications, submissions, reviews, skills (12), categories (4).

| Email | Password | Role |
|-------|----------|------|
| admin@talentpot.ru | admin123 | Admin |
| company@talentpot.ru | company123 | Company |
| participant@talentpot.ru | participant123 | Participant |
