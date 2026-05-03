from datetime import datetime

from pydantic import BaseModel, Field, field_validator


ALLOWED_LISTING_STATUSES = {"active", "draft", "paused"}
ALLOWED_AVAILABILITY_STATUSES = {"available", "limited", "full"}


class OwnerListingCreateRequest(BaseModel):
    pg_name: str = Field(min_length=2, max_length=120)
    city: str = Field(min_length=2, max_length=100)
    area: str = Field(min_length=2, max_length=120)
    monthly_rent: int = Field(gt=0)
    occupancy_type: str = Field(min_length=2, max_length=40)
    available_units: int = Field(ge=0)
    description: str = Field(min_length=10, max_length=2000)
    amenities: list[str] = Field(default_factory=list)
    listing_status: str = Field(default="active")
    availability_status: str = Field(default="available")
    availability_note: str | None = Field(default=None, max_length=200)

    @field_validator("pg_name", "city", "area", "occupancy_type", "description")
    @classmethod
    def _strip_text(cls, value: str) -> str:
        return " ".join(value.strip().split())

    @field_validator("amenities")
    @classmethod
    def _normalize_amenities(cls, value: list[str]) -> list[str]:
        return [item.strip() for item in value if item.strip()]

    @field_validator("listing_status")
    @classmethod
    def _validate_listing_status(cls, value: str) -> str:
        normalized = value.strip().lower()
        if normalized not in ALLOWED_LISTING_STATUSES:
            raise ValueError("Invalid listing status")
        return normalized

    @field_validator("availability_status")
    @classmethod
    def _validate_availability_status(cls, value: str) -> str:
        normalized = value.strip().lower()
        if normalized not in ALLOWED_AVAILABILITY_STATUSES:
            raise ValueError("Invalid availability status")
        return normalized

    @field_validator("availability_note")
    @classmethod
    def _normalize_availability_note(cls, value: str | None) -> str | None:
        if value is None:
            return None
        cleaned = " ".join(value.strip().split())
        return cleaned or None


class OwnerListingCreateResponse(BaseModel):
    id: str
    owner_id: str
    pg_name: str
    city: str
    area: str
    listing_status: str
    availability_status: str
    created_at: datetime


class OwnerListingAvailabilityUpdateRequest(BaseModel):
    availability_status: str = Field(min_length=3, max_length=20)
    availability_note: str | None = Field(default=None, max_length=200)

    @field_validator("availability_status")
    @classmethod
    def _validate_availability_status(cls, value: str) -> str:
        normalized = value.strip().lower()
        if normalized not in ALLOWED_AVAILABILITY_STATUSES:
            raise ValueError("Invalid availability status")
        return normalized

    @field_validator("availability_note")
    @classmethod
    def _normalize_availability_note(cls, value: str | None) -> str | None:
        if value is None:
            return None
        cleaned = " ".join(value.strip().split())
        return cleaned or None


class OwnerListingAvailabilityUpdateResponse(BaseModel):
    id: str
    availability_status: str
    availability_note: str | None
    updated_at: datetime


class OwnerListingDetailResponse(BaseModel):
    id: str
    owner_id: str
    pg_name: str
    city: str
    area: str
    monthly_rent: int
    occupancy_type: str
    available_units: int
    description: str
    amenities: list[str]
    listing_status: str
    availability_status: str
    availability_note: str | None
    created_at: datetime
    updated_at: datetime


class OwnerListingUpdateRequest(BaseModel):
    pg_name: str = Field(min_length=2, max_length=120)
    city: str = Field(min_length=2, max_length=100)
    area: str = Field(min_length=2, max_length=120)
    monthly_rent: int = Field(gt=0)
    occupancy_type: str = Field(min_length=2, max_length=40)
    available_units: int = Field(ge=0)
    description: str = Field(min_length=10, max_length=2000)
    amenities: list[str] = Field(default_factory=list)
    listing_status: str = Field(default="active")

    @field_validator("pg_name", "city", "area", "occupancy_type", "description")
    @classmethod
    def _strip_text(cls, value: str) -> str:
        return " ".join(value.strip().split())

    @field_validator("amenities")
    @classmethod
    def _normalize_amenities(cls, value: list[str]) -> list[str]:
        return [item.strip() for item in value if item.strip()]

    @field_validator("listing_status")
    @classmethod
    def _validate_listing_status(cls, value: str) -> str:
        normalized = value.strip().lower()
        if normalized not in ALLOWED_LISTING_STATUSES:
            raise ValueError("Invalid listing status")
        return normalized


class OwnerListingUpdateResponse(BaseModel):
    id: str
    pg_name: str
    city: str
    area: str
    monthly_rent: int
    occupancy_type: str
    available_units: int
    description: str
    amenities: list[str]
    listing_status: str
    updated_at: datetime
