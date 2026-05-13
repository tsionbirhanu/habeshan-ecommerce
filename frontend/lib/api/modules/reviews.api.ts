import { apiClient } from "../client/axios-instance";
import type {
  ApiResponse,
  PaginatedResponse,
  PaginationParams,
} from "../client/types";

export interface Review {
  id: string;
  productId: string;
  userId: string;
  rating: number;
  title: string;
  comment: string;
  helpful: number;
  isApproved: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateReviewPayload {
  productId: string;
  rating: number;
  title: string;
  comment: string;
  images?: string[];
}

export interface UpdateReviewPayload {
  rating?: number;
  title?: string;
  comment?: string;
}

export interface ApproveReviewPayload {
  approved: boolean;
  reason?: string;
}

class ReviewsAPI {
  getAll(params?: PaginationParams & { productId?: string }) {
    return apiClient.get<PaginatedResponse<Review>>("/reviews", { params });
  }

  create(data: CreateReviewPayload) {
    return apiClient.post<ApiResponse<Review>>("/reviews", data);
  }

  getById(id: string) {
    return apiClient.get<ApiResponse<Review>>(`/reviews/${id}`);
  }

  update(id: string, data: UpdateReviewPayload) {
    return apiClient.put<ApiResponse<Review>>(`/reviews/${id}`, data);
  }

  delete(id: string) {
    return apiClient.delete<ApiResponse>(`/reviews/${id}`);
  }

  approve(id: string, data: ApproveReviewPayload) {
    return apiClient.post<ApiResponse<Review>>(`/reviews/${id}/approve`, data);
  }

  getByProduct(productId: string, params?: PaginationParams) {
    return apiClient.get<PaginatedResponse<Review>>("/reviews", {
      params: { ...params, productId },
    });
  }

  markHelpful(id: string) {
    return apiClient.post<ApiResponse>(`/reviews/${id}/helpful`);
  }
}

export const reviewsAPI = new ReviewsAPI();
