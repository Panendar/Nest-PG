## 1. Screens

1. Listing Detail Screen (with contact entry)
   - Route: /user/listings/{listing_id}
   - User reviews listing and starts contact action.
2. Contact Owner Form Modal/Panel
   - Route context: /user/listings/{listing_id}
   - User enters inquiry details and submits to owner.
3. Inquiry Confirmation State
   - Route context: /user/listings/{listing_id}
   - Success message and next actions after submission.

## 2. Business Rules

- Only authenticated User-role users can initiate and submit owner inquiries.
- Contact action is available from listing detail and eligible result-card entry points.
- Inquiry must always be associated with exactly one listing.
- Contact submission is allowed only when listing is active and accepting inquiries.
- User must provide required inquiry fields before submission.
- After successful submission, user receives visible confirmation tied to selected listing.
- User can return to browsing after submission without losing core search context.
- This feature does not expose owner-side management actions.

State transitions:

- ListingViewed -> ContactInitiated -> ContactFormOpen
- ContactFormOpen -> ValidationError (missing/invalid required fields)
- ContactFormOpen -> Submitting -> SubmissionSuccess
- ContactFormOpen -> Submitting -> SubmissionFailure
- SubmissionSuccess -> ReturnToBrowsing
- ListingViewed/ContactFormOpen -> InquiryUnavailableState (listing not accepting inquiry)

Data constraints:

- Inquiry must reference a valid listing identifier.
- One submission payload maps to one owner and one listing.
- Inquiry text must stay within defined length limits.

## 3. Edge Cases

- Listing becomes unavailable before submit: block submit and show unavailable message.
- User starts contact from result card but listing context changes: form still shows explicit listing reference.
- Duplicate rapid submit clicks: only one submission is processed; others ignored until response.
- Session expires while form is open: require sign-in before submission.
- Optional fields omitted: submission still succeeds if required fields are valid.
- Temporary network failure on submit: show retryable error while preserving entered form values.
- User closes form without submitting: no inquiry is created.

## 4. API Endpoints Used

- GET /api/v1/listings/{listing_id}
  - Returns listing and inquiry eligibility context before contact.
- POST /api/v1/contacts
  - Creates a user inquiry to the owner for a specific listing.
- GET /api/v1/auth/me
  - Confirms authenticated user context for protected contact action.

## 5. DB Tables Used

- pg_listings
  - Source of listing status and owner linkage for inquiry eligibility.
- users
  - Source for authenticated user identity and role validation.
- contacts
  - Stores submitted user inquiries tied to listing and owner.

## 6. Frontend Components

- ContactOwnerEntryButton
- ContactOwnerFromListingModal
- ContactOwnerForm
- ContactOwnerListingContextHeader
- ContactOwnerNameField
- ContactOwnerPhoneField
- ContactOwnerMoveInDateField
- ContactOwnerMessageField
- ContactOwnerSubmitButton
- ContactOwnerCancelButton
- ContactOwnerValidationAlert
- ContactOwnerSubmitErrorAlert
- ContactOwnerSuccessToast
- InquiryUnavailableNotice

## 7. Validation Rules

| Field                  | Type   | Rules                                                                                |
| ---------------------- | ------ | ------------------------------------------------------------------------------------ |
| listing_id             | string | Required; must be valid listing identifier; must reference inquiry-eligible listing. |
| full_name              | string | Required; trim whitespace; min 2 chars; max 80 chars.                                |
| phone_number           | string | Required; must be valid reachable phone format for target region.                    |
| preferred_move_in_date | date   | Optional; if provided must be today or future date.                                  |
| message                | string | Required; trim whitespace; min 10 chars; max 500 chars.                              |

## 8. Error States

| HTTP Status | Condition                                          | User-Facing Message                                                         |
| ----------- | -------------------------------------------------- | --------------------------------------------------------------------------- |
| 400         | Invalid inquiry payload or missing required fields | Please review your details and try again.                                   |
| 401         | User not authenticated                             | Please sign in to contact the owner.                                        |
| 403         | User lacks permission for inquiry                  | Your account cannot send inquiries for this listing.                        |
| 404         | Listing not found                                  | This listing is no longer available. Please return to results.              |
| 409         | Duplicate or conflicting inquiry attempt           | You have already sent an inquiry recently. Please wait before trying again. |
| 410         | Listing not accepting inquiries                    | This listing is not accepting inquiries right now.                          |
| 422         | Field-level validation failed                      | Some details are incomplete or invalid. Please correct and resubmit.        |
| 429         | Too many inquiry attempts                          | You are sending requests too quickly. Please wait a moment and try again.   |
| 500         | Unexpected server error                            | Something went wrong while sending your inquiry. Please try again.          |
| 503         | Service temporarily unavailable                    | Contact service is temporarily unavailable. Please try again shortly.       |

Non-HTTP validation feedback:

- Missing required name: Please enter your full name.
- Invalid phone: Enter a valid phone number so the owner can reach you.
- Message too short: Please add a few more details about your inquiry.
- Listing not eligible: This listing cannot be contacted right now.
