# Domain: Recent Searches (Optional)

## GET /api/v1/recent-searches

- What it does: Returns recent searches for quick restoration.
- Auth: Required.
- Query params:
  - `page`: integer (optional)
  - `page_size`: integer (optional)
- Response shape (key fields):
  - `items[]`: `id`, `city`, `radius_km`, `filters`, `sort`, `searched_at`
  - `pagination`: standard pagination object
- Relevant error codes: `401`, `403`, `500`, `503`.

## POST /api/v1/recent-searches

- What it does: Records a completed search context as a recent item.
- Auth: Required.
- Request body:
  - `city`: string (optional)
  - `radius_km`: integer (optional)
  - `filters`: object (optional)
  - `sort`: string (optional)
- Response shape (key fields):
  - `id`, `searched_at`
- Relevant error codes: `400`, `401`, `403`, `409`, `429`, `500`.

## DELETE /api/v1/recent-searches/{recent_search_id}

- What it does: Removes one recent search record.
- Auth: Required.
- Query params/body: none.
- Response shape (key fields):
  - no body (`204`)
- Relevant error codes: `401`, `403`, `404`, `429`, `500`.
