import { apiClient } from "./client";

export type RecentSearchPayload = {
  city?: string;
  radius_km?: number;
  filters?: Record<string, unknown>;
  sort?: string;
};

export type RecentSearchItem = {
  id: string;
  city: string | null;
  radius_km: number | null;
  filters: Record<string, unknown> | null;
  sort: string | null;
  searched_at: string;
};

export type RecentSearchesResponse = {
  items: RecentSearchItem[];
  pagination: {
    page: number;
    page_size: number;
    total: number;
    total_pages: number;
  };
};

export async function getRecentSearches(page = 1, pageSize = 20): Promise<RecentSearchesResponse> {
  const response = await apiClient.get<RecentSearchesResponse>(`/recent-searches?page=${page}&page_size=${pageSize}`);
  return response.data;
}

export async function createRecentSearch(payload: RecentSearchPayload): Promise<{ id: string; searched_at: string }> {
  const response = await apiClient.post<{ id: string; searched_at: string }>("/recent-searches", payload);
  return response.data;
}

export async function deleteRecentSearch(recentSearchId: string): Promise<void> {
  await apiClient.delete(`/recent-searches/${recentSearchId}`);
}

export async function getSearchContext(searchId: string): Promise<RecentSearchItem> {
  const response = await apiClient.get<RecentSearchItem>(`/searches/${searchId}`);
  return response.data;
}
