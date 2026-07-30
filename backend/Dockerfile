# ─── Builder stage ───
FROM python:3.12-alpine AS builder

WORKDIR /app

# Install build dependencies
RUN apk add --no-cache gcc musl-dev postgresql-dev

COPY pyproject.toml .
RUN pip install --no-cache-dir build && python -m build --wheel


# ─── Production stage ───
FROM python:3.12-alpine AS prod

WORKDIR /app

# Install runtime system dependencies
RUN apk add --no-cache libpq

# Copy and install wheel
COPY --from=builder /app/dist/*.whl /tmp/
RUN pip install --no-cache-dir /tmp/*.whl

# Copy application code
COPY app/ app/
COPY alembic/ alembic/
COPY alembic.ini .

# Create non-root user
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

EXPOSE 8000

# Auto-run migrations on start + start uvicorn with workers
CMD alembic upgrade head && \
    uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4 --proxy-headers
