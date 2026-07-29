# AGENTS.md — Backend (FastAPI)

## Стек

- **Python 3.12+** — async/await, type hints
- **FastAPI** — REST API, OpenAPI docs (/docs)
- **SQLAlchemy 2.0** — async ORM (asyncpg)
- **Alembic** — async миграции
- **Redis** — async (через hiredis)
- **JWT** — python-jose (HS256)
- **bcrypt** — passlib
- **ruff** — линтер + форматтер
- **mypy** — typecheck
- **pytest + httpx** — тесты (async)

## Команды

```sh
uvicorn app.main:app --reload              # dev-сервер (http://localhost:8000)
alembic revision --autogenerate -m "msg"   # создать миграцию
alembic upgrade head                       # применить миграции
ruff check .                               # линтер
ruff check . --fix                         # автофикс
mypy app                                   # typecheck
pytest                                     # тесты
```

**Перед коммитом:** `ruff check . && mypy app`

## Архитектура: модульный монолит

```
app/
├── core/                  # Общая инфраструктура
│   ├── config.py          # pydantic-settings (читает .env)
│   ├── database.py        # async engine, Base, get_db
│   ├── security.py        # JWT + bcrypt (hash_password, verify_password, create_access_token)
│   └── dependencies.py    # get_current_user (Depends с HTTPBearer)
│
├── services/              # Каждый сервис — самодостаточная папка
│   ├── auth/
│   │   ├── __init__.py    # экспортирует router
│   │   ├── models.py      # SQLAlchemy модель(и)
│   │   ├── schemas.py     # Pydantic request/response
│   │   ├── service.py     # Бизнес-логика
│   │   └── router.py      # FastAPI APIRouter с префиксом
│   ├── users/
│   ├── participants/
│   ├── companies/
│   ├── directories/
│   ├── admin/
│   └── tasks/             # заглушка
│
└── main.py                # FastAPI app, CORS, include_router
```

### Правила

- **Сервисы не импортируют друг друга напрямую.** Если нужны данные из другой сущности — через core или через модель (модели могут быть переиспользованы).
- **Core — только инфраструктура** (БД, JWT, конфиг). Никакой бизнес-логики.
- **Каждый сервис самодостаточен:** models, schemas, service, router — внутри папки.
- **Модели регистрируются** в `Base.metadata` через импорт в `alembic/env.py`.

## Alembic

- Миграции асинхронные (alembic.ini → async engine)
- `alembic/env.py` импортирует все модели сервисов
- `target_metadata = Base.metadata` из `app/core/database.py`

## Auth

- JWT access token (HS256)
- Срок: 1440 минут (24 часа) из `.env`
- Токен в заголовке `Authorization: Bearer <token>`
- `Depends(get_current_user)` в `app/core/dependencies.py`
- bcrypt для паролей (`passlib.context.CryptContext`)

## Тесты

- `pytest-asyncio` для async тестов
- `httpx.AsyncClient` с `ASGITransport` для интеграционных тестов
- `conftest.py` переопределяет `get_db` на in-memory SQLite (aiosqlite)
- Тесты лежат в `tests/` на уровне backend

## .env

Обязательные переменные:
```
DATABASE_URL=postgresql+asyncpg://user:pass@localhost:5432/db
REDIS_URL=redis://localhost:6379/0
SECRET_KEY=<random-string>
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440
CORS_ORIGINS=["http://localhost:3000"]
```

## HTTP-конвенции

- Версионирование: `/api/v1/...`
- Статусы: 200 (OK), 201 (created), 400 (bad request), 401 (unauthorized), 403 (forbidden), 404 (not found)
- Ошибки: `{"detail": "message"}`
- Timestamps: ISO 8601 с timezone (UTC)
- snake_case для полей JSON

## Текущий спринт (Sprint 001)

Бэкенд развивается в рамках Sprint 001 — регистрация, JWT-аутентификация, CRUD пользователей, базовые справочники.
Сверяйся с `_bmad/implementation/SPRINT-001.md` перед началом работы.
