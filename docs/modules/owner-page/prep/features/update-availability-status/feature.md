## Summary

Update Availability Status lets an Owner quickly reflect whether a PG listing is currently open or not. This keeps listing freshness aligned with the module goal of reliable, current supply for seekers. It matters because incorrect availability creates wasted user effort and reduces trust in the marketplace.

## User Story

As an Owner, I want to update my PG availability status so that users only inquire about listings that are actually open.

## Acceptance Criteria

- The owner can open the availability controls for an existing listing.
- The owner can mark a listing with its current availability status.
- The system saves the updated availability and confirms the change.
- Updated availability becomes visible in the listing state used by user discovery.
- The owner can return later and still see the last saved availability state for that listing.

## Priority

High — Fresh availability is a core value proposition and directly affects user trust and inquiry quality.

## Dependencies

- `create-pg-listing`
