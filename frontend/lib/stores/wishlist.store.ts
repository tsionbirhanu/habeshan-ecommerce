import { create } from "zustand";
import { persist } from "zustand/middleware";

interface WishlistStore {
  items: string[]; // product IDs

  isInWishlist: (productId: string) => boolean;
  addItem: (productId: string) => void;
  removeItem: (productId: string) => void;
  clear: () => void;
}

export const useWishlistStore = create<WishlistStore>()(
  persist(
    (set, get) => ({
      items: [],

      isInWishlist: (productId) => get().items.includes(productId),

      addItem: (productId) =>
        set((state) => {
          if (state.items.includes(productId)) return state;
          return { items: [...state.items, productId] };
        }),

      removeItem: (productId) =>
        set((state) => ({
          items: state.items.filter((id) => id !== productId),
        })),

      clear: () => set({ items: [] }),
    }),
    {
      name: "wishlist-storage",
    },
  ),
);
