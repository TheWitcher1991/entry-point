# Точка входа

> Реальные задачи — подтверждённый опыт.

**Точка входа** — цифровая платформа, на которой IT-компании публикуют небольшие реальные задачи, а студенты, выпускники и начинающие специалисты выполняют их и получают подтверждённый практический опыт.

Платформа не является биржей фриланса, сайтом вакансий или образовательной платформой. Её задача — создать безопасный и прозрачный формат взаимодействия между компанией и начинающим специалистом через выполнение ограниченной по объёму реальной задачи.

**Ключевой сценарий:**
```
Компания публикует задачу → Участник подаёт заявку → 
Компания выбирает исполнителя → Участник выполняет → 
Компания принимает результат → Участник получает подтверждённый опыт
```

---

## Содержание

- [Стек](#стек)
- [Быстрый старт](#быстрый-старт)
- [Архитектура](#архитектура)
- [Структура проекта](#структура-проекта)
- [Команды](#команды)
- [API](#api)
- [Дизайн-система](#дизайн-система)
- [Состояние проекта](#состояние-проекта)
- [Документация](#документация)

---

## Стек

| Компонент | Технология |
|-----------|-----------|
| **Frontend** | Next.js 15, React 19, TypeScript, pnpm |
| **Backend** | FastAPI, Python 3.12, async (SQLAlchemy 2.0 + asyncpg) |
| **Server state** | @tanstack/react-query |
| **Client state** | effector |
| **Forms** | react-hook-form + zod |
| **UI Kit** | shadcn/ui (base-nova) + Tailwind CSS v4 |
| **Linter (JS/TS)** | oxlint |
| **Linter (Python)** | ruff, mypy |
| **Database** | PostgreSQL 16 |
| **Cache** | Redis 7 |
| **Migrations** | Alembic (async) |
| **Infra** | Docker Compose (dev), multi-stage Dockerfile (prod) |
| **Auth** | JWT (HS256) + bcrypt |

---

## Быстрый старт

### Требования

- Docker Desktop (или Docker Compose)
- Node.js 22+
- Python 3.12+
- pnpm (`npm install -g pnpm`)

### 1. Запуск через Docker (всё сразу)

```sh
# Поднять все сервисы
docker compose up -d

# Frontend: http://localhost:3000
# Backend API: http://localhost:8000
# API docs: http://localhost:8000/docs
```

### 2. Локальная разработка

```sh
# 1. Запустить БД и Redis
docker compose up postgres redis -d

# 2. Бэкенд
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -e ".[dev]"
alembic upgrade head
uvicorn app.main:app --reload     # http://localhost:8000

# 3. Фронтенд (в новом терминале)
cd frontend
pnpm install
pnpm dev                           # http://localhost:3000
```

### 3. Seed-данные (тестовые)

```sh
cd backend
python -m app.seed
```

Создаёт:
- 3 компании: `company1@example.com`, `company2@example.com`, `company3@example.com` (пароль `test123!`)
- 3 участника: `participant1@example.com`, `participant2@example.com`, `participant3@example.com` (пароль `test123!`)
- 6 задач с навыками
- 6 заявок
- 4 сабмита, 2 отзыва

---

## Архитектура

### Фронтенд: Feature-Sliced Design (FSD)

```
app/ (Next.js App Router)
  ↓
widgets/ (сложные блоки: header, footer, task-card)
  ↓
features/ (сценарии: auth, task-submit, profile-edit)
  ↓
entities/ (бизнес-сущности: user, task, participant, company)
  ↓
shared/ (API, UI-kit, Icons, lib, config)
```

**Правила импортов:**
- `shared` → ничего из вышележащих слоёв
- `entities` → только из shared
- `features` → из entities и shared
- `widgets` → из features, entities, shared
- `app` → из любого слоя

### Бэкенд: Модульный монолит

```
core/       → config, database, security, dependencies (инфраструктура)
services/   → каждый сервис в своей папке (models, schemas, service, router)
main.py     → FastAPI app, CORS, include_router
```

Каждый сервис самодостаточен: models, schemas, service, router — внутри одной папки.
Сервисы не импортируют друг друга напрямую. Core — только инфраструктура, без бизнес-логики.

---

## Структура проекта

```
/
├── frontend/                     # Next.js + FSD
│   ├── src/
│   │   ├── app/                  # Страницы (App Router)
│   │   │   ├── page.tsx          #   Лендинг
│   │   │   ├── catalog/          #   Каталог задач
│   │   │   ├── tasks/[id]/       #   Карточка задачи
│   │   │   ├── companies/        #   Список компаний
│   │   │   ├── companies/[id]/   #   Публичный профиль компании
│   │   │   ├── participants/[id]/ #   Публичный профиль участника
│   │   │   ├── login/            #   Вход
│   │   │   ├── register/         #   Регистрация
│   │   │   ├── how-it-works/     #   О платформе
│   │   │   ├── terms/            #   Пользовательское соглашение
│   │   │   ├── privacy-policy/   #   Политика конфиденциальности
│   │   │   ├── contacts/         #   Контакты
│   │   │   ├── admin/            #   Админ-панель
│   │   │   ├── admin/tasks/      #   Модерация задач
│   │   │   ├── company/          #   Дашборд компании
│   │   │   ├── company/tasks/    #   Задачи компании
│   │   │   ├── company/tasks/new/#   Создание задачи
│   │   │   ├── company/tasks/[id]/edit/ # Редактирование задачи
│   │   │   ├── company/applications/ # Заявки компании
│   │   │   ├── company/profile/  #   Профиль компании
│   │   │   ├── participant/      #   Дашборд участника
│   │   │   ├── participant/tasks/[id]/ # Рабочее пространство
│   │   │   ├── participant/applications/ # Заявки участника
│   │   │   ├── participant/profile/ # Профиль участника
│   │   │   ├── layout.tsx        #   Root layout + провайдеры
│   │   │   ├── providers.tsx     #   React Query + effector
│   │   │   └── globals.css       #   Дизайн-система
│   │   ├── components/ui/        # shadcn/ui компоненты
│   │   ├── shared/
│   │   │   ├── api/              # axios instance + query client
│   │   │   ├── ui/               # ThemeToggle
│   │   │   ├── icons/            # 30+ SVG-иконок
│   │   │   └── lib/              # cn(), cookies
│   │   ├── entities/             # Бизнес-сущности
│   │   │   ├── user/             #   Пользователь
│   │   │   ├── task/             #   Задачи
│   │   │   ├── participant/      #   Участники
│   │   │   ├── company/          #   Компании
│   │   │   ├── review/           #   Отзывы
│   │   │   ├── notification/     #   Уведомления
│   │   │   ├── participation/    #   Участие в задачах
│   │   │   ├── stats/            #   Статистика
│   │   │   └── admin/            #   Админка
│   │   ├── features/             # Сценарии
│   │   │   ├── auth/             #   Effector stores + формы
│   │   │   ├── task-submit/      #   Отправка результата
│   │   │   ├── task-review/      #   Проверка результата
│   │   │   └── profile-edit/     #   Редактирование профиля
│   │   └── widgets/              # Сложные блоки
│   │       ├── header/           #   Шапка
│   │       ├── footer/           #   Подвал
│   │       ├── task-card/        #   Карточка задачи
│   │       ├── theme-toggle/     #   Переключатель темы
│   │       └── notification-bell/ #  Уведомления
│   ├── middleware.ts             # Role-based auth middleware
│   ├── package.json
│   ├── tsconfig.json
│   ├── next.config.ts
│   ├── postcss.config.mjs
│   └── vitest.config.ts
│
├── backend/                      # FastAPI
│   ├── app/
│   │   ├── core/
│   │   │   ├── config.py         #   pydantic-settings
│   │   │   ├── database.py       #   async engine + Base
│   │   │   ├── security.py       #   JWT + bcrypt
│   │   │   └── dependencies.py   #   get_current_user
│   │   ├── services/
│   │   │   ├── auth/             #   Регистрация, логин, JWT
│   │   │   ├── users/            #   Профиль пользователя
│   │   │   ├── participants/     #   Профили участников
│   │   │   ├── companies/        #   Профили компаний
│   │   │   ├── tasks/            #   Задачи CRUD + submissions
│   │   │   ├── applications/     #   Заявки
│   │   │   ├── participations/   #   Участие в задачах
│   │   │   ├── reviews/          #   Отзывы
│   │   │   ├── notifications/    #   In-app уведомления + email
│   │   │   ├── directories/      #   Справочники (skills, categories)
│   │   │   └── admin/            #   Админка (users, tasks)
│   │   └── main.py               # FastAPI app
│   ├── alembic/                  # Миграции
│   ├── pyproject.toml
│   ├── Dockerfile
│   └── .env
│
├── docs/                         # Документация
│   ├── mocks/                    # HTML/CSS мокапы
│   ├── PRODUCT.md                # Полная спецификация продукта
│   └── MVP.md                    # MVP-скоуп
├── DESIGN.md                     # Дизайн-система
├── AGENTS.md                     # Инструкция для агентов
├── docker-compose.yml
└── README.md                     # Этот файл
```

---

## Команды

### Frontend

```sh
pnpm dev              # Dev-сервер (http://localhost:3000)
pnpm build            # Production build
pnpm lint             # oxlint --fix
pnpm lint:check       # oxlint (без --fix)
pnpm typecheck        # tsc --noEmit
pnpm test             # vitest run
```

**Перед коммитом:** `pnpm lint:check && pnpm typecheck`

### Backend

```sh
uvicorn app.main:app --reload              # Dev-сервер (http://localhost:8000)
alembic revision --autogenerate -m "msg"   # Создать миграцию
alembic upgrade head                       # Применить миграции
ruff check .                               # Линтер
ruff check . --fix                         # Автофикс
mypy app                                   # Typecheck
pytest                                     # Тесты
python -m app.seed                         # Seed-данные
```

**Перед коммитом:** `ruff check . && mypy app`

### Docker

```sh
docker compose up -d                    # Поднять всё
docker compose up postgres redis -d     # Только БД (для локальной разработки)
docker compose down                     # Остановить
docker compose logs -f                  # Логи всех сервисов
```

---

## API

### Публичные эндпоинты (без авторизации)

| Метод | Путь | Описание |
|-------|------|----------|
| GET | `/health` | Проверка сервера |
| GET | `/api/v1/stats` | Статистика (active_tasks, companies, participants) |
| GET | `/api/v1/tasks` | Список задач (фильтры, пагинация, сортировка) |
| GET | `/api/v1/tasks/{id}` | Детали задачи |
| GET | `/api/v1/companies` | Список компаний |
| GET | `/api/v1/companies/{id}` | Публичный профиль компании |
| GET | `/api/v1/companies/{id}/reviews` | Отзывы компании |
| GET | `/api/v1/participants/{id}` | Публичный профиль участника |
| GET | `/api/v1/participants/{id}/reviews` | Отзывы участника |
| GET | `/api/v1/directories/skills` | Справочник навыков |
| GET | `/api/v1/directories/categories` | Справочник категорий |
| POST | `/api/v1/auth/register` | Регистрация |
| POST | `/api/v1/auth/login` | Вход |

### Защищённые эндпоинты (JWT)

#### Участник
| Метод | Путь | Описание |
|-------|------|----------|
| GET/PATCH | `/api/v1/participants/me` | Профиль участника |
| GET | `/api/v1/participants/me/completed` | Завершённые задачи |
| GET | `/api/v1/participants/me/reviews` | Мои отзывы |
| POST | `/api/v1/applications` | Подать заявку |
| GET | `/api/v1/applications/my` | Мои заявки |
| POST | `/api/v1/tasks/{id}/submit` | Отправить результат |
| GET | `/api/v1/participations/my` | Мои активные участия |
| GET | `/api/v1/notifications` | Уведомления |
| GET | `/api/v1/notifications/unread-count` | Непрочитанные |
| PATCH | `/api/v1/notifications/{id}/read` | Отметить прочитанным |
| PATCH | `/api/v1/notifications/read-all` | Всё прочитано |

#### Компания
| Метод | Путь | Описание |
|-------|------|----------|
| GET/PATCH | `/api/v1/companies/me` | Профиль компании |
| POST | `/api/v1/tasks` | Создать задачу |
| PATCH | `/api/v1/tasks/{id}` | Редактировать задачу |
| GET | `/api/v1/tasks/my` | Мои задачи |
| GET | `/api/v1/tasks/{id}/submissions` | Результаты задачи |
| GET | `/api/v1/tasks/{id}/participants` | Участники задачи |
| PATCH | `/api/v1/tasks/{id}/submissions/{id}/review` | Проверить результат |
| PATCH | `/api/v1/tasks/{id}/status` | Сменить статус задачи |
| GET | `/api/v1/applications/company` | Заявки ко всем задачам |
| GET | `/api/v1/applications/task/{id}` | Заявки к задаче |
| PATCH | `/api/v1/applications/{id}/status` | Одобрить/отклонить заявку |
| POST | `/api/v1/tasks/{id}/submissions/{id}/review` | Создать отзыв |

#### Админ
| Метод | Путь | Описание |
|-------|------|----------|
| GET | `/api/v1/admin/users` | Список пользователей |
| PATCH | `/api/v1/admin/users/{id}/status` | Блокировка |
| GET | `/api/v1/admin/tasks` | Все задачи (для модерации) |
| PATCH | `/api/v1/tasks/{id}/status` | Модерация задачи |

---

## Дизайн-система

Полное описание — в [DESIGN.md](./DESIGN.md).

### Основные принципы

| Принцип | Значение |
|---------|----------|
| Акцентный цвет | `#166666` (light) / `#2EC4B6` (dark) |
| Радиус карточек | 24px (`rounded-3xl`) |
| Радиус кнопок/инпутов | 16px (`rounded-2xl`) |
| Основной шрифт | Inter (300–700) |
| Заголовки | Manrope (500–800) |
| Сетка | 8pt (4/8/12/16/24/32/48/64) |
| Высота инпутов | 52px |
| Стекло-морфизм | Только header и popups |

### Цвета (shadcn-семантика)

Все цвета — через CSS-переменные. Использование в классах:
- `bg-background`, `text-foreground`, `text-muted-foreground`
- `bg-primary`, `bg-card`, `bg-muted`
- `border-border`, `text-destructive`

### Тёмная тема

- Класс `.dark` на `<html>`
- Хранится в `localStorage`, читается в inline-скрипте (FOUC-free)
- Переключатель ThemeToggle в хедере

### Полировка UI (make-interfaces-feel-better)

- `active:scale-[0.96]` на всех кликабельных элементах
- `transition-[prop,...]` без `all`
- `text-wrap: balance` на h1–h4
- `text-wrap: pretty` на p, li
- `tabular-nums` для чисел
- Концентрические радиусы (24→16→8)
- Тени вместо бордеров

---

## Состояние проекта

**MVP-цикл замкнут.** Реализован полный сценарий:
→ компания создаёт задачу
→ отправляет на модерацию
→ админ одобряет
→ участник подаёт заявку
→ компания выбирает исполнителя
→ участник выполняет в рабочем пространстве
→ компания проверяет и принимает
→ участник получает отзыв и подтверждённый опыт

### Что работает
- ✅ Регистрация и JWT-авторизация (3 роли: participant, company, admin)
- ✅ Профили участника и компании (редактирование, публичный просмотр)
- ✅ Справочники навыков и категорий (управляются админом)
- ✅ Задачи: создание, каталог, фильтры, карточка, модерация
- ✅ Заявки: подача, просмотр, одобрение/отклонение
- ✅ Участие: привязка участника к задаче при одобрении
- ✅ Рабочее пространство участника: просмотр задачи + отправка результата
- ✅ Проверка результата: приёмка/доработка компанией
- ✅ Отзывы: рейтинг, текст, подтверждённые навыки
- ✅ In-app уведомления (колокольчик с polling)
- ✅ Email-уведомления (через SMTP/Mailhog)
- ✅ Админ-панель: модерация задач, управление пользователями
- ✅ Публичные профили участников и компаний
- ✅ Лендинг с реальной статистикой
- ✅ Юридические страницы (/terms, /privacy-policy, /contacts)
- ✅ Тёмная тема
- ✅ Seed-данные (3 компании, 3 участника, 6 задач)

### Что не входит в MVP

Платежи, комиссии, подписки, AI-рекомендации, Kanban, видеозвонки,
тайм-трекинг, интеграции (hh.ru, GitHub, Jira), мобильные приложения,
SSO, полноценный чат, загрузка файлов, жалобы.

---

## Документация

| Файл | Описание |
|------|----------|
| [DESIGN.md](./DESIGN.md) | Дизайн-система (цвета, типографика, компоненты) |
| [docs/PRODUCT.md](./docs/PRODUCT.md) | Полная спецификация продукта (1330 строк) |
| [docs/MVP.md](./docs/MVP.md) | MVP-скоуп, критерии успешности, риски |
| [docs/mocks/](./docs/mocks/) | HTML/CSS мокапы всех страниц (открой `index.html`) |
| [AGENTS.md](./AGENTS.md) | Инструкция для OpenCode-агентов |
| [frontend/AGENTS.md](./frontend/AGENTS.md) | Детали фронтенда (FSD, shadcn, design tokens) |
| [backend/AGENTS.md](./backend/AGENTS.md) | Детали бэкенда (модули, alembic, auth) |
| [skills/make-interfaces-feel-better/](./skills/make-interfaces-feel-better/) | Принципы полировки UI |
| [docs/AGENTS.md](./docs/AGENTS.md) | Документация по мокапам и Product/MVP docs |

---

## Лицензия

MIT
