## Flow 1: Create PG Listing

1. Name: Create PG Listing
2. Actor: Owner
3. Entry point: Owner opens the owner-page module to add a new PG.
4. Steps:
   1. Owner chooses to create a new listing.
   2. System presents a listing form for core PG information.
   3. Owner enters the listing details needed to describe the PG.
   4. System records the information and shows the listing as ready for publication or published.
5. Exit point: Flow completes when the listing is created and available for owner management; abandoned if the owner leaves before saving.
6. Notes: If required information is missing, the system should make the gap clear so the owner can complete the listing.

## Flow 2: Update Listing Details

1. Name: Update Listing Details
2. Actor: Owner
3. Entry point: Owner opens an existing PG listing from their owner-page area.
4. Steps:
   1. Owner selects a listing they want to revise.
   2. System shows the current listing information.
   3. Owner edits the property details to reflect the latest information.
   4. System saves the updated details and reflects the changes in the listing.
5. Exit point: Flow completes when revised details are saved; abandoned if the owner exits without keeping the changes.
6. Notes: This flow exists to keep listings accurate and reduce stale or misleading information for Users.

## Flow 3: Maintain Listing Media

1. Name: Maintain Listing Media
2. Actor: Owner
3. Entry point: Owner opens the media section for an existing listing.
4. Steps:
   1. Owner chooses to add, replace, or remove listing media.
   2. System shows the current media attached to the PG listing.
   3. Owner updates the media to better represent the property.
   4. System saves the media changes and shows the refreshed listing presentation.
5. Exit point: Flow completes when the media updates are reflected on the listing; abandoned if the owner leaves before saving.
6. Notes: The common variation is replacing outdated media rather than adding media for the first time.

## Flow 4: Update Availability Status

1. Name: Update Availability Status
2. Actor: Owner
3. Entry point: Owner opens a listing whose availability has changed.
4. Steps:
   1. Owner selects the availability control for the listing.
   2. System shows the current availability state.
   3. Owner marks the listing to reflect current availability.
   4. System updates the listing so Users see the latest status during discovery.
5. Exit point: Flow completes when the availability change is saved; abandoned if the owner exits without applying the update.
6. Notes: This flow is especially important when a listing becomes unavailable or reopens after being full.
