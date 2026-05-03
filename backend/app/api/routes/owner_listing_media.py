from __future__ import annotations

from datetime import datetime, timezone
from pathlib import Path
import uuid

from fastapi import APIRouter, Depends, File, Form, HTTPException, Response, UploadFile, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.security import require_roles
from app.db.models import ListingMedia, PgListing
from app.db.session import get_db_session
from app.schemas.owner_listing_media import OwnerListingMediaItemResponse, OwnerListingMediaListResponse


router = APIRouter(prefix="/owner/listings", tags=["owner-listing-media"])
UPLOAD_DIR = Path(__file__).resolve().parents[3] / "uploads"
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)


def _http_error(status_code: int, code: str, message: str) -> HTTPException:
    return HTTPException(status_code=status_code, detail={"code": code, "message": message})


def _owned_listing(db: Session, owner_id: str, listing_id: str) -> PgListing:
    listing = db.scalar(
        select(PgListing).where(
            PgListing.id == listing_id,
            PgListing.owner_id == owner_id,
            PgListing.deleted_at.is_(None),
        )
    )
    if not listing:
        raise _http_error(status.HTTP_404_NOT_FOUND, "NOT_FOUND", "The selected photo or listing is no longer available.")
    return listing


def _media_item_response(item: ListingMedia) -> OwnerListingMediaItemResponse:
    return OwnerListingMediaItemResponse(
        id=item.id,
        listing_id=item.listing_id,
        file_url=item.file_url,
        caption=item.caption,
        sort_order=item.sort_order,
        is_primary=item.is_primary,
        created_at=item.created_at,
        updated_at=item.updated_at,
    )


def _assert_image_file(file: UploadFile) -> None:
    if not file.content_type or not file.content_type.startswith("image/"):
        raise _http_error(status.HTTP_400_BAD_REQUEST, "INVALID_MEDIA", "This photo could not be used. Please choose a supported image and try again.")


def _store_file(file: UploadFile) -> tuple[str, str]:
    extension = Path(file.filename or "").suffix or ".jpg"
    storage_key = f"listing-media/{uuid.uuid4()}{extension}"
    physical_path = UPLOAD_DIR / storage_key.replace("/", "_")
    content = file.file.read()
    if len(content) > 8 * 1024 * 1024:
        raise _http_error(status.HTTP_413_REQUEST_ENTITY_TOO_LARGE, "MEDIA_TOO_LARGE", "This photo is too large to upload. Please choose a smaller image.")
    physical_path.write_bytes(content)
    return storage_key, f"/uploads/{physical_path.name}"


@router.get("/{listing_id}/media", response_model=OwnerListingMediaListResponse)
def list_listing_media(
    listing_id: str,
    current_user: dict = Depends(require_roles(["owner"])),
    db: Session = Depends(get_db_session),
) -> OwnerListingMediaListResponse:
    owner_id = str(current_user.get("sub", "")).strip()
    _owned_listing(db, owner_id, listing_id)
    items = list(
        db.scalars(
            select(ListingMedia).where(ListingMedia.listing_id == listing_id, ListingMedia.deleted_at.is_(None)).order_by(ListingMedia.sort_order.asc())
        )
    )
    return OwnerListingMediaListResponse(items=[_media_item_response(item) for item in items])


@router.post("/{listing_id}/media", response_model=OwnerListingMediaItemResponse, status_code=status.HTTP_201_CREATED)
def add_listing_media(
    listing_id: str,
    file: UploadFile = File(...),
    caption: str | None = Form(default=None),
    sort_order: int = Form(default=0),
    is_primary: bool = Form(default=False),
    current_user: dict = Depends(require_roles(["owner"])),
    db: Session = Depends(get_db_session),
) -> OwnerListingMediaItemResponse:
    owner_id = str(current_user.get("sub", "")).strip()
    _owned_listing(db, owner_id, listing_id)
    _assert_image_file(file)
    storage_key, file_url = _store_file(file)
    normalized_caption = " ".join(caption.strip().split()) if caption else None

    if is_primary:
        existing_primary = list(
            db.scalars(select(ListingMedia).where(ListingMedia.listing_id == listing_id, ListingMedia.deleted_at.is_(None), ListingMedia.is_primary.is_(True)))
        )
        for item in existing_primary:
            item.is_primary = False

    media = ListingMedia(
        id=str(uuid.uuid4()),
        listing_id=listing_id,
        storage_key=storage_key,
        file_url=file_url,
        caption=normalized_caption,
        sort_order=sort_order,
        is_primary=is_primary,
    )
    db.add(media)
    db.commit()
    db.refresh(media)
    return _media_item_response(media)


@router.put("/{listing_id}/media/{media_id}", response_model=OwnerListingMediaItemResponse)
def update_listing_media(
    listing_id: str,
    media_id: str,
    file: UploadFile | None = File(default=None),
    caption: str | None = Form(default=None),
    sort_order: int | None = Form(default=None),
    is_primary: bool | None = Form(default=None),
    current_user: dict = Depends(require_roles(["owner"])),
    db: Session = Depends(get_db_session),
) -> OwnerListingMediaItemResponse:
    owner_id = str(current_user.get("sub", "")).strip()
    _owned_listing(db, owner_id, listing_id)
    media = db.scalar(
        select(ListingMedia).where(ListingMedia.id == media_id, ListingMedia.listing_id == listing_id, ListingMedia.deleted_at.is_(None))
    )
    if not media:
        raise _http_error(status.HTTP_404_NOT_FOUND, "NOT_FOUND", "The selected photo or listing is no longer available.")

    if file:
        _assert_image_file(file)
        storage_key, file_url = _store_file(file)
        media.storage_key = storage_key
        media.file_url = file_url
    if caption is not None:
        cleaned = " ".join(caption.strip().split())
        media.caption = cleaned or None
    if sort_order is not None:
        media.sort_order = sort_order
    if is_primary is not None:
        if is_primary:
            existing_primary = list(
                db.scalars(
                    select(ListingMedia).where(
                        ListingMedia.listing_id == listing_id,
                        ListingMedia.deleted_at.is_(None),
                        ListingMedia.is_primary.is_(True),
                        ListingMedia.id != media.id,
                    )
                )
            )
            for item in existing_primary:
                item.is_primary = False
        media.is_primary = is_primary

    media.updated_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(media)
    return _media_item_response(media)


@router.delete("/{listing_id}/media/{media_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_listing_media(
    listing_id: str,
    media_id: str,
    current_user: dict = Depends(require_roles(["owner"])),
    db: Session = Depends(get_db_session),
) -> Response:
    owner_id = str(current_user.get("sub", "")).strip()
    _owned_listing(db, owner_id, listing_id)
    media = db.scalar(
        select(ListingMedia).where(ListingMedia.id == media_id, ListingMedia.listing_id == listing_id, ListingMedia.deleted_at.is_(None))
    )
    if not media:
        raise _http_error(status.HTTP_404_NOT_FOUND, "NOT_FOUND", "The selected photo or listing is no longer available.")
    media.deleted_at = datetime.now(timezone.utc)
    db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)
