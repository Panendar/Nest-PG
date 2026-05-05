## GET /owner/listings

- What it does: Returns the authenticated owner's listings for overview and selection.
- Auth requirement: Bearer token required; Owner role only.
- Query params:
  - `page`: optional integer
  - `page_size`: optional integer
  - `listing_status`: optional text filter
  - `availability_status`: optional text filter
- Response shape:
  - `items[]`: `id`, `pg_name`, `city`, `area`, `monthly_rent`, `listing_status`, `availability_status`, `updated_at`
  - `pagination`: standard paginated response block
- Relevant error codes:
  - `401`, `403`, `500`

## POST /owner/listings

- What it does: Creates a new PG listing for the authenticated owner.
- Auth requirement: Bearer token required; Owner role only.
- Request body shape:

```json
{
  "pg_name": "Sri Sai Boys PG",
  "city": "Hyderabad",
  "area": "Madhapur",
  "monthly_rent": 7500,
  "occupancy_type": "triple_sharing",
  "available_units": 3,
  "description": "Comfortable PG near major offices and transit.",
  "amenities": ["wifi", "meals", "laundry"],
  "listing_status": "active",
  "availability_status": "available",
  "availability_note": "Three beds open this week."
}
```

- Response shape:
  - `id`, `owner_id`, `pg_name`, `city`, `area`, `listing_status`, `availability_status`, `created_at`
- Relevant error codes:
  - `400`, `401`, `403`, `409`, `422`, `500`, `503`

## GET /owner/listings/{listing_id}

- What it does: Returns the current details of one owner-managed listing.
- Auth requirement: Bearer token required; Owner role and listing ownership required.
- Query params: none
- Response shape:
  - `id`, `owner_id`, `pg_name`, `city`, `area`, `monthly_rent`, `occupancy_type`, `available_units`, `description`, `amenities`, `listing_status`, `availability_status`, `availability_note`, `created_at`, `updated_at`
- Relevant error codes:
  - `401`, `403`, `404`, `500`

## PUT /owner/listings/{listing_id}

- What it does: Replaces the editable business details of an existing listing.
- Auth requirement: Bearer token required; Owner role and listing ownership required.
- Request body shape:

```json
{
  "pg_name": "Sri Sai Boys PG",
  "city": "Hyderabad",
  "area": "Madhapur",
  "monthly_rent": 8000,
  "occupancy_type": "double_sharing",
  "available_units": 2,
  "description": "Updated room availability and amenities.",
  "amenities": ["wifi", "meals", "laundry"],
  "listing_status": "active"
}
```

- Response shape:
  - `id`, `pg_name`, `city`, `area`, `monthly_rent`, `occupancy_type`, `available_units`, `description`, `amenities`, `listing_status`, `updated_at`
- Relevant error codes:
  - `400`, `401`, `403`, `404`, `409`, `422`, `500`

## PATCH /owner/listings/{listing_id}/availability

- What it does: Updates the current availability state of an existing listing.
- Auth requirement: Bearer token required; Owner role and listing ownership required.
- Request body shape:

```json
{
  "availability_status": "available",
  "availability_note": "One bed available from next week."
}
```

- Response shape:
  - `id`, `availability_status`, `availability_note`, `updated_at`
- Relevant error codes:
  - `400`, `401`, `403`, `404`, `422`, `500`
