import { useMutation, useQuery } from "@tanstack/react-query";
import { wishlistAPI } from "../modules/wishlist.api";
import { queryClient } from "@/lib/query-client";

export const useWishlistHooks = () => {
  const getWishlistQuery = () =>
    useQuery({
      queryKey: ["wishlist"],
      queryFn: () => wishlistAPI.getWishlist(),
      staleTime: 1000 * 60 * 5,
    });

  const addItemMutation = useMutation({
    mutationFn: (productId: string) => wishlistAPI.addItem(productId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wishlist"] });
      queryClient.invalidateQueries({ queryKey: ["wishlist", "count"] });
    },
  });

  const removeItemMutation = useMutation({
    mutationFn: (itemId: string) => wishlistAPI.removeItem(itemId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wishlist"] });
      queryClient.invalidateQueries({ queryKey: ["wishlist", "count"] });
    },
  });

  const moveToCartMutation = useMutation({
    mutationFn: (itemId: string) => wishlistAPI.moveToCart(itemId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wishlist"] });
      queryClient.invalidateQueries({ queryKey: ["cart"] });
    },
  });

  const getCountQuery = () =>
    useQuery({
      queryKey: ["wishlist", "count"],
      queryFn: () => wishlistAPI.getCount(),
      staleTime: 1000 * 60 * 5,
    });

  return {
    getWishlistQuery,
    addItemMutation,
    removeItemMutation,
    moveToCartMutation,
    getCountQuery,
  };
};
