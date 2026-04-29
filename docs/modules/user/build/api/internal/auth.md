# Domain: Auth

## POST /api/v1/auth/token

- What it does: Exchanges user credentials for access and refresh tokens.
- Auth: Not required.
- Request body:
  - `email`: string
  - `password`: string
- Response shape (key fields):
  - `access_token`: string
  - `refresh_token`: string
  - `token_type`: "bearer"
  - `expires_in`: integer (seconds)
- Relevant error codes: `400`, `401`, `429`, `500`.

## GET /api/v1/auth/me

- What it does: Returns current authenticated user identity and role.
- Auth: Required.
- Query params/body: none.
- Response shape (key fields):
  - `id`: string
  - `email`: string
  - `role`: string
  - `is_active`: boolean
- Relevant error codes: `401`, `403`, `500`.
