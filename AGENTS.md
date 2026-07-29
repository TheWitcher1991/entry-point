# AGENTS.md — Точка входа

## Состояние проекта

**Этап:** Sprint 001 — Начало разработки. Tailwind v4 + shadcn/ui работают, дизайн-система приведена к мокапам.

### Что работает сейчас — Sprint 001 ✅ завершён
- **Дизайн-система**: полная палитра из DESIGN.md (accent `#166666` light / `#2EC4B6` dark) через CSS-переменные в `globals.css`
- **Тёмная тема**: `.dark` класс на `<html>`, FOUC-prevention через inline `<script>`
- **shadcn/ui** (base-nova стиль): Button, Card, Badge, Tabs, Avatar, Input, Select, Separator, Dialog, Dropdown-menu, Sheet — 12 компонентов в `components/ui/`
- **Tailwind v4**: 67KB CSS, все shadcn-утилиты (`bg-primary`, `text-foreground`, `border-border` и т.д.)
- **Auth (бэкенд)**: FastAPI регистрация/логин, JWT (bcrypt + HS256), роли participant/company/admin
- **Auth (фронтенд)**: LoginForm + RegisterForm (effector), редирект в dashboard по роли, middleware.ts с защитой маршрутов + role guard
- **Профили**: участник + компания (бэкенд GET/PATCH, фронтенд React Query + zod-формы)
- **Справочники**: Skills + Categories (бэкенд CRUD + seed-скрипт, фронтенд entities с типами и API)
- **Админка**: бэкенд users list + change status
- **Страница компаний**: `/companies` — сетка, поиск по названию/городу/технологиям
- **Все страницы-заглушки**: `/catalog`, `/tasks/[id]`, `/how-it-works`, `/companies/[id]`, `/register`, `/login`, `/participant`, дашборды
- **Иконки**: кастомный набор SVG-иконок в `shared/ui/Icons/`
- **make-interfaces-feel-better**: `active:scale-[0.96]` на кнопках, `text-wrap: balance/pretty`, `transition` без `all`
- **Проектный скилл**: `skills/make-interfaces-feel-better/` — принципы полировки интерфейсов

### Артефакты
- `docs/mocks/` — 9 HTML/CSS/JS мокапов (визуал, тёмная тема, демо-авторизация)
- `docs/PRODUCT.md` — полная спецификация продукта
- `docs/MVP.md` — сфокусированный MVP-скоуп
- `DESIGN.md` — дизайн-система

## Архитектура

**Стек:**
- Frontend: Next.js 15, React 19, TypeScript, pnpm
- Backend: FastAPI, Python 3.12, async (SQLAlchemy 2.0 + asyncpg)
- State: @tanstack/react-query (сервер), effector (клиент)
- Forms: react-hook-form + zod
- Linter: oxlint (замена ESLint)
- UI: shadcn/ui (base-nova), Tailwind CSS v4
- DB: PostgreSQL + Redis (через Docker Compose)
- Infra: Docker Compose (dev), multi-stage Dockerfile (prod)

**Структура:**

```
frontend/                # Next.js + FSD
├── src/
│   ├── app/             # Next.js App Router (pages, layout, providers)
│   ├── components/ui/   # shadcn/ui компоненты (Button, Card, Badge, Tabs...)
│   ├── shared/          # API (axios), Icons, config, lib (cn)
│   ├── entities/        # user, task — model + api
│   ├── features/        # auth (effector stores + LoginForm), profile-edit
│   └── widgets/         # header, footer, task-card, theme-toggle
├── package.json         # pnpm
├── tsconfig.json        # strict, path aliases @/* @shared/* @entities/* etc.
├── next.config.ts
├── vitest.config.ts
├── postcss.config.mjs   # @tailwindcss/postcss { base: process.cwd() }
└── .oxlintrc.json       # правила: no-any, no-ts-ignore, etc.

backend/                 # FastAPI modular monolith
├── app/
│   ├── core/            # config, database (async engine), security (JWT+bcrypt)
│   ├── services/        # каждый сервис в своей папке
│   │   ├── auth/        # models.py, schemas.py, service.py, router.py
│   │   ├── users/       # schemas.py, router.py (заглушка)
│   │   ├── participants/
│   │   ├── companies/
│   │   ├── directories/
│   │   ├── admin/
│   │   └── tasks/       # заглушка
│   └── main.py          # FastAPI app, CORS, /health, подключение роутеров
├── pyproject.toml       # ruff + mypy
├── alembic.ini + env.py # async миграции
├── Dockerfile
├── .env
└── tests/

skills/                  # Проектные скиллы для агентов
└── make-interfaces-feel-better/  # Принципы полировки UI

docker-compose.yml       # postgres:16 + redis:7 + backend + frontend (dev)
```

## Текущий спринт

Текущий спринт: **Sprint 001 — Основа** ✅ завершён (auth, роли, профили, справочники)
→ `_bmad/implementation/SPRINT-001.md`

### Что сделано за спринт
- **Auth**: бэкенд (регистрация, логин, JWT, роли), фронтенд (формы с effector, редирект по роли, middleware)
- **Профили**: участник + компания (бэкенд GET/PATCH, фронтенд React Query + zod-формы)
- **Справочники**: Skills + Categories (бэкенд CRUD + entities на фронте + seed-скрипт)
- **Админка**: бэкенд (users list + change status)
- **Страница компаний**: `/companies` с поиском и карточками
- **Дизайн-система**: полная shadcn-палитра, тёмная тема, 12 компонентов, полировка UI

