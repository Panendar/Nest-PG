## 1. Screens

1. Recent Searches Screen
   - Route: /user/recent-searches
   - Primary view showing recent search entries.
2. Recent Searches Empty State
   - Route: /user/recent-searches
   - Shown when the user has no recent searches.
3. Search Context Restore View
   - Route: /user/search
   - Restored search page when the user opens a recent search.

## 2. Business Rules

- Only authenticated User-role users can view and manage saved recent searches when the data is account-based.
- A recent search is created when the user performs a valid search action.
- Recent searches must appear in most-recent-first order.
- The user can open a recent search to restore the same search context.
- The user can remove a recent search from the list.
- Recent searches are informational and do not alter listing data.
- If the user performs a new search, it should become the most recent entry.
- Only a bounded number of recent searches are retained per user; older entries fall off the list.

State transitions:

- NoRecentSearches -> SearchPerformed -> RecentSearchSaved
- RecentSearchSaved -> OpenRecentSearch -> SearchContextRestored
- RecentSearchSaved -> RemoveRecentSearch -> NoRecentSearches or UpdatedRecentSearches
- UpdatedRecentSearches -> NewSearchPerformed -> RecentSearchSaved

Data constraints:

- Each recent search must reference a valid search context.
- Recent searches belong to exactly one authenticated user when account-based.
- Duplicate recent search entries should collapse to the latest occurrence.
- Search context should preserve key parameters such as city, radius, filters, and sort.

## 3. Edge Cases

- User has no recent searches: show empty state with prompt to start a new search.
- User repeats the same search multiple times: keep one entry and move it to the top.
- Recent search is older than retention limit: older entries are removed automatically.
- Saved search context is incomplete: restore whatever valid context is available and prompt user to refine.
- User removes the last recent search: return to empty state.
- Rapid remove/open clicks: only the latest valid action should be applied.
- Session expires while on recent searches: require sign-in before continuing protected actions.
- Account-based vs session-based tracking: use the current authenticated scope when available.

## 4. API Endpoints Used

- GET /api/v1/recent-searches
  - Returns the current user's recent searches.
- POST /api/v1/recent-searches
  - Records a completed search as a recent search entry.
- DELETE /api/v1/recent-searches/{recent_search_id}
  - Removes a recent search entry for the current user.
- GET /api/v1/searches/{search_id}
  - Returns the saved search context for restoration.
- GET /api/v1/auth/me
  - Confirms authenticated user context for recent-search actions.

## 5. DB Tables Used

- recent_searches
  - Stores search context entries for the user.
- users
  - Source for authenticated user identity/role validation.

## 6. Frontend Components

- RecentSearchesPage
- RecentSearchesHeader
- RecentSearchesGrid
- RecentSearchCard
- RecentSearchTimestamp
- OpenRecentSearchButton
- RemoveRecentSearchButton
- RecentSearchesEmptyState
- RecentSearchesLoadingSkeleton
- RecentSearchesErrorAlert
- RecentSearchRestoreNotice

## 7. Validation Rules

| Field                    | Type    | Rules                                                                                 |
| ------------------------ | ------- | ------------------------------------------------------------------------------------- |
| search_id                | string  | Required for restore action; must reference a valid stored search context.            |
| recent_search_id         | string  | Required for remove action; must reference a recent search owned by the current user. |
| user_id                  | string  | Implicitly required; must be the authenticated user.                                  |
| search_context.city      | string  | Optional; if present trim whitespace; max length 100.                                 |
| search_context.radius_km | integer | Optional; if present allowed values: 1, 2, 5, 10, 15, 20.                             |

## 8. Error States

| HTTP Status | Condition                                        | User-Facing Message                                                               |
| ----------- | ------------------------------------------------ | --------------------------------------------------------------------------------- |
| 400         | Invalid recent-search request or restore context | We could not restore this search. Please try again.                               |
| 401         | User not authenticated                           | Please sign in to view recent searches.                                           |
| 403         | User lacks permission for this recent search     | You cannot modify this recent search.                                             |
| 404         | Recent search or saved context not found         | This recent search is no longer available.                                        |
| 409         | Duplicate recent search conflict                 | This search is already in your recent list.                                       |
| 429         | Too many recent-search requests                  | You are updating recent searches too quickly. Please wait a moment and try again. |
| 500         | Unexpected server error                          | Something went wrong while loading recent searches. Please try again.             |
| 503         | Service temporarily unavailable                  | Recent searches are temporarily unavailable. Please try again shortly.            |

Non-HTTP validation feedback:

- No recent searches: You have no recent searches yet.
- Missing search context: We could not fully restore that search. Please refine it manually.
- Duplicate search: This search is already in your recent list.
