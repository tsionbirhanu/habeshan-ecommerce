import api from "./index";

export const inventoryAPI = {
  getInventory: (params?: any) => api.get("/inventory", { params }),

  getLowStockAlerts: () => api.get("/inventory/alerts"),

  getInventorySummary: () => api.get("/inventory/summary"),

  getInventoryHistory: (params?: any) =>
    api.get("/inventory/history", { params }),

  getProductInventory: (productId: string) =>
    api.get(`/inventory/${productId}`),

  updateInventory: (productId: string, data: any) =>
    api.put(`/inventory/${productId}`, data),
};
