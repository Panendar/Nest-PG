import { apiClient } from "./client";

export type ContactCreatePayload = {
  listing_id: string;
  full_name: string;
  phone_number: string;
  preferred_move_in_date?: string | null;
  message: string;
};

export type ContactCreateResponse = {
  id: string;
  listing_id: string;
  status: string;
  submitted_at: string;
};

export type ContactStatusResponse = {
  id: string;
  listing_id: string;
  status: "open" | "closed" | "confirmed";
  submitted_at: string;
  can_contact_again: boolean;
};

export async function createContact(payload: ContactCreatePayload): Promise<ContactCreateResponse> {
  const response = await apiClient.post<ContactCreateResponse>("/contacts", payload);
  return response.data;
}

export async function getContact(contactId: string): Promise<ContactStatusResponse> {
  const response = await apiClient.get<ContactStatusResponse>(`/contacts/${contactId}`);
  return response.data;
}
