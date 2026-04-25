import { create } from "zustand";
import type { ReactNode } from "react";

type User = {
  id: string;
  email: string;
  role: string;
};

type AuthState = {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (next: { user: User; token: string }) => void;
  logout: () => void;
};

const STORAGE_KEY = "my_pg_auth";

function readStoredAuth(): Pick<AuthState, "user" | "token" | "isAuthenticated"> {
  if (typeof window === "undefined") {
    return { user: null, token: null, isAuthenticated: false };
  }

  const rawValue = window.localStorage.getItem(STORAGE_KEY);
  if (!rawValue) {
    return { user: null, token: null, isAuthenticated: false };
  }

  try {
    const parsedValue = JSON.parse(rawValue) as Pick<AuthState, "user" | "token" | "isAuthenticated">;
    if (!parsedValue?.token || !parsedValue?.user) {
      return { user: null, token: null, isAuthenticated: false };
    }
    return {
      user: parsedValue.user,
      token: parsedValue.token,
      isAuthenticated: true,
    };
  } catch {
    return { user: null, token: null, isAuthenticated: false };
  }
}

function storeAuth(state: Pick<AuthState, "user" | "token" | "isAuthenticated">): void {
  if (typeof window === "undefined") {
    return;
  }

  if (!state.isAuthenticated || !state.user || !state.token) {
    window.localStorage.removeItem(STORAGE_KEY);
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

const initialAuth = readStoredAuth();

const useAuthStore = create<AuthState>((set) => ({
  ...initialAuth,
  login: ({ user, token }: { user: User; token: string }) =>
    set(() => {
      const nextState = { user, token, isAuthenticated: true };
      storeAuth(nextState);
      return nextState;
    }),
  logout: () =>
    set(() => {
      const nextState = { user: null, token: null, isAuthenticated: false };
      storeAuth(nextState);
      return nextState;
    }),
}));

export function AuthProvider({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

export function useAuth() {
  return useAuthStore();
}
