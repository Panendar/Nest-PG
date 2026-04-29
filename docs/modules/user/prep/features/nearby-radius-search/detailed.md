## 1. Screens

1. Nearby Search Screen (User Home)

- Route: /user/search
- Location context, radius selector, and search action.

2. Nearby Search Results Screen

- Route: /user/search?mode=nearby
- Listing cards filtered by selected radius from user location, result count, and empty state.

3. Listing Details Screen (from nearby results)

- Route: /user/listings/{listing_id}
- Read-only listing details for evaluation and next action.

## 2. Business Rules

- Only authenticated User-role users can use nearby radius search.
- Nearby search requires valid location context (device location or saved location).
- User must select a radius value before running nearby search.
- Nearby search is not available to anonymous visitors.
- Radius matching uses distance from user location to listing location and returns only active/visible listings.
- When user changes radius and re-runs search, previous results are replaced with new results.
- If no listings match the selected radius, the system returns an empty result (not an error).
- User can open any returned listing details from results.
- This feature is read-only for discovery; it does not create or edit listing data.

State transitions:

- Idle -> Searching -> ResultsLoaded
- Idle -> Searching -> EmptyResults
- Idle/ResultsLoaded/EmptyResults -> ValidationError (missing radius/location)
- Searching -> ErrorState (auth/network/server failure)

Data constraints:

- Radius value must be from allowed options only.
- Location coordinates must be present and valid before search.
- Listing location data must include coordinates to be eligible for nearby results.
- Results are scoped to the currently selected radius and page; stale results from prior radius values must not remain visible.

## 3. Edge Cases

- Missing location permission: user sees clear guidance to enable location or set location manually.
- Missing radius selection: search is blocked with inline validation.
- Small radius with zero matches: empty state with CTA to increase radius.
- Very large radius: results are paginated and remain tied to the same radius value.
- Listing without valid coordinates: excluded from nearby result set.
- Single matching listing: shown in normal result layout with one card.
- Repeated rapid clicks on Search: one active request at a time; extra submits ignored while loading.
- Session expires while searching: user sees auth-required message and is redirected to sign-in.
- Temporary network failure: user sees retryable error state and can rerun search.

## 4. API Endpoints Used

- GET /api/v1/listings/nearby?lat={lat}&lng={lng}&radius_km={radius_km}&status=active&page={page}&page_size={page_size}
  - Returns active listings within the selected radius from user location.
- GET /api/v1/listings/{listing_id}
  - Returns full details for a selected listing from nearby results.
- GET /api/v1/auth/me
  - Confirms authenticated user context for protected views.

## 5. DB Tables Used

- pg_listings
  - Source of listing status and location coordinates used for nearby filtering.
- users
  - Source of authenticated user identity/role verification.

## 6. Frontend Components

- UserNearbyRadiusSearchPage
- NearbyRadiusSearchForm
- LocationContextBanner
- RadiusSelectField
- NearbySearchSubmitButton
- NearbySearchResultsHeader
- NearbyListingResultsGrid
- NearbyListingResultCard
- NearbySearchPagination
- NearbySearchEmptyState
- NearbySearchErrorAlert
- NearbySearchLoadingSkeleton
- ListingDetailsPage

## 7. Validation Rules

| Field     | Type    | Rules                                                          |
| --------- | ------- | -------------------------------------------------------------- |
| lat       | number  | Required for nearby search; valid latitude range -90 to 90.    |
| lng       | number  | Required for nearby search; valid longitude range -180 to 180. |
| radius_km | integer | Required; allowed values: 1, 2, 5, 10, 15, 20.                 |
| page      | integer | Optional; default 1; must be >= 1.                             |
| page_size | integer | Optional; default 20; allowed range 1-50.                      |

## 8. Error States

| HTTP Status | Condition                                        | User-Facing Message                                                             |
| ----------- | ------------------------------------------------ | ------------------------------------------------------------------------------- |
| 400         | Invalid coordinates, radius, or query parameters | We could not run nearby search. Check your location and radius, then try again. |
| 401         | User not authenticated                           | Please sign in to search nearby PG listings.                                    |
| 403         | User lacks permission for this view              | Your account does not have access to nearby search.                             |
| 404         | Listing details not found after selection        | This listing is no longer available. Please return to results.                  |
| 429         | Too many requests in short time                  | You are searching too quickly. Please wait a moment and try again.              |
| 500         | Unexpected server error                          | Something went wrong on our side. Please try again.                             |
| 503         | Service temporarily unavailable                  | Nearby search is temporarily unavailable. Please try again shortly.             |

Non-HTTP validation feedback:

- Missing location context: We need your location to show nearby PGs.
- Missing radius: Please select a search radius.
- Invalid radius option: Please choose one of the available radius options.
