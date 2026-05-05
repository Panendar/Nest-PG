## GET /owner/listings/{listing_id}/media

- What it does: Returns the media set attached to a listing.
- Auth requirement: Bearer token required; Owner role and listing ownership required.
- Query params: none
- Response shape:
  - `items[]`: `id`, `listing_id`, `file_url`, `caption`, `sort_order`, `is_primary`, `created_at`
- Relevant error codes:
  - `401`, `403`, `404`, `500`

## POST /owner/listings/{listing_id}/media

- What it does: Adds a new photo to the listing.
- Auth requirement: Bearer token required; Owner role and listing ownership required.
- Request body shape:
  - `multipart/form-data` with:
    - `file`: required image file
    - `caption`: optional text
    - `sort_order`: optional integer
    - `is_primary`: optional boolean
- Response shape:
  - `id`, `listing_id`, `file_url`, `caption`, `sort_order`, `is_primary`, `created_at`
- Relevant error codes:
  - `400`, `401`, `403`, `404`, `413`, `422`, `500`, `503`

## PUT /owner/listings/{listing_id}/media/{media_id}

- What it does: Replaces or updates an existing listing media item.
- Auth requirement: Bearer token required; Owner role and listing ownership required.
- Request body shape:
  - `multipart/form-data` or `application/json` depending on update type:
    - `file`: optional replacement image
    - `caption`: optional text
    - `sort_order`: optional integer
    - `is_primary`: optional boolean
- Response shape:
  - `id`, `listing_id`, `file_url`, `caption`, `sort_order`, `is_primary`, `updated_at`
- Relevant error codes:
  - `400`, `401`, `403`, `404`, `413`, `422`, `500`, `503`

## DELETE /owner/listings/{listing_id}/media/{media_id}

- What it does: Removes a media item from the listing.
- Auth requirement: Bearer token required; Owner role and listing ownership required.
- Query params: none
- Response shape:
  - No response body on success.
- Relevant error codes:
  - `401`, `403`, `404`, `500`
