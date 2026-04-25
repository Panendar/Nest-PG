from pydantic import BaseModel, ConfigDict


class ListingOwner(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    email: str
    role: str


class ListingSummary(BaseModel):
    id: str
    title: str
    city: str
    availability_status: str
    accepting_inquiries: bool
    price: int
    distance_km: float | None = None


class ListingPagination(BaseModel):
    page: int
    page_size: int
    total: int
    total_pages: int


class SearchResultsResponse(BaseModel):
    items: list[ListingSummary]
    pagination: ListingPagination


class ListingDetailResponse(BaseModel):
    id: str
    title: str
    description: str
    city: str
    lat: float
    lng: float
    availability_status: str
    accepting_inquiries: bool
    price: int
    beds_available: int
    wifi_included: bool
    meals_included: bool
    furnished: bool
    owner: ListingOwner
    distance_km: float | None = None


class CompareListingResponse(BaseModel):
    id: str
    title: str
    city: str
    availability_status: str
    accepting_inquiries: bool
    price: int
    distance_km: float | None = None
    beds_available: int
    wifi_included: bool
    meals_included: bool
    furnished: bool
    amenities: list[str]


class CompareResultsResponse(BaseModel):
    items: list[CompareListingResponse]
