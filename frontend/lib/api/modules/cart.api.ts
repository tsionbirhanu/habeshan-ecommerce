import { apiClient } from "../client/axios-instance";
import type { ApiResponse } from "../client/types";

export interface CartItem {
  id: string;
  productId: string;
  quantity: number;
  price: number;
}

export interface Cart {
  id: string;
  items: CartItem[];
  subtotal: number;
  tax: number;
  total: number;
}

export interface ApplyCouponResponse {
  discount: number;
  newTotal: number;
  couponCode: string;
}

class CartAPI {
  getCart() {
    return apiClient.get<ApiResponse<Cart>>("/cart");
  }

  addItem(productId: string, quantity: number) {
    return apiClient.post<ApiResponse<Cart>>("/cart/add", {
      productId,
      quantity,
    });
  }

  updateItem(itemId: string, quantity: number) {
    return apiClient.put<ApiResponse<Cart>>(`/cart/items/${itemId}`, {
      quantity,
    });
  }

  removeItem(itemId: string) {
    return apiClient.delete<ApiResponse<Cart>>(`/cart/items/${itemId}`);
  }

  clear() {
    return apiClient.delete<ApiResponse<Cart>>("/cart");
  }

  validate() {
    return apiClient.get<ApiResponse>("/cart/validate");
  }

  applyCoupon(couponCode: string, orderTotal: number) {
    return apiClient.post<ApiResponse<ApplyCouponResponse>>(
      "/cart/apply-coupon",
      { couponCode, orderTotal },
    );
  }
}

export const cartAPI = new CartAPI();
