import { useMutation, useQuery } from "@tanstack/react-query";
import { couponsAPI } from "../modules/coupons.api";
import { queryClient } from "@/lib/query-client";

export const useCouponsHooks = () => {
  const getCouponsQuery = (params?: any) =>
    useQuery({
      queryKey: ["coupons", params],
      queryFn: () => couponsAPI.getAll(params),
      staleTime: 1000 * 60 * 10,
    });

  const getCouponByCodeQuery = (code: string) =>
    useQuery({
      queryKey: ["coupons", code],
      queryFn: () => couponsAPI.getByCode(code),
      staleTime: 1000 * 60 * 5,
      enabled: !!code,
    });

  const validateCouponMutation = useMutation({
    mutationFn: (data: any) => couponsAPI.validate(data),
  });

  const createCouponMutation = useMutation({
    mutationFn: (data: any) => couponsAPI.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["coupons"] });
    },
  });

  const updateCouponMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      couponsAPI.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["coupons"] });
    },
  });

  return {
    getCouponsQuery,
    getCouponByCodeQuery,
    validateCouponMutation,
    createCouponMutation,
    updateCouponMutation,
  };
};
