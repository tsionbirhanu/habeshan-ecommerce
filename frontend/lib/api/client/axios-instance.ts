import axios, {
  AxiosInstance,
  AxiosError,
  InternalAxiosRequestConfig,
} from "axios";
import { useAuthStore } from "@/lib/stores/auth.store";

let tokenRefreshPromise: Promise<string> | null = null;

interface RequestConfig extends InternalAxiosRequestConfig {
  retry?: number;
}

export const createApiClient = (): AxiosInstance => {
  const instance = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api",
    timeout: 30000,
    headers: {
      "Content-Type": "application/json",
    },
    withCredentials: true,
  });

  // Request Interceptor
  instance.interceptors.request.use(
    (config: RequestConfig) => {
      if (typeof window !== "undefined") {
        const token = useAuthStore.getState().accessToken;
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      }
      return config;
    },
    (error) => Promise.reject(error),
  );

  // Response Interceptor
  instance.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
      const config = error.config as RequestConfig;

      // Handle 401 - Token Expired
      if (error.response?.status === 401) {
        if (!tokenRefreshPromise) {
          tokenRefreshPromise = refreshAccessToken();
        }

        try {
          const newToken = await tokenRefreshPromise;
          config!.headers.Authorization = `Bearer ${newToken}`;
          return instance(config!);
        } catch (err) {
          if (typeof window !== "undefined") {
            useAuthStore.getState().logout();
            window.location.href = "/login";
          }
          return Promise.reject(err);
        } finally {
          tokenRefreshPromise = null;
        }
      }

      // Handle 403 - Forbidden
      if (error.response?.status === 403) {
        if (typeof window !== "undefined") {
          window.location.href = "/unauthorized";
        }
      }

      return Promise.reject(error);
    },
  );

  return instance;
};

async function refreshAccessToken(): Promise<string> {
  const { refreshToken } = useAuthStore.getState();
  try {
    const response = await apiClient.post("/auth/refresh-token", {
      refreshToken,
    });
    const newToken = response.data.data.accessToken;
    useAuthStore.getState().setTokens(newToken, refreshToken);
    return newToken;
  } catch (error) {
    throw error;
  }
}

export const apiClient = createApiClient();
