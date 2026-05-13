import { useQuery, useMutation } from "@tanstack/react-query";
import { cartAPI } from "../modules/cart.api";
import { queryClient } from "@/lib/query-client";

export const useCartHooks = () => {
  const getCartQuery = () =>
    useQuery({
      queryKey: ["cart"],
      queryFn: () => cartAPI.getCart(),
      staleTime: 1000 * 60 * 2,
    });

  const addToCartMutation = useMutation({
    mutationFn: ({
      productId,
      quantity,
    }: {
      productId: string;
      quantity: number;
    }) => cartAPI.addItem(productId, quantity),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
    },
  });

  const updateCartItemMutation = useMutation({
    mutationFn: ({ itemId, quantity }: { itemId: string; quantity: number }) =>
      cartAPI.updateItem(itemId, quantity),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
    },
  });

  const removeFromCartMutation = useMutation({
    mutationFn: (itemId: string) => cartAPI.removeItem(itemId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
    },
  });

  const clearCartMutation = useMutation({
    mutationFn: () => cartAPI.clear(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
    },
  });

  const applyCouponMutation = useMutation({
    mutationFn: ({
      couponCode,
      orderTotal,
    }: {
      couponCode: string;
      orderTotal: number;
    }) => cartAPI.applyCoupon(couponCode, orderTotal),
  });

  return {
    getCartQuery,
    addToCartMutation,
    updateCartItemMutation,
    removeFromCartMutation,
    clearCartMutation,
    applyCouponMutation,
  };
};
