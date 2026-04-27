import { apiClient } from "./client";
import type { ListingSummary } from "./listings";

export type SavedListingItem = {
  id: string;
  listing_id: string;
  saved_at: string;
  listing_summary: ListingSummary;
};

export type SavedListingsResponse = {
  items: SavedListingItem[];
  pagination: {
    page: number;
    page_size: number;
    total: number;
    total_pages: number;
  };
};

export type SavedListingCreateResponse = {
  id: string;
  listing_id: string;
  saved_at: string;
};

export async function getSavedListings(page = 1, pageSize = 20): Promise<SavedListingsResponse> {
  const response = await apiClient.get<SavedListingsResponse>(`/saved-listings?page=${page}&page_size=${pageSize}`);
  return response.data;
}

export async function createSavedListing(listingId: string): Promise<SavedListingCreateResponse> {
  const response = await apiClient.post<SavedListingCreateResponse>("/saved-listings", { listing_id: listingId });
  return response.data;
}

export async function deleteSavedListing(savedListingId: string): Promise<void> {
  await apiClient.delete(`/saved-listings/${savedListingId}`);
}
