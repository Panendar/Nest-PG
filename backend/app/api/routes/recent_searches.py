from __future__ import annotations

from datetime import UTC, datetime
import json
import uuid

from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.security import require_roles
from app.db.models import RecentSearch
from app.db.session import get_db_session
from app.schemas.recent_searches import (
    RecentSearchCreateRequest,
    RecentSearchCreateResponse,
    RecentSearchItem,
    RecentSearchesPagination,
    RecentSearchesResponse,
)


router = APIRouter(prefix="/recent-searches", tags=["recent-searches"])
ALLOWED_RADIUS_VALUES = {1, 2, 5, 10, 15, 20}
RECENT_SEARCH_LIMIT = 20


def _http_error(status_code: int, code: str, message: str) -> HTTPException:
    return HTTPException(status_code=status_code, detail={"code": code, "message": message})


def _build_context_key(payload: RecentSearchCreateRequest) -> str:
    filters_payload = payload.filters or {}
    parts = {
        "city": (payload.city or "").strip().lower(),
        "radius_km": payload.radius_km,
        "filters": filters_payload,
        "sort": (payload.sort or "").strip().lower(),
    }
    return json.dumps(parts, sort_keys=True, separators=(",", ":"))


@router.get("", response_model=RecentSearchesResponse)
def list_recent_searches(
    current_user: dict = Depends(require_roles(["user"])),
    db: Session = Depends(get_db_session),
    page: int = 1,
    page_size: int = 20,
) -> RecentSearchesResponse:
    page = max(1, page)
    page_size = min(max(1, page_size), 50)

    user_id = str(current_user.get("sub"))
    all_items = list(db.scalars(select(RecentSearch).where(RecentSearch.user_id == user_id).order_by(RecentSearch.searched_at.desc())))
    total = len(all_items)
    total_pages = (total + page_size - 1) // page_size if total else 0
    start = (page - 1) * page_size
    end = start + page_size

    items: list[RecentSearchItem] = []
    for item in all_items[start:end]:
        filters = json.loads(item.filters_json) if item.filters_json else None
        items.append(
            RecentSearchItem(
                id=item.id,
                city=item.city,
                radius_km=item.radius_km,
                filters=filters,
                sort=item.sort,
                searched_at=item.searched_at,
            )
        )

    return RecentSearchesResponse(
        items=items,
        pagination=RecentSearchesPagination(page=page, page_size=page_size, total=total, total_pages=total_pages),
    )


@router.post("", response_model=RecentSearchCreateResponse, status_code=status.HTTP_201_CREATED)
def create_recent_search(
    payload: RecentSearchCreateRequest,
    current_user: dict = Depends(require_roles(["user"])),
    db: Session = Depends(get_db_session),
) -> RecentSearchCreateResponse:
    city = (payload.city or "").strip()
    has_payload = bool(city or payload.radius_km is not None or payload.filters or payload.sort)
    if not has_payload:
        raise _http_error(status.HTTP_400_BAD_REQUEST, "INVALID_SEARCH", "We could not restore this search. Please try again.")

    if payload.radius_km is not None and payload.radius_km not in ALLOWED_RADIUS_VALUES:
        raise _http_error(status.HTTP_400_BAD_REQUEST, "INVALID_RADIUS", "We could not restore this search. Please try again.")

    user_id = str(current_user.get("sub"))
    context_key = _build_context_key(payload)
    existing = db.scalar(select(RecentSearch).where(RecentSearch.user_id == user_id, RecentSearch.context_key == context_key))

    if existing:
        existing.city = city or None
        existing.radius_km = payload.radius_km
        existing.filters_json = json.dumps(payload.filters, sort_keys=True) if payload.filters else None
        existing.sort = payload.sort
        existing.searched_at = datetime.now(UTC)
        db.add(existing)
        db.commit()
        db.refresh(existing)
        return RecentSearchCreateResponse(id=existing.id, searched_at=existing.searched_at)

    recent = RecentSearch(
        id=str(uuid.uuid4()),
        user_id=user_id,
        city=city or None,
        radius_km=payload.radius_km,
        filters_json=json.dumps(payload.filters, sort_keys=True) if payload.filters else None,
        sort=payload.sort,
        context_key=context_key,
    )
    db.add(recent)
    db.commit()
    db.refresh(recent)

    all_items = list(db.scalars(select(RecentSearch).where(RecentSearch.user_id == user_id).order_by(RecentSearch.searched_at.desc())))
    for stale_item in all_items[RECENT_SEARCH_LIMIT:]:
        db.delete(stale_item)
    db.commit()

    return RecentSearchCreateResponse(id=recent.id, searched_at=recent.searched_at)


@router.delete("/{recent_search_id}", status_code=status.HTTP_204_NO_CONTENT, response_class=Response)
def delete_recent_search(
    recent_search_id: str,
    current_user: dict = Depends(require_roles(["user"])),
    db: Session = Depends(get_db_session),
) -> Response:
    user_id = str(current_user.get("sub"))

    recent = db.scalar(select(RecentSearch).where(RecentSearch.id == recent_search_id))
    if not recent:
        raise _http_error(status.HTTP_404_NOT_FOUND, "NOT_FOUND", "This recent search is no longer available.")
    if recent.user_id != user_id:
        raise _http_error(status.HTTP_403_FORBIDDEN, "FORBIDDEN", "You cannot modify this recent search.")

    db.delete(recent)
    db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)
