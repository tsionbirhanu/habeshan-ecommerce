import api from "./index";

export interface RegisterPayload {
  email: string;
  firstName: string;
  lastName: string;
  password: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    isActive: boolean;
  };
  accessToken: string;
  refreshToken: string;
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

  resetPassword: (data: { token: string; password: string }) =>
    api.post("/auth/reset-password", data),

  verifyEmail: (token: string) =>
    api.get("/auth/verify-email", { params: { token } }),

  vendorSetupPassword: (data: { token: string; password: string }) =>
    api.post("/auth/vendor/setup-password", data),

  getMe: () => api.get("/auth/me"),
};
