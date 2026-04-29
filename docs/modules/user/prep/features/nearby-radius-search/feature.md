## Summary

Nearby Radius Search allows authenticated users to find PG listings within a selected distance from their current area. It matters because many users decide based on practical travel distance, not just city name, and need quick local options they can evaluate immediately. This feature strengthens the core discovery-to-contact journey by making location relevance more precise.

## User Story

As a User, I want to search PG listings within a nearby radius so that I can quickly find options that are close enough for my daily needs and shortlist the right places faster.

## Acceptance Criteria

- The user can choose a radius value and run a nearby search from the user search experience.
- After search is triggered, the user sees listings that are clearly labeled as results for the selected nearby radius.
- The user can change the radius and run a new search without leaving the current search flow.
- If no listings are found in the selected radius, the user sees a clear empty-state message and a prompt to widen the radius.
- If the user tries to run nearby search without required location context, the user sees a clear message explaining what is needed.
- From nearby search results, the user can open a listing detail page to continue evaluation.

## Priority

High - Nearby distance filtering is a core discovery behavior that directly improves result relevance and decision speed.

## Dependencies

none
