## 1. Screens

1. Empty Search Results State
   - Route: /user/search?city={city} or /user/search?mode=nearby
   - Shown when a search returns no listings.
2. Empty Filtered Results State
   - Route: /user/search?city={city}&filters=...&sort=...
   - Shown when active filters produce no matches.
3. Compare Minimum Selection Prompt
   - Route: /user/search?city={city} or /user/search?mode=nearby
   - Shown when the user attempts to compare fewer than two listings.
4. Unavailable Listing State
   - Route: /user/listings/{listing_id}
   - Shown when a listing becomes unavailable after the user opens it.
5. Contact Unavailable State
   - Route: /user/listings/{listing_id}
   - Shown when the user tries to contact a listing that is not accepting inquiries.

## 2. Business Rules

- Only authenticated User-role users can use recovery actions tied to protected search, compare, or listing views.
- Empty states must always offer a clear recovery action that returns the user to a usable discovery path.
- Recovery actions should preserve the broader search context whenever possible (city, radius, page, filters, sort).
- If no results are returned, the UI must explain that the result set is empty rather than implying failure.
- If a comparison cannot be created because fewer than two listings are selected, the user must be guided back to selecting more listings.
- If a listing is unavailable or not accepting inquiries, the user must be prevented from proceeding with the blocked action.
- Recovery is read-only and does not change listing data.

State transitions:

- ResultsLoaded -> EmptyResults -> RecoveryActionSelected -> SearchUpdated
- FilteredResults -> EmptyFilteredResults -> ClearFilterOrBroadenSearch -> SearchUpdated
- SelectingListings -> CompareAttemptWithInsufficientSelection -> MinSelectionPrompt -> AddMoreListings
- ListingViewed -> ListingUnavailableState -> ReturnToResults
- ListingViewed -> ContactUnavailableState -> ReturnToResults

Data constraints:

- Recovery actions must keep or restore known context values when available.
- Empty states must not discard user selections unless the user explicitly resets them.
- Comparison recovery requires at least two unique listings.

## 3. Edge Cases

- Zero listings in city search: show empty search state with suggestion to widen location.
- Zero listings after filters: show empty filtered state while keeping filters visible.
- Single selected listing for compare: show minimum-selection prompt and block compare action.
- Listing becomes unavailable while user is viewing it: show unavailable state and disable next-step actions.
- Contact blocked because inquiry is closed: show contact unavailable state and keep browsing options visible.
- Multiple recovery actions available: first action chosen determines the next state.
- Rapid repeated recovery clicks: only one recovery action should run at a time.
- Session expires while on empty state: sign-in prompt appears before protected recovery actions.

## 4. API Endpoints Used

- GET /api/v1/listings?city={city}&radius_km={radius_km}&status=active&page={page}&page_size={page_size}
  - Re-runs search with broader or adjusted criteria after empty results.
- GET /api/v1/listings?city={city}&radius_km={radius_km}&status=active&price_min={price_min}&price_max={price_max}&availability={availability}&sort={sort}&page={page}&page_size={page_size}
  - Refreshes results after filter or sort adjustments.
- GET /api/v1/listings/{listing_id}
  - Revalidates listing state when a detail view shows unavailable or contact-blocked state.
- GET /api/v1/auth/me
  - Confirms authenticated user context for protected recovery interactions.

## 5. DB Tables Used

- pg_listings
  - Source of listing availability and search result records used to determine empty or unavailable states.
- users
  - Source for authenticated user identity/role validation.
- contacts
  - Source of inquiry status when determining whether contact is still available.

## 6. Frontend Components

- EmptySearchResultsState
- EmptyFilteredResultsState
- EmptyStateMessage
- EmptyStateActionButton
- CompareMinimumSelectionBanner
- RecoveryActionList
- ListingUnavailableState
- ContactUnavailableState
- ReturnToResultsButton
- RetrySearchButton
- BroadenSearchButton
- ClearFiltersButton
- LoadingSpinner
- EmptyStateIcon

## 7. Validation Rules

| Field       | Type          | Rules                                                                                           |
| ----------- | ------------- | ----------------------------------------------------------------------------------------------- |
| city        | string        | Optional for empty-state recovery actions; if provided trim whitespace; max length 100.         |
| radius_km   | integer       | Optional; if provided allowed values: 1, 2, 5, 10, 15, 20.                                      |
| listing_ids | array<string> | Required for compare recovery context; must contain at least 1 selected listing to show prompt. |
| filters     | object        | Optional; must only include allowed filter fields from search.                                  |
| sort        | string        | Optional; if provided must be a valid sort option from search.                                  |

## 8. Error States

| HTTP Status | Condition                                                 | User-Facing Message                                                       |
| ----------- | --------------------------------------------------------- | ------------------------------------------------------------------------- |
| 400         | Invalid recovery context or malformed search parameters   | We could not recover this view. Please update your search and try again.  |
| 401         | User not authenticated                                    | Please sign in to continue.                                               |
| 403         | User lacks permission for this view                       | Your account does not have access to this action.                         |
| 404         | Listing no longer available                               | This listing is no longer available. Please return to search results.     |
| 410         | Listing no longer accepting inquiries                     | This listing is not accepting inquiries right now.                        |
| 422         | Compare selection below minimum or invalid recovery state | Please select at least two listings to compare.                           |
| 429         | Too many recovery actions in short time                   | You are updating results too quickly. Please wait a moment and try again. |
| 500         | Unexpected server error                                   | Something went wrong while recovering this view. Please try again.        |
| 503         | Service temporarily unavailable                           | Recovery options are temporarily unavailable. Please try again shortly.   |

Non-HTTP validation feedback:

- No matches found: No listings match your current search. Try widening your search or clearing filters.
- Too few compare selections: Select at least two listings to compare.
- Listing inactive: This listing is no longer active.
