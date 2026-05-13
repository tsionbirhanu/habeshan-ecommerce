import api from "./index";

export interface RegisterPayload {
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  password: string;
  agreeToTerms: boolean;
  subscribeToNewsletter?: boolean;
}

export interface LoginPayload {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface AuthResponse {
  data: {
    user: {
      id: string;
      email: string;
      firstName: string;
      lastName: string;
      role: "ADMIN" | "VENDOR" | "CUSTOMER";
      isActive: boolean;
      isEmailVerified?: boolean;
    };
    tokens: {
      accessToken: string;
      refreshToken: string;
    };
  };
}

export interface ResetPasswordPayload {
  token: string;
  newPassword: string;
  confirmPassword: string;
}

export interface VendorSetupPayload {
  token: string;
  password: string;
  confirmPassword: string;
}

export const authAPI = {
  registerCustomer: (data: RegisterPayload) =>
    api.post<AuthResponse>("/auth/register-customer", data),

  login: (data: LoginPayload) => api.post<AuthResponse>("/auth/login", data),

  logout: () => api.post("/auth/logout", {}),

  refreshToken: (data: { refreshToken: string }) =>
    api.post<AuthResponse>("/auth/refresh-token", data),

  forgotPassword: (data: { email: string }) =>
    api.post("/auth/forgot-password", data),

  resetPassword: (data: ResetPasswordPayload) =>
    api.post("/auth/reset-password", data),

  verifyEmail: (token: string) =>
    api.get("/auth/verify-email", { params: { token } }),

  vendorSetupPassword: (data: VendorSetupPayload) =>
    api.post("/auth/vendor/setup-password", data),

  resendVerificationEmail: (data: { email: string }) =>
    api.post("/auth/resend-verification-email", data),

  getMe: () => api.get("/auth/me"),
};
