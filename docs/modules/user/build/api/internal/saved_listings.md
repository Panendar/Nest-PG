# Domain: Saved Listings (Optional)

## GET /api/v1/saved-listings

- What it does: Returns the current user's saved listing collection.
- Auth: Required.
- Query params:
  - `page`: integer (optional)
  - `page_size`: integer (optional)
- Response shape (key fields):
  - `items[]`: `id` (saved item ID), `listing_id`, `saved_at`, `listing_summary`
  - `pagination`: standard pagination object
- Relevant error codes: `401`, `403`, `500`, `503`.

## POST /api/v1/saved-listings

- What it does: Saves one listing for the current user.
- Auth: Required.
- Request body:
  - `listing_id`: string
- Response shape (key fields):
  - `id`, `listing_id`, `saved_at`
- Relevant error codes: `400`, `401`, `403`, `404`, `409`, `429`, `500`.

## DELETE /api/v1/saved-listings/{saved_listing_id}

- What it does: Removes one saved listing entry.
- Auth: Required.
- Query params/body: none.
- Response shape (key fields):
  - no body (`204`)
- Relevant error codes: `401`, `403`, `404`, `429`, `500`.
