import { useMutation, useQuery } from "@tanstack/react-query";
import { ordersAPI } from "../modules/orders.api";
import { queryClient } from "@/lib/query-client";

export const useOrdersHooks = () => {
  const createOrderMutation = useMutation({
    mutationFn: (data: any) => ordersAPI.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
  });

  const getOrdersQuery = (params?: any) =>
    useQuery({
      queryKey: ["orders", params],
      queryFn: () => ordersAPI.getAll(params),
      staleTime: 1000 * 60 * 2,
    });

  const getOrderByIdQuery = (id: string) =>
    useQuery({
      queryKey: ["orders", id],
      queryFn: () => ordersAPI.getById(id),
      staleTime: 1000 * 60 * 5,
      enabled: !!id,
    });

  const updateOrderStatusMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      ordersAPI.updateStatus(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["orders", id] });
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
  });

  const deleteOrderMutation = useMutation({
    mutationFn: (id: string) => ordersAPI.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
  });

  const cancelOrderMutation = useMutation({
    mutationFn: (id: string) => ordersAPI.cancel(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ["orders", id] });
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
  });

  const getTrackingQuery = (id: string) =>
    useQuery({
      queryKey: ["orders", id, "tracking"],
      queryFn: () => ordersAPI.getTracking(id),
      staleTime: 1000 * 60 * 2,
      enabled: !!id,
    });

  const requestReturnMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      ordersAPI.requestReturn(id, data),
  });

  const getInvoiceMutation = useMutation({
    mutationFn: (id: string) => ordersAPI.getInvoice(id),
  });

  const getReceiptMutation = useMutation({
    mutationFn: (id: string) => ordersAPI.getReceipt(id),
  });

  return {
    createOrderMutation,
    getOrdersQuery,
    getOrderByIdQuery,
    updateOrderStatusMutation,
    deleteOrderMutation,
    cancelOrderMutation,
    getTrackingQuery,
    requestReturnMutation,
    getInvoiceMutation,
    getReceiptMutation,
  };
};
