# Sprint 001 — Основа (auth, роли, профили, справочники)

> **Фаза:** Implementation  
> **Источник:** MVP.md Этап 1  
> **Длительность:** —  
> **Статус:** 🟢 Активен

---

## Цель

Реализовать базовый скелет платформы: регистрация/авторизация, две роли, профили, справочники навыков и категорий, минимальная админка.

После этого спринта пользователь должен мочь:
- зарегистрироваться как участник или компания
- войти в систему
- заполнить/редактировать свой профиль
- участник — указать навыки, технологии, ссылки
- компания — указать название, описание, стек
- администратор — управлять справочником навыков и категорий
- увидеть дашборд после входа (пустой, но свой для каждой роли)

---

## Задачи

### 1. Auth — регистрация и вход

**Бэкенд:**
- `backend/app/services/auth/models.py` — ✅ User уже есть, добавить `created_at`/`updated_at` и поле `email_verified_at`
- `backend/app/services/auth/schemas.py` — ✅ уже есть
- `backend/app/services/auth/service.py` — ✅ register + login
- `backend/app/services/auth/router.py` — ✅ /auth/register + /auth/login
- Разобрать повторную отправку пароля в ответе (убрать), добавить `RegisterResponse` без пароля
- Добавить `email_verified_at = datetime.now(timezone.utc)` при регистрации

**Фронтенд:**
- `frontend/src/features/auth/ui/LoginForm.tsx` — ✅ уже есть, причесать (стили, обработка ошибок, редирект)
- `frontend/src/features/auth/ui/RegisterForm.tsx` — создать (email, password, выбор роли через переключатель)
- `frontend/src/features/auth/model/stores.ts` — ✅ уже есть, добавить `$authError`, `authError reset`
- `frontend/src/features/auth/api/index.ts` — ✅ уже есть
- `frontend/src/app/(auth)/login/page.tsx` — страница логина
- `frontend/src/app/(auth)/register/page.tsx` — страница регистрации
- `frontend/src/app/providers.tsx` — добавить init эффектора (считать токен из localStorage)

### 2. Профиль участника (ParticipantProfile)

**Бэкенд:**
- Создать `backend/app/services/participants/` — models, schemas, service, router
- `models.py` — `ParticipantProfile`: linked to User, first_name, last_name, avatar_url, city, bio, education, specialty, graduation_year, desired_role, github_url, telegram, portfolio_url, resume_url, availability_status
- `schemas.py` — `ParticipantProfileResponse`, `ParticipantProfileUpdate`
- `service.py` — `get_profile`, `update_profile`
- `router.py` — `GET /participants/me`, `PATCH /participants/me`
- Подключить роутер в `main.py`

**Фронтенд:**
- `frontend/src/entities/participant/model/` — types
- `frontend/src/entities/participant/api/` — getProfile, updateProfile
- `frontend/src/features/participant-profile/ui/ProfileForm.tsx` — форма редактирования (react-hook-form + zod)
- `frontend/src/app/(dashboard)/participant/profile/page.tsx` — страница профиля в дашборде

### 3. Профиль компании (Company)

**Бэкенд:**
- Создать `backend/app/services/companies/` — models, schemas, service, router
- `models.py` — `Company`: owner_id, name, logo_url, description, website, city, industry, company_size, stack, contact_name, contact_position, verification_status
- `schemas.py` — `CompanyResponse`, `CompanyUpdate`
- `service.py` — `get_company`, `update_company`
- `router.py` — `GET /companies/me`, `PATCH /companies/me`, `GET /companies/{id}` (публичный)
- Подключить роутер в `main.py`

**Фронтенд:**
- `frontend/src/entities/company/model/` — types
- `frontend/src/entities/company/api/` — getCompany, updateCompany
- `frontend/src/features/company-profile/ui/ProfileForm.tsx` — форма
- `frontend/src/app/(dashboard)/company/profile/page.tsx` — страница профиля
- `frontend/src/app/company/[id]/page.tsx` — публичная страница компании (позже, заглушка)

### 4. Справочники (Skills + Categories)

**Бэкенд:**
- Создать `backend/app/services/directories/` — models, schemas, service, router
- `models.py` — `Skill` (id, name, category, is_active), `Category` (id, name, direction, is_active)
- `schemas.py` — `SkillResponse`, `CategoryResponse`
- `service.py` — `get_skills`, `create_skill`, `update_skill`, `get_categories`, etc.
- `router.py` — `GET /skills`, `POST /skills` (admin), `GET /categories`, `POST /categories` (admin)
- Seed-команда или миграция с начальными значениями справочников
- Подключить роутер в `main.py`

