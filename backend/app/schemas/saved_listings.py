from datetime import datetime

from pydantic import BaseModel

from app.schemas.listings import ListingSummary


class SavedListingCreateRequest(BaseModel):
    listing_id: str


class SavedListingItem(BaseModel):
    id: str
    listing_id: str
    saved_at: datetime
    listing_summary: ListingSummary


class SavedListingsPagination(BaseModel):
    page: int
    page_size: int
    total: int
    total_pages: int


class SavedListingsResponse(BaseModel):
    items: list[SavedListingItem]
    pagination: SavedListingsPagination


class SavedListingCreateResponse(BaseModel):
    id: str
    listing_id: str
    saved_at: datetime
