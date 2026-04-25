from __future__ import annotations

from collections.abc import Iterable
from datetime import datetime
from math import asin, cos, radians, sin, sqrt
import re

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.security import require_roles
from app.db.models import PgListing
from app.db.session import get_db_session
from app.schemas.listings import (
    CompareListingResponse,
    CompareResultsResponse,
    ListingDetailResponse,
    ListingOwner,
    ListingPagination,
    ListingSummary,
    SearchResultsResponse,
)


router = APIRouter(prefix="/listings", tags=["listings"])

ALLOWED_RADIUS_VALUES = {1, 2, 5, 10, 15, 20}
ALLOWED_AVAILABILITY = {"available", "limited", "full"}
ALLOWED_SORT_VALUES = {"relevance", "price_low_to_high", "price_high_to_low", "nearest", "newest"}


def _http_error(status_code: int, code: str, message: str) -> HTTPException:
    return HTTPException(status_code=status_code, detail={"code": code, "message": message})


def _normalize_city(city: str) -> str:
    normalized = " ".join(city.strip().split())
    if not normalized:
        raise _http_error(status.HTTP_400_BAD_REQUEST, "INVALID_CITY", "Please enter a city to search.")
    if len(normalized) < 2:
        raise _http_error(status.HTTP_400_BAD_REQUEST, "INVALID_CITY", "Enter at least 2 characters for the city.")
    if len(normalized) > 100:
        raise _http_error(status.HTTP_400_BAD_REQUEST, "INVALID_CITY", "City name must be 100 characters or fewer.")
    if not re.fullmatch(r"[A-Za-z .-]+", normalized):
        raise _http_error(
            status.HTTP_400_BAD_REQUEST,
            "INVALID_CITY",
            "We could not run this search. Check the city name and try again.",
        )
    return normalized


def _normalize_status(status_value: str | None) -> None:
    if status_value is None:
        return
    if status_value != "active":
        raise _http_error(status.HTTP_400_BAD_REQUEST, "INVALID_STATUS", "We could not run this search. Check the city name and try again.")


def _distance_km(lat1: float, lng1: float, lat2: float, lng2: float) -> float:
    radius_earth_km = 6371.0
    phi1 = radians(lat1)
    phi2 = radians(lat2)
    delta_phi = radians(lat2 - lat1)
    delta_lambda = radians(lng2 - lng1)
    a = sin(delta_phi / 2) ** 2 + cos(phi1) * cos(phi2) * sin(delta_lambda / 2) ** 2
    return 2 * radius_earth_km * asin(sqrt(a))


def _active_listings(db: Session) -> list[PgListing]:
    listings = list(db.scalars(select(PgListing).where(PgListing.is_active.is_(True))))
    return listings


def _filter_city(listings: Iterable[PgListing], city: str) -> list[PgListing]:
    target = _normalize_city(city).casefold()
    return [listing for listing in listings if listing.city.casefold() == target]


def _filter_availability(listings: Iterable[PgListing], availability: str | None) -> list[PgListing]:
    if availability is None:
        return list(listings)
    if availability not in ALLOWED_AVAILABILITY:
        raise _http_error(status.HTTP_400_BAD_REQUEST, "INVALID_AVAILABILITY", "We could not apply these filters. Please review your selections and try again.")
    return [listing for listing in listings if listing.availability_status == availability]


def _filter_price(listings: Iterable[PgListing], price_min: int | None, price_max: int | None) -> list[PgListing]:
    if price_min is not None and price_min < 0:
        raise _http_error(status.HTTP_400_BAD_REQUEST, "INVALID_PRICE", "We could not apply these filters. Please review your selections and try again.")
    if price_max is not None and price_min is not None and price_max < price_min:
        raise _http_error(status.HTTP_400_BAD_REQUEST, "INVALID_PRICE", "Maximum price must be equal to or higher than minimum price.")

    filtered = list(listings)
    if price_min is not None:
        filtered = [listing for listing in filtered if listing.price >= price_min]
    if price_max is not None:
        filtered = [listing for listing in filtered if listing.price <= price_max]
    return filtered


