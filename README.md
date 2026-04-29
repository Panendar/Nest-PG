# My_PG

My_PG is a PG discovery platform focused on reducing the offline effort students usually spend searching for accommodation. The current implementation is centered on the authenticated user journey: search listings, compare options, view details, save promising places, and contact owners from one workflow.

## Project Snapshot

- Product idea: centralize PG discovery, comparison, and owner contact.
- Current implementation focus: `user` module.
- Frontend: React + TypeScript + Vite + Chakra UI.
- Backend: FastAPI + SQLAlchemy + SQLite.
- Auth: JWT-based login and protected routes.
- Seeded demo data: users, owners, and sample PG listings across Hyderabad, Bengaluru, and Pune.

## What Is Implemented

The repository currently delivers the user-side discovery-to-contact flow:

- User registration and login
- City-based PG search
- Nearby/radius-based search
- Listing detail view
- Compare listings
- Contact owner flow with inquiry status lookup
- Saved listings
- Recent searches
- Empty-state and unavailable-listing recovery handling

Owner and admin capabilities are documented in `docs/`, but they are not the active implementation focus in this codebase yet.

## User Workflow

1. Register or log in.
2. Search PGs by city or by nearby radius.
3. Review listing cards, filters, and result states.
4. Open a listing to inspect price, amenities, availability, and inquiry readiness.
5. Compare shortlisted listings side by side.
6. Save listings for later or restore a recent search.
7. Contact the owner directly from the listing.
8. Revisit inquiry status when needed.

## How This Project Was Built

The repo shows a clear staged workflow rather than a single ad hoc build:

1. Product definition
   Core product intent, website structure, and success framing live under `docs/source/`.

2. Module planning
   The user module scope, requirements, flows, feature definitions, design system, and validation notes live under `docs/modules/user/prep/`.

3. Foundation setup
   The base architecture was established with routing, auth middleware, error handling, API client wiring, DB session setup, and seed data. See `docs/modules/user/build/foundation/foundation.md`.

4. Feature implementation
   The frontend and backend were built around the user module release scope recorded in `docs/modules/user/build/releases.json`.

5. Verification
   Backend API coverage is in `backend/tests/test_api.py`, and the frontend has a production build pipeline through Vite.

6. Deployment review
   The latest deployment note is in `docs/modules/user/build/deploy-log.md`. As of `2026-04-27`, local validation passed, but production deployment was blocked because a safe production target/config is not present in the repository.

## Architecture

### Frontend

- React Router drives public and authenticated routes.
- Chakra UI handles the component system and styling.
- Axios provides API access.
- Context-based auth/UI state manages tokens, session state, loading, and toasts.

Key routes:

- `/login`
- `/register`
- `/app/search`
- `/app/listings/:listingId`
- `/app/compare`
- `/app/saved`
- `/app/recent-searches`

### Backend

- FastAPI exposes versioned REST endpoints under `/api/v1`.
- SQLAlchemy manages SQLite models and sessions.
- App startup creates tables and seeds baseline data.
- JWT middleware protects authenticated API areas.

Main endpoint groups:

- `/api/v1/auth`
- `/api/v1/listings`
- `/api/v1/contacts`
- `/api/v1/saved-listings`
- `/api/v1/recent-searches`
- `/api/v1/searches`
- `/api/v1/health`

## Tech Stack

| Layer | Stack |
| --- | --- |
| Frontend | React 18, TypeScript, Vite, Chakra UI, Axios |
| Backend | FastAPI, Pydantic, SQLAlchemy |
| Database | SQLite |
| Auth | JWT bearer tokens |
| Tooling | Pytest, Alembic, npm, Vite build |

## Repository Structure

```text
My_PG/
|- backend/        FastAPI app, DB models, seed data, tests
|- frontend/       React app, routes, pages, API client
|- docs/           Product, module, build, and deployment documentation
```

## Local Setup

### Backend

From `backend/`:

```powershell
python -m venv .venv
.venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn app.main:app --reload
```

Default backend config is loaded from environment variables with safe local defaults in `backend/app/core/config.py`.

Useful variables:

- `DATABASE_URL`
- `JWT_SECRET_KEY`
- `CORS_ALLOW_ORIGINS`
- `DEFAULT_USER_EMAIL`
- `DEFAULT_USER_PASSWORD`
- `DEFAULT_ADMIN_EMAIL`
- `DEFAULT_ADMIN_PASSWORD`

### Frontend

From `frontend/`:

```powershell
npm install
npm run dev
```

By default, the frontend expects the API on a local FastAPI server and uses the shared Axios client in `frontend/src/api/client.ts`.

## Validation

Backend:

```powershell
cd backend
pytest
```

Frontend:

```powershell
cd frontend
npm run build
```

## Current Status

- The implemented release scope is the user module.
- Local development, seeded data, API tests, and frontend build are in place.
- Production deployment is not configured end-to-end in this repository yet.

## Known Gaps

- Password hashing currently uses a placeholder SHA-256 approach and should be upgraded for production.
- SQLite is appropriate for local development and small-scale use, but not as a long-term scaling choice.
- Owner management, moderation, and broader platform operations are documented but not fully implemented here.
- Deployment target/configuration still needs to be defined before a safe production push.

## Documentation Map

- Product overview: `docs/source/about.md`
- Website structure: `docs/source/website.md`
- User module scope: `docs/modules/user/module.md`
- User prep artifacts: `docs/modules/user/prep/`
- Foundation summary: `docs/modules/user/build/foundation/foundation.md`
- API conventions: `docs/modules/user/build/api/internal/info.md`
- DB model notes: `docs/modules/user/build/dbmodel/SQLite/info.md`
- Deployment log: `docs/modules/user/build/deploy-log.md`

## Summary

This repository is best understood as a well-documented PG platform build with a completed user-module MVP path: authenticate, discover listings, compare them, save useful context, and contact owners directly. The docs show the product thinking behind the implementation, and the code shows that the core user journey is already working locally.
