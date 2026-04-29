import { create } from "zustand";
import type { ReactNode } from "react";

export type ToastMessage = {
  id: string;
  title: string;
  description?: string;
  status: "info" | "success" | "warning" | "error";
};

type UIState = {
  globalLoading: boolean;
  toasts: ToastMessage[];
  setGlobalLoading: (isLoading: boolean) => void;
  showToast: (toast: Omit<ToastMessage, "id">) => void;
  dismissToast: (id: string) => void;
};

const useUIStore = create<UIState>((set) => ({
  globalLoading: false,
  toasts: [],
  setGlobalLoading: (isLoading: boolean) => set({ globalLoading: isLoading }),
  showToast: (toast: Omit<ToastMessage, "id">) =>
    set((state) => ({
      toasts: [...state.toasts, { ...toast, id: crypto.randomUUID() }],
    })),
  dismissToast: (id: string) =>
    set((state) => ({
      toasts: state.toasts.filter((toast) => toast.id !== id),
    })),
}));

export function UIProvider({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

export function useUI() {
  return useUIStore();
}
