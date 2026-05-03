from __future__ import annotations

import json
import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.security import require_roles
from app.db.models import PgListing
from app.db.session import get_db_session
from app.schemas.owner_listings import OwnerListingCreateRequest, OwnerListingCreateResponse
from app.schemas.owner_listings import OwnerListingAvailabilityUpdateRequest, OwnerListingAvailabilityUpdateResponse


router = APIRouter(prefix="/owner/listings", tags=["owner-listings"])


def _http_error(status_code: int, code: str, message: str) -> HTTPException:
    return HTTPException(status_code=status_code, detail={"code": code, "message": message})


@router.post("", response_model=OwnerListingCreateResponse, status_code=status.HTTP_201_CREATED)
def create_owner_listing(
    payload: OwnerListingCreateRequest,
    current_user: dict = Depends(require_roles(["owner"])),
    db: Session = Depends(get_db_session),
) -> OwnerListingCreateResponse:
    owner_id = str(current_user.get("sub", "")).strip()
    if not owner_id:
        raise _http_error(status.HTTP_401_UNAUTHORIZED, "UNAUTHORIZED", "Authentication required")

    duplicate = db.scalar(
        select(PgListing).where(
            PgListing.owner_id == owner_id,
            PgListing.pg_name == payload.pg_name,
            PgListing.area == payload.area,
            PgListing.deleted_at.is_(None),
        )
    )
    if duplicate:
        raise _http_error(
            status.HTTP_409_CONFLICT,
            "CONFLICT",
            "This listing could not be created as submitted. Please review and try again.",
        )

    amenities = payload.amenities
    listing = PgListing(
        id=str(uuid.uuid4()),
        owner_id=owner_id,
        title=payload.pg_name,
        pg_name=payload.pg_name,
        description=payload.description,
        city=payload.city,
        area=payload.area,
        # SPEC GAP: owner create spec does not define coordinates at create time.
        # We keep placeholder values until a geocoding/location feature is defined.
        lat=0.0,
        lng=0.0,
        price=payload.monthly_rent,
        monthly_rent=payload.monthly_rent,
        occupancy_type=payload.occupancy_type,
        available_units=payload.available_units,
        amenities_json=json.dumps(amenities),
        listing_status=payload.listing_status,
        availability_status=payload.availability_status,
        availability_note=payload.availability_note,
        accepting_inquiries=payload.availability_status != "full" and payload.listing_status == "active",
        beds_available=max(1, payload.available_units),
        wifi_included="wifi" in {item.lower() for item in amenities},
        meals_included="meals" in {item.lower() for item in amenities},
        furnished="furnished" in {item.lower() for item in amenities},
        is_active=payload.listing_status == "active",
    )
    db.add(listing)
    db.commit()
    db.refresh(listing)

    return OwnerListingCreateResponse(
        id=listing.id,
        owner_id=listing.owner_id,
        pg_name=listing.pg_name or listing.title,
        city=listing.city,
        area=listing.area or "",
        listing_status=listing.listing_status,
        availability_status=listing.availability_status,
        created_at=listing.created_at,
    )


def _get_owned_listing(db: Session, owner_id: str, listing_id: str) -> PgListing:
    listing = db.scalar(
        select(PgListing).where(
            PgListing.id == listing_id,
            PgListing.owner_id == owner_id,
            PgListing.deleted_at.is_(None),
        )
    )
    if not listing:
        raise _http_error(status.HTTP_404_NOT_FOUND, "NOT_FOUND", "This listing is no longer available to update.")
    return listing


@router.patch("/{listing_id}/availability", response_model=OwnerListingAvailabilityUpdateResponse)
def update_owner_listing_availability(
    listing_id: str,
    payload: OwnerListingAvailabilityUpdateRequest,
    current_user: dict = Depends(require_roles(["owner"])),
    db: Session = Depends(get_db_session),
) -> OwnerListingAvailabilityUpdateResponse:
    owner_id = str(current_user.get("sub", "")).strip()
    if not owner_id:
        raise _http_error(status.HTTP_401_UNAUTHORIZED, "UNAUTHORIZED", "Authentication required")

    listing = _get_owned_listing(db, owner_id, listing_id)
    listing.availability_status = payload.availability_status
    listing.availability_note = payload.availability_note
    listing.accepting_inquiries = payload.availability_status != "full" and listing.listing_status == "active"
    db.commit()
    db.refresh(listing)

    return OwnerListingAvailabilityUpdateResponse(
        id=listing.id,
        availability_status=listing.availability_status,
        availability_note=listing.availability_note,
        updated_at=listing.updated_at,
    )
