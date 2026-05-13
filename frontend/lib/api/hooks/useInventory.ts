import { useMutation, useQuery } from "@tanstack/react-query";
import { inventoryAPI } from "../modules/inventory.api";
import { queryClient } from "@/lib/query-client";

export const useInventoryHooks = () => {
  const getInventoryQuery = (params?: any) =>
    useQuery({
      queryKey: ["inventory", params],
      queryFn: () => inventoryAPI.getAll(params),
      staleTime: 1000 * 60 * 5,
    });

  const getInventoryByIdQuery = (id: string) =>
    useQuery({
      queryKey: ["inventory", id],
      queryFn: () => inventoryAPI.getById(id),
      staleTime: 1000 * 60 * 10,
      enabled: !!id,
    });

  const updateInventoryMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      inventoryAPI.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["inventory", id] });
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
    },
  });

  const getLowStockQuery = (params?: any) =>
    useQuery({
      queryKey: ["inventory", "low-stock", params],
      queryFn: () => inventoryAPI.getLowStock(params),
      staleTime: 1000 * 60 * 10,
    });

  const createAlertMutation = useMutation({
    mutationFn: (data: any) => inventoryAPI.createAlert(data),
  });

  return {
    getInventoryQuery,
    getInventoryByIdQuery,
    updateInventoryMutation,
    getLowStockQuery,
    createAlertMutation,
  };
};
