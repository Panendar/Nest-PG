from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy import select
from sqlalchemy.orm import Session
import uuid

from app.core.security import require_roles
from app.db.models import PgListing, SavedListing
from app.db.session import get_db_session
from app.schemas.listings import ListingSummary
from app.schemas.saved_listings import (
    SavedListingCreateRequest,
    SavedListingCreateResponse,
    SavedListingItem,
    SavedListingsPagination,
    SavedListingsResponse,
)


router = APIRouter(prefix="/saved-listings", tags=["saved-listings"])


def _http_error(status_code: int, code: str, message: str) -> HTTPException:
    return HTTPException(status_code=status_code, detail={"code": code, "message": message})


@router.get("", response_model=SavedListingsResponse)
def list_saved_listings(
    current_user: dict = Depends(require_roles(["user"])),
    db: Session = Depends(get_db_session),
    page: int = 1,
    page_size: int = 20,
) -> SavedListingsResponse:
    page = max(1, page)
    page_size = min(max(1, page_size), 50)

    user_id = str(current_user.get("sub"))
    all_items = list(db.scalars(select(SavedListing).where(SavedListing.user_id == user_id).order_by(SavedListing.saved_at.desc())))
    total = len(all_items)
    total_pages = (total + page_size - 1) // page_size if total else 0
    start = (page - 1) * page_size
    end = start + page_size

    response_items: list[SavedListingItem] = []
    for item in all_items[start:end]:
        listing = db.scalar(select(PgListing).where(PgListing.id == item.listing_id))
        if not listing:
            continue
        listing_summary = ListingSummary(
            id=listing.id,
            title=listing.title,
            city=listing.city,
            availability_status=listing.availability_status,
            accepting_inquiries=listing.accepting_inquiries,
            price=listing.price,
            distance_km=None,
        )
        response_items.append(
            SavedListingItem(
                id=item.id,
                listing_id=item.listing_id,
                saved_at=item.saved_at,
                listing_summary=listing_summary,
            )
        )

    return SavedListingsResponse(
        items=response_items,
        pagination=SavedListingsPagination(page=page, page_size=page_size, total=total, total_pages=total_pages),
    )


@router.post("", response_model=SavedListingCreateResponse, status_code=status.HTTP_201_CREATED)
def create_saved_listing(
    payload: SavedListingCreateRequest,
    current_user: dict = Depends(require_roles(["user"])),
    db: Session = Depends(get_db_session),
) -> SavedListingCreateResponse:
    user_id = str(current_user.get("sub"))

    listing = db.scalar(select(PgListing).where(PgListing.id == payload.listing_id))
    if not listing or not listing.is_active:
        raise _http_error(status.HTTP_404_NOT_FOUND, "NOT_FOUND", "This listing is no longer available in your saved list.")

    duplicate = db.scalar(select(SavedListing).where(SavedListing.user_id == user_id, SavedListing.listing_id == payload.listing_id))
    if duplicate:
        raise _http_error(status.HTTP_409_CONFLICT, "DUPLICATE_SAVED", "This listing is already in your saved list.")

    saved = SavedListing(id=str(uuid.uuid4()), user_id=user_id, listing_id=payload.listing_id)
    db.add(saved)
    db.commit()
    db.refresh(saved)
    return SavedListingCreateResponse(id=saved.id, listing_id=saved.listing_id, saved_at=saved.saved_at)


@router.delete("/{saved_listing_id}", status_code=status.HTTP_204_NO_CONTENT, response_class=Response)
def delete_saved_listing(
    saved_listing_id: str,
    current_user: dict = Depends(require_roles(["user"])),
    db: Session = Depends(get_db_session),
) -> Response:
    user_id = str(current_user.get("sub"))

    saved = db.scalar(select(SavedListing).where(SavedListing.id == saved_listing_id))
    if not saved:
        raise _http_error(status.HTTP_404_NOT_FOUND, "NOT_FOUND", "This listing is no longer available in your saved list.")
    if saved.user_id != user_id:
        raise _http_error(status.HTTP_403_FORBIDDEN, "FORBIDDEN", "You cannot modify this saved listing.")

    db.delete(saved)
    db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)
