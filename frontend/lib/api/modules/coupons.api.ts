import { apiClient } from "../client/axios-instance";
import type {
  ApiResponse,
  PaginatedResponse,
  PaginationParams,
} from "../client/types";

export interface Coupon {
  id: string;
  code: string;
  description?: string;
  discountType: "PERCENTAGE" | "FIXED";
  discountValue: number;
  maxUses?: number;
  usedCount: number;
  minOrderAmount?: number;
  expiresAt?: string;
  isActive: boolean;
  createdAt: string;
}

export interface CreateCouponPayload {
  code: string;
  description?: string;
  discountType: "PERCENTAGE" | "FIXED";
  discountValue: number;
  maxUses?: number;
  minOrderAmount?: number;
  expiresAt?: string;
}

export interface ValidateCouponPayload {
  code: string;
  orderTotal: number;
}

export interface ValidateCouponResponse {
  valid: boolean;
  coupon?: Coupon;
  discount: number;
  message?: string;
}

class CouponsAPI {
  getAll(params?: PaginationParams) {
    return apiClient.get<PaginatedResponse<Coupon>>("/coupons", { params });
  }

  getByCode(code: string) {
    return apiClient.get<ApiResponse<Coupon>>(`/coupons/${code}`);
  }

  validate(data: ValidateCouponPayload) {
    return apiClient.post<ApiResponse<ValidateCouponResponse>>(
      "/coupons/validate",
      data,
    );
  }

  create(data: CreateCouponPayload) {
    return apiClient.post<ApiResponse<Coupon>>("/coupons", data);
  }

  update(id: string, data: Partial<CreateCouponPayload>) {
    return apiClient.put<ApiResponse<Coupon>>(`/coupons/${id}`, data);
  }
}

export const couponsAPI = new CouponsAPI();
