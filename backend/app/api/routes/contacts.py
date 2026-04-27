from __future__ import annotations

from datetime import UTC, datetime, timedelta
import re
import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.security import require_roles
from app.db.models import Contact, PgListing
from app.db.session import get_db_session
from app.schemas.contacts import ContactCreateRequest, ContactCreateResponse, ContactStatusResponse


router = APIRouter(prefix="/contacts", tags=["contacts"])
PHONE_RE = re.compile(r"^[+()\-\d\s]{7,32}$")


def _http_error(status_code: int, code: str, message: str) -> HTTPException:
    return HTTPException(status_code=status_code, detail={"code": code, "message": message})


@router.post("", response_model=ContactCreateResponse, status_code=status.HTTP_201_CREATED)
def create_contact(
    payload: ContactCreateRequest,
    current_user: dict = Depends(require_roles(["user"]),),
    db: Session = Depends(get_db_session),
) -> ContactCreateResponse:
    if payload.preferred_move_in_date and payload.preferred_move_in_date < datetime.now(UTC).date():
        raise _http_error(status.HTTP_422_UNPROCESSABLE_ENTITY, "VALIDATION_ERROR", "Some details are incomplete or invalid. Please correct and resubmit.")

    if not PHONE_RE.fullmatch(payload.phone_number):
        raise _http_error(status.HTTP_422_UNPROCESSABLE_ENTITY, "VALIDATION_ERROR", "Some details are incomplete or invalid. Please correct and resubmit.")

    listing = db.scalar(select(PgListing).where(PgListing.id == payload.listing_id))
    if not listing:
        raise _http_error(status.HTTP_404_NOT_FOUND, "NOT_FOUND", "This listing is no longer available. Please return to results.")
    if not listing.is_active or not listing.accepting_inquiries:
        raise _http_error(status.HTTP_410_GONE, "INQUIRY_CLOSED", "This listing is not accepting inquiries right now.")

    user_id = str(current_user.get("sub"))
    one_minute_ago = datetime.now(UTC) - timedelta(minutes=1)
    rapid_count = db.query(Contact).filter(Contact.user_id == user_id, Contact.submitted_at >= one_minute_ago).count()
    if rapid_count >= 5:
        raise _http_error(status.HTTP_429_TOO_MANY_REQUESTS, "RATE_LIMITED", "You are sending requests too quickly. Please wait a moment and try again.")

    recent_duplicate_cutoff = datetime.now(UTC) - timedelta(minutes=10)
    duplicate = db.scalar(
        select(Contact).where(
            Contact.user_id == user_id,
            Contact.listing_id == payload.listing_id,
            Contact.submitted_at >= recent_duplicate_cutoff,
        )
    )
    if duplicate:
        raise _http_error(status.HTTP_409_CONFLICT, "DUPLICATE_CONTACT", "You have already sent an inquiry recently. Please wait before trying again.")

    contact = Contact(
        id=str(uuid.uuid4()),
        user_id=user_id,
        owner_id=listing.owner_id,
        listing_id=listing.id,
        full_name=payload.full_name,
        phone_number=payload.phone_number,
        preferred_move_in_date=payload.preferred_move_in_date,
        message=payload.message,
        status="confirmed",
    )
    db.add(contact)
    db.commit()
    db.refresh(contact)
    return ContactCreateResponse(id=contact.id, listing_id=contact.listing_id, status=contact.status, submitted_at=contact.submitted_at)


@router.get("/{contact_id}", response_model=ContactStatusResponse)
def get_contact_status(
    contact_id: str,
    current_user: dict = Depends(require_roles(["user"])),
    db: Session = Depends(get_db_session),
) -> ContactStatusResponse:
    contact = db.scalar(select(Contact).where(Contact.id == contact_id))
    if not contact:
        raise _http_error(status.HTTP_404_NOT_FOUND, "NOT_FOUND", "This inquiry or listing is no longer available. Please return to search results.")

    user_id = str(current_user.get("sub"))
    if contact.user_id != user_id:
        raise _http_error(status.HTTP_403_FORBIDDEN, "FORBIDDEN", "Your account cannot view this inquiry status.")

    listing = db.scalar(select(PgListing).where(PgListing.id == contact.listing_id))
    if not listing:
        raise _http_error(status.HTTP_404_NOT_FOUND, "NOT_FOUND", "This inquiry or listing is no longer available. Please return to search results.")

    can_contact_again = bool(listing.is_active and listing.accepting_inquiries)
    inquiry_status = "open" if can_contact_again else "closed"
    return ContactStatusResponse(
        id=contact.id,
        listing_id=contact.listing_id,
        status=inquiry_status,
        submitted_at=contact.submitted_at,
        can_contact_again=can_contact_again,
    )
