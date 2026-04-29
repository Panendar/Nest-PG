## Summary

Empty State Recovery helps authenticated users move forward when a search, comparison, or detail view returns no meaningful results. It matters because users should be able to recover quickly instead of hitting a dead end and leaving the discovery journey. This feature keeps the PG search flow usable even when there is nothing to show at first.

## User Story

As a User, I want clear next steps when a view has no results so that I can adjust my search and continue finding a suitable PG.

## Acceptance Criteria

- When a results view is empty, the user sees a clear message explaining that nothing matched.
- The user sees at least one suggested next action to continue searching, such as changing filters, widening search, or trying a different view.
- The user can take a recovery action and immediately see the view update or return to a usable state.
- The user can return from an empty state to browsing without losing the broader search context.
- If no comparison can be built because too few listings are selected, the user sees guidance on what to do next.
- Empty state messaging is understandable without needing technical explanation.

## Priority

High - Empty-state recovery prevents users from getting stuck and directly supports continued discovery and conversion.

## Dependencies

search-by-city
nearby-radius-search
filter-and-sort-results
compare-listings
listing-detail-view
