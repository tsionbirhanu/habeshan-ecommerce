import api from "./index";

export const wishlistAPI = {
  getWishlist: () => api.get("/wishlist"),

  addToWishlist: (productId: string) => api.post(`/wishlist/${productId}`, {}),

  removeFromWishlist: (productId: string) =>
    api.delete(`/wishlist/${productId}`),

  moveToCart: (productId: string) =>
    api.post(`/wishlist/${productId}/move-to-cart`, {}),
};
