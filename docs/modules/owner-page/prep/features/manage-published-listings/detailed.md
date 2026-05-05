## 1. Screens

1. Manage Published Listings Screen
   - Primary hub where the owner sees their published PG listings and opens one to manage it.
   - Reference mock: `docs/modules/owner-page/prep/features/manage-published-listings/mocks/manage-published-listings-screen.txt`
2. Manage Published Listings — Empty State
   - Same hub route when the owner has no published listings yet.
   - Reference mock: `docs/modules/owner-page/prep/features/manage-published-listings/mocks/manage-published-listings-empty-state.txt`
3. Listing Management View
   - Destination after the owner selects a listing from the hub (continues into detail, media, or availability flows owned by other features).

## 2. Business Rules

- Only authenticated Owner-role users can open the manage-published-listings hub.
- The list shows only listings that belong to the signed-in owner.
- By default, the list reflects **published** inventory the owner is expected to maintain (for example, listings in an active or equivalent “live” state). Draft or archived handling, if any, stays out of this feature unless product explicitly expands scope.
- Each listed item must expose enough identity for the owner to choose the correct property before opening it.
- Selecting a listing must navigate to that listing’s management view without requiring the owner to re-enter identifiers manually.
- Ordering is stable enough for repeat visits (for example, most recently updated first, or alphabetical by name—exact sort is an implementation choice documented with UX).

State transitions:

- HubLoading -> HubLoadedWithItems
- HubLoading -> HubLoadedEmpty
- HubLoadedWithItems -> OpenListing -> ListingManagementView
- HubLoadedWithItems -> HubError (retry)
- HubLoadedEmpty -> (owner may leave or use create listing elsewhere)

Data constraints:

- List payload must include at least listing id, display name/title, and one secondary cue (for example city or area) for disambiguation.
- Optional filters (status, availability) must not hide listings from other owners.

## 3. Edge Cases

- Owner has zero published listings: show the dedicated empty state; do not show placeholder rows as if they were real listings.
- Owner has many listings: list remains usable (pagination or equivalent pattern—implementation detail) without mixing other owners’ rows.
- Load fails: owner sees a clear error with a retry path; previously loaded data should not be silently cleared without confirmation where stale data would mislead.
- Owner opens the hub while a listing was just created: new listing appears after the hub refreshes or on next visit, consistent with product expectations for eventual consistency.
- Owner selects a listing that is no longer accessible: show a not-found or unavailable message and return them to the hub without trapping them on a blank screen.
- Session expires on the hub: owner is prompted to sign in before protected actions continue.

## 4. API Endpoints Used

- GET /api/v1/owner/listings
  - Returns the authenticated owner’s listings for overview and selection; supports optional pagination and filters as defined in module API docs.
- GET /api/v1/owner/listings/{listing_id}
  - Optional: used when opening a listing to confirm the latest record before showing the management view, if the product requires a fresh fetch on selection.
- GET /api/v1/auth/me
  - Confirms authenticated owner context.

## 5. DB Tables Used

- pg_listings
  - Source of listing rows, ownership, publication state, and fields shown in the hub list.
- users
  - Owner identity and role validation.

## 6. Frontend Components

- ManagePublishedListingsPage
- ManagePublishedListingsHeader
- PublishedListingsToolbar (optional filters, if exposed)
- PublishedListingList
- PublishedListingRow (or PublishedListingCard)
- PublishedListingPrimaryLabel
- PublishedListingSecondaryCue
- OpenListingManagementButton
- PublishedListingsEmptyState
- PublishedListingsLoadingSkeleton
- PublishedListingsErrorBanner

## 7. Validation Rules

| Input | Type | Rules |
| --- | --- | --- |
| page | integer | Optional; must be positive when supplied. |
| page_size | integer | Optional; bounded to a reasonable maximum when supplied. |
| listing_status | string | Optional; must be one of allowed filter values when supplied. |
| availability_status | string | Optional; must be one of allowed filter values when supplied. |

## 8. Error States

| HTTP Status | Condition | User-Facing Message |
| --- | --- | --- |
| 401 | Owner not authenticated | Please sign in to manage your listings. |
| 403 | User lacks owner permission | Your account does not have access to owner listing management. |
| 404 | Selected listing not found | This listing is no longer available. |
| 500 | Unexpected server error | We could not load your listings right now. Please try again. |
| 503 | Service temporarily unavailable | Listing management is temporarily unavailable. Please try again shortly. |

## 9. Mocks (exact paths)

All mock files for this feature live under the feature folder:

`docs/modules/owner-page/prep/features/manage-published-listings/mocks/`

| Mock | File |
| --- | --- |
| Hub with listings | `docs/modules/owner-page/prep/features/manage-published-listings/mocks/manage-published-listings-screen.txt` |
| Empty hub | `docs/modules/owner-page/prep/features/manage-published-listings/mocks/manage-published-listings-empty-state.txt` |

Relative paths from this feature directory (for `def.json` and tooling): `mocks/manage-published-listings-screen.txt`, `mocks/manage-published-listings-empty-state.txt`.
