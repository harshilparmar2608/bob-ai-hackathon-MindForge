# CampusPilot Backend

Production-oriented FastAPI backend for CampusPilot, structured with **Clean Architecture**, a **Repository Pattern**, and a **Service Layer**.

> Scaffold only — no API routes, models, or business logic are implemented yet.

## Stack

| Concern | Technology |
|--------|------------|
| Runtime | Python 3.12 |
| API | FastAPI |
| Validation | Pydantic v2 |
| ORM | SQLAlchemy 2.0 |
| Migrations | Alembic |
| Dev DB | SQLite (async via aiosqlite) |
| Prod DB | PostgreSQL (async via asyncpg) |
| Auth | JWT (python-jose + passlib) |
| AI (future) | IBM Granite |

## Architecture

```
backend/
├── app/
│   ├── api/              # Presentation — HTTP routers & dependencies
│   ├── core/             # Config, security, logging, shared exceptions
│   ├── db/               # Engine, session, declarative base
│   ├── domain/           # Entities, enums, interfaces (innermost)
│   ├── models/           # SQLAlchemy ORM models (infrastructure)
│   ├── schemas/          # Pydantic request/response DTOs
│   ├── repositories/     # Data access (Repository Pattern)
│   ├── services/         # Application / use-case layer
│   ├── integrations/     # External systems (IBM Granite, …)
│   ├── middleware/       # Cross-cutting HTTP middleware
│   └── utils/            # Pure helpers
├── alembic/              # Database migrations
├── tests/                # Unit, integration, API tests
└── scripts/              # Ops / seed utilities
```

**Dependency rule (inward):**

`api` → `services` → `domain` ← `repositories` ← `db` / `integrations`

- Domain has no outward dependencies.
- Services orchestrate use cases; they do not talk to HTTP or SQL directly.
- Repositories implement domain interfaces against SQLAlchemy.
- API endpoints only depend on services (via FastAPI deps).

## Quick start (when implementation begins)

```bash
cd backend
python -m venv .venv

# Windows
.venv\Scripts\activate

# macOS / Linux
source .venv/bin/activate

pip install -r requirements.txt
pip install -e ".[dev]"

cp .env.example .env
# Edit SECRET_KEY and DATABASE_URL as needed

# Migrations (after models exist)
alembic upgrade head

# Run API
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

## Environment

See [`.env.example`](.env.example). Key variables:

- `DATABASE_URL` — SQLite for local; `postgresql+asyncpg://…` for production
- `SECRET_KEY` — required for JWT; use a long random value in production
- `CORS_ORIGINS` — frontend origins
- `GRANITE_*` — reserved for IBM Granite integration

## Quality tooling

Configured in `pyproject.toml`:

- **Ruff** — lint + format
- **mypy** — strict typing
- **pytest** — async tests + coverage

```bash
ruff check app tests
ruff format app tests
mypy app
pytest
```

## Production notes

- Prefer PostgreSQL with connection pooling (`DATABASE_POOL_*`).
- Set `APP_ENV=production`, `APP_DEBUG=false`, `RELOAD=false`.
- Run behind a reverse proxy with TLS; use multiple uvicorn workers.
- Never commit `.env`; rotate `SECRET_KEY` and Granite credentials securely.
- Apply migrations with Alembic as part of deploy (`alembic upgrade head`).

## Status

This repository path currently contains the **folder layout and placeholder modules only**. Implementation of models, repositories, services, and API endpoints is intentionally deferred.
