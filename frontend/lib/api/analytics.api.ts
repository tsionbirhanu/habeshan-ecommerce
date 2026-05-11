import api from "./index";

export const analyticsAPI = {
  getSalesReport: (params?: any) => api.get("/analytics/sales", { params }),

  getProductReport: (params?: any) =>
    api.get("/analytics/products", { params }),

  getCustomerReport: () => api.get("/analytics/customers"),

  getInventoryReport: () => api.get("/analytics/inventory"),

  getPaymentReport: (params?: any) =>
    api.get("/analytics/payments", { params }),

  exportReport: (params?: any) =>
    api.get("/analytics/export", { params, responseType: "blob" }),
};
