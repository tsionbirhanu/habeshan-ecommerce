import { useMutation, useQuery } from "@tanstack/react-query";
import { authAPI } from "../modules/auth.api";
import { useAuthStore } from "@/lib/stores/auth.store";
import { queryClient } from "@/lib/query-client";
import type { RegisterPayload, LoginPayload } from "../modules/auth.api";

export const useAuthHooks = () => {
  const { login: storeLogin, logout: storeLogout } = useAuthStore();

  const registerMutation = useMutation({
    mutationFn: (data: RegisterPayload) => authAPI.registerCustomer(data),
    onSuccess: (response) => {
      // Registration doesn't return tokens, user must verify email first
      // Just invalidate any cached queries
      queryClient.invalidateQueries({ queryKey: ["auth"] });
    },
  });

  const loginMutation = useMutation({
    mutationFn: (data: LoginPayload) => authAPI.login(data),
    onSuccess: (response) => {
      const { user, tokens } = response.data.data!;
      storeLogin(user, tokens.accessToken, tokens.refreshToken);
      queryClient.setQueryData(["auth", "me"], { data: { user } });
    },
  });

  const logoutMutation = useMutation({
    mutationFn: () => authAPI.logout(),
    onSuccess: () => {
      storeLogout();
      queryClient.removeQueries({ queryKey: ["auth"] });
    },
  });

  const forgotPasswordMutation = useMutation({
    mutationFn: ({ email }: { email: string }) => authAPI.forgotPassword(email),
  });

  const verifyEmailMutation = useMutation({
    mutationFn: ({ token }: { token: string }) => authAPI.verifyEmail(token),
  });

  const resetPasswordMutation = useMutation({
    mutationFn: ({
      token,
      newPassword,
    }: {
      token: string;
      newPassword: string;
    }) => authAPI.resetPassword(token, newPassword),
  });

  const getCurrentUserQuery = useQuery({
    queryKey: ["auth", "me"],
    queryFn: () => authAPI.getCurrentUser(),
    staleTime: 1000 * 60 * 5, // 5 minutes
    enabled: false, // Don't auto-run on mount
  });

  return {
    registerMutation,
    loginMutation,
    logoutMutation,
    forgotPasswordMutation,
    verifyEmailMutation,
    resetPasswordMutation,
    getCurrentUserQuery,
  };
};
