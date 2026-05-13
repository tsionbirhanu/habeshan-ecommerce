import { useMutation, useQuery } from "@tanstack/react-query";
import { paymentsAPI } from "../modules/payments.api";
import { queryClient } from "@/lib/query-client";

export const usePaymentsHooks = () => {
  const createPaymentMutation = useMutation({
    mutationFn: (data: any) => paymentsAPI.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payments"] });
    },
  });

  const getPaymentsQuery = (params?: any) =>
    useQuery({
      queryKey: ["payments", params],
      queryFn: () => paymentsAPI.getAll(params),
      staleTime: 1000 * 60 * 5,
    });

  const getPaymentByIdQuery = (id: string) =>
    useQuery({
      queryKey: ["payments", id],
      queryFn: () => paymentsAPI.getById(id),
      staleTime: 1000 * 60 * 10,
      enabled: !!id,
    });

  const handleStripeWebhookMutation = useMutation({
    mutationFn: (data: any) => paymentsAPI.handleStripeWebhook(data),
  });

  const handlePayPalWebhookMutation = useMutation({
    mutationFn: (data: any) => paymentsAPI.handlePayPalWebhook(data),
  });

  const handleKlarnaWebhookMutation = useMutation({
    mutationFn: (data: any) => paymentsAPI.handleKlarnaWebhook(data),
  });

  const getInvoiceMutation = useMutation({
    mutationFn: (id: string) => paymentsAPI.getInvoice(id),
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      paymentsAPI.updateStatus(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["payments", id] });
      queryClient.invalidateQueries({ queryKey: ["payments"] });
    },
  });

  return {
    createPaymentMutation,
    getPaymentsQuery,
    getPaymentByIdQuery,
    handleStripeWebhookMutation,
    handlePayPalWebhookMutation,
    handleKlarnaWebhookMutation,
    getInvoiceMutation,
    updateStatusMutation,
  };
};