**Фронтенд:**
- `frontend/src/entities/skill/model/` — types
- Использовать React Query для получения справочников (кэшируются надолго)
- Пока только бэкенд — фронтенд для админки позже

### 5. Дашборды (пустые, но свои для каждой роли)

**Фронтенд:**
- `frontend/src/app/(dashboard)/layout.tsx` — layout дашборда (header + контент)
- `frontend/src/widgets/navbar/ui/Navbar.tsx` — верхняя навигация (разная для participant/company, выпадающие меню)
- `frontend/src/app/(dashboard)/participant/page.tsx` — дашборд участника
- `frontend/src/app/(dashboard)/company/page.tsx` — дашборд компании
- Middleware для редиректа: если не авторизован → /login, если роль не совпадает → свой дашборд

**Бэкенд:**
- Эндпоинт `GET /auth/me` уже есть (`/users/me`) — фронт получает роль после логина

### 6. Базовая админка

**Бэкенд:**
- Создать `backend/app/services/admin/` — router с проверкой роли admin
- `POST /admin/skills` — создать навык
- `PATCH /admin/skills/{id}` — изменить навык
- `POST /admin/categories` — создать категорию
- `PATCH /admin/categories/{id}` — изменить категорию
- `GET /admin/users` — список пользователей
- `PATCH /admin/users/{id}/status` — блокировка
- Middleware: `is_admin` dependency, проверяет `current_user.role == 'admin'`

**Фронтенд:**
- Позже (админка будет минимальной, можно через REST клиент на старте)

---

## Структура после спринта

```
backend/
└── app/
    ├── core/                         # без изменений
    ├── services/
    │   ├── auth/                     # регистрация, вход, JWT
    │   ├── users/                    # GET /me
    │   ├── participants/             # профиль участника  ★ NEW
    │   ├── companies/                # профиль компании    ★ NEW
    │   ├── directories/              # справочники         ★ NEW
    │   ├── admin/                    # админка             ★ NEW
    │   └── tasks/                    # заглушка (пока пусто)
    └── main.py

frontend/
└── src/
    ├── app/
    │   ├── (auth)/
    │   │   ├── login/page.tsx        ★ NEW
    │   │   └── register/page.tsx     ★ NEW
    │   ├── (dashboard)/
    │   │   ├── layout.tsx            ★ NEW
    │   │   ├── participant/
    │   │   │   ├── page.tsx          ★ NEW
    │   │   │   └── profile/page.tsx  ★ NEW
    │   │   └── company/
    │   │       ├── page.tsx          ★ NEW
    │   │       └── profile/page.tsx  ★ NEW
    │   ├── layout.tsx
    │   ├── providers.tsx
    │   └── page.tsx
    ├── entities/
    │   ├── user/                     # без изменений
    │   ├── task/                     # без изменений
    │   ├── participant/              ★ NEW
    │   └── company/                  ★ NEW
    ├── features/
    │   ├── auth/                     # + RegisterForm
    │   ├── participant-profile/      ★ NEW
    │   └── company-profile/          ★ NEW
    └── widgets/
        ├── header/                   # без изменений
        ├── navbar/                   ★ NEW (верхняя навигация)
        └── task-card/                # без изменений
```

---

## Критерии приёмки (Definition of Done)

Для каждой задачи:

- [ ] Модель создана (SQLAlchemy), миграция проходит
- [ ] Pydantic schemas описывают request/response
- [ ] Service-слой содержит бизнес-логику
- [ ] Router с корректными HTTP-статусами и ошибками
- [ ] Фронтенд: страница/форма работает, данные приходят с бэка
- [ ] Effector store (где нужно) обновляется
- [ ] React Query кэширует справочные данные
- [ ] Валидация через zod на формах
- [ ] Нет `any`, `@ts-ignore`, хардкода
- [ ] `ruff check .` и `pnpm lint:check` проходят

---

## Аудит (Checklist перед закрытием спринта)

- [ ] Пользователь регистрируется → получает токен → редирект в свой дашборд
- [ ] Пользователь входит → редирект в свой дашборд
- [ ] Участник может заполнить профиль (имя, город, навыки, GitHub)
- [ ] Компания может заполнить профиль (название, описание, стек)
- [ ] Справочник навыков возвращается с бэка
- [ ] Админ может создать навык/категорию
- [ ] Дашборд участника и компании — разные
- [ ] Неавторизованный пользователь редиректится на /login
- [ ] Пользователь компании не видит дашборд участника и наоборот
