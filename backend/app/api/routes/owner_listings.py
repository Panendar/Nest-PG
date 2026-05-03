from __future__ import annotations

import json
import uuid

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.security import require_roles
from app.db.models import PgListing
from app.db.session import get_db_session
from app.schemas.owner_listings import OwnerListingCreateRequest, OwnerListingCreateResponse
from app.schemas.owner_listings import OwnerListingAvailabilityUpdateRequest, OwnerListingAvailabilityUpdateResponse
from app.schemas.owner_listings import OwnerListingDetailResponse, OwnerListingUpdateRequest, OwnerListingUpdateResponse
from app.schemas.owner_listings import OwnerListingListResponse, OwnerListingListItem, OwnerListingsPagination


router = APIRouter(prefix="/owner/listings", tags=["owner-listings"])


def _http_error(status_code: int, code: str, message: str) -> HTTPException:
    return HTTPException(status_code=status_code, detail={"code": code, "message": message})


@router.get("", response_model=OwnerListingListResponse)
def list_owner_listings(
    current_user: dict = Depends(require_roles(["owner"])),
    db: Session = Depends(get_db_session),
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=50),
    listing_status: str | None = Query(default=None),
    availability_status: str | None = Query(default=None),
) -> OwnerListingListResponse:
    owner_id = str(current_user.get("sub", "")).strip()
    if not owner_id:
        raise _http_error(status.HTTP_401_UNAUTHORIZED, "UNAUTHORIZED", "Authentication required")

    query = select(PgListing).where(PgListing.owner_id == owner_id, PgListing.deleted_at.is_(None))
    if listing_status:
        query = query.where(PgListing.listing_status == listing_status.strip().lower())
    if availability_status:
        query = query.where(PgListing.availability_status == availability_status.strip().lower())

    all_items = list(db.scalars(query.order_by(PgListing.updated_at.desc())))
    total = len(all_items)
    total_pages = (total + page_size - 1) // page_size if total else 0
    start = (page - 1) * page_size
    end = start + page_size
    page_items = all_items[start:end]

    return OwnerListingListResponse(
        items=[
            OwnerListingListItem(
                id=item.id,
                pg_name=item.pg_name or item.title,
                city=item.city,
                area=item.area or "",
                monthly_rent=item.monthly_rent or item.price,
                listing_status=item.listing_status,
                availability_status=item.availability_status,
                updated_at=item.updated_at,
            )
            for item in page_items
        ],
        pagination=OwnerListingsPagination(page=page, page_size=page_size, total=total, total_pages=total_pages),
    )


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


def _amenities_from_listing(listing: PgListing) -> list[str]:
    if not listing.amenities_json:
        return []
    try:
        value = json.loads(listing.amenities_json)
    except json.JSONDecodeError:
        return []
    if not isinstance(value, list):
        return []
    return [str(item) for item in value]


@router.get("/{listing_id}", response_model=OwnerListingDetailResponse)
def get_owner_listing(
    listing_id: str,
    current_user: dict = Depends(require_roles(["owner"])),
    db: Session = Depends(get_db_session),
) -> OwnerListingDetailResponse:
    owner_id = str(current_user.get("sub", "")).strip()
    if not owner_id:
        raise _http_error(status.HTTP_401_UNAUTHORIZED, "UNAUTHORIZED", "Authentication required")

    listing = _get_owned_listing(db, owner_id, listing_id)
    amenities = _amenities_from_listing(listing)
    return OwnerListingDetailResponse(
        id=listing.id,
        owner_id=listing.owner_id,
        pg_name=listing.pg_name or listing.title,
        city=listing.city,
        area=listing.area or "",
        monthly_rent=listing.monthly_rent or listing.price,
        occupancy_type=listing.occupancy_type or "shared",
        available_units=listing.available_units if listing.available_units is not None else listing.beds_available,
        description=listing.description,
        amenities=amenities,
        listing_status=listing.listing_status,
        availability_status=listing.availability_status,
        availability_note=listing.availability_note,
        created_at=listing.created_at,
        updated_at=listing.updated_at,
    )


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


@router.put("/{listing_id}", response_model=OwnerListingUpdateResponse)
def update_owner_listing_details(
    listing_id: str,
    payload: OwnerListingUpdateRequest,
    current_user: dict = Depends(require_roles(["owner"])),
    db: Session = Depends(get_db_session),
) -> OwnerListingUpdateResponse:
    owner_id = str(current_user.get("sub", "")).strip()
    if not owner_id:
        raise _http_error(status.HTTP_401_UNAUTHORIZED, "UNAUTHORIZED", "Authentication required")

    listing = _get_owned_listing(db, owner_id, listing_id)
    amenities = payload.amenities
    listing.pg_name = payload.pg_name
    listing.title = payload.pg_name
    listing.city = payload.city
    listing.area = payload.area
    listing.monthly_rent = payload.monthly_rent
    listing.price = payload.monthly_rent
    listing.occupancy_type = payload.occupancy_type
    listing.available_units = payload.available_units
    listing.beds_available = max(1, payload.available_units)
    listing.description = payload.description
    listing.amenities_json = json.dumps(amenities)
    listing.listing_status = payload.listing_status
    listing.is_active = payload.listing_status == "active"
    listing.accepting_inquiries = listing.availability_status != "full" and listing.listing_status == "active"
    listing.wifi_included = "wifi" in {item.lower() for item in amenities}
    listing.meals_included = "meals" in {item.lower() for item in amenities}
    listing.furnished = "furnished" in {item.lower() for item in amenities}
    db.commit()
    db.refresh(listing)

    return OwnerListingUpdateResponse(
        id=listing.id,
        pg_name=listing.pg_name or listing.title,
        city=listing.city,
        area=listing.area or "",
        monthly_rent=listing.monthly_rent or listing.price,
        occupancy_type=listing.occupancy_type or "shared",
        available_units=listing.available_units if listing.available_units is not None else listing.beds_available,
        description=listing.description,
        amenities=amenities,
        listing_status=listing.listing_status,
        updated_at=listing.updated_at,
    )
