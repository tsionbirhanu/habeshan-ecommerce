import { useMutation, useQuery } from "@tanstack/react-query";
import { shippingAPI } from "../modules/shipping.api";
import { queryClient } from "@/lib/query-client";

export const useShippingHooks = () => {
  const getRatesMutation = useMutation({
    mutationFn: (data: any) => shippingAPI.getRates(data),
  });

  const createShipmentMutation = useMutation({
    mutationFn: (data: any) => shippingAPI.createShipment(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shipping", "shipments"] });
    },
  });

  const getShipmentsQuery = (params?: any) =>
    useQuery({
      queryKey: ["shipping", "shipments", params],
      queryFn: () => shippingAPI.getShipments(params),
      staleTime: 1000 * 60 * 2,
    });

  const getShipmentByIdQuery = (id: string) =>
    useQuery({
      queryKey: ["shipping", "shipments", id],
      queryFn: () => shippingAPI.getShipmentById(id),
      staleTime: 1000 * 60 * 5,
      enabled: !!id,
    });

  const trackShipmentMutation = useMutation({
    mutationFn: (data: any) => shippingAPI.trackShipment(data),
  });

  const updateShipmentMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      shippingAPI.updateShipment(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({
        queryKey: ["shipping", "shipments", id],
      });
      queryClient.invalidateQueries({ queryKey: ["shipping", "shipments"] });
    },
  });

  const createCarrierMutation = useMutation({
    mutationFn: (data: any) => shippingAPI.createCarrier(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shipping", "carriers"] });
    },
  });

  const getCarriersQuery = () =>
    useQuery({
      queryKey: ["shipping", "carriers"],
      queryFn: () => shippingAPI.getCarriers(),
      staleTime: 1000 * 60 * 30,
    });

  return {
    getRatesMutation,
    createShipmentMutation,
    getShipmentsQuery,
    getShipmentByIdQuery,
    trackShipmentMutation,
    updateShipmentMutation,
    createCarrierMutation,
    getCarriersQuery,
  };
};