def _sort_listings(listings: list[PgListing], sort: str | None, origin: tuple[float, float] | None = None) -> list[tuple[PgListing, float | None]]:
    sort_value = sort or "relevance"
    if sort_value not in ALLOWED_SORT_VALUES:
        raise _http_error(status.HTTP_400_BAD_REQUEST, "INVALID_SORT", "We could not apply these filters. Please review your selections and try again.")

    scored: list[tuple[PgListing, float | None]] = []
    for listing in listings:
        distance = None
        if origin is not None:
            distance = _distance_km(origin[0], origin[1], listing.lat, listing.lng)
        scored.append((listing, distance))

    if sort_value == "price_low_to_high":
        scored.sort(key=lambda item: (item[0].price, item[0].created_at or datetime.min))
    elif sort_value == "price_high_to_low":
        scored.sort(key=lambda item: (-item[0].price, item[0].created_at or datetime.min))
    elif sort_value == "nearest":
        if origin is None:
            raise _http_error(status.HTTP_400_BAD_REQUEST, "INVALID_SORT", "We could not apply these filters. Please review your selections and try again.")
        scored.sort(key=lambda item: (item[1] if item[1] is not None else float("inf"), item[0].price))
    elif sort_value == "newest":
        scored.sort(key=lambda item: item[0].created_at or datetime.min, reverse=True)
    else:
        scored.sort(key=lambda item: (0 if item[0].availability_status == "available" else 1, item[0].created_at or datetime.min), reverse=False)

    return scored


def _paginate(scored: list[tuple[PgListing, float | None]], page: int, page_size: int) -> SearchResultsResponse:
    total = len(scored)
    total_pages = (total + page_size - 1) // page_size if total else 0
    start = (page - 1) * page_size
    end = start + page_size
    page_items = scored[start:end]
    return SearchResultsResponse(
        items=[
            ListingSummary(
                id=listing.id,
                title=listing.title,
                city=listing.city,
                availability_status=listing.availability_status,
                accepting_inquiries=listing.accepting_inquiries,
                price=listing.price,
                distance_km=round(distance, 1) if distance is not None else None,
            )
            for listing, distance in page_items
        ],
        pagination=ListingPagination(page=page, page_size=page_size, total=total, total_pages=total_pages),
    )


def _listing_owner(listing: PgListing) -> ListingOwner:
    owner = listing.owner
    return ListingOwner(id=owner.id, email=owner.email, role=owner.role)


def _detail_payload(listing: PgListing, distance_km: float | None = None) -> ListingDetailResponse:
    return ListingDetailResponse(
        id=listing.id,
        title=listing.title,
        description=listing.description,
        city=listing.city,
        lat=listing.lat,
        lng=listing.lng,
        availability_status=listing.availability_status,
        accepting_inquiries=listing.accepting_inquiries,
        price=listing.price,
        beds_available=listing.beds_available,
        wifi_included=listing.wifi_included,
        meals_included=listing.meals_included,
        furnished=listing.furnished,
        owner=_listing_owner(listing),
        distance_km=round(distance_km, 1) if distance_km is not None else None,
    )


def _compare_payload(listing: PgListing, distance_km: float | None = None) -> CompareListingResponse:
    amenities = []
    if listing.wifi_included:
        amenities.append("Wi-Fi")
    if listing.meals_included:
        amenities.append("Meals")
    if listing.furnished:
        amenities.append("Furnished")
    return CompareListingResponse(
        id=listing.id,
        title=listing.title,
        city=listing.city,
        availability_status=listing.availability_status,
        accepting_inquiries=listing.accepting_inquiries,
        price=listing.price,
        distance_km=round(distance_km, 1) if distance_km is not None else None,
        beds_available=listing.beds_available,
        wifi_included=listing.wifi_included,
        meals_included=listing.meals_included,
        furnished=listing.furnished,
        amenities=amenities,
    )


@router.get("", response_model=SearchResultsResponse)
def search_listings(
    _current_user: dict = Depends(require_roles(["user"])),
    db: Session = Depends(get_db_session),
    city: str | None = Query(default=None),
    availability: str | None = Query(default=None),
    price_min: int | None = Query(default=None),
    price_max: int | None = Query(default=None),
    sort: str | None = Query(default=None),
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=50),
    status_value: str | None = Query(default="active", alias="status"),
) -> SearchResultsResponse:
    _normalize_status(status_value)
    if city is None or not city.strip():
        raise _http_error(status.HTTP_400_BAD_REQUEST, "INVALID_CITY", "Please enter a city to search.")

    listings = _active_listings(db)
    listings = _filter_city(listings, city)
    listings = _filter_availability(listings, availability)
    listings = _filter_price(listings, price_min, price_max)
    scored = _sort_listings(listings, sort)
    return _paginate(scored, page, page_size)


