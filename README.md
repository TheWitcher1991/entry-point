# Точка входа

> Реальные задачи — подтверждённый опыт.

**Точка входа** — цифровая платформа, на которой IT-компании публикуют небольшие реальные задачи, а студенты, выпускники и начинающие специалисты выполняют их и получают подтверждённый практический опыт.

Платформа не является биржей фриланса, сайтом вакансий или образовательной платформой. Её задача — создать безопасный и прозрачный формат взаимодействия между компанией и начинающим специалистом через выполнение ограниченной по объёму реальной задачи.

---

## Стек

| Компонент | Технология |
|-----------|-----------|
| Frontend | Next.js 15, React 19, TypeScript, pnpm |
| Backend | FastAPI, Python 3.12, async (SQLAlchemy 2.0 + asyncpg) |
| State | @tanstack/react-query (server), effector (client) |
| Forms | react-hook-form + zod |
| Linter | oxlint (замена ESLint), ruff (Python) |
| Database | PostgreSQL 16, Redis 7 |
| Infra | Docker Compose (dev), multi-stage Dockerfile (prod) |

---

## Быстрый старт

### Требования
- Docker Desktop (или Docker Compose)
- Node.js 22+ (для локальной разработки фронта)
- Python 3.12+ (для локальной разработки бэка)
- pnpm (`npm install -g pnpm`)

### Запуск через Docker

```sh
# Поднять всё (БД + бэкенд + фронтенд)
docker compose up -d

# Только БД (для локальной разработки)
docker compose up postgres redis -d
```

- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API docs: http://localhost:8000/docs

### Локальная разработка

```sh
# 1. Запустить БД
docker compose up postgres redis -d

# 2. Бэкенд
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -e ".[dev]"
alembic upgrade head
uvicorn app.main:app --reload

# 3. Фронтенд
cd frontend
pnpm install
pnpm dev
```

---

## Команды

### Frontend
```sh
pnpm dev            # Dev-сервер (localhost:3000)
pnpm build          # Production build
pnpm lint           # oxlint --fix
pnpm lint:check     # oxlint (без --fix)
pnpm typecheck      # tsc --noEmit
pnpm test           # vitest run
```

### Backend
```sh
uvicorn app.main:app --reload              # Dev-сервер
alembic revision --autogenerate -m "msg"   # Миграция
alembic upgrade head                       # Применить миграции
ruff check .                               # Линтер
mypy app                                   # Type check
pytest                                     # Тесты
```

---

## Архитектура

```
frontend/                # Next.js + Feature-Sliced Design
├── src/
│   ├── app/             # Next.js App Router
│   ├── shared/          # API (axios), UI-kit, config, lib
│   ├── entities/        # user, task, participant, company
│   ├── features/        # auth, profile-edit, task-catalog
│   └── widgets/         # header, sidebar, task-card
├── package.json
└── tsconfig.json

backend/                 # FastAPI modular monolith
├── app/
│   ├── core/            # config, database, security, dependencies
│   └── services/        # self-contained modules
│       ├── auth/        # registration, login, JWT
│       ├── users/       # user profile
│       ├── participants/
│       ├── companies/
│       ├── directories/ # skills, categories
│       ├── admin/
│       └── tasks/       # (future)
├── pyproject.toml
└── alembic/             # async migrations

docker-compose.yml       # postgres + redis + backend + frontend
```

---

## Дизайн

Дизайн-система описана в `DESIGN.md`. Основные принципы:
- Акцентный цвет `#166666`
- Крупные карточки (24px radius), низкая информационная плотность
- Inter / Manrope
- Тёмная тема через `[data-theme="dark"]`

Мокапы всех страниц — в `docs/mocks/`. Открой `docs/mocks/index.html` в браузере.

---

## Документация

| Файл | Описание |
|------|---------|
| `DESIGN.md` | Дизайн-система |
| `docs/PRODUCT.md` | Полная спецификация продукта |
| `docs/MVP.md` | MVP-скоуп и критерии успешности |
| `AGENTS.md` | Инструкция для OpenCode-агентов |
| `_bmad/implementation/SPRINT-001.md` | Текущий спринт |

---

## Разработка

Проект идёт по BMAD-циклу: `Discovery → Product → Architecture → Story Prep → Implementation → QA → Handoff`.

Текущая фаза: **Implementation** (Sprint 001).

---

## Лицензия

[MIT](LICENSE.md)
