# AGENTS.md — Точка входа

## Состояние проекта

**MVP-цикл замкнут.** Реализован полный сценарий от создания задачи компанией до получения участником подтверждённого опыта.

Основные вехи:
- Sprint 001 ✅ — основа (auth, роли, профили, справочники, админка)
- Sprint 002 ✅ — задачи (CRUD, каталог, фильтры, модерация)
- Sprint 003–4 ✅ — заявки и выполнение (applications, submissions, participation, reviews)
- Текущая фаза — **полировка и подготовка к пилоту**

### Что работает сейчас

- **Дизайн-система**: полная палитра, тёмная тема, 12 shadcn/ui компонентов, Tailwind v4
- **Auth**: FastAPI регистрация/логин, JWT (bcrypt + HS256), роли participant/company/admin + фронтенд (effector), middleware.ts
- **Профили**: участник + компания (бэкенд GET/PATCH, фронтенд React Query + zod-формы)
- **Справочники**: Skills + Categories (бэкенд CRUD + seed-скрипт, фронтенд entities)
- **Задачи (Tasks)**: бэкенд CRUD + модерация, фронтенд каталог с фильтрами, создание/редактирование
- **Заявки (Applications)**: бэкенд CRUD, фронтенд подача/просмотр/статусы
- **Участие (Participation)**: при одобрении заявки — авто-привязка участника к задаче, проверка прав при сабмите
- **Рабочее пространство**: `/participant/tasks/[id]` — просмотр задачи + отправка результата
- **Выполнение (Submissions)**: отправка результата, проверка, приёмка/доработка
- **Отзывы (Reviews)**: рейтинг 1-5, текст, подтверждённые навыки (skills_confirmed)
- **Уведомления (in-app)**: колокольчик в хедере, список, отметка прочитанным, polling 30s
- **Email-уведомления**: SMTP (Mailhog), отправка при approve/submit/review
- **Админка**: модерация задач (admin/tasks), управление пользователями
- **Публичные профили**: компании + участника с отзывами
- **Лендинг**: живая статистика + популярные задачи
- **Юридические страницы**: `/terms`, `/privacy-policy`, `/contacts`, `/rules-of-publication`
- **Страница компаний**: `/companies` — сетка, поиск
- **Все страницы**: полный список в [README.md](./README.md#структура-проекта)
- **Seed**: 3 компании, 3 участника, 6 задач, заявки, сабмиты, отзывы
- **Полировка UI**: `active:scale-[0.96]`, `text-wrap`, `transition` без `all`, концентрические радиусы

### Артефакты

- `docs/mocks/` — 9 HTML/CSS/JS мокапов (визуал, тёмная тема, демо-авторизация)
- `docs/PRODUCT.md` — полная спецификация продукта
- `docs/MVP.md` — сфокусированный MVP-скоуп
- `docs/technical/design.md` — дизайн-система

## Архитектура

### Стек

| Компонент | Технология |
|-----------|-----------|
| Frontend | Next.js 15, React 19, TypeScript, pnpm |
| Backend | FastAPI, Python 3.12, async (SQLAlchemy 2.0 + asyncpg) |
| Server state | @tanstack/react-query |
| Client state | effector |
| Forms | react-hook-form + zod |
| UI Kit | shadcn/ui (base-nova), Tailwind CSS v4 |
| Linter (JS/TS) | oxlint |
| Linter (Python) | ruff, mypy |
| Database | PostgreSQL 16 + Redis 7 |
| Migrations | Alembic (async) |
| Infra | Docker Compose (dev), multi-stage Dockerfile (prod) |

### Структура

```
frontend/                # Next.js + FSD
├── src/
│   ├── app/             # Next.js App Router (20+ страниц)
│   ├── components/ui/   # shadcn/ui компоненты (Button, Card, Badge, Tabs...)
│   ├── shared/          # API (axios), Icons, config, lib (cn)
│   ├── entities/        # user, task, participant, company, review, notification...
│   ├── features/        # auth, task-submit, task-review, profile-edit
│   └── widgets/         # header, footer, task-card, notification-bell
├── package.json         # pnpm
├── tsconfig.json        # strict, path aliases @/* @shared/* @entities/* etc.
├── middleware.ts         # role-based auth
└── next.config.ts

backend/                 # FastAPI modular monolith
├── app/
│   ├── core/            # config, database (async engine), security (JWT+bcrypt)
│   ├── services/        # 10 сервисов: auth, users, participants, companies,
│   │                    # tasks, applications, participations, reviews,
│   │                    # notifications, directories, admin
│   └── main.py          # FastAPI app, CORS, /health, подключение роутеров
├── pyproject.toml       # ruff + mypy
├── alembic/             # async миграции
├── Dockerfile
├── .env
└── tests/

docker-compose.yml       # postgres:16 + redis:7 + backend + frontend (dev)
```

## Полная документация

Подробная документация для разработчиков — в [README.md](./README.md).

- [docs/technical/design.md](./docs/technical/design.md) — дизайн-система
- [docs/PRODUCT.md](./docs/PRODUCT.md) — спецификация продукта
- [docs/MVP.md](./docs/MVP.md) — MVP-скоуп
- [frontend/AGENTS.md](./frontend/AGENTS.md) — FSD, shadcn, Tailwind v4
- [backend/AGENTS.md](./backend/AGENTS.md) — модульный монолит, FastAPI, Alembic

## Команды

```sh
# Backend
uvicorn app.main:app --reload                          # dev-сервер
alembic revision --autogenerate -m "message"          # создать миграцию
alembic upgrade head                                  # применить миграции
ruff check .                                          # линтер
mypy app                                              # typecheck
python -m app.seed                                    # seed-данные

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
- **FSD на фронтенде**: слои `app → widgets → features → entities → shared`. Импорты строго сверху вниз.
- **Effector + React Query**: React Query для server state, effector для client state. Не дублировать.
- **Модульный монолит на бэкенде**: каждый сервис — самодостаточная папка. Core — только инфраструктура.
- **JWT auth**: токен в localStorage, прокидывается через axios interceptor. На бэке — `Depends(get_current_user)`.
- **Дизайн по docs/technical/design.md**: крупные карточки (24px radius), `#166666` accent (light) / `#2EC4B6` (dark), стекло-морфизм только для header/popups, Inter/Manrope, 8pt сетка.
- **make-interfaces-feel-better**: `active:scale-[0.96]` на всех кнопках, `transition` без `all`, `text-wrap: balance` на h1-h4, `text-wrap: pretty` на p/li, концентрические радиусы, тени вместо бордеров, `tabular-nums`.
- **Единая цветовая палитра**: shadcn-семантика (`bg-background`, `text-foreground`, `bg-primary`, `bg-card`). Никаких `text-text-primary`, `bg-surface-secondary`, `bg-hover`, `text-accent`.
- **Статусы — строки**: все статусы (task, application, participation, submission) — plain strings, не enum. Валидация через regex в Pydantic-схемах.

## Ограничения MVP

- **Нет** платежей, комиссий, AI-рекомендаций, Kanban, видеозвонков, интеграций
- **Нет** полноценного чата, загрузки файлов, жалоб
- **Нет** mobile-адаптации (десктоп)
- Статусы задач/заявок/участия — строго по справочнику (см. MVP.md раздел 5)
- Код — без `any`, `@ts-ignore`, хардкода, комментариев (конвенция dev-агента)
