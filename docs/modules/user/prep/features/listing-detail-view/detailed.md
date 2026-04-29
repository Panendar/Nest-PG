## 1. Screens

1. Listing Details Screen
   - Route: /user/listings/{listing_id}
   - Primary view for evaluating one selected PG listing.
2. Search Results Screen (return context)
   - Route: /user/search?city={city} or /user/search?mode=nearby
   - Return destination when user exits details view.

## 2. Business Rules

- Only authenticated User-role users can access full listing detail view.
- Listing detail view is opened from a selected listing in search results.
- The page must show key evaluation information needed before compare or contact.
- If listing is active/visible, all normal detail actions are available.
- If listing becomes unavailable, the page remains viewable with an unavailable notice and no contact progression.
- The user can return to results and preserve prior search context (city/radius/page).
- This feature is read-only for listing data; users cannot modify listing content.

State transitions:

- EnterDetails -> Loading -> DetailsReady
- EnterDetails -> Loading -> NotFoundOrUnavailable
- DetailsReady -> BackToResults
- DetailsReady -> NextActionSelected (Compare or Contact)
- Loading -> ErrorState (network/auth/server issues)

Data constraints:

- A valid listing identifier is required to load details.
- Listing must have minimum discoverability fields to render: title, location, availability status.
- Contact path is allowed only when listing status supports user inquiry.

## 3. Edge Cases

- Listing removed after user clicks from results: show unavailable message and allow return to results.
- Listing temporarily unavailable: show clear status and disable contact action.
- Missing optional listing fields (for example, some amenities): render remaining fields without layout break.
- Single image or no image: show fallback media area and continue rendering core details.
- User opens details in a new tab without prior results context: show details normally; back action goes to default search page.
- Session expires while viewing details: show auth-required message before protected next actions.
- Repeated click on next action buttons: prevent duplicate navigation/submit while action is processing.

## 4. API Endpoints Used

- GET /api/v1/listings/{listing_id}
  - Returns full listing details for evaluation.
- GET /api/v1/auth/me
  - Confirms authenticated user context for protected access and actions.

## 5. DB Tables Used

- pg_listings
  - Source of listing detail data, status, and location information.
- users
  - Source for authenticated user identity/role verification.

## 6. Frontend Components

- ListingDetailsPage
- ListingDetailsHeader
- ListingStatusBadge
- ListingMediaPanel
- ListingInfoSection
- ListingAmenitiesList
- ListingPricingBlock
- ListingOwnerContactCard
- BackToResultsButton
- CompareFromDetailsButton
- ContactOwnerFromDetailsButton
- ListingUnavailableAlert
- ListingDetailsLoadingSkeleton
- ListingDetailsErrorAlert

## 7. Validation Rules

| Field                    | Type    | Rules                                                                                     |
| ------------------------ | ------- | ----------------------------------------------------------------------------------------- |
| listing_id               | string  | Required; must be present in route; must match listing identifier format used by product. |
| return_context.city      | string  | Optional; if present, trim whitespace; max length 100.                                    |
| return_context.radius_km | integer | Optional; if present, allowed values: 1, 2, 5, 10, 15, 20.                                |
| return_context.page      | integer | Optional; if present, must be >= 1.                                                       |

## 8. Error States

| HTTP Status | Condition                           | User-Facing Message                                                          |
| ----------- | ----------------------------------- | ---------------------------------------------------------------------------- |
| 400         | Invalid listing identifier format   | We could not open this listing. Please return to results and try again.      |
| 401         | User not authenticated              | Please sign in to view full listing details.                                 |
| 403         | User lacks permission for this view | Your account does not have access to this listing view.                      |
| 404         | Listing not found or removed        | This listing is no longer available. Please return to search results.        |
| 410         | Listing no longer active            | This listing is no longer accepting inquiries. You can browse other options. |
| 429         | Too many requests                   | You are requesting details too quickly. Please wait a moment and try again.  |
| 500         | Unexpected server error             | Something went wrong while loading this listing. Please try again.           |
| 503         | Service temporarily unavailable     | Listing details are temporarily unavailable. Please try again shortly.       |

Non-HTTP validation feedback:

- Missing listing id: We could not identify this listing. Please open it again from search results.
- Missing return context: Returning to default search results.
