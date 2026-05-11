import api from "./index";

export const adminAPI = {
  getDashboardStats: () => api.get("/admin/dashboard"),

  getSalesCharts: (params?: any) =>
    api.get("/admin/dashboard/charts", { params }),

  getDashboardAlerts: () => api.get("/admin/dashboard/alerts"),

  getTopProducts: (params?: any) =>
    api.get("/admin/dashboard/top-products", { params }),

  getRecentOrders: (params?: any) =>
    api.get("/admin/dashboard/orders", { params }),

  getAllUsers: (params?: any) => api.get("/admin/users", { params }),

  getUserDetails: (userId: string) => api.get(`/admin/users/${userId}`),

  updateUserRole: (userId: string, data: { role: string }) =>
    api.put(`/admin/users/${userId}/role`, data),

  toggleUserStatus: (userId: string, data: { isActive: boolean }) =>
    api.put(`/admin/users/${userId}/status`, data),

  resetUserPassword: (userId: string) =>
    api.post(`/admin/users/${userId}/reset-password`, {}),

  getUserActivity: (userId: string, params?: any) =>
    api.get(`/admin/users/${userId}/activity`, { params }),

  createVendor: (data: any) => api.post("/admin/vendors", data),

  getAllVendors: (params?: any) => api.get("/admin/vendors", { params }),

  approveVendor: (vendorId: string) =>
    api.post(`/admin/vendors/${vendorId}/approve`, {}),

  rejectVendor: (vendorId: string, data: { reason?: string }) =>
    api.post(`/admin/vendors/${vendorId}/reject`, data),

  getSettings: () => api.get("/admin/settings"),

  updateSettings: (data: any) => api.put("/admin/settings", data),
};
