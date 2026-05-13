import { apiClient } from "../client/axios-instance";
import type { ApiResponse } from "../client/types";

export interface WishlistItem {
  id: string;
  productId: string;
  addedAt: string;
}

export interface Wishlist {
  id: string;
  userId: string;
  items: WishlistItem[];
  count: number;
}

class WishlistAPI {
  getWishlist() {
    return apiClient.get<ApiResponse<Wishlist>>("/wishlist");
  }

  addItem(productId: string) {
    return apiClient.post<ApiResponse<Wishlist>>("/wishlist", { productId });
  }

  removeItem(itemId: string) {
    return apiClient.delete<ApiResponse<Wishlist>>(`/wishlist/${itemId}`);
  }

  moveToCart(itemId: string) {
    return apiClient.post<ApiResponse>(`/wishlist/${itemId}/move-to-cart`);
  }

  getCount() {
    return apiClient.get<ApiResponse<{ count: number }>>("/wishlist/count");
  }
}

export const wishlistAPI = new WishlistAPI();
