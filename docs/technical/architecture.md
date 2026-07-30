# Architecture

> Full-stack architecture for the **Точка входа** platform.

---

## Overview

```
Browser → Next.js (App Router)
              ↓
         FastAPI (REST API)
              ↓
    PostgreSQL 16 + Redis 7
```

The frontend and backend are **independent services** communicating over HTTP/JSON.
No server-side rendering for authenticated pages — the frontend is a SPA with API calls.

---

## Frontend: Feature-Sliced Design

```
app/        ─── Pages, routing, providers
  ↓
widgets/    ─── Complex blocks (Header, Footer, TaskCard)
  ↓
features/   ─── User scenarios (Auth, TaskSubmit, ProfileEdit)
  ↓
entities/   ─── Business entities (User, Task, Company, Review)
  ↓
shared/     ─── API client, UI kit, icons, utilities
```

### Import rules

| Layer | Can import from |
|-------|----------------|
| `shared` | — |
| `entities` | `shared` |
| `features` | `entities`, `shared` |
| `widgets` | `features`, `entities`, `shared` |
| `app` | any layer |

### State management

| Concern | Tool |
|---------|------|
| Server state (API data) | `@tanstack/react-query` |
| Client state (auth token, theme) | `effector` |

### Forms

- `react-hook-form` for complex forms
- `zod` for validation schemas (shared with API types)

---

## Backend: Modular Monolith

```
app/
├── core/          ─── Infrastructure (config, DB engine, JWT, dependencies)
├── services/      ─── Domain modules (each is self-contained)
│   ├── auth/
│   ├── users/
│   ├── participants/
│   ├── companies/
│   ├── tasks/          ─── Tasks CRUD + submissions
│   ├── applications/   ─── Applications from participants
│   ├── participations/ ─── Task-participant bindings
│   ├── reviews/
│   ├── notifications/  ─── In-app + email notifications
│   ├── directories/    ─── Skills & categories reference data
│   └── admin/
└── main.py        ─── FastAPI app factory
```

### Service structure

Each service in `services/<name>/` follows the same pattern:

| File | Responsibility |
|------|----------------|
| `models.py` | SQLAlchemy model(s) |
| `schemas.py` | Pydantic request/response schemas |
| `service.py` | Business logic (no HTTP awareness) |
| `router.py` | FastAPI `APIRouter` with route handlers |

### Rules

- **Services never import each other directly.** Cross-module data is accessed through models or injected via `core`.
- **Core has no business logic.** It provides infrastructure: database engine, security, configuration.
- **Statuses are plain strings** (not enums). Validated by regex in Pydantic schemas where needed.

---

## Data flow (submission cycle)

```
1. Company creates task          → /api/v1/tasks (POST)
2. Participant applies           → /api/v1/applications (POST)
3. Company approves              → /api/v1/applications/{id}/status (PATCH)
4. Participation auto-created    → service layer
5. Participant submits work      → /api/v1/tasks/{id}/submit (POST)
6. Company reviews               → /api/v1/tasks/{id}/submissions/{id}/review (PATCH)
7. Review auto-creates           → service layer
8. Participant gets confirmed    → /api/v1/participants/me/completed (GET)
```

---

## Auth

| Component | Detail |
|-----------|--------|
| Algorithm | HS256 (JWT) |
| Token expiry | 24 hours (configurable) |
| Storage | `localStorage`, sent via `Authorization: Bearer <token>` |
| Password hash | bcrypt via `passlib` |
| Roles | `participant`, `company`, `admin` — checked via `Depends(get_current_user)` |

---

## Testing

| Layer | Tool | Target |
|-------|------|--------|
| Backend integration | `pytest` + `httpx` + `aiosqlite` | All API endpoints |
| Frontend unit | `vitest` | Components, hooks |
| Frontend type check | `tsc --noEmit` | Full TS project |

Backend tests auto-detect PostgreSQL; fall back to SQLite (`aiosqlite`) when Postgres is unavailable.
