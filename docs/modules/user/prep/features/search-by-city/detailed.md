## 1. Screens

1. Search Screen (User Home)
   - City input, search action, and optional quick refine controls.
2. Search Results Screen
   - Listing cards filtered by city, result count, and empty-state block.
3. Listing Details Screen (handoff from search result)
   - Read-only listing details so user can continue evaluation.

## 2. Business Rules

- Only authenticated User-role users can run this feature.
- City search is required to start the feature flow; blank city submissions are not allowed.
- City matching is case-insensitive and whitespace-trimmed before evaluation.
- Search results must only contain listings currently marked active/visible for discovery.
- When city input changes and user re-submits, previous results are replaced by the new result set.
- If zero listings match the city, system must return an empty result (not an error) and show empty-state guidance.
- User can open any returned listing detail from the results set.
- This feature does not create/modify listings; it is read-only discovery.

State transitions:

- Idle -> Searching -> ResultsLoaded
- Idle -> Searching -> EmptyResults
- Idle/ResultsLoaded/EmptyResults -> ValidationError (blank/invalid city)
- Searching -> ErrorState (request/auth/server failure)

Data constraints:

- City input is normalized (trim + collapse multiple spaces).
- Max city input length: 100 characters.
- Special characters used for injection-like patterns are rejected with validation feedback.

## 3. Edge Cases

- Empty city input: search is blocked with inline validation.
- City with only spaces: treated as empty input.
- Single matching listing: show standard result card list with one item.
- No matching listings: show explicit empty state with retry CTA.
- Very broad city returning many items: paginate results and preserve city filter across pages.
- Rapid repeated clicks on Search: only one in-flight search request at a time; duplicate submits are ignored until response.
- Session expires while searching: user sees auth-required message and is redirected to sign-in.
- Temporary network loss: user sees retryable error state and can re-run search.

## 4. API Endpoints Used

- GET /api/v1/listings?city={city}&status=active&page={page}&page_size={page_size}
  - Returns active listings for the requested city.
- GET /api/v1/listings/{listing_id}
  - Returns full details for a selected listing from search results.
- GET /api/v1/auth/me
  - Confirms current authenticated user context before protected actions/views.

## 5. DB Tables Used

- pg_listings
  - Source of listing records and city/location attributes used in filtering.
- users
  - Source of authenticated user identity/role validation.

## 6. Frontend Components

- UserSearchByCityPage
- CitySearchForm
- CityInputField
- SearchSubmitButton
- SearchResultsHeader
- ListingResultsGrid
- ListingResultCard
- SearchResultsPagination
- SearchEmptyState
- SearchErrorAlert
- SearchLoadingSkeleton
- ListingDetailsPage

## 7. Validation Rules

| Field     | Type    | Rules                                                                                                                                           |
| --------- | ------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| city      | string  | Required; trim leading/trailing spaces; min length 2; max length 100; letters, spaces, hyphen, and period allowed; must not be only whitespace. |
| page      | integer | Optional; default 1; must be >= 1.                                                                                                              |
| page_size | integer | Optional; default 20; allowed range 1-50.                                                                                                       |

## 8. Error States

| HTTP Status | Condition                                 | User-Facing Message                                                |
| ----------- | ----------------------------------------- | ------------------------------------------------------------------ |
| 400         | Invalid city format or query parameters   | We could not run this search. Check the city name and try again.   |
| 401         | User not authenticated                    | Please sign in to search PG listings by city.                      |
| 403         | User lacks permission for this view       | Your account does not have access to this search view.             |
| 404         | Listing details not found after selection | This listing is no longer available. Please return to results.     |
| 429         | Too many requests in short time           | You are searching too quickly. Please wait a moment and try again. |
| 500         | Unexpected server error                   | Something went wrong on our side. Please try again.                |
| 503         | Service temporarily unavailable           | Search is temporarily unavailable. Please try again shortly.       |

Non-HTTP validation feedback:

- Blank city input: Please enter a city to search.
- City input too short: Enter at least 2 characters for the city.
- City input too long: City name must be 100 characters or fewer.
