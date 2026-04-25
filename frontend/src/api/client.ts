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

type Handlers = {
  getToken: () => string | null;
  onUnauthorized: () => void;
  onNetworkError: () => void;
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
      }
      return Promise.reject(error);
    }
  );

  interceptorsRegistered = true;
}
