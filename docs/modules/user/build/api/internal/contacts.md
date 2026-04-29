# Domain: Contacts

## POST /api/v1/contacts

- What it does: Creates a user inquiry for a specific listing owner.
- Auth: Required.
- Request body:
  - `listing_id`: string
  - `full_name`: string
  - `phone_number`: string
  - `preferred_move_in_date`: string (optional, date)
  - `message`: string
- Response shape (key fields):
  - `id`: string (contact ID)
  - `listing_id`: string
  - `status`: string
  - `submitted_at`: string (UTC timestamp)
- Relevant error codes: `400`, `401`, `403`, `404`, `409`, `410`, `422`, `429`, `500`, `503`.

## GET /api/v1/contacts/{contact_id}

- What it does: Returns inquiry confirmation and current status.
- Auth: Required.
- Query params/body: none.
- Response shape (key fields):
  - `id`, `listing_id`, `status`, `submitted_at`, `can_contact_again`
- Relevant error codes: `400`, `401`, `403`, `404`, `409`, `500`, `503`.
