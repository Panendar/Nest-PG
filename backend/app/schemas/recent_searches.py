from datetime import datetime
from typing import Any

from pydantic import BaseModel, Field


class RecentSearchCreateRequest(BaseModel):
    city: str | None = Field(default=None, max_length=100)
    radius_km: int | None = None
    filters: dict[str, Any] | None = None
    sort: str | None = Field(default=None, max_length=50)


class RecentSearchItem(BaseModel):
    id: str
    city: str | None
    radius_km: int | None
    filters: dict[str, Any] | None
    sort: str | None
    searched_at: datetime


class RecentSearchesPagination(BaseModel):
    page: int
    page_size: int
    total: int
    total_pages: int


class RecentSearchesResponse(BaseModel):
    items: list[RecentSearchItem]
    pagination: RecentSearchesPagination


class RecentSearchCreateResponse(BaseModel):
    id: str
    searched_at: datetime
