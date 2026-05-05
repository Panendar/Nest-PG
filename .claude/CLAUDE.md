# CLAUDE.md

## Project Context

- Project: My_PG
- Module: User
- Scope: Authenticated user discovery-to-contact journey for PG listings.

## Module Purpose

This module helps PG seekers discover, evaluate, compare, and contact owners in one place. It replaces fragmented offline searching with a centralized workflow: search by city or nearby radius, inspect listing details, compare options, and send inquiries.

## Primary User

- Persona: User (authenticated seeker)
- Goal: Find suitable PG options quickly and contact the right owner with confidence.

## In Scope

- City search and nearby radius search
- Listing detail view
- Compare listings
- Contact owner flow
- Empty-state recovery paths
- Optional convenience features: saved listings, recent searches

## Out of Scope

- Owner listing management
- Admin moderation/operations
- Anonymous access to full listing details or direct owner contact

## Technology Stack

### Frontend

- Framework: React 18
- Language: TypeScript 5
- UI: Chakra UI 2
- Styling: Chakra styling system
- State: React Context + useState
- Forms: react-hook-form 7 + zod 3
- HTTP: axios 1
- Routing: react-router-dom 6

### Backend

- Framework: FastAPI 0.11x
- Language: Python 3.12
- ORM: SQLAlchemy 2
- Auth: OAuth2PasswordBearer with JWT bearer tokens
- Validation: Pydantic 2

### Data

- Primary DB: SQLite 3
- Migrations: Alembic 1.13+
- Cache: none

### Hosting

- Frontend: Vercel
- Backend: Azure App Service (Linux)
- Database storage: SQLite file on backend persistent volume

## API Conventions

- Base path: /api/v1
- Auth header: Authorization: Bearer <token>
- Request/response content type: application/json
- Standard pagination: page, page_size with pagination object in response
- Common status codes: 200/201/204, 400, 401, 403, 404, 409, 422, 429, 500, 503

## Data Model Conventions

- snake_case table and column names
- Primary keys: text UUID-style IDs where applicable
- UTC timestamps: created_at, updated_at
- Soft delete where applicable: deleted_at nullable timestamp
- Enable SQLite foreign keys: PRAGMA foreign_keys=ON

## Build Priorities

1. Keep flows user-centric and consistent with prep artifacts.
2. Preserve authentication boundaries on protected actions.
3. Keep optional features isolated; do not block core discovery-to-contact path.
4. Prefer simple, maintainable implementation over extra abstraction.

## Feature Mapping (Current Module)

- Core: search-by-city, nearby-radius-search, listing-detail-view, filter-and-sort-results, compare-listings, contact-owner-from-listing
- Supporting: inquiry-confirmation-and-status, empty-state-recovery
- Optional: saved-listings-optional, search-history-recent-searches-optional

## Guardrails for Changes

- Do not introduce owner/admin workflows in this module.
- Do not add unauthenticated direct contact paths.
- Keep API and DB naming consistent with current conventions.
- Keep docs and implementation in sync when introducing new fields or endpoints.

## Known Gaps to Respect

- Success metrics are directional; numeric targets are not finalized yet.
- Optional features are defined but may be phased after core flow delivery.

## Definition of Done (Module-Level)

- User can complete search -> detail -> compare -> contact without dead ends.
- Error and empty states provide clear recovery actions.
- Protected actions require valid authentication.
- Data and API contracts stay consistent across frontend, backend, and docs.


## Project Context

- Project: My_PG
- Module: Owner page
- Scope: Owner-side PG listing management for publish, update, media, and availability workflows.

## Module Purpose

This module helps PG owners keep listings visible, accurate, and inquiry-ready. It covers the supply-side workflow to create listings, maintain property details, manage listing photos, and keep availability current so seekers can rely on the marketplace data.

## Primary User

- Persona: Owner
- Goal: Publish and maintain trustworthy PG listings that generate credible user inquiries.

## In Scope

- Owner listings overview and selection
- Create PG listing
- Update listing details
- Manage listing media
- Update listing availability

## Out of Scope

- Anonymous browsing and conversion flows
- User-side search, comparison, shortlist, and contact journeys
- Admin moderation, governance, and marketplace operations

## Technology Stack

### Frontend

- Framework: React 19.2
- Language: TypeScript 6.0
- UI: Chakra UI 3
- Styling: Chakra UI styling system
- State: React Context + useState
- Forms: react-hook-form 7 + zod 4
- HTTP: axios 1.15
- Routing: react-router-dom 7

### Backend

- Framework: FastAPI 0.135
- Language: Python 3.13
- ORM: SQLAlchemy 2.0
- Auth: OAuth2PasswordBearer with JWT bearer tokens
- Validation: Pydantic 2.12

### Data

- Primary DB: SQLite 3
- Migrations: Alembic 1.18
- Cache: none
- Media storage: Azure Blob Storage

### Hosting

- Frontend: Vercel
- Backend: Azure App Service (Linux)
- Database storage: SQLite file on backend persistent volume

## API Conventions

- Base path: `/api/v1`
- Auth header: `Authorization: Bearer <token>`
- Request/response content type: `application/json`
- Media upload content type: `multipart/form-data`
- Standard pagination: `page`, `page_size`, and `pagination` object in responses
- Common status codes: `200`, `201`, `204`, `400`, `401`, `403`, `404`, `409`, `413`, `422`, `500`, `503`

## Data Model Conventions

- snake_case table and column names
- Primary keys: integer `id` columns
- Foreign keys: `<entity>_id`
- UTC timestamps: `created_at`, `updated_at`
- Soft delete where needed: `deleted_at` nullable timestamp
- SQLite foreign keys must be enabled
- Media binaries are not stored in SQLite; only metadata and storage references are stored

## Build Priorities

1. Keep owner workflows fast and low-friction.
2. Preserve ownership and authentication boundaries on every protected action.
3. Keep listing data fresh enough for user discovery to remain trustworthy.
4. Prefer simple implementation over extra abstraction.

## Feature Mapping

- Core: create-pg-listing, update-listing-details, maintain-listing-media, update-availability-status

## Guardrails for Changes

- Do not introduce user-discovery or admin-moderation workflows in this module.
- Do not expose listing management endpoints to non-owner users.
- Keep API, DB, and media-storage contracts aligned when adding fields.
- Keep docs in sync with implementation when changing owner flows or business fields.

## Known Gaps to Respect

- Success metrics are not finalized with numeric targets yet.
- Owner listings overview is shared scaffolding and not yet documented as a separate feature.
- Unsaved-changes confirmation copy is still not defined in prep content.

## Definition of Done

- Owner can create a listing, edit it, manage photos, and update availability without dead ends.
- All protected actions require valid owner authentication and ownership checks.
- Listing and media data stay consistent across frontend, backend, API docs, and DB model docs.
- Error states provide clear recovery paths for save, upload, and permission failures.