Следующий спринт — уточнить после MVP-ревью (tasks, заявки, реальные данные).

## AGENTS.md в поддиректориях

- `frontend/AGENTS.md` — FSD структура, shadcn/ui, Tailwind v4, команды
- `backend/AGENTS.md` — модульный монолит, FastAPI, команды
- `docs/AGENTS.md` — мокапы, PRODUCT.md, MVP.md
- `skills/AGENTS.md` — проектные скиллы (make-interfaces-feel-better)
- `_bmad/AGENTS.md` — BMAD-фреймворк, артефакты фаз
- `.opencode/AGENTS.md` — opencode агенты, команды, конфиги

### FSD-слои frontend
- `frontend/src/shared/AGENTS.md` — утилиты, UI-kit, иконки
- `frontend/src/entities/AGENTS.md` — бизнес-сущности (user, task...)
- `frontend/src/features/AGENTS.md` — сценарии (auth, profile-edit...)
- `frontend/src/widgets/AGENTS.md` — сложные блоки (header, footer...)

## BMAD-фреймворк

Разработка управляется BMAD (Business → Model → Architecture → Development):

**Фазы:** Discovery → Product → Architecture → Story Prep → Implementation → QA → Handoff

**Ключевые артефакты:**
- Каждая фаза пишет артефакт в `_bmad/{phase}/`
- Манифест агентов: `_bmad/_config/agent-manifest.csv`
- Агентные прокси: `.opencode/agent/bmad-agent-*.md`
- Команды: `.opencode/command/bmad-*.md`

**Загрузка агента:** каждый proxy md (.opencode/agent/bmad-agent-*.md) указывает путь к полному агенту в `_bmad/`. Следуй инструкции `<agent-activation>`.

## Команды

```sh
# Backend
uvicorn app.main:app --reload                          # dev-сервер
alembic revision --autogenerate -m "message"          # создать миграцию
alembic upgrade head                                  # применить миграции
ruff check .                                          # линтер
mypy app                                              # typecheck
python -m app.seed                                    # seed справочников (Skills + Categories)

# Frontend
pnpm dev                                              # dev-сервер
pnpm build                                            # production build
pnpm lint                                             # oxlint --fix
pnpm lint:check                                       # oxlint (без --fix)
pnpm typecheck                                        # tsc --noEmit
pnpm test                                             # vitest

# Docker
docker compose up -d                                  # поднять всё
docker compose up postgres redis -d                   # только БД (для локальной разработки)
```

**Перед коммитом:** `pnpm lint:check && pnpm typecheck` (фронтенд), `ruff check && mypy app` (бэкенд).

## Особенности, которые важно не пропустить

- **shadcn/ui (base-nova)**: без `asChild`, используется `@base-ui/react` (Button, useRender, mergeProps)
- **Tailwind v4 + CSS-переменные**: цвета через `@theme inline { --color-*: var(--*) }` в `globals.css`. Светлая/тёмная тема через `:root` / `.dark`. Баг next@15.5.22: пустые PostCSS-опции `{}` ломают `@tailwindcss/postcss` — всегда передавать `{ base: process.cwd() }`
- **FSD на фронтенде**: слои `app → widgets → features → entities → shared`. Импорты строго сверху вниз (shared не импортирует features, entities не импортирует widgets).
- **Effector + React Query**: React Query для server state (кэш/синхронизация с API), effector для client state (формы, UI, авторизация). Не дублировать состояние.
- **Модульный монолит на бэкенде**: каждый сервис — самодостаточная папка с models/schemas/service/router. Core — только общая инфраструктура (БД, JWT, конфиг).
- **JWT auth**: токен хранится в localStorage (фронт), прокидывается через axios interceptor. На бэке — `Depends(get_current_user)` из `app/core/dependencies.py`.
- **Дизайн по DESIGN.md**: крупные карточки (24px radius), `#166666` accent (light) / `#2EC4B6` (dark), стекло-морфизм только для header/popups, Inter/Manrope, 8pt сетка. Тёмная тема через класс `.dark`.
- **make-interfaces-feel-better**: `active:scale-[0.96]` на всех кнопках, `transition` только конкретных свойств, `text-wrap: balance` на h1-h4, `text-wrap: pretty` на p/li, концентрические радиусы, тени вместо бордеров, `tabular-nums` для чисел.
- **Единая цветовая палитра**: shadcn-семантика (`bg-background`, `text-foreground`, `text-muted-foreground`, `bg-primary`, `bg-card`, `border-border`). Никаких `text-text-primary`, `bg-surface-secondary`, `bg-hover`, `text-accent` (как primary).

## Мокапы (docs/mocks/)

Если нужно быстро сверить визуал или навигацию — открой `docs/mocks/index.html` в браузере. Там:
- Чистый HTML/CSS/JS, без сборщиков
- Тёмная тема через `[data-theme="dark"]` + localStorage
- Демо-авторизация (`localStorage`, роль `participant`/`company`)
- Все внутренние ссылки ведут на реальные страницы мокапов

## Ограничения MVP (из PRODUCT.md + MVP.md)

- **Нет** платежей, комиссий, AI-рекомендаций, Kanban, видеозвонков, интеграций
- Статусы задач/заявок/участия — строго по справочнику (см. MVP.md раздел 5)
- Код — без `any`, `@ts-ignore`, хардкода, комментариев (конвенция dev-агента)
