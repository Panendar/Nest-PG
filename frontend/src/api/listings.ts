import { apiClient } from "./client";

export type ListingSummary = {
  id: string;
  title: string;
  city: string;
  availability_status: string;
  accepting_inquiries: boolean;
  price: number;
  distance_km: number | null;
};

export type ListingPagination = {
  page: number;
  page_size: number;
  total: number;
  total_pages: number;
};

export type SearchResults = {
  items: ListingSummary[];
  pagination: ListingPagination;
};

export type ListingOwner = {
  id: string;
  email: string;
  role: string;
};

export type ListingDetail = {
  id: string;
  title: string;
  description: string;
  city: string;
  lat: number;
  lng: number;
  availability_status: string;
  accepting_inquiries: boolean;
  price: number;
  beds_available: number;
  wifi_included: boolean;
  meals_included: boolean;
  furnished: boolean;
  owner: ListingOwner;
  distance_km: number | null;
};

export type CompareListing = {
  id: string;
  title: string;
  city: string;
  availability_status: string;
  accepting_inquiries: boolean;
  price: number;
  distance_km: number | null;
  beds_available: number;
  wifi_included: boolean;
  meals_included: boolean;
  furnished: boolean;
  amenities: string[];
};

export type CompareResults = {
  items: CompareListing[];
};

type SearchParams = {
  city?: string;
  availability?: string;
  priceMin?: number | null;
  priceMax?: number | null;
  sort?: string;
  page?: number;
  pageSize?: number;
};

type NearbySearchParams = SearchParams & {
  lat: number;
  lng: number;
  radiusKm: number;
};

function appendIfDefined(params: URLSearchParams, key: string, value: string | number | null | undefined): void {
  if (value === null || value === undefined || value === "") {
    return;
  }
  params.set(key, String(value));
}

function withStatus(params: URLSearchParams): URLSearchParams {
  params.set("status", "active");
  return params;
}

export async function searchListings(payload: SearchParams): Promise<SearchResults> {
  const params = withStatus(new URLSearchParams());
  appendIfDefined(params, "city", payload.city);
  appendIfDefined(params, "availability", payload.availability);
  appendIfDefined(params, "price_min", payload.priceMin ?? undefined);
  appendIfDefined(params, "price_max", payload.priceMax ?? undefined);
  appendIfDefined(params, "sort", payload.sort);
  appendIfDefined(params, "page", payload.page ?? undefined);
  appendIfDefined(params, "page_size", payload.pageSize ?? undefined);

  const response = await apiClient.get<SearchResults>(`/listings?${params.toString()}`);
  return response.data;
}

export async function searchNearbyListings(payload: NearbySearchParams): Promise<SearchResults> {
  const params = withStatus(new URLSearchParams());
  appendIfDefined(params, "lat", payload.lat);
  appendIfDefined(params, "lng", payload.lng);
  appendIfDefined(params, "radius_km", payload.radiusKm);
  appendIfDefined(params, "availability", payload.availability);
  appendIfDefined(params, "price_min", payload.priceMin ?? undefined);
  appendIfDefined(params, "price_max", payload.priceMax ?? undefined);
  appendIfDefined(params, "sort", payload.sort);
  appendIfDefined(params, "page", payload.page ?? undefined);
  appendIfDefined(params, "page_size", payload.pageSize ?? undefined);

  const response = await apiClient.get<SearchResults>(`/listings/nearby?${params.toString()}`);
  return response.data;
}

export async function getListing(listingId: string): Promise<ListingDetail> {
  const response = await apiClient.get<ListingDetail>(`/listings/${listingId}`);
  return response.data;
}

export async function compareListings(listingIds: string[]): Promise<CompareResults> {
  const response = await apiClient.get<CompareResults>(`/listings/compare?ids=${encodeURIComponent(listingIds.join(","))}`);
  return response.data;
}
