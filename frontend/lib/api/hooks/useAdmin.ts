import { useMutation, useQuery } from "@tanstack/react-query";
import { adminAPI } from "../modules/admin.api";
import { queryClient } from "@/lib/query-client";

export const useAdminHooks = () => {
  const getUsersQuery = (params?: any) =>
    useQuery({
      queryKey: ["admin", "users", params],
      queryFn: () => adminAPI.getUsers(params),
      staleTime: 1000 * 60 * 5,
    });

  const banUserMutation = useMutation({
    mutationFn: ({ userId, data }: { userId: string; data: any }) =>
      adminAPI.banUser(userId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: (userId: string) => adminAPI.deleteUser(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
    },
  });

  const getOrdersQuery = (params?: any) =>
    useQuery({
      queryKey: ["admin", "orders", params],
      queryFn: () => adminAPI.getOrders(params),
      staleTime: 1000 * 60 * 5,
    });

  const updateOrderStatusMutation = useMutation({
    mutationFn: ({ orderId, data }: { orderId: string; data: any }) =>
      adminAPI.updateOrderStatus(orderId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "orders"] });
    },
  });

  const getProductsQuery = (params?: any) =>
    useQuery({
      queryKey: ["admin", "products", params],
      queryFn: () => adminAPI.getProducts(params),
      staleTime: 1000 * 60 * 5,
    });

  const createProductMutation = useMutation({
    mutationFn: (data: any) => adminAPI.createProduct(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "products"] });
    },
  });

  const updateProductMutation = useMutation({
    mutationFn: ({ productId, data }: { productId: string; data: any }) =>
      adminAPI.updateProduct(productId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "products"] });
    },
  });

  const deleteProductMutation = useMutation({
    mutationFn: (productId: string) => adminAPI.deleteProduct(productId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "products"] });
    },
  });

  const getSettingsQuery = () =>
    useQuery({
      queryKey: ["admin", "settings"],
      queryFn: () => adminAPI.getSettings(),
      staleTime: 1000 * 60 * 15,
    });

  const updateSettingsMutation = useMutation({
    mutationFn: (data: any) => adminAPI.updateSettings(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "settings"] });
    },
  });

  const createVendorMutation = useMutation({
    mutationFn: (data: any) => adminAPI.createVendor(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "vendors"] });
    },
  });

  const getVendorsQuery = (params?: any) =>
    useQuery({
      queryKey: ["admin", "vendors", params],
      queryFn: () => adminAPI.getVendors(params),
      staleTime: 1000 * 60 * 5,
    });

  const updateVendorMutation = useMutation({
    mutationFn: ({ vendorId, data }: { vendorId: string; data: any }) =>
      adminAPI.updateVendor(vendorId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "vendors"] });
    },
  });

  const deleteVendorMutation = useMutation({
    mutationFn: (vendorId: string) => adminAPI.deleteVendor(vendorId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "vendors"] });
    },
  });

  return {
    getUsersQuery,
    banUserMutation,
    deleteUserMutation,
    getOrdersQuery,
    updateOrderStatusMutation,
    getProductsQuery,
    createProductMutation,
    updateProductMutation,
    deleteProductMutation,
    getSettingsQuery,
    updateSettingsMutation,
    createVendorMutation,
    getVendorsQuery,
    updateVendorMutation,
    deleteVendorMutation,
  };
};
