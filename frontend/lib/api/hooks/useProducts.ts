import { useQuery, useMutation } from "@tanstack/react-query";
import { productsAPI } from "../modules/products.api";
import { queryClient } from "@/lib/query-client";
import type { PaginationParams } from "../client/types";

export const useProductsHooks = () => {
  const getProductsQuery = (params?: any) =>
    useQuery({
      queryKey: ["products", params],
      queryFn: () => productsAPI.getAll(params),
      staleTime: 1000 * 60 * 5,
    });

  const getProductByIdQuery = (id: string) =>
    useQuery({
      queryKey: ["products", id],
      queryFn: () => productsAPI.getById(id),
      staleTime: 1000 * 60 * 10,
      enabled: !!id,
    });

  const searchProductsQuery = (params?: any) =>
    useQuery({
      queryKey: ["products", "search", params],
      queryFn: () => productsAPI.search(params),
      staleTime: 1000 * 60 * 3,
    });

  const getFeaturedQuery = () =>
    useQuery({
      queryKey: ["products", "featured"],
      queryFn: () => productsAPI.getFeatured(),
      staleTime: 1000 * 60 * 30,
    });

  const getNewArrivalsQuery = () =>
    useQuery({
      queryKey: ["products", "new-arrivals"],
      queryFn: () => productsAPI.getNewArrivals(),
      staleTime: 1000 * 60 * 30,
    });

  const getRelatedQuery = (id: string) =>
    useQuery({
      queryKey: ["products", id, "related"],
      queryFn: () => productsAPI.getRelated(id),
      staleTime: 1000 * 60 * 10,
      enabled: !!id,
    });

  const createProductMutation = useMutation({
    mutationFn: (data: any) => productsAPI.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });

  const updateProductMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      productsAPI.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["products", id] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });

  const deleteProductMutation = useMutation({
    mutationFn: (id: string) => productsAPI.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });

  const uploadImagesMutation = useMutation({
    mutationFn: ({ id, files }: { id: string; files: File[] }) =>
      productsAPI.uploadImages(id, files),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["products", id] });
    },
  });

  return {
    getProductsQuery,
    getProductByIdQuery,
    searchProductsQuery,
    getFeaturedQuery,
    getNewArrivalsQuery,
    getRelatedQuery,
    createProductMutation,
    updateProductMutation,
    deleteProductMutation,
    uploadImagesMutation,
  };
};
