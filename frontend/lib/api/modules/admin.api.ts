import { apiClient } from "../client/axios-instance";
import type {
  ApiResponse,
  PaginatedResponse,
  PaginationParams,
} from "../client/types";

export interface AdminUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  isActive: boolean;
  createdAt: string;
}

export interface AdminVendor {
  id: string;
  name: string;
  email: string;
  phone: string;
  isActive: boolean;
  isVerified: boolean;
  commission: number;
  createdAt: string;
}

export interface AdminSettings {
  siteTitle: string;
  siteDescription: string;
  logo?: string;
  favicon?: string;
  primaryColor: string;
  secondaryColor: string;
  currency: string;
  timezone: string;
  taxRate: number;
  shippingPolicy?: string;
  refundPolicy?: string;
  privacyPolicy?: string;
  termsConditions?: string;
}

export interface BanUserPayload {
  reason: string;
  duration?: number; // in days
}

export interface UpdateVendorPayload {
  name?: string;
  email?: string;
  phone?: string;
  isActive?: boolean;
  commission?: number;
}

class AdminAPI {
  getUsers(params?: PaginationParams & { role?: string; isActive?: boolean }) {
    return apiClient.get<PaginatedResponse<AdminUser>>("/admin/users", {
      params,
    });
  }

  banUser(userId: string, data: BanUserPayload) {
    return apiClient.post<ApiResponse>(`/admin/users/${userId}/ban`, data);
  }

  deleteUser(userId: string) {
    return apiClient.delete<ApiResponse>(`/admin/users/${userId}`);
  }

  getOrders(params?: PaginationParams) {
    return apiClient.get<PaginatedResponse<any>>("/admin/orders", { params });
  }

  updateOrderStatus(orderId: string, data: { status: string }) {
    return apiClient.put<ApiResponse>(`/admin/orders/${orderId}/status`, data);
  }

  getProducts(params?: PaginationParams) {
    return apiClient.get<PaginatedResponse<any>>("/admin/products", { params });
  }

  createProduct(data: any) {
    return apiClient.post<ApiResponse<any>>("/admin/products", data);
  }

  updateProduct(productId: string, data: any) {
    return apiClient.put<ApiResponse<any>>(
      `/admin/products/${productId}`,
      data,
    );
  }

  deleteProduct(productId: string) {
    return apiClient.delete<ApiResponse>(`/admin/products/${productId}`);
  }

  getSettings() {
    return apiClient.get<ApiResponse<AdminSettings>>("/admin/settings");
  }

  updateSettings(data: Partial<AdminSettings>) {
    return apiClient.put<ApiResponse<AdminSettings>>("/admin/settings", data);
  }

  createVendor(data: any) {
    return apiClient.post<ApiResponse<AdminVendor>>("/admin/vendors", data);
  }

  getVendors(params?: PaginationParams) {
    return apiClient.get<PaginatedResponse<AdminVendor>>("/admin/vendors", {
      params,
    });
  }

  updateVendor(vendorId: string, data: UpdateVendorPayload) {
    return apiClient.put<ApiResponse<AdminVendor>>(
      `/admin/vendors/${vendorId}`,
      data,
    );
  }

  deleteVendor(vendorId: string) {
    return apiClient.delete<ApiResponse>(`/admin/vendors/${vendorId}`);
  }
}

export const adminAPI = new AdminAPI();
