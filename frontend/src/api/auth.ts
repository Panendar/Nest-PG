import { apiClient } from "./client";

export type AuthTokenResponse = {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
};

export type CurrentUser = {
  id: string;
  email: string;
  role: string;
  is_active: boolean;
};

export type RegisterPayload = {
  email: string;
  password: string;
};

export async function loginWithCredentials(payload: { email: string; password: string }): Promise<AuthTokenResponse> {
  const response = await apiClient.post<AuthTokenResponse>("/auth/token", payload);
  return response.data;
}

export async function fetchCurrentUser(token: string): Promise<CurrentUser> {
  const response = await apiClient.get<CurrentUser>("/auth/me", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
}

export async function registerWithCredentials(payload: RegisterPayload): Promise<CurrentUser> {
  const response = await apiClient.post<CurrentUser>("/auth/register", payload);
  return response.data;
}
