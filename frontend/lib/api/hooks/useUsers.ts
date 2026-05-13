import { useMutation, useQuery } from "@tanstack/react-query";
import { usersAPI } from "../modules/users.api";
import { queryClient } from "@/lib/query-client";

export const useUsersHooks = () => {
  const getProfileQuery = () =>
    useQuery({
      queryKey: ["users", "profile"],
      queryFn: () => usersAPI.getProfile(),
      staleTime: 1000 * 60 * 10,
    });

  const updateProfileMutation = useMutation({
    mutationFn: (data: any) => usersAPI.updateProfile(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users", "profile"] });
    },
  });

  const changePasswordMutation = useMutation({
    mutationFn: (data: any) => usersAPI.changePassword(data),
  });

  const deleteAccountMutation = useMutation({
    mutationFn: () => usersAPI.deleteAccount(),
  });

  const getPersonalDataMutation = useMutation({
    mutationFn: () => usersAPI.getPersonalData(),
  });

  const getAddressesQuery = () =>
    useQuery({
      queryKey: ["users", "addresses"],
      queryFn: () => usersAPI.getAddresses(),
      staleTime: 1000 * 60 * 5,
    });

  const createAddressMutation = useMutation({
    mutationFn: (data: any) => usersAPI.createAddress(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users", "addresses"] });
    },
  });

  const updateAddressMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      usersAPI.updateAddress(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users", "addresses"] });
    },
  });

  const deleteAddressMutation = useMutation({
    mutationFn: (id: string) => usersAPI.deleteAddress(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users", "addresses"] });
    },
  });

  return {
    getProfileQuery,
    updateProfileMutation,
    changePasswordMutation,
    deleteAccountMutation,
    getPersonalDataMutation,
    getAddressesQuery,
    createAddressMutation,
    updateAddressMutation,
    deleteAddressMutation,
  };
};
