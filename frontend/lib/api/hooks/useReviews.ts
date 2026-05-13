import { useMutation, useQuery } from "@tanstack/react-query";
import { reviewsAPI } from "../modules/reviews.api";
import { queryClient } from "@/lib/query-client";

export const useReviewsHooks = () => {
  const getReviewsQuery = (params?: any) =>
    useQuery({
      queryKey: ["reviews", params],
      queryFn: () => reviewsAPI.getAll(params),
      staleTime: 1000 * 60 * 5,
    });

  const createReviewMutation = useMutation({
    mutationFn: (data: any) => reviewsAPI.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reviews"] });
    },
  });

  const getReviewByIdQuery = (id: string) =>
    useQuery({
      queryKey: ["reviews", id],
      queryFn: () => reviewsAPI.getById(id),
      staleTime: 1000 * 60 * 10,
      enabled: !!id,
    });

  const updateReviewMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      reviewsAPI.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["reviews", id] });
      queryClient.invalidateQueries({ queryKey: ["reviews"] });
    },
  });

  const deleteReviewMutation = useMutation({
    mutationFn: (id: string) => reviewsAPI.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reviews"] });
    },
  });

  const approveReviewMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      reviewsAPI.approve(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["reviews", id] });
      queryClient.invalidateQueries({ queryKey: ["reviews"] });
    },
  });

  const getProductReviewsQuery = (productId: string, params?: any) =>
    useQuery({
      queryKey: ["reviews", "product", productId, params],
      queryFn: () => reviewsAPI.getByProduct(productId, params),
      staleTime: 1000 * 60 * 5,
      enabled: !!productId,
    });

  const markHelpfulMutation = useMutation({
    mutationFn: (id: string) => reviewsAPI.markHelpful(id),
  });

  return {
    getReviewsQuery,
    createReviewMutation,
    getReviewByIdQuery,
    updateReviewMutation,
    deleteReviewMutation,
    approveReviewMutation,
    getProductReviewsQuery,
    markHelpfulMutation,
  };
};
