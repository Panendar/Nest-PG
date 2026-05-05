## 1. Screens

1. Owner Listings Overview
   - Screen where the owner chooses a listing to edit.
2. Edit Listing Details Screen
   - Form populated with current listing information.
3. Listing Management Screen
   - Updated listing state after save confirmation.

## 2. Business Rules

- Only the authenticated owner of the listing can edit its details through this module.
- The edit experience must show the current saved values before the owner changes them.
- Required listing fields must remain valid when an update is saved.
- Saved changes replace prior listing details for future user discovery.
- This feature covers property detail updates only, not media-specific or availability-specific actions.

State transitions:

- ListingSelected -> Viewing
- Viewing -> Editing
- Editing -> ValidationError
- Editing -> Saving -> Saved
- Editing -> Saving -> ErrorState -> RetryOrCancel

Data constraints:

- Updated text values are trimmed before save.
- Invalid or incomplete required fields block save.
- Numeric fields must remain positive where applicable.
- Update payload applies only to the selected listing owned by the authenticated owner.

## 3. Edge Cases

- Owner opens a listing that was removed or is no longer available: show a not-found or unavailable state.
- Owner exits without saving: previous listing details remain unchanged.
- Concurrent update conflict: owner sees a retry message if latest data cannot be saved safely.
- Session expires during edit: owner is prompted to sign in again.
- Two rapid save clicks while a request is in-flight: only one final save outcome is applied.

## 4. API Endpoints Used

- GET /api/v1/owner/listings/{listing_id}
  - Returns current listing details for editing.
- PUT /api/v1/owner/listings/{listing_id}
  - Updates the core details of an existing owner listing.
- GET /api/v1/auth/me
  - Confirms current authenticated owner context.

## 5. DB Tables Used

- pg_listings
  - Stores owner-managed listing content.
- users
  - Stores owner identity and role context.

## 6. Frontend Components

- OwnerListingsOverviewPage
- OwnerListingCard
- EditListingPage
- ListingDetailsForm
- SaveChangesButton
- UnsavedChangesDialog
- UpdateSuccessToast
- UpdateDetailsLoadingState
- UpdateDetailsErrorBanner

## 7. Validation Rules

| Field | Type | Rules |
| --- | --- | --- |
| pg_name | string | Required; trim spaces; max length 120. |
| city | string | Required; trim spaces; max length 100. |
| area | string | Required; trim spaces; max length 120. |
| monthly_rent | number | Required; must be greater than 0. |
| description | string | Required; max length 2000. |
| listing_id | string | Required route/context value; must reference an existing listing owned by the current owner. |

## 8. Error States

| HTTP Status | Condition | User-Facing Message |
| --- | --- | --- |
| 400 | Invalid listing update data | Please correct the highlighted details and try again. |
| 401 | Owner not authenticated | Please sign in to update this listing. |
| 403 | User lacks permission for this listing | You do not have access to update this listing. |
| 404 | Listing not found | This listing is no longer available to edit. |
| 409 | Update conflict | This listing changed before your save completed. Refresh and try again. |
| 500 | Unexpected server error | We could not save your changes right now. Please try again. |
| 503 | Service temporarily unavailable | Listing update is temporarily unavailable. Please try again shortly. |

## 9. Mocks (exact paths)

`docs/modules/owner-page/prep/features/update-listing-details/mocks/`

- `docs/modules/owner-page/prep/features/update-listing-details/mocks/update-listing-details-edit-form.txt`
- `docs/modules/owner-page/prep/features/update-listing-details/mocks/update-listing-details-after-save.txt`
