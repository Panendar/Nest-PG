# Internal API Conventions (User Module)

## Base URLs

- Dev: `https://api-dev.example.com/user`
- Staging: `https://api-staging.example.com/user`
- Prod: `https://api.example.com/user`

## Version Strategy

- Current version path prefix: `/api/v1`
- Non-breaking changes: additive fields and new optional params in `v1`.
- Breaking changes: released under a new major path (for example `/api/v2`) with parallel support during migration.

## Authentication

- Mechanism: OAuth2 password flow with JWT bearer tokens.
- Token issue endpoint: `POST /api/v1/auth/token`.
- Header format: `Authorization: Bearer <access_token>`.
- Token TTL:
  - Access token: 60 minutes
  - Refresh token: 7 days

## Content Type

- Request: `application/json`
- Response: `application/json`

## Standard Error Response

All error responses return the following JSON shape:

```json
{
  "error": {
    "code": "string",
    "message": "human readable message",
    "details": {},
    "request_id": "string"
  }
}
```

## Common HTTP Status Codes

- `200` OK: successful read/update operation.
- `201` Created: successful resource creation.
- `204` No Content: successful delete operation.
- `400` Bad Request: invalid request shape or parameter values.
- `401` Unauthorized: missing/invalid token.
- `403` Forbidden: token valid but operation not allowed.
- `404` Not Found: requested resource does not exist.
- `409` Conflict: duplicate or conflicting business state.
- `422` Unprocessable Entity: validation passed structurally but business-rule failure.
- `429` Too Many Requests: request rate exceeded.
- `500` Internal Server Error: unexpected server-side failure.
- `503` Service Unavailable: temporary backend outage.

## Pagination Convention

- Query params:
  - `page` (1-based, default `1`)
  - `page_size` (default `20`, max `50`)
- Response shape:

```json
{
  "items": [],
  "pagination": {
    "page": 1,
    "page_size": 20,
    "total_items": 0,
    "total_pages": 0,
    "has_next": false,
    "has_prev": false
  }
}
```
