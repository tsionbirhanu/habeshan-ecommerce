import { apiClient } from "../client/axios-instance";
import type {
  ApiResponse,
  PaginatedResponse,
  PaginationParams,
} from "../client/types";

export type OrderStatus =
  | "PENDING"
  | "CONFIRMED"
  | "PROCESSING"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED"
  | "RETURNED";

export interface OrderItem {
  id: string;
  productId: string;
  quantity: number;
  price: number;
  total: number;
}

export interface Order {
  id: string;
  userId: string;
  items: OrderItem[];
  status: OrderStatus;
  subtotal: number;
  tax: number;
  shipping: number;
  discount: number;
  total: number;
  shippingAddress?: any;
  billingAddress?: any;
  paymentMethod?: string;
  trackingNumber?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateOrderPayload {
  items: Array<{ productId: string; quantity: number }>;
  shippingAddressId: string;
  billingAddressId?: string;
  paymentMethodId: string;
  couponCode?: string;
  notes?: string;
}

export interface UpdateOrderStatusPayload {
  status: OrderStatus;
  notes?: string;
}

export interface ReturnOrderPayload {
  reason: string;
  description: string;
  items: Array<{ productId: string; quantity: number }>;
}

class OrdersAPI {
  create(data: CreateOrderPayload) {
    return apiClient.post<ApiResponse<Order>>("/orders", data);
  }

  getAll(params?: PaginationParams) {
    return apiClient.get<PaginatedResponse<Order>>("/orders", { params });
  }

  getById(id: string) {
    return apiClient.get<ApiResponse<Order>>(`/orders/${id}`);
  }

  updateStatus(id: string, data: UpdateOrderStatusPayload) {
    return apiClient.put<ApiResponse<Order>>(`/orders/${id}/status`, data);
  }

  delete(id: string) {
    return apiClient.delete<ApiResponse>(`/orders/${id}`);
  }

  cancel(id: string) {
    return apiClient.post<ApiResponse<Order>>(`/orders/${id}/cancel`);
  }

  getTracking(id: string) {
    return apiClient.get<
      ApiResponse<{ trackingNumber: string; status: string; updates: any[] }>
    >(`/orders/${id}/tracking`);
  }

  requestReturn(id: string, data: ReturnOrderPayload) {
    return apiClient.post<ApiResponse>(`/orders/${id}/return`, data);
  }

  getInvoice(id: string) {
    return apiClient.get<ApiResponse>(`/orders/${id}/invoice`);
  }

  getReceipt(id: string) {
    return apiClient.get<ApiResponse>(`/orders/${id}/receipt`);
  }
}

export const ordersAPI = new OrdersAPI();
