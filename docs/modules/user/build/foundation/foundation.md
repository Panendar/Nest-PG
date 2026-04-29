# Foundation Implementation Summary (User Module)

## What was implemented

- Authentication middleware: JWT verification on protected endpoints, user context attachment, 401/403 handling with role guard support.
- Router and layout setup: public vs authenticated route tree, auth guard redirect, base shell with header/sidebar/content and placeholder feature routes.
- Global error handling: FastAPI centralized exception handlers with standard error payload and request-context logging; frontend root ErrorBoundary.
- API client configuration: Axios instance with env-driven base URL, bearer token injection, 401 logout+redirect, network error toast hook.
- Base store structure: React Context stores for auth (`user`, `token`, `isAuthenticated`) and UI (`globalLoading`, `toasts`) with required actions.
- Database connection/session setup: SQLAlchemy engine/session factory from env, SQLite FK pragma enforcement, DB dependency function.
- Seed data script: idempotent seed for baseline roles and default admin user from environment variables.

## Component locations

- Backend app bootstrap: `backend/app/main.py`
- Backend auth middleware and auth dependencies: `backend/app/core/security.py`
- Backend global error handlers: `backend/app/core/errors.py`
- Backend settings/env config: `backend/app/core/config.py`
- Backend DB session/engine: `backend/app/db/session.py`
- Backend base metadata/model shell: `backend/app/db/base.py`, `backend/app/db/models.py`
- Backend seed script: `backend/app/db/seed.py`
- Alembic migration configuration baseline: `backend/alembic.ini`, `backend/alembic/env.py`

- Frontend app entry and providers: `frontend/src/main.tsx`
- Frontend app wiring/interceptor bridge: `frontend/src/App.tsx`
- Frontend router and protected layout hierarchy: `frontend/src/router.tsx`, `frontend/src/layouts/AppLayout.tsx`
- Frontend auth guard and root error boundary: `frontend/src/components/AuthGuard.tsx`, `frontend/src/components/ErrorBoundary.tsx`
- Frontend API client/interceptors: `frontend/src/api/client.ts`
- Frontend global state stores: `frontend/src/state/AuthContext.tsx`, `frontend/src/state/UIContext.tsx`
- Frontend placeholder base pages: `frontend/src/pages/LoginPage.tsx`, `frontend/src/pages/DashboardPage.tsx`, `frontend/src/pages/NotFoundPage.tsx`

## How to run the seed script

1. Set environment variables for backend:
   - `DATABASE_URL`
   - `JWT_SECRET_KEY`
   - `DEFAULT_ADMIN_EMAIL`
   - `DEFAULT_ADMIN_PASSWORD`
2. Run seed script from project root:
   - `python -m backend.app.db.seed`

## Foundation decisions for feature tranches

- All protected backend endpoints should be mounted under `/api/v1/protected` or another prefix included in middleware-protected prefixes.
- Standard API error contract is always `{ "error": { code, message, details, request_id } }`.
- Route-level role checks should use `require_roles([...])` dependency to keep authorization logic explicit.
- Frontend authentication boundary is enforced at route level with `AuthGuard`; feature routes should live under `/app/*`.
- Frontend HTTP calls should use shared Axios instance from `frontend/src/api/client.ts` only.
- Feature-level state should remain local or feature-scoped; do not expand global store with feature business state.

## Assumptions to validate with architect

- Password hashing in seed script currently uses SHA-256 placeholder; production auth should switch to a stronger password hashing strategy (for example bcrypt/argon2).
- Protected path convention `/api/v1/protected/*` is adopted for middleware-based auth checks.
- Initial role model includes only `admin` and `user`; additional roles/permissions may be required before admin features.
- Frontend redirect target after unauthorized response is always `/login`.
- Current scaffold introduces new top-level `backend` and `frontend` directories because no runtime source tree existed yet.
