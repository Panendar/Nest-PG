from datetime import datetime

from pydantic import BaseModel, Field, field_validator


class OwnerListingMediaItemResponse(BaseModel):
    id: str
    listing_id: str
    file_url: str
    caption: str | None
    sort_order: int
    is_primary: bool
    created_at: datetime
    updated_at: datetime | None = None


class OwnerListingMediaListResponse(BaseModel):
    items: list[OwnerListingMediaItemResponse]


class OwnerListingMediaUpdateRequest(BaseModel):
    caption: str | None = Field(default=None, max_length=200)
    sort_order: int | None = Field(default=None, ge=0)
    is_primary: bool | None = None

    @field_validator("caption")
    @classmethod
    def _normalize_caption(cls, value: str | None) -> str | None:
        if value is None:
            return None
        cleaned = " ".join(value.strip().split())
        return cleaned or None
