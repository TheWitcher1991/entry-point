# Точка входа

> **Реальные задачи — подтверждённый опыт.**

Платформа, где IT-компании публикуют небольшие реальные задачи, а студенты и начинающие специалисты выполняют их и получают подтверждённый практический опыт.

```
Компания создаёт задачу → Участник подаёт заявку →
Компания выбирает → Участник выполняет →
Компания принимает → Участник получает подтверждённый опыт
```

---

## Tech stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 15, React 19, TypeScript, pnpm |
| Backend | FastAPI (Python 3.12), SQLAlchemy 2.0 async |
| UI | shadcn/ui, Tailwind CSS v4 |
| Database | PostgreSQL 16 + Redis 7 |
| Auth | JWT (HS256) + bcrypt |

---

## Quick start

```sh
# Full stack (Docker)
docker compose up -d
# → Frontend: http://localhost:3000
# → API:      http://localhost:8000
# → Docs:     http://localhost:8000/docs

# Or local dev — see docs/guide/quickstart.md
```

---

## Project structure

```
frontend/        Next.js + Feature-Sliced Design
backend/         FastAPI modular monolith
docs/            Product, architecture, API, guides, design
├── product/     Product overview, MVP scope
├── guide/       Quick start, runbook
├── technical/   Architecture, API reference, frontend/backend conventions, design system
└── mocks/       HTML/CSS mockups
```

---

## Documentation

| Section | Description |
|---------|-------------|
| [Product Overview](docs/product/overview.md) | What the product is and who it's for |
| [MVP Scope](docs/product/mvp.md) | MVP features, statuses, criteria |
| [Quick Start](docs/guide/quickstart.md) | Setup in 5 minutes |
| [Runbook](docs/guide/runbook.md) | Migrations, deploy, CI/CD |
| [Architecture](docs/technical/architecture.md) | FSD + modular monolith |
| [API Reference](docs/technical/api.md) | All endpoints with schemas |
| [Design System](docs/technical/design.md) | Colors, typography, components |
| [Frontend Conventions](docs/technical/frontend.md) | FSD, shadcn, Tailwind |
| [Backend Conventions](docs/technical/backend.md) | Services, migrations, testing |

---

## Status

MVP-цикл замкнут. Реализован полный сценарий:

- ✅ Auth (3 роли, JWT, регистрация)
- ✅ Профили (участник + компания)
- ✅ Задачи (CRUD, каталог, фильтры, статусы)
- ✅ Заявки (подача, одобрение, отклонение)
- ✅ Рабочее пространство (просмотр + отправка)
- ✅ Проверка (приёмка/доработка)
- ✅ Отзывы (рейтинг, подтверждённые навыки)
- ✅ Уведомления (in-app + email)
- ✅ Админка (модерация, пользователи)
- ✅ Тёмная тема
- ✅ Seed-данные
- ✅ 87 тестов

---

## Commands

### Frontend (`cd frontend`)

| Command | Action |
|---------|--------|
| `pnpm dev` | Dev server |
| `pnpm build` | Production build |
| `pnpm lint:check` | Lint check |
| `pnpm typecheck` | TypeScript check |

### Backend (`cd backend`)

| Command | Action |
|---------|--------|
| `uvicorn app.main:app --reload` | Dev server |
| `alembic upgrade head` | Apply migrations |
| `ruff check .` | Lint |
| `mypy app` | Type check |
| `pytest` | Run tests |
| `python -m app.seed` | Seed data |

**Before commit:** `pnpm lint:check && pnpm typecheck` + `ruff check . && mypy app`

---

## License

MIT
