## 1. Screens

1. Saved Listings Screen
   - Route: /user/saved
   - Primary view showing saved PG listings.
2. Saved Listing Empty State
   - Route: /user/saved
   - Shown when the user has no saved listings.
3. Saved Listing Detail Return View
   - Route: /user/listings/{listing_id}
   - Shows saved state and allows user to return to a saved listing.

## 2. Business Rules

- Only authenticated User-role users can save and manage saved listings.
- A listing can be saved from search results or a listing detail view.
- Each saved listing must be unique per user; duplicates are not allowed.
- The user can remove a saved listing at any time.
- The saved list should preserve the listing's latest visible identity and status.
- Saved listings are informational and do not change listing availability or contact behavior.
- Returning to a saved listing should reopen the listing detail context when possible.

State transitions:

- UnsavedListing -> SaveAction -> SavedListing
- SavedListing -> RemoveAction -> UnsavedListing
- SavedListing -> OpenSavedItem -> ListingDetailView
- SavedListingsList -> EmptyState -> NoSavedListings

Data constraints:

- Saved listing must reference a valid listing identifier.
- Saved listings belong to exactly one authenticated user.
- Saved listings must not include duplicates.
- Saved state should respect the latest active listing availability shown to the user.

## 3. Edge Cases

- User has no saved listings: show empty state with prompt to continue browsing.
- User tries to save the same listing twice: keep one saved entry and show saved state.
- Listing becomes unavailable after saving: keep it in saved list but surface its current status.
- Saved listing is deleted or no longer available: show removed/unavailable notice and allow cleanup.
- User removes the last saved item: return to empty state.
- User opens a saved listing from the saved list: preserve that listing's detail context when possible.
- Rapid save/remove clicks: only the latest valid action should be applied.
- Session expires while on saved list: require sign-in before continuing protected actions.

## 4. API Endpoints Used

- GET /api/v1/saved-listings
  - Returns the current user's saved listings.
- POST /api/v1/saved-listings
  - Saves a listing for the current user.
- DELETE /api/v1/saved-listings/{saved_listing_id}
  - Removes a saved listing for the current user.
- GET /api/v1/listings/{listing_id}
  - Returns listing details when the user opens a saved listing.
- GET /api/v1/auth/me
  - Confirms authenticated user context for saved-listing actions.

## 5. DB Tables Used

- saved_listings
  - Stores user-to-listing saved mappings.
- pg_listings
  - Source of listing identity and current listing status.
- users
  - Source for authenticated user identity/role validation.

## 6. Frontend Components

- SavedListingsPage
- SavedListingsHeader
- SavedListingsGrid
- SavedListingCard
- SavedListingBadge
- SaveListingButton
- RemoveSavedListingButton
- OpenSavedListingButton
- SavedListingsEmptyState
- SavedListingsLoadingSkeleton
- SavedListingsErrorAlert
- SavedListingUnavailableNotice

## 7. Validation Rules

| Field            | Type   | Rules                                                                                 |
| ---------------- | ------ | ------------------------------------------------------------------------------------- |
| listing_id       | string | Required for save action; must be a valid listing identifier.                         |
| saved_listing_id | string | Required for remove action; must reference a saved listing owned by the current user. |
| user_id          | string | Implicitly required; must be the authenticated user.                                  |

## 8. Error States

| HTTP Status | Condition                                    | User-Facing Message                                                              |
| ----------- | -------------------------------------------- | -------------------------------------------------------------------------------- |
| 400         | Invalid save/remove request                  | We could not update your saved listings. Please try again.                       |
| 401         | User not authenticated                       | Please sign in to manage saved listings.                                         |
| 403         | User lacks permission for this saved listing | You cannot modify this saved listing.                                            |
| 404         | Listing or saved item not found              | This listing is no longer available in your saved list.                          |
| 409         | Duplicate saved listing                      | This listing is already in your saved list.                                      |
| 429         | Too many save/remove requests                | You are updating saved listings too quickly. Please wait a moment and try again. |
| 500         | Unexpected server error                      | Something went wrong while updating saved listings. Please try again.            |
| 503         | Service temporarily unavailable              | Saved listings are temporarily unavailable. Please try again shortly.            |

Non-HTTP validation feedback:

- Already saved: This listing is already in your saved list.
- Cannot save unavailable listing: This listing is no longer available.
- Missing saved item: We could not find that saved listing.
