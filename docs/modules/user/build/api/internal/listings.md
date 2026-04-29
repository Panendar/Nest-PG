# Domain: Listings

## GET /api/v1/listings

- What it does: Returns searchable listing collection for city/radius/filter/sort flows.
- Auth: Required.
- Query params:
  - `city`: string (optional in nearby mode)
  - `radius_km`: integer (optional)
  - `availability`: string (optional)
  - `price_min`: integer (optional)
  - `price_max`: integer (optional)
  - `sort`: string (optional)
  - `page`: integer (optional)
  - `page_size`: integer (optional)
- Response shape (key fields):
  - `items[]`: `id`, `title`, `city`, `availability_status`, `accepting_inquiries`, `price`, `distance_km`
  - `pagination`: standard pagination object
- Relevant error codes: `400`, `401`, `403`, `422`, `429`, `500`, `503`.

## GET /api/v1/listings/{listing_id}

- What it does: Returns full listing detail for evaluation and contact entry.
- Auth: Required.
- Query params/body: none.
- Response shape (key fields):
  - `id`, `title`, `description`, `city`, `lat`, `lng`, `availability_status`, `accepting_inquiries`, `owner`
- Relevant error codes: `400`, `401`, `403`, `404`, `410`, `500`, `503`.

## GET /api/v1/listings/compare

- What it does: Returns normalized side-by-side data for selected listing IDs.
- Auth: Required.
- Query params:
  - `ids`: comma-separated listing IDs (min 2, max 4)
- Response shape (key fields):
  - `items[]`: `id`, `title`, `price`, `distance_km`, `availability_status`, `accepting_inquiries`, `amenities`
- Relevant error codes: `400`, `401`, `403`, `404`, `422`, `429`, `500`.
