import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 10, // 10 minutes (formerly cacheTime)
      retry: (failureCount, error: any) => {
        if (
          error?.response?.status === 401 ||
          error?.response?.status === 403 ||
          error?.response?.status === 422
        ) {
          return false; // Don't retry auth or validation errors
        }
        return failureCount < 1; // Retry once for other errors
      },
      refetchOnWindowFocus: false, // Disable auto-refetch on window focus
      refetchOnReconnect: true,
    },
    mutations: {
      retry: 0, // Don't retry mutations automatically
    },
  },
});
