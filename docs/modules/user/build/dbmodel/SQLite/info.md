# Database Info (User Module)

## Type and Version

- Type: SQLite
- Version: SQLite 3

## Purpose

Stores user-module operational data for discovery-to-contact workflows: authenticated users, PG listings, user inquiries, saved listings, and recent search context.

## Managed By

- Hosting platform: Azure App Service (Linux)
- Storage model: SQLite file on persistent backend volume

## Migration Tool

- Alembic (1.13+)

## Connection

- Environment variable: `DATABASE_URL`
- Example format (no real value): `sqlite:///./app.db`

## Conventions

- Naming: `snake_case` for tables and columns.
- Primary keys: `id` as text UUID where possible for cross-service safety.
- Foreign keys: explicit FK columns with indexed relationships.
- Soft delete: `deleted_at` nullable UTC timestamp for user-facing recoverable entities (`saved_listings`, `recent_searches`, `contacts` optional).
- Timestamps: UTC ISO-8601 semantics via `created_at` and `updated_at`.
- SQLite rules:
  - Enable `PRAGMA foreign_keys=ON`.
  - Use Alembic for all schema changes; avoid direct production schema edits.
  - Keep write transactions short to reduce lock contention.
