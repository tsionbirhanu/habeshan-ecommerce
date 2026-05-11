import { create } from "zustand";

export interface Toast {
  id: string;
  message: string;
  type: "success" | "error" | "warning" | "info";
  duration?: number;
}

interface UIStore {
  isSearchOpen: boolean;
  isMobileMenuOpen: boolean;
  toasts: Toast[];

  toggleSearch: () => void;
  toggleMobileMenu: () => void;
  closeSearch: () => void;
  closeMobileMenu: () => void;

  addToast: (toast: Omit<Toast, "id">) => void;
  removeToast: (id: string) => void;
  clearToasts: () => void;
}

export const useUIStore = create<UIStore>((set) => ({
  isSearchOpen: false,
  isMobileMenuOpen: false,
  toasts: [],

  toggleSearch: () => set((state) => ({ isSearchOpen: !state.isSearchOpen })),

  toggleMobileMenu: () =>
    set((state) => ({ isMobileMenuOpen: !state.isMobileMenuOpen })),

  closeSearch: () => set({ isSearchOpen: false }),

  closeMobileMenu: () => set({ isMobileMenuOpen: false }),

  addToast: (toast) =>
    set((state) => ({
      toasts: [...state.toasts, { ...toast, id: Date.now().toString() }],
    })),

  removeToast: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    })),

  clearToasts: () => set({ toasts: [] }),
}));
