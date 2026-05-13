import { useQuery } from "@tanstack/react-query";
import { analyticsAPI } from "../modules/analytics.api";

export const useAnalyticsHooks = () => {
  const getDashboardQuery = (params?: any) =>
    useQuery({
      queryKey: ["analytics", "dashboard", params],
      queryFn: () => analyticsAPI.getDashboard(params),
      staleTime: 1000 * 60 * 5,
    });

  const getSalesQuery = (params?: any) =>
    useQuery({
      queryKey: ["analytics", "sales", params],
      queryFn: () => analyticsAPI.getSales(params),
      staleTime: 1000 * 60 * 5,
    });

  const getProductsQuery = (params?: any) =>
    useQuery({
      queryKey: ["analytics", "products", params],
      queryFn: () => analyticsAPI.getProducts(params),
      staleTime: 1000 * 60 * 5,
    });

  const getCustomersQuery = (params?: any) =>
    useQuery({
      queryKey: ["analytics", "customers", params],
      queryFn: () => analyticsAPI.getCustomers(params),
      staleTime: 1000 * 60 * 5,
    });

  const getOrdersQuery = (params?: any) =>
    useQuery({
      queryKey: ["analytics", "orders", params],
      queryFn: () => analyticsAPI.getOrders(params),
      staleTime: 1000 * 60 * 5,
    });

  const getRevenueQuery = (params?: any) =>
    useQuery({
      queryKey: ["analytics", "revenue", params],
      queryFn: () => analyticsAPI.getRevenue(params),
      staleTime: 1000 * 60 * 5,
    });

  return {
    getDashboardQuery,
    getSalesQuery,
    getProductsQuery,
    getCustomersQuery,
    getOrdersQuery,
    getRevenueQuery,
  };
};
