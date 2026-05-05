## 1. Screens

1. Owner Listings Overview
   - Screen where the owner chooses a listing to update.
2. Availability Update Panel or Screen
   - Focused control for selecting the current listing availability.
3. Listing Management Screen
   - Updated listing state with the new availability status.

## 2. Business Rules

- Only the authenticated owner of the listing can update its availability through this module.
- Availability updates must apply to an existing listing owned by the current owner.
- The latest saved availability must replace the previous value used in user discovery.
- This feature updates listing status only and does not change other listing details or media.

State transitions:

- ListingSelected -> Viewing
- Viewing -> EditingAvailability
- EditingAvailability -> Saving -> Saved
- EditingAvailability -> ErrorState -> RetryOrCancel

Data constraints:

- Availability status must be chosen from the allowed platform states.
- Optional availability notes must be trimmed before save.
- Availability update must apply only to the selected listing owned by the current owner.

## 3. Edge Cases

- Owner marks a listing unavailable after it recently showed available in discovery.
- Owner reopens a previously full listing.
- Owner exits without saving: previous availability remains unchanged.
- Session expires during update: owner is prompted to sign in again.
- Two rapid availability saves: only the last valid confirmed save is reflected.

## 4. API Endpoints Used

- GET /api/v1/owner/listings/{listing_id}
  - Returns current listing data including availability.
- PATCH /api/v1/owner/listings/{listing_id}/availability
  - Updates availability status for the selected listing.
- GET /api/v1/auth/me
  - Confirms current authenticated owner context.

## 5. DB Tables Used

- pg_listings
  - Stores current availability state for each listing.
- users
  - Stores owner identity and role context.

## 6. Frontend Components

- OwnerListingsOverviewPage
- OwnerListingCard
- AvailabilityStatusBadge
- AvailabilityUpdatePanel
- AvailabilitySelectField
- UpdateAvailabilityButton
- AvailabilityUpdateToast
- AvailabilityNoteField
- AvailabilityUpdateErrorBanner

## 7. Validation Rules

| Field | Type | Rules |
| --- | --- | --- |
| listing_id | string | Required route/context value; must reference an existing listing owned by the current owner. |
| availability_status | enum | Required; must be one of the allowed listing availability states. |
| availability_note | string | Optional; trim spaces; max length 200. |

## 8. Error States

| HTTP Status | Condition | User-Facing Message |
| --- | --- | --- |
| 400 | Invalid availability update | Please choose a valid availability status and try again. |
| 401 | Owner not authenticated | Please sign in to update listing availability. |
| 403 | User lacks permission for this listing | You do not have access to update this listing. |
| 404 | Listing not found | This listing is no longer available to update. |
| 500 | Unexpected server error | We could not update availability right now. Please try again. |
| 503 | Service temporarily unavailable | Availability updates are temporarily unavailable. Please try again shortly. |

## 9. Mocks (exact paths)

`docs/modules/owner-page/prep/features/update-availability-status/mocks/`

- `docs/modules/owner-page/prep/features/update-availability-status/mocks/update-availability-status-panel.txt`
- `docs/modules/owner-page/prep/features/update-availability-status/mocks/update-availability-status-after-save.txt`
