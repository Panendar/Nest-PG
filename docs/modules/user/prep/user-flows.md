## Flow 1: Search PGs by Location

1. Name: Search PGs by Location
2. Actor: User
3. Entry point: User opens the authenticated user home/search screen.
4. Steps:
   1. User enters a city or chooses nearby radius-based search.
   2. System returns matching PG listings for the selected location scope.
   3. User adjusts search inputs (city/radius) to refine relevance.
   4. System refreshes results to reflect the updated search.
5. Exit point: Flow completes when the user sees a relevant result set, or is abandoned when the user leaves without continuing.
6. Notes: If no results are found, the system should still let the user change city/radius and retry quickly.

## Flow 2: Review Listing Details

1. Name: Review Listing Details
2. Actor: User
3. Entry point: User selects a listing from search results.
4. Steps:
   1. User opens a listing to review suitability information.
   2. System shows listing details needed for evaluation (for example, availability status and key listing information).
   3. User decides whether the listing should be considered further.
   4. System allows the user to return to results and continue exploring alternatives.
5. Exit point: Flow completes when the user either proceeds to compare/contact or returns to browsing; abandoned if the user exits the module.
6. Notes: If listing information appears outdated or unavailable, the user may return to results and choose another listing.

## Flow 3: Compare Candidate Listings

1. Name: Compare Candidate Listings
2. Actor: User
3. Entry point: User has identified multiple listings worth evaluating.
4. Steps:
   1. User reviews two or more candidate listings.
   2. System presents each listing consistently so the user can judge differences.
   3. User narrows options to the best-fit listing(s).
   4. System preserves the user context so they can continue to contact from selected listing(s).
5. Exit point: Flow completes when the user narrows to one or a few preferred listings, or is abandoned if they stop before deciding.
6. Notes: This flow does not require long-term saved favorites in the current scope; comparison can be session-based.

## Flow 4: Contact Owner

1. Name: Contact Owner
2. Actor: User
3. Entry point: User chooses a preferred listing and selects contact action.
4. Steps:
   1. User initiates contact from the listing.
   2. System verifies authenticated access and enables direct owner contact.
   3. User sends the inquiry to the owner for the selected PG.
   4. System confirms that the contact request was submitted.
5. Exit point: Flow completes when inquiry submission is confirmed; abandoned if the user exits before submitting.
6. Notes: Anonymous contact is out of scope; user must be authenticated for this flow.
