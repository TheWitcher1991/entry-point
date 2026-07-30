# RUNBOOK — Точка входа

## Локальный запуск

### Требования

- Python 3.12+
- Node.js 22+
- pnpm
- PostgreSQL 16
- Redis 7

### 1. База данных

```bash
# PostgreSQL (если не через Docker)
createdb entrypoint

# Redis
redis-server
```

Или через Docker (только БД):
```bash
docker compose up postgres redis -d
```

### 2. Бэкенд

```bash
cd backend

# Виртуальное окружение
python -m venv .venv
source .venv/bin/activate

# Зависимости
pip install -e ".[dev]"

# или через uv
uv sync

# Файл .env (если нет — скопировать пример)
cp .env.example .env
# .env по умолчанию подходит для локальной разработки

# Миграции
alembic upgrade head

# Seed-данные (3 компании, 3 участника, 6 задач, заявки, сабмиты, отзывы)
python -m app.seed

# Запуск dev-сервера
uvicorn app.main:app --reload
# → http://localhost:8000
# → Swagger: http://localhost:8000/docs
```

### 3. Фронтенд

```bash
cd frontend

# Установка зависимостей
pnpm install

# Запуск dev-сервера
pnpm dev
# → http://localhost:3000
```

### 4. Docker (полный стенд)

```bash
# Dev-стенд (hot-reload)
docker compose up -d

# Prod-стенд
docker compose -f docker-compose.prod.yml up -d
```

---

## Миграции (Alembic)

```bash
cd backend
source .venv/bin/activate

# Создать новую миграцию (авто — сравнивает models с БД)
alembic revision --autogenerate -m "описание изменений"

# Применить все миграции до последней
alembic upgrade head

# Откатиться на одну миграцию назад
alembic downgrade -1

# Откатиться до конкретной ревизии
alembic downgrade <revision_id>

# Просмотреть историю
alembic history

# Проверить текущую версию
alembic current
```

**Важно:** после изменения моделей SQLAlchemy всегда запускай:
```bash
alembic revision --autogenerate -m "message"
alembic upgrade head
```

---

## Seed-данные

```bash
cd backend
source .venv/bin/activate

# Залить seed-данные (идиempotent — безопасно запускать多次)
python -m app.seed
```

Seed создаёт:
- **3 компании**: ООО «ТехноПрогресс», CloudScale, DataBridge
- **3 участника**: Анна Смирнова, Дмитрий Волков, Елена Павлова
- **6 задач** (разные статусы, категории, сложность)
- **Заявки, участия, сабмиты** (для демо-цикла)
- **Отзывы** на выполненные работы
- **Справочники**: Skills (12 шт), Categories (4 шт)

Логины для входа после seed:

| Email | Пароль | Роль |
|-------|--------|------|
| admin@talentpot.ru | admin123 | Admin |
| company@talentpot.ru | company123 | Company |
| participant@talentpot.ru | participant123 | Participant |

---

## Проверка качества (перед коммитом)

### Фронтенд

```bash
cd frontend

# TypeScript
pnpm typecheck

# Линтер
pnpm lint:check

# Авто-фикс
pnpm lint

# Билд
pnpm build
```

### Бэкенд

```bash
cd backend
source .venv/bin/activate

# Линтер
ruff check .

# Авто-фикс
ruff check . --fix

# Typecheck
mypy app

# Тесты
pytest
```

---

## Production-деплой

### Docker Compose (на сервере)

```bash
# На сервере скопировать .env.prod и настроить
cp .env.prod.example .env.prod
# Отредактировать .env.prod: пароли, секреты, домены

# Запустить
docker compose -f docker-compose.prod.yml up -d

# Проверить
curl http://localhost/health

# Посмотреть логи
docker compose -f docker-compose.prod.yml logs -f

# Перезапустить один сервис
docker compose -f docker-compose.prod.yml restart backend
```

### CI/CD (GitHub Actions)

Рабочий процесс в `.github/workflows/deploy.yml`:
1. **quality** — ruff, typecheck, lint
2. **build** — сборка Docker-образов, пуш в GHCR
3. **deploy** — SSH на сервер, pull образов, миграции, рестарт

Триггер: push в `main`.

### Nginx

Конфиг: `infra/nginx/nginx.conf`

- Reverse proxy: `/api/ → backend:8000`, `/ → frontend:3000`
- Gzip, security headers, rate limiting
- SSL termination (настраивается отдельно через certbot)

---

## Архитектура

```
nginx :80/:443
  ├── /api/* → backend:8000 (FastAPI + uvicorn)
  └── /* → frontend:3000 (Next.js)

backend → postgres:5432
backend → redis:6379
```

---

## Полезные ссылки

| Что | URL |
|-----|-----|
| Swagger UI | http://localhost:8000/docs |
| ReDoc | http://localhost:8000/redoc |
| Health check | http://localhost:8000/health |
| Фронтенд | http://localhost:3000 |
| Mailhog (email) | http://localhost:8025 |
