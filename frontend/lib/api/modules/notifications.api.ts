import { apiClient } from "../client/axios-instance";
import type {
  ApiResponse,
  PaginatedResponse,
  PaginationParams,
} from "../client/types";

export interface Notification {
  id: string;
  userId: string;
  type: "ORDER" | "PAYMENT" | "SHIPPING" | "REVIEW" | "PROMOTION" | "SYSTEM";
  title: string;
  message: string;
  data?: Record<string, any>;
  isRead: boolean;
  createdAt: string;
  readAt?: string;
}

export interface NotificationSubscription {
  id: string;
  userId: string;
  type: string;
  channel: "EMAIL" | "SMS" | "PUSH" | "IN_APP";
  isSubscribed: boolean;
}

class NotificationsAPI {
  getAll(params?: PaginationParams & { unreadOnly?: boolean }) {
    return apiClient.get<PaginatedResponse<Notification>>("/notifications", {
      params,
    });
  }

  getById(id: string) {
    return apiClient.get<ApiResponse<Notification>>(`/notifications/${id}`);
  }

  markAsRead(id: string) {
    return apiClient.put<ApiResponse<Notification>>(
      `/notifications/${id}/read`,
    );
  }

  delete(id: string) {
    return apiClient.delete<ApiResponse>(`/notifications/${id}`);
  }

  subscribe(data: {
    type: string;
    channel: "EMAIL" | "SMS" | "PUSH" | "IN_APP";
  }) {
    return apiClient.post<ApiResponse<NotificationSubscription>>(
      "/notifications/subscribe",
      data,
    );
  }

  unsubscribe(type: string, channel: string) {
    return apiClient.post<ApiResponse>("/notifications/unsubscribe", {
      type,
      channel,
    });
  }
}

export const notificationsAPI = new NotificationsAPI();
