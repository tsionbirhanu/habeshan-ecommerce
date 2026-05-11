import api from "./index";

export interface Order {
  id: string;
  orderNumber: string;
  userId: string;
  items: any[];
  total: number;
  status: string;
  createdAt: string;
}

export const ordersAPI = {
  createOrder: (data: any) => api.post<Order>("/orders", data),

  getAllOrders: (params?: any) =>
    api.get<{ orders: Order[]; total: number }>("/orders", { params }),

  getMyOrders: (params?: any) =>
    api.get<{ orders: Order[]; total: number }>("/orders/my", { params }),

  getOrder: (id: string) => api.get<Order>(`/orders/${id}`),

  updateOrderStatus: (id: string, data: { status: string }) =>
    api.put<Order>(`/orders/${id}/status`, data),

  cancelOrder: (id: string) => api.post<Order>(`/orders/${id}/cancel`, {}),

  getOrderTracking: (id: string) => api.get(`/orders/${id}/tracking`),

  addOrderNote: (id: string, data: { note: string }) =>
    api.post(`/orders/${id}/notes`, data),
};
