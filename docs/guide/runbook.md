# Runbook

> Operations guide for the **Точка входа** platform.

---

## Local dev

```sh
docker compose up postgres redis -d   # DB only
cd backend && uvicorn app.main:app --reload
cd frontend && pnpm dev
```

---

## Migrations (Alembic)

```sh
cd backend
alembic revision --autogenerate -m "description"
alembic upgrade head
alembic downgrade -1                    # Rollback one step
alembic history                         # Show history
alembic current                         # Show current version
```

**Always** run after model changes:
```sh
alembic revision --autogenerate -m "message"
alembic upgrade head
```

---

## Quality checks (before commit)

### Frontend

```sh
cd frontend
pnpm typecheck
pnpm lint:check
pnpm build              # Optional: full build test
```

### Backend

```sh
cd backend
ruff check .
mypy app
pytest
```

---

## Docker production deploy

```sh
# 1. Configure
cp .env.prod.example .env.prod
# Edit .env.prod: secrets, passwords, domains

# 2. Deploy
docker compose -f docker-compose.prod.yml up -d

# 3. Check
curl http://localhost/health

# 4. Logs
docker compose -f docker-compose.prod.yml logs -f
docker compose -f docker-compose.prod.yml restart backend
```

---

## CI/CD (GitHub Actions)

`.github/workflows/deploy.yml`:

1. **quality** — ruff, mypy, typecheck, lint
2. **build** — Docker images → GHCR
3. **deploy** — SSH → pull images → migrate → restart

Trigger: push to `main`.

---

## Infrastructure

```
nginx :80/:443
  ├── /api/* → backend:8000 (FastAPI + uvicorn)
  └── /*     → frontend:3000 (Next.js)

backend → postgres:5432
backend → redis:6379
```

Nginx config: `infra/nginx/nginx.conf`

Features: reverse proxy, Gzip, security headers, rate limiting, SSL (certbot).

---

## Useful URLs

| Service | URL |
|---------|-----|
| Swagger UI | http://localhost:8000/docs |
| ReDoc | http://localhost:8000/redoc |
| Health | http://localhost:8000/health |
| Frontend | http://localhost:3000 |
| Mailhog | http://localhost:8025 |

---

## Logging

- Log level: `LOG_LEVEL=INFO` in `.env` (set to `DEBUG` for verbose)
- All services log to stdout via centralised `app/core/logging_config.py`
- HTTP requests are logged automatically: `POST /api/v1/tasks → 201 (5ms)`
- Docker: `docker compose logs -f [service]`
