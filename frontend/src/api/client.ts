import axios, { AxiosError } from "axios";

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

if (!apiBaseUrl) {
  throw new Error("Missing VITE_API_BASE_URL");
}

export const apiClient = axios.create({
  baseURL: apiBaseUrl,
  headers: {
    "Content-Type": "application/json",
  },
});

export function getApiErrorMessage(error: unknown, fallbackMessage = "Request failed. Please try again."): string {
  if (!axios.isAxiosError(error)) {
    return error instanceof Error ? error.message : fallbackMessage;
  }

  const responseMessage =
    (error.response?.data?.error?.message as string | undefined) ??
    (error.response?.data?.detail?.message as string | undefined);

  return responseMessage || fallbackMessage;
}

type Handlers = {
  getToken: () => string | null;
  onUnauthorized: () => void;
  onNetworkError: () => void;
  onApiError: (message: string) => void;
};

let interceptorsRegistered = false;
let currentHandlers: Handlers | null = null;

export function registerApiInterceptors(handlers: Handlers): void {
  currentHandlers = handlers;

  if (interceptorsRegistered) {
    return;
  }

  apiClient.interceptors.request.use((config) => {
    const token = currentHandlers?.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  apiClient.interceptors.response.use(
    (response) => response,
    (error: AxiosError) => {
      if (error.response?.status === 401) {
        currentHandlers?.onUnauthorized();
      } else if (!error.response) {
        currentHandlers?.onNetworkError();
      } else if (error.response.status >= 500) {
        currentHandlers?.onApiError(getApiErrorMessage(error, "Something went wrong on our side. Please try again."));
      }
      return Promise.reject(error);
    }
  );

  interceptorsRegistered = true;
}
