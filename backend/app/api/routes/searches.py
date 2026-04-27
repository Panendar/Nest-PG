from __future__ import annotations

import json

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.security import require_roles
from app.db.models import RecentSearch
from app.db.session import get_db_session
from app.schemas.recent_searches import RecentSearchItem


router = APIRouter(prefix="/searches", tags=["searches"])


def _http_error(status_code: int, code: str, message: str) -> HTTPException:
    return HTTPException(status_code=status_code, detail={"code": code, "message": message})


@router.get("/{search_id}", response_model=RecentSearchItem)
def get_search_context(
    search_id: str,
    current_user: dict = Depends(require_roles(["user"])),
    db: Session = Depends(get_db_session),
) -> RecentSearchItem:
    search = db.scalar(select(RecentSearch).where(RecentSearch.id == search_id))
    if not search:
        raise _http_error(status.HTTP_404_NOT_FOUND, "NOT_FOUND", "This recent search is no longer available.")

    user_id = str(current_user.get("sub"))
    if search.user_id != user_id:
        raise _http_error(status.HTTP_403_FORBIDDEN, "FORBIDDEN", "You cannot view this recent search.")

    return RecentSearchItem(
        id=search.id,
        city=search.city,
        radius_km=search.radius_km,
        filters=json.loads(search.filters_json) if search.filters_json else None,
        sort=search.sort,
        searched_at=search.searched_at,
    )
