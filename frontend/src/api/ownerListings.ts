import { apiClient } from "./client";

export type OwnerListingCreatePayload = {
  pg_name: string;
  city: string;
  area: string;
  monthly_rent: number;
  occupancy_type: string;
  available_units: number;
  description: string;
  amenities: string[];
  listing_status: string;
  availability_status: string;
  availability_note?: string;
};

export type OwnerListingCreateResponse = {
  id: string;
  owner_id: string;
  pg_name: string;
  city: string;
  area: string;
  listing_status: string;
  availability_status: string;
  created_at: string;
};

export async function createOwnerListing(payload: OwnerListingCreatePayload): Promise<OwnerListingCreateResponse> {
  const response = await apiClient.post<OwnerListingCreateResponse>("/owner/listings", payload);
  return response.data;
}

export type OwnerAvailabilityUpdatePayload = {
  availability_status: string;
  availability_note?: string;
};

export type OwnerAvailabilityUpdateResponse = {
  id: string;
  availability_status: string;
  availability_note: string | null;
  updated_at: string;
};

export async function updateOwnerListingAvailability(
  listingId: string,
  payload: OwnerAvailabilityUpdatePayload
): Promise<OwnerAvailabilityUpdateResponse> {
  const response = await apiClient.patch<OwnerAvailabilityUpdateResponse>(`/owner/listings/${listingId}/availability`, payload);
  return response.data;
}
