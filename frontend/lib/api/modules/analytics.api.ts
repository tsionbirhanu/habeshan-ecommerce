import { apiClient } from "../client/axios-instance";
import type { ApiResponse } from "../client/types";

export interface DashboardMetrics {
  totalSales: number;
  totalOrders: number;
  totalCustomers: number;
  totalRevenue: number;
  averageOrderValue: number;
  conversionRate: number;
}

export interface SalesData {
  date: string;
  sales: number;
  orders: number;
  revenue: number;
}

export interface ProductAnalytics {
  productId: string;
  productName: string;
  sales: number;
  revenue: number;
  rating: number;
  reviews: number;
}

export interface CustomerAnalytics {
  totalCustomers: number;
  activeCustomers: number;
  newCustomers: number;
  churnRate: number;
}

export interface OrderAnalytics {
  totalOrders: number;
  completedOrders: number;
  cancelledOrders: number;
  averageValue: number;
}

export interface RevenueAnalytics {
  totalRevenue: number;
  averageRevenue: number;
  topCountries: Array<{ country: string; revenue: number }>;
  paymentMethods: Record<string, number>;
}

export interface AnalyticsParams {
  startDate?: string;
  endDate?: string;
  period?: "DAY" | "WEEK" | "MONTH" | "YEAR";
}

class AnalyticsAPI {
  getDashboard(params?: AnalyticsParams) {
    return apiClient.get<ApiResponse<DashboardMetrics>>(
      "/analytics/dashboard",
      { params },
    );
  }

  getSales(params?: AnalyticsParams) {
    return apiClient.get<ApiResponse<SalesData[]>>("/analytics/sales", {
      params,
    });
  }

  getProducts(params?: AnalyticsParams) {
    return apiClient.get<ApiResponse<ProductAnalytics[]>>(
      "/analytics/products",
      { params },
    );
  }

  getCustomers(params?: AnalyticsParams) {
    return apiClient.get<ApiResponse<CustomerAnalytics>>(
      "/analytics/customers",
      { params },
    );
  }

  getOrders(params?: AnalyticsParams) {
    return apiClient.get<ApiResponse<OrderAnalytics>>("/analytics/orders", {
      params,
    });
  }

  getRevenue(params?: AnalyticsParams) {
    return apiClient.get<ApiResponse<RevenueAnalytics>>("/analytics/revenue", {
      params,
    });
  }
}

export const analyticsAPI = new AnalyticsAPI();
