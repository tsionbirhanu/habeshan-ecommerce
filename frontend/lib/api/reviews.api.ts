import api from "./index";

export interface Review {
  id: string;
  productId: string;
  userId: string;
  rating: number;
  title: string;
  comment: string;
  isApproved: boolean;
  createdAt: string;
}

export const reviewsAPI = {
  createReview: (data: any) => api.post<Review>("/reviews", data),

  getProductReviews: (productId: string, params?: any) =>
    api.get<{ reviews: Review[]; total: number }>(
      `/products/${productId}/reviews`,
      { params },
    ),

  getPendingReviews: (params?: any) =>
    api.get<{ reviews: Review[]; total: number }>("/reviews/pending", {
      params,
    }),

  updateReview: (id: string, data: any) =>
    api.put<Review>(`/reviews/${id}`, data),

  deleteReview: (id: string) => api.delete(`/reviews/${id}`),

  approveReview: (id: string) => api.post<Review>(`/reviews/${id}/approve`, {}),

  rejectReview: (id: string, data: { reason?: string }) =>
    api.post(`/reviews/${id}/reject`, data),

  markHelpful: (id: string, data: { helpful: boolean }) =>
    api.post(`/reviews/${id}/helpful`, data),
};
