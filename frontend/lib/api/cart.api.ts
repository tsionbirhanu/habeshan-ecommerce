import api from "./index";

export interface CartItem {
  id: string;
  productId: string;
  quantity: number;
  price: number;
}

export interface Cart {
  items: CartItem[];
  total: number;
  itemCount: number;
}

export const cartAPI = {
  getCart: () => api.get<Cart>("/cart"),

  addToCart: (data: { productId: string; quantity: number }) =>
    api.post<Cart>("/cart/add", data),

  updateCartItem: (id: string, data: { quantity: number }) =>
    api.put<Cart>(`/cart/items/${id}`, data),

  removeCartItem: (id: string) => api.delete<Cart>(`/cart/items/${id}`),

  clearCart: () => api.delete<Cart>("/cart"),

  validateCart: () => api.post("/cart/validate", {}),

  validateCoupon: (data: { couponCode: string; orderTotal: number }) =>
    api.post("/cart/coupon", data),
};