@router.get("/nearby", response_model=SearchResultsResponse)
def nearby_listings(
    _current_user: dict = Depends(require_roles(["user"])),
    db: Session = Depends(get_db_session),
    lat: float | None = Query(default=None),
    lng: float | None = Query(default=None),
    radius_km: int | None = Query(default=None),
    availability: str | None = Query(default=None),
    price_min: int | None = Query(default=None),
    price_max: int | None = Query(default=None),
    sort: str | None = Query(default="nearest"),
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=50),
    status_value: str | None = Query(default="active", alias="status"),
) -> SearchResultsResponse:
    _normalize_status(status_value)
    if lat is None or lng is None:
        raise _http_error(status.HTTP_400_BAD_REQUEST, "MISSING_LOCATION", "We need your location to show nearby PGs.")
    if not -90 <= lat <= 90 or not -180 <= lng <= 180:
        raise _http_error(status.HTTP_400_BAD_REQUEST, "INVALID_LOCATION", "We could not run nearby search. Check your location and radius, then try again.")
    if radius_km is None:
        raise _http_error(status.HTTP_400_BAD_REQUEST, "MISSING_RADIUS", "Please select a search radius.")
    if radius_km not in ALLOWED_RADIUS_VALUES:
        raise _http_error(status.HTTP_400_BAD_REQUEST, "INVALID_RADIUS", "Please choose one of the available radius options.")

    listings = [listing for listing in _active_listings(db) if _distance_km(lat, lng, listing.lat, listing.lng) <= radius_km]
    listings = _filter_availability(listings, availability)
    listings = _filter_price(listings, price_min, price_max)
    scored = _sort_listings(listings, sort, origin=(lat, lng))
    return _paginate(scored, page, page_size)


@router.get("/compare", response_model=CompareResultsResponse)
def compare_listings(
    _current_user: dict = Depends(require_roles(["user"])),
    db: Session = Depends(get_db_session),
    ids: str = Query(..., min_length=1),
) -> CompareResultsResponse:
    listing_ids = [item.strip() for item in ids.split(",") if item.strip()]
    if len(listing_ids) < 2:
        raise _http_error(status.HTTP_422_UNPROCESSABLE_ENTITY, "MIN_SELECTION", "Please select at least two listings to compare.")
    if len(listing_ids) > 4:
        raise _http_error(status.HTTP_400_BAD_REQUEST, "MAX_SELECTION", "You can compare up to 4 listings at a time.")
    if len(set(listing_ids)) != len(listing_ids):
        raise _http_error(status.HTTP_400_BAD_REQUEST, "DUPLICATE_SELECTION", "This listing is already in your comparison.")

    listings = []
    for listing_id in listing_ids:
        listing = db.scalar(select(PgListing).where(PgListing.id == listing_id))
        if not listing:
            raise _http_error(status.HTTP_404_NOT_FOUND, "NOT_FOUND", "One selected listing is no longer available. Please update your comparison.")
        if not listing.is_active:
            raise _http_error(status.HTTP_410_GONE, "GONE", "A selected listing is no longer accepting inquiries. You can continue with others.")
        listings.append(listing)

    return CompareResultsResponse(items=[_compare_payload(listing) for listing in listings])


@router.get("/{listing_id}", response_model=ListingDetailResponse)
def get_listing(
    listing_id: str,
    _current_user: dict = Depends(require_roles(["user"])),
    db: Session = Depends(get_db_session),
) -> ListingDetailResponse:
    listing = db.scalar(select(PgListing).where(PgListing.id == listing_id))
    if not listing:
        raise _http_error(status.HTTP_404_NOT_FOUND, "NOT_FOUND", "This listing is no longer available. Please return to search results.")
    if not listing.is_active:
        raise _http_error(status.HTTP_410_GONE, "GONE", "This listing is no longer accepting inquiries. You can browse other options.")
    return _detail_payload(listing)
