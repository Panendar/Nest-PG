from datetime import date, datetime

from pydantic import BaseModel, ConfigDict, Field, field_validator


class ContactCreateRequest(BaseModel):
    listing_id: str = Field(min_length=1)
    full_name: str = Field(min_length=2, max_length=80)
    phone_number: str = Field(min_length=7, max_length=32)
    preferred_move_in_date: date | None = None
    message: str = Field(min_length=10, max_length=500)

    @field_validator("listing_id", "full_name", "phone_number", "message")
    @classmethod
    def _trim_fields(cls, value: str) -> str:
        normalized = " ".join(value.strip().split())
        if not normalized:
            raise ValueError("Field cannot be empty")
        return normalized


class ContactCreateResponse(BaseModel):
    id: str
    listing_id: str
    status: str
    submitted_at: datetime


class ContactStatusResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    listing_id: str
    status: str
    submitted_at: datetime
    can_contact_again: bool
