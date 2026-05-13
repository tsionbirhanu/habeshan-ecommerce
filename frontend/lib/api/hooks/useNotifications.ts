import { useMutation, useQuery } from "@tanstack/react-query";
import { notificationsAPI } from "../modules/notifications.api";
import { queryClient } from "@/lib/query-client";

export const useNotificationsHooks = () => {
  const getNotificationsQuery = (params?: any) =>
    useQuery({
      queryKey: ["notifications", params],
      queryFn: () => notificationsAPI.getAll(params),
      staleTime: 1000 * 30, // 30 seconds
      refetchInterval: 1000 * 60, // Refetch every minute
    });

  const getNotificationByIdQuery = (id: string) =>
    useQuery({
      queryKey: ["notifications", id],
      queryFn: () => notificationsAPI.getById(id),
      staleTime: 1000 * 60 * 5,
      enabled: !!id,
    });

  const markAsReadMutation = useMutation({
    mutationFn: (id: string) => notificationsAPI.markAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  const deleteNotificationMutation = useMutation({
    mutationFn: (id: string) => notificationsAPI.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  const subscribeMutation = useMutation({
    mutationFn: (data: any) => notificationsAPI.subscribe(data),
  });

  const unsubscribeMutation = useMutation({
    mutationFn: ({ type, channel }: { type: string; channel: string }) =>
      notificationsAPI.unsubscribe(type, channel),
  });

  return {
    getNotificationsQuery,
    getNotificationByIdQuery,
    markAsReadMutation,
    deleteNotificationMutation,
    subscribeMutation,
    unsubscribeMutation,
  };
};
