## 1. Screens

1. Search Results Screen (selection context)
   - Route: /user/search?city={city} or /user/search?mode=nearby
   - User selects listings to compare from result cards.
2. Compare Listings Screen
   - Route: /user/compare?listing_ids={id1,id2,...}
   - Side-by-side comparison of selected listings.
3. Compare Minimum Selection Prompt (in-page state)
   - Route: /user/search?city={city} or /user/search?mode=nearby
   - Guidance shown when user attempts compare with fewer than two listings.

## 2. Business Rules

- Only authenticated User-role users can use compare functionality.
- User must select at least two listings to open compare view.
- Maximum listings in one compare session: 4.
- Comparison view must display selected listings using a consistent field order.
- Removing one listing from compare view updates comparison immediately.
- If selected listings drop below two, compare view is replaced by minimum-selection guidance.
- User can navigate from compare view to listing detail or contact action for any compared listing.
- Returning to results preserves prior search context (city/radius/page and active filters).
- Compare feature is read-only for listing data and does not modify listings.

State transitions:

- ResultsIdle -> SelectingListings -> SelectionReady
- SelectionReady -> OpenCompare -> CompareLoaded
- SelectingListings -> CompareAttemptWithInsufficientSelection -> MinSelectionPrompt
- CompareLoaded -> RemoveListing -> CompareUpdated
- CompareLoaded -> RemoveListingBelowMinimum -> MinSelectionPrompt
- CompareLoaded -> NavigateNextAction (ViewDetails or ContactOwner)
- CompareLoaded -> ErrorState (network/auth/server failure)

Data constraints:

- Compared listings must be unique (no duplicate listing IDs).
- Only active/visible listings can be compared.
- Comparison field set is fixed for all cards to ensure like-for-like evaluation.

## 3. Edge Cases

- User selects same listing twice: second selection is ignored.
- User selects one listing and attempts compare: show minimum-selection prompt.
- User selects more than allowed maximum: block additional selection and show limit message.
- One compared listing becomes unavailable after selection: mark as unavailable and keep others visible.
- All compared listings become unavailable: show unavailable state and prompt return to results.
- User opens compare route with invalid or missing listing IDs: show recoverable error and return CTA.
- Session expires during compare: show sign-in requirement before protected actions.
- Rapid add/remove interactions: latest valid selection set defines rendered compare state.

## 4. API Endpoints Used

- GET /api/v1/listings?ids={id1,id2,...}&status=active
  - Returns selected listing records for comparison view.
- GET /api/v1/listings/{listing_id}
  - Returns full listing details when user opens one compared listing.
- GET /api/v1/auth/me
  - Confirms authenticated user context for compare and next actions.

## 5. DB Tables Used

- pg_listings
  - Source of listing fields displayed in comparison and availability status.
- users
  - Source for authenticated user identity/role checks.

## 6. Frontend Components

- CompareListingsSelectionBar
- CompareToggleCheckbox
- CompareNowButton
- MinSelectionPromptBanner
- CompareListingsPage
- CompareListingsGrid
- CompareListingColumnCard
- CompareFieldRow
- RemoveFromCompareButton
- CompareActionsFooter
- CompareEmptyOrUnavailableState
- CompareListingsLoadingSkeleton
- CompareListingsErrorAlert

## 7. Validation Rules

| Field                    | Type          | Rules                                                                   |
| ------------------------ | ------------- | ----------------------------------------------------------------------- |
| listing_ids              | array<string> | Required for compare route; min items 2; max items 4; all items unique. |
| listing_ids[]            | string        | Required; each must match valid listing identifier format.              |
| return_context.city      | string        | Optional; if present trim whitespace; max length 100.                   |
| return_context.radius_km | integer       | Optional; if present allowed values: 1, 2, 5, 10, 15, 20.               |
| return_context.page      | integer       | Optional; if present must be >= 1.                                      |

## 8. Error States

| HTTP Status | Condition                                              | User-Facing Message                                                                |
| ----------- | ------------------------------------------------------ | ---------------------------------------------------------------------------------- |
| 400         | Invalid listing id format or malformed compare request | We could not open this comparison. Please reselect listings and try again.         |
| 401         | User not authenticated                                 | Please sign in to compare listings.                                                |
| 403         | User lacks permission for compare view                 | Your account does not have access to listing comparison.                           |
| 404         | One or more listings not found                         | One selected listing is no longer available. Please update your comparison.        |
| 410         | Listing no longer active                               | A selected listing is no longer accepting inquiries. You can continue with others. |
| 422         | Fewer than minimum required listings                   | Please select at least two listings to compare.                                    |
| 429         | Too many compare updates in short time                 | You are updating comparison too quickly. Please wait a moment and try again.       |
| 500         | Unexpected server error                                | Something went wrong while loading comparison. Please try again.                   |
| 503         | Service temporarily unavailable                        | Listing comparison is temporarily unavailable. Please try again shortly.           |

Non-HTTP validation feedback:

- Duplicate selection: This listing is already in your comparison.
- Compare limit reached: You can compare up to 4 listings at a time.
- Missing selection: Select at least two listings to start comparing.
