import { apiClient } from "../client/axios-instance";
import type {
  ApiResponse,
  PaginatedResponse,
  PaginationParams,
} from "../client/types";

export type PaymentMethod =
  | "STRIPE"
  | "PAYPAL"
  | "KLARNA"
  | "BANK_TRANSFER"
  | "CRYPTOCURRENCY";
export type PaymentStatus =
  | "PENDING"
  | "PROCESSING"
  | "COMPLETED"
  | "FAILED"
  | "REFUNDED";

export interface Payment {
  id: string;
  orderId: string;
  userId: string;
  amount: number;
  currency: string;
  method: PaymentMethod;
  status: PaymentStatus;
  transactionId?: string;
  reference?: string;
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePaymentPayload {
  orderId: string;
  amount: number;
  currency?: string;
  method: PaymentMethod;
  metadata?: Record<string, any>;
}

export interface StripeWebhookPayload {
  type: string;
  data: any;
}

export interface PayPalWebhookPayload {
  event_type: string;
  resource: any;
}

export interface KlarnaWebhookPayload {
  event_type: string;
  data: any;
}

export interface UpdatePaymentStatusPayload {
  status: PaymentStatus;
  transactionId?: string;
  reference?: string;
}

class PaymentsAPI {
  create(data: CreatePaymentPayload) {
    return apiClient.post<ApiResponse<Payment>>("/payments", data);
  }

  getAll(params?: PaginationParams) {
    return apiClient.get<PaginatedResponse<Payment>>("/payments", { params });
  }

  getById(id: string) {
    return apiClient.get<ApiResponse<Payment>>(`/payments/${id}`);
  }

  handleStripeWebhook(data: StripeWebhookPayload) {
    return apiClient.post<ApiResponse>("/payments/stripe/webhook", data);
  }

  handlePayPalWebhook(data: PayPalWebhookPayload) {
    return apiClient.post<ApiResponse>("/payments/paypal/webhook", data);
  }

  handleKlarnaWebhook(data: KlarnaWebhookPayload) {
    return apiClient.post<ApiResponse>("/payments/klarna/webhook", data);
  }

  getInvoice(id: string) {
    return apiClient.get<ApiResponse>(`/payments/${id}/invoice`);
  }

  updateStatus(id: string, data: UpdatePaymentStatusPayload) {
    return apiClient.put<ApiResponse<Payment>>(`/payments/${id}/status`, data);
  }
}

export const paymentsAPI = new PaymentsAPI();
