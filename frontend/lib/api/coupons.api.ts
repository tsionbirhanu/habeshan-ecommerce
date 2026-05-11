import api from "./index";

export interface Coupon {
  id: string;
  code: string;
  discount: number;
  discountType: "percentage" | "fixed";
  minOrder?: number;
  maxUses?: number;
  expiresAt?: string;
}

export const couponsAPI = {
  createCoupon: (data: any) => api.post<Coupon>("/coupons", data),

  getAllCoupons: (params?: any) =>
    api.get<{ coupons: Coupon[]; total: number }>("/coupons", { params }),

  getCouponByCode: (code: string) => api.get<Coupon>(`/coupons/code/${code}`),

  updateCoupon: (id: string, data: any) =>
    api.put<Coupon>(`/coupons/${id}`, data),

  deleteCoupon: (id: string) => api.delete(`/coupons/${id}`),

  getCouponStats: () => api.get("/coupons/stats/overview"),

  validateCoupon: (data: { couponCode: string }) =>
    api.post("/coupons/validate", data),
};
