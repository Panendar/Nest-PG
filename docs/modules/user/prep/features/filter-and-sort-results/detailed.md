## 1. Screens

1. Filter and Sort Panel (within Search Results)
   - Route: /user/search?city={city} or /user/search?mode=nearby
   - Control area where user applies filters and selects sort order.
2. Filtered Results List
   - Route: /user/search?city={city}&filters=...&sort=...
   - Result cards updated based on selected filters and sort.
3. No Results State (within Search Results)
   - Route: /user/search?city={city}&filters=...&sort=...
   - Empty-state view shown when active filters return no matches.

## 2. Business Rules

- Only authenticated User-role users can use filter and sort controls.
- Filters can be applied individually or in combination.
- Sort order applies to the currently filtered result set, not to all listings globally.
- Applying or changing any filter refreshes result list context for current search.
- Changing sort option reorders the current filtered result set.
- Clearing one filter keeps all other selected filters active.
- Resetting filters/sort returns to default result view for the same search context.
- Filter and sort state must remain visible so the user can understand active constraints.
- This feature is discovery-only; it does not edit listing data.

State transitions:

- DefaultResults -> Filtering -> FilteredResults
- FilteredResults -> Sorting -> SortedResults
- FilteredResults/SortedResults -> ClearingOneFilter -> UpdatedResults
- FilteredResults/SortedResults -> ResetAll -> DefaultResults
- Filtering/Sorting -> EmptyResults
- Filtering/Sorting -> ErrorState (network/auth/server failure)

Data constraints:

- Only allowed filter fields can be submitted.
- Each filter value must match allowed value ranges/options.
- Sort value must be one of defined sort options.
- Invalid filters or sort values are rejected and not applied.

## 3. Edge Cases

- No filters selected: results remain in default state.
- Single filter selected with zero matches: show empty state with clear next action.
- Multiple filters yield zero matches: keep selected filters visible so user can adjust.
- One listing remaining after filters: display normal listing card list with one item.
- Rapid filter/sort changes: only latest user selection should determine final displayed results.
- User clears all filters while loading: final state returns to default results.
- Session expires during filtering/sorting: show sign-in requirement and block further updates.
- Temporary network issue while updating results: show retryable error and preserve current selections.

## 4. API Endpoints Used

- GET /api/v1/listings?city={city}&radius_km={radius_km}&status=active&price_min={price_min}&price_max={price_max}&availability={availability}&sort={sort}&page={page}&page_size={page_size}
  - Returns listings constrained by selected filters and sort order.
- GET /api/v1/auth/me
  - Confirms authenticated user context for protected search interactions.

## 5. DB Tables Used

- pg_listings
  - Source of listing attributes used for filtering and sorting.
- users
  - Source for authenticated user identity/role validation.

## 6. Frontend Components

- FilterAndSortResultsPage
- SearchResultsFilterBar
- FilterDrawerPanel
- PriceRangeFilterField
- AvailabilityFilterField
- DistanceFilterField
- SortOptionSelect
- ActiveFilterChips
- ClearSingleFilterButton
- ResetAllFiltersButton
- FilteredListingResultsGrid
- FilterSortResultsHeader
- FilterSortEmptyState
- FilterSortErrorAlert
- FilterSortLoadingSkeleton

## 7. Validation Rules

| Field        | Type    | Rules                                                                                                    |
| ------------ | ------- | -------------------------------------------------------------------------------------------------------- |
| city         | string  | Optional for nearby mode; required for city mode; trim whitespace; max length 100.                       |
| radius_km    | integer | Optional; if present allowed values: 1, 2, 5, 10, 15, 20.                                                |
| price_min    | integer | Optional; if present must be >= 0.                                                                       |
| price_max    | integer | Optional; if present must be >= price_min.                                                               |
| availability | string  | Optional; allowed values: available, limited, full.                                                      |
| sort         | string  | Required when sorting; allowed values: relevance, price_low_to_high, price_high_to_low, nearest, newest. |
| page         | integer | Optional; default 1; must be >= 1.                                                                       |
| page_size    | integer | Optional; default 20; allowed range 1-50.                                                                |

## 8. Error States

| HTTP Status | Condition                                   | User-Facing Message                                                            |
| ----------- | ------------------------------------------- | ------------------------------------------------------------------------------ |
| 400         | Invalid filter or sort parameters           | We could not apply these filters. Please review your selections and try again. |
| 401         | User not authenticated                      | Please sign in to filter and sort listings.                                    |
| 403         | User lacks permission for this view         | Your account does not have access to this search view.                         |
| 422         | Filter combination is invalid               | Some selected filters cannot be used together. Please adjust and try again.    |
| 429         | Too many filter/sort requests in short time | You are updating results too quickly. Please wait a moment and try again.      |
| 500         | Unexpected server error                     | Something went wrong while updating results. Please try again.                 |
| 503         | Service temporarily unavailable             | Filters and sorting are temporarily unavailable. Please try again shortly.     |

Non-HTTP validation feedback:

- Invalid price range: Maximum price must be equal to or higher than minimum price.
- Missing sort selection when sort action triggered: Please select a sort option.
- No matches found: No listings match your filters. Try removing one or more filters.
