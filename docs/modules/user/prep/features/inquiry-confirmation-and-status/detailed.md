## 1. Screens

1. Inquiry Confirmation Screen
   - Route: /user/listings/{listing_id}
   - Shown after a successful inquiry submission.
2. Inquiry Status Banner/State
   - Route: /user/listings/{listing_id}
   - Shown when the user revisits a listing to see whether inquiry is open or closed.
3. Inquiry Unavailable State
   - Route: /user/listings/{listing_id}
   - Shown when the listing is no longer accepting inquiries.

## 2. Business Rules

- Only authenticated User-role users can view inquiry confirmation and status details.
- A submitted inquiry must be associated with exactly one listing.
- The confirmation screen must clearly identify the listing the inquiry was sent for.
- Inquiry status must reflect whether the listing is open or closed to new inquiries.
- If inquiry status is closed, the user cannot continue with a new contact action from the status view.
- The user can return to browsing other listings from confirmation or status views.
- Inquiry status is informational and does not modify listing or contact records.

State transitions:

- ContactSubmitted -> ConfirmationVisible
- ConfirmationVisible -> StatusViewed
- StatusViewed -> InquiryOpen (contact allowed)
- StatusViewed -> InquiryClosed (contact blocked)
- InquiryClosed -> ReturnToBrowse

Data constraints:

- Inquiry confirmation must reference a valid listing identifier and inquiry record.
- Status display must map to the current inquiry availability for that listing.
- Only one active status context is shown at a time per listing.

## 3. Edge Cases

- User returns to a listing after submission: show confirmation history and current status.
- Listing becomes closed after submission: confirmation still shows, but new contact is blocked.
- Listing reopens later: status updates to open on revisit.
- User tries to contact from a closed status view: block the action and show guidance.
- User has not submitted an inquiry yet: confirmation screen is not shown.
- Session expires while viewing status: prompt sign-in before protected actions.
- Multiple inquiries for the same listing: show the most recent confirmed inquiry context.

## 4. API Endpoints Used

- POST /api/v1/contacts
  - Creates the inquiry that will later be confirmed.
- GET /api/v1/contacts/{contact_id}
  - Returns inquiry confirmation and status details for a specific inquiry.
- GET /api/v1/listings/{listing_id}
  - Returns current listing and inquiry-availability state.
- GET /api/v1/auth/me
  - Confirms authenticated user context for protected status views.

## 5. DB Tables Used

- contacts
  - Stores submitted inquiries and their confirmation/status data.
- pg_listings
  - Source of listing availability and inquiry-open/closed state.
- users
  - Source for authenticated user identity/role validation.

## 6. Frontend Components

- InquiryConfirmationPage
- InquiryConfirmationBanner
- InquiryStatusBadge
- InquiryStatusCard
- InquiryUnavailableAlert
- InquiryListingContextHeader
- ReturnToBrowseButton
- ViewListingButton
- ContactOwnerAgainButton
- StatusRefreshButton
- InquiryConfirmationToast
- InquiryStatusLoadingSkeleton
- InquiryStatusErrorAlert

## 7. Validation Rules

| Field                    | Type    | Rules                                                                         |
| ------------------------ | ------- | ----------------------------------------------------------------------------- |
| contact_id               | string  | Required for confirmation/status view; must reference a valid inquiry record. |
| listing_id               | string  | Required; must match a valid listing identifier.                              |
| inquiry_status           | string  | Required for display; allowed values: open, closed, confirmed.                |
| return_context.city      | string  | Optional; if present trim whitespace; max length 100.                         |
| return_context.radius_km | integer | Optional; if present allowed values: 1, 2, 5, 10, 15, 20.                     |

## 8. Error States

| HTTP Status | Condition                                    | User-Facing Message                                                              |
| ----------- | -------------------------------------------- | -------------------------------------------------------------------------------- |
| 400         | Invalid inquiry or listing identifier        | We could not load inquiry status. Please return to the listing and try again.    |
| 401         | User not authenticated                       | Please sign in to view inquiry confirmation.                                     |
| 403         | User lacks permission for this inquiry       | Your account cannot view this inquiry status.                                    |
| 404         | Inquiry or listing not found                 | This inquiry or listing is no longer available. Please return to search results. |
| 409         | Inquiry record conflicts with current status | The inquiry status changed. Please refresh the page.                             |
| 410         | Listing no longer accepting inquiries        | This listing is not accepting new inquiries right now.                           |
| 429         | Too many status requests                     | You are checking status too quickly. Please wait a moment and try again.         |
| 500         | Unexpected server error                      | Something went wrong while loading inquiry status. Please try again.             |
| 503         | Service temporarily unavailable              | Inquiry status is temporarily unavailable. Please try again shortly.             |

Non-HTTP validation feedback:

- Missing inquiry reference: We could not identify this inquiry. Please open it again from your confirmation.
- Closed inquiry: This listing is not accepting new inquiries right now.
- No confirmation yet: No inquiry has been sent for this listing.
