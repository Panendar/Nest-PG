## 1. Screens

1. Owner Listings Overview
   - Entry screen with a primary action to add a new listing.
2. Create PG Listing Screen
   - Form for core property information required to publish a listing.
3. Listing Management Screen
   - Post-create state where the owner can continue with media and availability updates.

## 2. Business Rules

- Only authenticated Owner-role users can create listings in this module.
- A listing cannot be created without the minimum required property details.
- Newly created listings must be associated with the creating Owner account.
- After successful creation, the listing becomes available for ongoing owner management.
- This feature creates a listing record but does not replace later detail, media, or availability updates.

State transitions:

- OwnerEntry -> Editing
- Editing -> ValidationError
- Editing -> Saving -> Created
- Editing -> Saving -> ErrorState -> RetryOrCancel

Data constraints:

- Text inputs are trimmed before save.
- Required fields must be present before create action succeeds.
- Numeric listing values, where used, must be positive and plausible for PG listing entry.
- Newly created listing is scoped to the authenticated owner and cannot be assigned to another owner from this flow.

## 3. Edge Cases

- Owner abandons the form before saving: listing is not created.
- Required fields missing: create action is blocked with inline guidance.
- Duplicate rapid clicks on create/save: only one create request should be processed.
- Session expires during create: owner is asked to sign in again before continuing.
- Network interruption during save: owner sees a retryable save failure state.
- Owner submits the same payload rapidly multiple times: system creates at most one listing record for a single successful action.

## 4. API Endpoints Used

- POST /api/v1/owner/listings
  - Creates a new PG listing for the authenticated owner.
- GET /api/v1/auth/me
  - Confirms current authenticated owner context.

## 5. DB Tables Used

- pg_listings
  - Stores core listing records created by owners.
- users
  - Stores owner identity and role context.

## 6. Frontend Components

- OwnerListingsOverviewPage
- CreateListingButton
- CreateListingPage
- ListingDetailsForm
- SaveListingButton
- ListingValidationAlert
- ListingSaveToast
- CreateListingCancelButton
- CreateListingLoadingState

## 7. Validation Rules

| Field | Type | Rules |
| --- | --- | --- |
| pg_name | string | Required; trim spaces; max length 120. |
| city | string | Required; trim spaces; max length 100. |
| area | string | Required; trim spaces; max length 120. |
| monthly_rent | number | Required; must be greater than 0. |
| description | string | Required; must be meaningful for user evaluation; max length 2000. |
| listing_status | enum | Optional if present in create form; must be one of allowed owner listing states. |

## 8. Error States

| HTTP Status | Condition | User-Facing Message |
| --- | --- | --- |
| 400 | Invalid or missing required listing data | Please review the listing details and correct the highlighted fields. |
| 401 | Owner not authenticated | Please sign in to create a listing. |
| 403 | User lacks owner permission | Your account does not have access to create listings. |
| 409 | Duplicate or conflicting listing submission | This listing could not be created as submitted. Please review and try again. |
| 500 | Unexpected server error | We could not create your listing right now. Please try again. |
| 503 | Service temporarily unavailable | Listing creation is temporarily unavailable. Please try again shortly. |

## 9. Mocks (exact paths)

`docs/modules/owner-page/prep/features/create-pg-listing/mocks/`

- `docs/modules/owner-page/prep/features/create-pg-listing/mocks/create-pg-listing-overview.txt`
- `docs/modules/owner-page/prep/features/create-pg-listing/mocks/create-pg-listing-form.txt`
- `docs/modules/owner-page/prep/features/create-pg-listing/mocks/create-pg-listing-post-create-management.txt`
