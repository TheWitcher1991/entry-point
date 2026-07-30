# Quick Start

> Get the platform running in 5 minutes.

---

## Requirements

- Docker Desktop (or Docker Compose plugin)
- Node.js 22+
- Python 3.12+
- pnpm (`npm install -g pnpm`)

---

## Option A: Docker (full stack, 1 command)

```sh
docker compose up -d

# Frontend:  http://localhost:3000
# Backend:   http://localhost:8000
# API docs:  http://localhost:8000/docs
# Mailhog:   http://localhost:8025
```

---

## Option B: Local development

### 1. Start databases

```sh
docker compose up postgres redis -d
```

### 2. Backend

```sh
cd backend
python -m venv .venv
# Windows: .venv\Scripts\activate
source .venv/bin/activate
pip install -e ".[dev]"

# .env already exists with dev defaults

alembic upgrade head
uvicorn app.main:app --reload
# → http://localhost:8000
```

### 3. Frontend

```sh
cd frontend
pnpm install
pnpm dev
# → http://localhost:3000
```

---

## Seed data

```sh
cd backend
python -m app.seed
```

Creates:

- **Companies:** company1@example.com, company2@example.com, company3@example.com (password: `test123!`)
- **Participants:** participant1@example.com, participant2@example.com, participant3@example.com (password: `test123!`)
- 6 tasks with skills, 6 applications, 4 submissions, 2 reviews

Admin account (inserted directly):
| Email | Password |
|-------|----------|
| admin@talentpot.ru | admin123 |

---

## Verify

```sh
# Health check
curl http://localhost:8000/health
# → {"status": "ok"}

# API
curl http://localhost:8000/api/v1/stats
# → {"active_tasks": 0, "companies": 0, "participants": 0}
```
