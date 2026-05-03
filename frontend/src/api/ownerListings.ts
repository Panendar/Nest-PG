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

export type OwnerListingSummary = {
  id: string;
  pg_name: string;
  city: string;
  area: string;
  monthly_rent: number;
  listing_status: string;
  availability_status: string;
  updated_at: string;
};

export type OwnerListingsResponse = {
  items: OwnerListingSummary[];
  pagination: {
    page: number;
    page_size: number;
    total: number;
    total_pages: number;
  };
};

export type OwnerListingDetail = {
  id: string;
  owner_id: string;
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
  availability_note: string | null;
  created_at: string;
  updated_at: string;
};

export async function createOwnerListing(payload: OwnerListingCreatePayload): Promise<OwnerListingCreateResponse> {
  const response = await apiClient.post<OwnerListingCreateResponse>("/owner/listings", payload);
  return response.data;
}

export async function listOwnerListings(params?: {
  page?: number;
  page_size?: number;
  listing_status?: string;
  availability_status?: string;
}): Promise<OwnerListingsResponse> {
  const query = new URLSearchParams();
  if (params?.page) query.set("page", String(params.page));
  if (params?.page_size) query.set("page_size", String(params.page_size));
  if (params?.listing_status) query.set("listing_status", params.listing_status);
  if (params?.availability_status) query.set("availability_status", params.availability_status);
  const suffix = query.toString() ? `?${query.toString()}` : "";
  const response = await apiClient.get<OwnerListingsResponse>(`/owner/listings${suffix}`);
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

export type OwnerListingUpdatePayload = {
  pg_name: string;
  city: string;
  area: string;
  monthly_rent: number;
  occupancy_type: string;
  available_units: number;
  description: string;
  amenities: string[];
  listing_status: string;
};

export type OwnerListingUpdateResponse = {
  id: string;
  pg_name: string;
  city: string;
  area: string;
  monthly_rent: number;
  occupancy_type: string;
  available_units: number;
  description: string;
  amenities: string[];
  listing_status: string;
  updated_at: string;
};

export async function getOwnerListing(listingId: string): Promise<OwnerListingDetail> {
  const response = await apiClient.get<OwnerListingDetail>(`/owner/listings/${listingId}`);
  return response.data;
}

export async function updateOwnerListingDetails(
  listingId: string,
  payload: OwnerListingUpdatePayload
): Promise<OwnerListingUpdateResponse> {
  const response = await apiClient.put<OwnerListingUpdateResponse>(`/owner/listings/${listingId}`, payload);
  return response.data;
}

export type OwnerListingMediaItem = {
  id: string;
  listing_id: string;
  file_url: string;
  caption: string | null;
  sort_order: number;
  is_primary: boolean;
  created_at: string;
  updated_at: string | null;
};

export type OwnerListingMediaListResponse = {
  items: OwnerListingMediaItem[];
};

export async function listOwnerListingMedia(listingId: string): Promise<OwnerListingMediaListResponse> {
  const response = await apiClient.get<OwnerListingMediaListResponse>(`/owner/listings/${listingId}/media`);
  return response.data;
}

export async function addOwnerListingMedia(
  listingId: string,
  payload: { file: File; caption?: string; sort_order?: number; is_primary?: boolean }
): Promise<OwnerListingMediaItem> {
  const formData = new FormData();
  formData.append("file", payload.file);
  if (payload.caption) formData.append("caption", payload.caption);
  if (typeof payload.sort_order === "number") formData.append("sort_order", String(payload.sort_order));
  if (typeof payload.is_primary === "boolean") formData.append("is_primary", String(payload.is_primary));
  const response = await apiClient.post<OwnerListingMediaItem>(`/owner/listings/${listingId}/media`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
}

export async function updateOwnerListingMedia(
  listingId: string,
  mediaId: string,
  payload: { file?: File; caption?: string; sort_order?: number; is_primary?: boolean }
): Promise<OwnerListingMediaItem> {
  const formData = new FormData();
  if (payload.file) formData.append("file", payload.file);
  if (typeof payload.caption !== "undefined") formData.append("caption", payload.caption);
  if (typeof payload.sort_order === "number") formData.append("sort_order", String(payload.sort_order));
  if (typeof payload.is_primary === "boolean") formData.append("is_primary", String(payload.is_primary));
  const response = await apiClient.put<OwnerListingMediaItem>(`/owner/listings/${listingId}/media/${mediaId}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
}

export async function deleteOwnerListingMedia(listingId: string, mediaId: string): Promise<void> {
  await apiClient.delete(`/owner/listings/${listingId}/media/${mediaId}`);
}
