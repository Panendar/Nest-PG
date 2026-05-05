## Type and Version

- Database: SQLite 3

## Purpose

- Stores owner-managed PG listing records and the media attached to those listings.
- Supports the owner-page workflows for creating listings, updating listing details, managing photos, and maintaining current availability.

## Managed By

- Azure App Service (Linux) persistent backend volume

## Migration Tool

- Alembic 1.18

## Connection

- Environment variable: `DATABASE_URL`

## Conventions

- Table names use plural snake_case.
- Primary keys use a single `id` column with SQLite integer primary key semantics.
- Foreign keys use `<entity>_id` naming in snake_case.
- Timestamps are stored in UTC using ISO 8601-compatible datetime values.
- Soft delete uses nullable `deleted_at` timestamps instead of `is_deleted` flags for recoverable business records.
- Business enums such as listing status and availability status are stored as constrained text values.
- Media binary files do not live in SQLite; the database stores only metadata and external storage references.
