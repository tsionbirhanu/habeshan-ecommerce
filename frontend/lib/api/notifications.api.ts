import api from "./index";

export interface Notification {
  id: string;
  userId: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
}

export const notificationsAPI = {
  getNotifications: (params?: any) =>
    api.get<{ notifications: Notification[]; total: number }>(
      "/notifications",
      { params },
    ),

  getNotificationStats: () => api.get("/notifications/stats"),

  markAsRead: (id: string) => api.put(`/notifications/${id}/read`, {}),

  markAllAsRead: () => api.put("/notifications/read-all", {}),

  deleteNotification: (id: string) => api.delete(`/notifications/${id}`),

  deleteAllNotifications: () => api.delete("/notifications/delete-all"),
};
