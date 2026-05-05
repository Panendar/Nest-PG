## 1. Screens

1. Owner Listings Overview
   - Entry point where the owner chooses a specific listing to manage.
2. Listing Media Management Screen
   - Main workspace for adding, replacing, and removing listing photos.
3. Listing Management Screen
   - Post-update listing view showing the latest saved media set.

## 2. Business Rules

- Only the authenticated owner of the listing can manage its media.
- Media actions apply to an existing listing and cannot exist without a parent listing.
- Owners can add, replace, or remove photos from the listing media set.
- Updated media should replace the prior visible state after a successful save.
- This feature is limited to listing media and does not change core property details or availability status.
- The owner must always be able to identify which listing is being edited before applying media changes.

State transitions:

- ListingSelected -> ViewingMedia
- ViewingMedia -> AddingPhoto -> Saving -> MediaUpdated
- ViewingMedia -> ReplacingPhoto -> Saving -> MediaUpdated
- ViewingMedia -> RemovingPhoto -> Saving -> MediaUpdated
- Saving -> ErrorState -> RetryOrCancel

Data constraints:

- Only supported image file types are accepted.
- Each media item belongs to exactly one listing.
- Files that fail validation or upload do not modify existing saved media.
- Caption text is optional and trimmed before save.
- The media set must remain tied to the correct listing record.

## 3. Edge Cases

- First-time media upload for a listing with no photos.
- Removing the last remaining photo from a listing.
- Upload failure caused by unsupported file type or temporary network issues.
- Owner leaves the screen before a media action completes.
- Two rapid remove clicks on the same item: only one removal is applied.
- Owner opens a listing media page for a listing they do not own: access is denied.

## 4. API Endpoints Used

- GET /api/v1/owner/listings/{listing_id}/media
  - Returns current media for the selected listing.
- POST /api/v1/owner/listings/{listing_id}/media
  - Adds a new media item to the listing.
- PUT /api/v1/owner/listings/{listing_id}/media/{media_id}
  - Replaces or updates an existing media item.
- DELETE /api/v1/owner/listings/{listing_id}/media/{media_id}
  - Removes a media item from the listing.
- GET /api/v1/auth/me
  - Confirms authenticated owner context before protected media actions.

## 5. DB Tables Used

- pg_listings
  - Parent listing record for media ownership.
- listing_media
  - Stores media references associated with listings.
- users
  - Stores owner identity and role context.

## 6. Frontend Components

- OwnerListingCard
- OwnerListingsOverviewPage
- ListingMediaPage
- MediaGalleryGrid
- UploadPhotosButton
- ReplacePhotoAction
- RemovePhotoDialog
- RemovePhotoConfirmButton
- MediaCaptionField
- MediaTile
- MediaEmptyState
- MediaUploadProgress
- MediaUploadErrorAlert
- MediaUpdateToast

## 7. Validation Rules

| Field | Type | Rules |
| --- | --- | --- |
| listing_id | string | Required context for all media actions; must reference an existing listing owned by the authenticated owner. |
| photo_file | file | Required for add/replace; must be a supported image type; must not be empty. |
| photo_caption | string | Optional; trim spaces; max length 200. |
| media_id | string | Required for replace/remove actions; must identify an existing listing media item. |

## 8. Error States

| HTTP Status | Condition | User-Facing Message |
| --- | --- | --- |
| 400 | Invalid media input | This photo could not be used. Please choose a supported image and try again. |
| 401 | Owner not authenticated | Please sign in to manage listing photos. |
| 403 | User lacks permission for this listing | You do not have access to update photos for this listing. |
| 404 | Listing or photo not found | The selected photo or listing is no longer available. |
| 413 | Uploaded file too large | This photo is too large to upload. Please choose a smaller image. |
| 500 | Unexpected server error | We could not update your photos right now. Please try again. |
| 503 | Service temporarily unavailable | Listing media is temporarily unavailable. Please try again shortly. |
