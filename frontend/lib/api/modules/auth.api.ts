import { apiClient } from "../client/axios-instance";
import type {
  ApiResponse,
  PaginatedResponse,
  PaginationParams,
} from "../client/types";

export interface AuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: "ADMIN" | "VENDOR" | "CUSTOMER" | "DELIVERY";
  isActive: boolean;
  isEmailVerified: boolean;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface RegisterPayload {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: AuthUser;
  tokens: AuthTokens;
}

class AuthAPI {
  registerCustomer(data: RegisterPayload) {
    return apiClient.post<ApiResponse<AuthResponse>>(
      "/auth/register-customer",
      data,
    );
  }

  login(data: LoginPayload) {
    return apiClient.post<ApiResponse<AuthResponse>>("/auth/login", data);
  }

  logout() {
    return apiClient.post<ApiResponse>("/auth/logout");
  }

  verifyEmail(token: string) {
    return apiClient.get<ApiResponse>("/auth/verify-email", {
      params: { token },
    });
  }

  resendVerification(email: string) {
    return apiClient.post<ApiResponse>("/auth/resend-verification", {
      email,
    });
  }

  forgotPassword(email: string) {
    return apiClient.post<ApiResponse>("/auth/forgot-password", { email });
  }

  resetPassword(token: string, newPassword: string) {
    return apiClient.post<ApiResponse>("/auth/reset-password", {
      token,
      newPassword,
    });
  }

  refreshToken(refreshToken: string) {
    return apiClient.post<ApiResponse<AuthTokens>>("/auth/refresh-token", {
      refreshToken,
    });
  }

  getCurrentUser() {
    return apiClient.get<ApiResponse<{ user: AuthUser }>>("/auth/me");
  }
}

export const authAPI = new AuthAPI();
