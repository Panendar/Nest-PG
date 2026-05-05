## Base URLs

- Dev: `https://api-dev.example.com/api/v1`
- Staging: `https://api-staging.example.com/api/v1`
- Prod: `https://api.example.com/api/v1`

## Version Strategy

- The API is versioned in the URL path, starting at `/api/v1`.
- Non-breaking additions may be introduced within `v1`.
- Breaking changes require a new version path such as `/api/v2`.
- Deprecated `v1` endpoints should remain available through a published migration window before removal.

## Authentication

- Mechanism: OAuth2 password flow with JWT bearer tokens.
- Token obtain path: shared platform auth endpoint such as `POST /api/v1/auth/login`.
- Header format: `Authorization: Bearer <access_token>`.
- Token TTL: 60 minutes for access tokens unless overridden by platform auth policy.
- Owner-page endpoints require an authenticated user with the Owner role.

## Content Type

- Requests: `application/json`
- Responses: `application/json`
- Media upload requests may use `multipart/form-data` when files are sent directly through the API.

## Standard Error Response Format

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Please review the highlighted fields and try again.",
    "details": [
      {
        "field": "pg_name",
        "message": "PG name is required."
      }
    ],
    "request_id": "req_1234567890"
  }
}
```

## Common HTTP Status Codes

- `200 OK`: Request succeeded and returned data.
- `201 Created`: Resource was created successfully.
- `204 No Content`: Delete-like action succeeded with no response body.
- `400 Bad Request`: Request payload or query params failed validation.
- `401 Unauthorized`: Missing, expired, or invalid bearer token.
- `403 Forbidden`: Authenticated user lacks Owner access or ownership of the target listing.
- `404 Not Found`: Target listing or media item does not exist.
- `409 Conflict`: Request conflicts with current resource state.
- `413 Payload Too Large`: Uploaded media exceeds allowed limits.
- `422 Unprocessable Entity`: Framework-level validation failed for a structurally correct request.
- `500 Internal Server Error`: Unexpected backend failure.
- `503 Service Unavailable`: Temporary outage affecting storage or API availability.

## Pagination Convention

- Query params:
  - `page`: 1-based page number, default `1`
  - `page_size`: items per page, default `20`, max `100`
- Response shape:

```json
{
  "items": [],
  "pagination": {
    "page": 1,
    "page_size": 20,
    "total_items": 0,
    "total_pages": 0
  }
}
```
