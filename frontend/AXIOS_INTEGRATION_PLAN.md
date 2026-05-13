# Axios Integration Plan - Frontend Architecture

## Executive Summary

This document outlines a comprehensive, decoupled axios-based API integration architecture for the Habeshan E-Commerce frontend. The plan leverages your existing structure while providing clear patterns for scaling.

---

## Current Architecture Assessment ✅

### Strengths

- ✅ Axios instance with interceptors (auth, error handling)
- ✅ Modular API layer (16 separate modules)
- ✅ Zustand for state management
- ✅ Existing interceptors for token refresh
- ✅ Type-safe API responses
- ✅ Error normalization

### To Enhance

- Add request/response type definitions
- Implement retry logic
- Add request caching
- Create custom hooks for common patterns
- Add loading/error state management
- Implement request queuing for token refresh

---

## Architecture Overview

```
frontend/
├── lib/
│   ├── api/
│   │   ├── client/                 # Core axios instance
│   │   │   ├── axios-instance.ts   # Main instance
│   │   │   ├── interceptors.ts     # Request/Response interceptors
│   │   │   └── types.ts            # Common types
│   │   │
│   │   ├── modules/                # Feature-based API modules
│   │   │   ├── auth.api.ts
│   │   │   ├── users.api.ts
│   │   │   ├── products.api.ts
│   │   │   ├── cart.api.ts
│   │   │   ├── orders.api.ts
│   │   │   ├── payments.api.ts
│   │   │   ├── shipping.api.ts
│   │   │   ├── reviews.api.ts
│   │   │   ├── wishlist.api.ts
│   │   │   ├── coupons.api.ts
│   │   │   ├── notifications.api.ts
│   │   │   ├── inventory.api.ts
│   │   │   ├── analytics.api.ts
│   │   │   ├── admin.api.ts
│   │   │   └── index.ts
│   │   │
│   │   ├── hooks/                  # React Query hooks
│   │   │   ├── useAuth.ts
│   │   │   ├── useProducts.ts
│   │   │   ├── useCart.ts
│   │   │   ├── useOrders.ts
│   │   │   ├── usePayments.ts
│   │   │   ├── useUsers.ts
│   │   │   ├── useNotifications.ts
│   │   │   └── index.ts
│   │   │
│   │   ├── errors/                 # Error handling
│   │   │   ├── api-error.ts
│   │   │   └── error-handler.ts
│   │   │
│   │   └── utils/                  # API utilities
│   │       ├── retry-config.ts
│   │       └── pagination.ts
│   │
│   ├── stores/                     # Zustand stores
│   │   ├── auth.store.ts
│   │   ├── cart.store.ts
│   │   ├── checkout.store.ts
│   │   ├── wishlist.store.ts
│   │   └── ui.store.ts
│   │
│   ├── constants/                  # API endpoints
│   │   └── api-endpoints.ts
│   │
│   └── utils/
│       └── request.ts              # Helper utilities
```

---

## Phase 1: Core Setup (Foundation)

### 1.1 Enhance Axios Instance

**File:** `lib/api/client/axios-instance.ts`

```typescript
import axios from "axios";
import type { AxiosInstance, InternalAxiosRequestConfig } from "axios";

interface RequestConfig extends InternalAxiosRequestConfig {
  retry?: number;
  shouldRetry?: (error: any) => boolean;
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

  return instance;
};

export const apiClient = createApiClient();
```

### 1.2 Request/Response Interceptors

**File:** `lib/api/client/interceptors.ts`

```typescript
import { AxiosInstance, AxiosError, AxiosResponse } from "axios";
import { useAuthStore } from "@/lib/stores/auth.store";

const MAX_RETRIES = 3;
let tokenRefreshPromise: Promise<string> | null = null;

export const setupInterceptors = (instance: AxiosInstance) => {
  // Request Interceptor
  instance.interceptors.request.use(
    (config) => {
      const token = useAuthStore.getState().accessToken;
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error),
  );

  // Response Interceptor
  instance.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
      const config = error.config as any;

      // Handle 401 - Token Expired
      if (error.response?.status === 401) {
        if (!tokenRefreshPromise) {
          tokenRefreshPromise = refreshAccessToken();
        }

        try {
          const newToken = await tokenRefreshPromise;
          config.headers.Authorization = `Bearer ${newToken}`;
          return instance(config);
        } catch (err) {
          useAuthStore.getState().logout();
          window.location.href = "/login";
          return Promise.reject(err);
        } finally {
          tokenRefreshPromise = null;
        }
      }

      // Handle 403 - Forbidden
      if (error.response?.status === 403) {
        window.location.href = "/unauthorized";
      }

      return Promise.reject(error);
    },
  );
};

async function refreshAccessToken(): Promise<string> {
  const { refreshToken } = useAuthStore.getState();
  const response = await apiClient.post("/auth/refresh-token", {
    refreshToken,
  });
  const newToken = response.data.data.accessToken;
  useAuthStore.getState().setTokens(newToken, refreshToken);
  return newToken;
}
```

### 1.3 Type Definitions

**File:** `lib/api/client/types.ts`

```typescript
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: {
    code: string;
    message: string;
    details?: Record<string, any>;
  };
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface ApiError {
  code: string;
  message: string;
  statusCode: number;
  details?: Record<string, any>;
}

export type RequestMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";

export interface RetryConfig {
  maxRetries: number;
  delayMs: number;
  backoffMultiplier: number;
  statusCodesToRetry: number[];
}
```

---

## Phase 2: API Modules (Layer by Layer)

### 2.1 Authentication Module

**File:** `lib/api/modules/auth.api.ts`

```typescript
import { apiClient } from "../client/axios-instance";
import type { ApiResponse } from "../client/types";

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
```

### 2.2 Users Module

**File:** `lib/api/modules/users.api.ts`

```typescript
import { apiClient } from "../client/axios-instance";
import type { ApiResponse } from "../client/types";

export interface UserProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  role: string;
  createdAt: string;
  updatedAt: string;
}

export interface Address {
  id: string;
  type: "SHIPPING" | "BILLING";
  firstName: string;
  lastName: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
}

export interface UpdateProfilePayload {
  firstName?: string;
  lastName?: string;
  phone?: string;
  email?: string;
}

class UsersAPI {
  getProfile() {
    return apiClient.get<ApiResponse<{ user: UserProfile }>>("/users/profile");
  }

  updateProfile(data: UpdateProfilePayload) {
    return apiClient.put<ApiResponse<{ user: UserProfile }>>(
      "/users/profile",
      data,
    );
  }

  changePassword(oldPassword: string, newPassword: string) {
    return apiClient.post<ApiResponse>("/users/change-password", {
      oldPassword,
      newPassword,
    });
  }

  deleteAccount() {
    return apiClient.delete<ApiResponse>("/users/account");
  }

  downloadPersonalData() {
    return apiClient.get<ApiResponse>("/users/personal-data", {
      responseType: "blob",
    });
  }

  // Address Management
  getAddresses(type?: string) {
    return apiClient.get<ApiResponse<{ addresses: Address[] }>>(
      "/users/addresses",
      { params: { type } },
    );
  }

  createAddress(data: Omit<Address, "id">) {
    return apiClient.post<ApiResponse<Address>>("/users/addresses", data);
  }

  updateAddress(id: string, data: Partial<Address>) {
    return apiClient.put<ApiResponse<Address>>(`/users/addresses/${id}`, data);
  }

  deleteAddress(id: string) {
    return apiClient.delete<ApiResponse>(`/users/addresses/${id}`);
  }
}

export const usersAPI = new UsersAPI();
```

### 2.3 Products Module

**File:** `lib/api/modules/products.api.ts`

```typescript
import { apiClient } from "../client/axios-instance";
import type {
  ApiResponse,
  PaginatedResponse,
  PaginationParams,
} from "../client/types";

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  sku: string;
  images: string[];
  categoryId: string;
  rating: number;
  reviewCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProductPayload {
  name: string;
  nameEn?: string;
  nameDe?: string;
  description: string;
  price: number;
  stock: number;
  categoryId: string;
  sku: string;
  images?: string[];
}

class ProductsAPI {
  getAll(
    params?: PaginationParams & {
      category?: string;
      minPrice?: number;
      maxPrice?: number;
    },
  ) {
    return apiClient.get<PaginatedResponse<Product>>("/products", {
      params,
    });
  }

  getById(id: string) {
    return apiClient.get<ApiResponse<Product>>(`/products/${id}`);
  }

  search(
    params: {
      q?: string;
      category?: string;
      minPrice?: number;
      maxPrice?: number;
    } & PaginationParams,
  ) {
    return apiClient.get<PaginatedResponse<Product>>("/products/search", {
      params,
    });
  }

  getFeatured() {
    return apiClient.get<ApiResponse<Product[]>>("/products/featured");
  }

  getNewArrivals() {
    return apiClient.get<ApiResponse<Product[]>>("/products/new-arrivals");
  }

  getRelated(id: string) {
    return apiClient.get<ApiResponse<Product[]>>(`/products/${id}/related`);
  }

  create(data: CreateProductPayload) {
    return apiClient.post<ApiResponse<Product>>("/products", data);
  }

  update(id: string, data: Partial<CreateProductPayload>) {
    return apiClient.put<ApiResponse<Product>>(`/products/${id}`, data);
  }

  delete(id: string) {
    return apiClient.delete<ApiResponse>(`/products/${id}`);
  }

  uploadImages(id: string, files: File[]) {
    const formData = new FormData();
    files.forEach((file, index) => {
      formData.append(`images`, file);
    });

    return apiClient.post<ApiResponse<Product>>(
      `/products/${id}/images`,
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      },
    );
  }
}

export const productsAPI = new ProductsAPI();
```

### 2.4 Cart Module

**File:** `lib/api/modules/cart.api.ts`

```typescript
import { apiClient } from "../client/axios-instance";
import type { ApiResponse } from "../client/types";

export interface CartItem {
  id: string;
  productId: string;
  quantity: number;
  price: number;
}

export interface Cart {
  id: string;
  items: CartItem[];
  subtotal: number;
  tax: number;
  total: number;
}

export interface ApplyCouponResponse {
  discount: number;
  newTotal: number;
  couponCode: string;
}

class CartAPI {
  getCart() {
    return apiClient.get<ApiResponse<Cart>>("/cart");
  }

  addItem(productId: string, quantity: number) {
    return apiClient.post<ApiResponse<Cart>>("/cart/add", {
      productId,
      quantity,
    });
  }

  updateItem(itemId: string, quantity: number) {
    return apiClient.put<ApiResponse<Cart>>(`/cart/items/${itemId}`, {
      quantity,
    });
  }

  removeItem(itemId: string) {
    return apiClient.delete<ApiResponse<Cart>>(`/cart/items/${itemId}`);
  }

  clear() {
    return apiClient.delete<ApiResponse<Cart>>("/cart");
  }

  validate() {
    return apiClient.get<ApiResponse>("/cart/validate");
  }

  applyCoupon(couponCode: string, orderTotal: number) {
    return apiClient.post<ApiResponse<ApplyCouponResponse>>(
      "/cart/apply-coupon",
      { couponCode, orderTotal },
    );
  }
}

export const cartAPI = new CartAPI();
```

### 2.5 Orders Module

**File:** `lib/api/modules/orders.api.ts`

```typescript
import { apiClient } from "../client/axios-instance";
import type {
  ApiResponse,
  PaginatedResponse,
  PaginationParams,
} from "../client/types";

export type OrderStatus =
  | "PENDING_PAYMENT"
  | "CONFIRMED"
  | "PROCESSING"
  | "SHIPPED"
  | "IN_TRANSIT"
  | "DELIVERED"
  | "COMPLETED"
  | "CANCELLED"
  | "RETURNED"
  | "REFUNDED";

export interface OrderItem {
  id: string;
  productId: string;
  quantity: number;
  price: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  shippingCost: number;
  totalAmount: number;
  deliveryAddressId: string;
  billingAddressId: string;
  paymentMethod: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateOrderPayload {
  deliveryAddressId: string;
  billingAddressId: string;
  paymentMethod: "STRIPE" | "PAYPAL" | "KLARNA" | "COD";
  couponCode?: string;
}

class OrdersAPI {
  create(data: CreateOrderPayload) {
    return apiClient.post<ApiResponse<Order>>("/orders", data);
  }

  getAll(
    params?: PaginationParams & {
      status?: OrderStatus;
      customerId?: string;
    },
  ) {
    return apiClient.get<PaginatedResponse<Order>>("/orders", { params });
  }

  getMyOrders(params?: PaginationParams & { status?: OrderStatus }) {
    return apiClient.get<PaginatedResponse<Order>>("/orders/my", { params });
  }

  getById(id: string) {
    return apiClient.get<ApiResponse<Order>>(`/orders/${id}`);
  }

  updateStatus(id: string, status: OrderStatus, notes?: string) {
    return apiClient.put<ApiResponse<Order>>(`/orders/${id}`, {
      status,
      notes,
    });
  }

  cancel(id: string) {
    return apiClient.post<ApiResponse<Order>>(`/orders/${id}/cancel`);
  }

  getTracking(id: string) {
    return apiClient.get<ApiResponse>(`/orders/${id}/tracking`);
  }

  addNote(id: string, note: string) {
    return apiClient.post<ApiResponse<Order>>(`/orders/${id}/notes`, { note });
  }
}

export const ordersAPI = new OrdersAPI();
```

### 2.6 Payments Module

**File:** `lib/api/modules/payments.api.ts`

```typescript
import { apiClient } from "../client/axios-instance";
import type { ApiResponse } from "../client/types";

export interface StripePaymentIntent {
  clientSecret: string;
  paymentIntentId: string;
  publishableKey: string;
  amount: number;
  amountFormatted: string;
}

export interface PayPalOrder {
  id: string;
  status: string;
  links: Array<{ rel: string; href: string }>;
}

export interface KlarnaSession {
  sessionId: string;
  checkoutUrl: string;
}

class PaymentsAPI {
  getMethods() {
    return apiClient.get<ApiResponse>("/payments/methods");
  }

  createStripeIntent(orderId: string) {
    return apiClient.post<ApiResponse<StripePaymentIntent>>(
      "/payments/stripe/create-intent",
      { orderId },
    );
  }

  createPayPalOrder(orderId: string) {
    return apiClient.post<ApiResponse<PayPalOrder>>("/payments/paypal/create", {
      orderId,
    });
  }

  capturePayPalOrder(orderId: string, paypalOrderId: string) {
    return apiClient.post<ApiResponse>("/payments/paypal/capture", {
      orderId,
      paypalOrderId,
    });
  }

  createKlarnaSession(orderId: string) {
    return apiClient.post<ApiResponse<KlarnaSession>>(
      "/payments/klarna/session",
      { orderId },
    );
  }

  confirmKlarnaOrder(orderId: string, sessionId: string) {
    return apiClient.post<ApiResponse>("/payments/klarna/confirm", {
      orderId,
      sessionId,
    });
  }

  getPaymentStatus(orderId: string) {
    return apiClient.get<ApiResponse>(`/payments/${orderId}`);
  }

  refundPayment(orderId: string, reason: string, amount: number) {
    return apiClient.post<ApiResponse>(`/payments/${orderId}/refund`, {
      reason,
      amount,
    });
  }

  getInvoice(orderId: string) {
    return apiClient.get<ApiResponse>(`/payments/${orderId}/invoice`);
  }

  downloadInvoice(orderId: string) {
    return apiClient.get<Blob>(`/payments/${orderId}/invoice/download`, {
      responseType: "blob",
    });
  }

  sendInvoiceEmail(orderId: string) {
    return apiClient.post<ApiResponse>(`/payments/${orderId}/invoice/send`);
  }

  getReceipt(orderId: string) {
    return apiClient.get<ApiResponse>(`/payments/${orderId}/receipt`);
  }
}

export const paymentsAPI = new PaymentsAPI();
```

### 2.7 Shipping Module

**File:** `lib/api/modules/shipping.api.ts`

```typescript
import { apiClient } from "../client/axios-instance";
import type { ApiResponse } from "../client/types";

export interface ShippingRate {
  method: "DHL" | "HERMES" | "DPD";
  cost: number;
  estimatedDays: number;
}

export interface Shipment {
  id: string;
  orderId: string;
  method: string;
  trackingNumber: string;
  status: string;
  estimatedDelivery: string;
}

export interface TrackingInfo {
  trackingNumber: string;
  status: string;
  updates: Array<{
    timestamp: string;
    status: string;
    location: string;
  }>;
}

class ShippingAPI {
  getRates(params: {
    weightKg: number;
    postalCode: string;
    country: string;
    orderTotal?: number;
  }) {
    return apiClient.post<ApiResponse<ShippingRate[]>>(
      "/shipping/rates",
      params,
    );
  }

  createShipment(orderId: string, method: string) {
    return apiClient.post<ApiResponse<Shipment>>("/shipping", {
      orderId,
      method,
    });
  }

  getTracking(trackingNumber: string) {
    return apiClient.get<ApiResponse<TrackingInfo>>(
      `/shipping/track/${trackingNumber}`,
    );
  }

  getOrderShipment(orderId: string) {
    return apiClient.get<ApiResponse<Shipment>>(`/shipping/order/${orderId}`);
  }

  downloadLabel(shipmentId: string) {
    return apiClient.get<Blob>(`/shipping/${shipmentId}/label`, {
      responseType: "blob",
    });
  }
}

export const shippingAPI = new ShippingAPI();
```

### 2.8 Wishlist Module

**File:** `lib/api/modules/wishlist.api.ts`

```typescript
import { apiClient } from "../client/axios-instance";
import type { ApiResponse } from "../client/types";
import type { Product } from "./products.api";

class WishlistAPI {
  getWishlist() {
    return apiClient.get<ApiResponse<{ items: Product[] }>>("/wishlist");
  }

  addItem(productId: string) {
    return apiClient.post<ApiResponse>(`/wishlist/${productId}`);
  }

  removeItem(productId: string) {
    return apiClient.delete<ApiResponse>(`/wishlist/${productId}`);
  }

  moveToCart(productId: string) {
    return apiClient.post<ApiResponse>(`/wishlist/${productId}/move-to-cart`);
  }
}

export const wishlistAPI = new WishlistAPI();
```

### 2.9 Reviews Module

**File:** `lib/api/modules/reviews.api.ts`

```typescript
import { apiClient } from "../client/axios-instance";
import type {
  ApiResponse,
  PaginatedResponse,
  PaginationParams,
} from "../client/types";

export interface Review {
  id: string;
  productId: string;
  rating: number;
  title: string;
  comment: string;
  helpful: number;
  unhelpful: number;
  status: "PENDING" | "APPROVED" | "REJECTED";
  createdAt: string;
}

export interface CreateReviewPayload {
  productId: string;
  rating: number;
  title: string;
  comment: string;
}

class ReviewsAPI {
  create(data: CreateReviewPayload) {
    return apiClient.post<ApiResponse<Review>>("/reviews", data);
  }

  getByProduct(productId: string, params?: PaginationParams) {
    return apiClient.get<PaginatedResponse<Review>>(
      `/products/${productId}/reviews`,
      { params },
    );
  }

  getPending(params?: PaginationParams) {
    return apiClient.get<PaginatedResponse<Review>>("/reviews/pending", {
      params,
    });
  }

  update(id: string, data: Partial<CreateReviewPayload>) {
    return apiClient.put<ApiResponse<Review>>(`/reviews/${id}`, data);
  }

  delete(id: string) {
    return apiClient.delete<ApiResponse>(`/reviews/${id}`);
  }

  approve(id: string) {
    return apiClient.post<ApiResponse<Review>>(`/reviews/${id}/approve`);
  }

  reject(id: string) {
    return apiClient.post<ApiResponse<Review>>(`/reviews/${id}/reject`);
  }

  toggleHelpful(id: string) {
    return apiClient.post<ApiResponse>(`/reviews/${id}/helpful`);
  }
}

export const reviewsAPI = new ReviewsAPI();
```

### 2.10 Additional Modules

Create similar patterns for:

- **Coupons** (`coupons.api.ts`)
- **Notifications** (`notifications.api.ts`)
- **Inventory** (`inventory.api.ts`)
- **Analytics** (`analytics.api.ts`)
- **Admin** (`admin.api.ts`)

---

## Phase 3: Custom React Query Hooks

### 3.1 Authentication Hooks

**File:** `lib/api/hooks/useAuth.ts`

```typescript
import { useMutation, useQuery } from "@tanstack/react-query";
import { authAPI } from "../modules/auth.api";
import { useAuthStore } from "@/lib/stores/auth.store";
import type { RegisterPayload, LoginPayload } from "../modules/auth.api";

export const useAuthHooks = () => {
  const { login: storeLogin, logout: storeLogout } = useAuthStore();

  const registerMutation = useMutation({
    mutationFn: (data: RegisterPayload) => authAPI.registerCustomer(data),
    onSuccess: (response) => {
      const { user, tokens } = response.data.data;
      storeLogin(user, tokens.accessToken, tokens.refreshToken);
    },
  });

  const loginMutation = useMutation({
    mutationFn: (data: LoginPayload) => authAPI.login(data),
    onSuccess: (response) => {
      const { user, tokens } = response.data.data;
      storeLogin(user, tokens.accessToken, tokens.refreshToken);
    },
  });

  const logoutMutation = useMutation({
    mutationFn: () => authAPI.logout(),
    onSuccess: () => {
      storeLogout();
    },
  });

  const verifyEmailMutation = useMutation({
    mutationFn: (token: string) => authAPI.verifyEmail(token),
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
  });

  return {
    registerMutation,
    loginMutation,
    logoutMutation,
    verifyEmailMutation,
    resetPasswordMutation,
    getCurrentUserQuery,
  };
};
```

### 3.2 Products Hooks

**File:** `lib/api/hooks/useProducts.ts`

```typescript
import { useQuery, useMutation, useInfiniteQuery } from "@tanstack/react-query";
import { productsAPI } from "../modules/products.api";
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
  });

  const updateProductMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      productsAPI.update(id, data),
  });

  const deleteProductMutation = useMutation({
    mutationFn: (id: string) => productsAPI.delete(id),
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
  };
};
```

### 3.3 Cart Hooks

**File:** `lib/api/hooks/useCart.ts`

```typescript
import { useQuery, useMutation } from "@tanstack/react-query";
import { cartAPI } from "../modules/cart.api";
import { queryClient } from "@/lib/query-client"; // Create this

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
```

### 3.4 Orders Hooks

**File:** `lib/api/hooks/useOrders.ts`

```typescript
import { useQuery, useMutation } from "@tanstack/react-query";
import { ordersAPI } from "../modules/orders.api";
import { queryClient } from "@/lib/query-client";
import type { CreateOrderPayload, OrderStatus } from "../modules/orders.api";

export const useOrdersHooks = () => {
  const getMyOrdersQuery = (params?: any) =>
    useQuery({
      queryKey: ["orders", "my", params],
      queryFn: () => ordersAPI.getMyOrders(params),
      staleTime: 1000 * 60 * 5,
    });

  const getOrderByIdQuery = (id: string) =>
    useQuery({
      queryKey: ["orders", id],
      queryFn: () => ordersAPI.getById(id),
      staleTime: 1000 * 60 * 3,
      enabled: !!id,
    });

  const getAllOrdersQuery = (params?: any) =>
    useQuery({
      queryKey: ["orders", "all", params],
      queryFn: () => ordersAPI.getAll(params),
      staleTime: 1000 * 60 * 5,
    });

  const createOrderMutation = useMutation({
    mutationFn: (data: CreateOrderPayload) => ordersAPI.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
  });

  const updateOrderStatusMutation = useMutation({
    mutationFn: ({
      id,
      status,
      notes,
    }: {
      id: string;
      status: OrderStatus;
      notes?: string;
    }) => ordersAPI.updateStatus(id, status, notes),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["orders", id] });
    },
  });

  const cancelOrderMutation = useMutation({
    mutationFn: (id: string) => ordersAPI.cancel(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ["orders", id] });
    },
  });

  const getOrderTrackingQuery = (id: string) =>
    useQuery({
      queryKey: ["orders", id, "tracking"],
      queryFn: () => ordersAPI.getTracking(id),
      enabled: !!id,
    });

  const addOrderNoteMutation = useMutation({
    mutationFn: ({ id, note }: { id: string; note: string }) =>
      ordersAPI.addNote(id, note),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["orders", id] });
    },
  });

  return {
    getMyOrdersQuery,
    getOrderByIdQuery,
    getAllOrdersQuery,
    createOrderMutation,
    updateOrderStatusMutation,
    cancelOrderMutation,
    getOrderTrackingQuery,
    addOrderNoteMutation,
  };
};
```

---

## Phase 4: Error Handling & Utils

### 4.1 Error Handler

**File:** `lib/api/errors/error-handler.ts`

```typescript
import type { AxiosError } from "axios";
import type { ApiError } from "../client/types";

export class AppError extends Error {
  constructor(
    public statusCode: number,
    public code: string,
    message: string,
    public details?: Record<string, any>,
  ) {
    super(message);
    this.name = "AppError";
  }
}

export const parseApiError = (error: unknown): AppError => {
  if (error instanceof AppError) {
    return error;
  }

  const axiosError = error as AxiosError<{ error?: ApiError }>;

  if (axiosError.response?.status === 401) {
    return new AppError(
      401,
      "UNAUTHORIZED",
      "Your session has expired. Please login again.",
    );
  }

  if (axiosError.response?.status === 403) {
    return new AppError(
      403,
      "FORBIDDEN",
      "You do not have permission to perform this action.",
    );
  }

  if (axiosError.response?.status === 404) {
    return new AppError(
      404,
      "NOT_FOUND",
      "The requested resource was not found.",
    );
  }

  if (axiosError.response?.status === 409) {
    return new AppError(
      409,
      "CONFLICT",
      axiosError.response?.data?.error?.message ||
        "A conflict occurred. Please try again.",
    );
  }

  if (axiosError.response?.status === 422) {
    return new AppError(
      422,
      "VALIDATION_ERROR",
      "Please check your input and try again.",
      axiosError.response?.data?.error?.details,
    );
  }

  if (axiosError.response?.status === 500) {
    return new AppError(
      500,
      "SERVER_ERROR",
      "An unexpected error occurred. Please try again later.",
    );
  }

  if (axiosError.code === "ECONNABORTED") {
    return new AppError(
      408,
      "REQUEST_TIMEOUT",
      "The request took too long. Please try again.",
    );
  }

  if (axiosError.code === "ECONNREFUSED") {
    return new AppError(
      503,
      "SERVICE_UNAVAILABLE",
      "The service is currently unavailable. Please try again later.",
    );
  }

  return new AppError(
    axiosError.response?.status || 500,
    "UNKNOWN_ERROR",
    "An unexpected error occurred. Please try again.",
  );
};

export const getErrorMessage = (error: unknown): string => {
  const appError = parseApiError(error);
  return appError.message;
};

export const getErrorDetails = (
  error: unknown,
): Record<string, any> | undefined => {
  const appError = parseApiError(error);
  return appError.details;
};
```

### 4.2 Query Client Setup

**File:** `lib/query-client.ts`

```typescript
import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 10, // 10 minutes
      retry: (failureCount, error: any) => {
        if (error?.response?.status === 401) {
          return false; // Don't retry auth errors
        }
        return failureCount < 2; // Retry twice for other errors
      },
      refetchOnWindowFocus: true,
      refetchOnReconnect: true,
    },
    mutations: {
      retry: 1,
    },
  },
});
```

---

## Phase 5: Component Integration Examples

### 5.1 Login Component

**File:** `app/(auth)/login/page.tsx`

```typescript
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthHooks } from '@/lib/api/hooks/useAuth';
import { parseApiError } from '@/lib/api/errors/error-handler';

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');

  const { loginMutation } = useAuthHooks();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      await loginMutation.mutateAsync(formData);
      router.push('/dashboard');
    } catch (err) {
      setError(parseApiError(err).message);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="email"
        value={formData.email}
        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        placeholder="Email"
      />
      <input
        type="password"
        value={formData.password}
        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
        placeholder="Password"
      />
      {error && <p className="text-red-500">{error}</p>}
      <button
        type="submit"
        disabled={loginMutation.isPending}
      >
        {loginMutation.isPending ? 'Logging in...' : 'Login'}
      </button>
    </form>
  );
}
```

### 5.2 Products List Component

**File:** `app/(shop)/products/page.tsx`

```typescript
'use client';

import { useState } from 'react';
import { useProductsHooks } from '@/lib/api/hooks/useProducts';
import { getErrorMessage } from '@/lib/api/errors/error-handler';

export default function ProductsPage() {
  const [page, setPage] = useState(1);
  const { getProductsQuery } = useProductsHooks();

  const { data, isLoading, error } = getProductsQuery({
    page,
    limit: 12,
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div className="text-red-500">{getErrorMessage(error)}</div>;

  return (
    <div>
      <div className="grid grid-cols-3 gap-4">
        {data?.data?.data.map((product) => (
          <div key={product.id} className="border p-4">
            <h3>{product.name}</h3>
            <p>${product.price}</p>
          </div>
        ))}
      </div>

      {/* Pagination */}
      <div className="flex justify-center gap-2 mt-8">
        {Array.from({ length: data?.data?.pagination.pages || 1 }).map((_, i) => (
          <button
            key={i + 1}
            onClick={() => setPage(i + 1)}
            className={i + 1 === page ? 'font-bold' : ''}
          >
            {i + 1}
          </button>
        ))}
      </div>
    </div>
  );
}
```

### 5.3 Cart Component

**File:** `components/cart/CartSummary.tsx`

```typescript
'use client';

import { useCartHooks } from '@/lib/api/hooks/useCart';
import { getErrorMessage } from '@/lib/api/errors/error-handler';

export function CartSummary() {
  const { getCartQuery, removeFromCartMutation } = useCartHooks();

  const { data: cart, isLoading, error } = getCartQuery();

  if (isLoading) return <div>Loading cart...</div>;
  if (error) return <div className="text-red-500">{getErrorMessage(error)}</div>;

  return (
    <div className="cart-summary">
      <h2>Shopping Cart ({cart?.data?.items.length || 0})</h2>

      {cart?.data?.items.map((item) => (
        <div key={item.id} className="cart-item">
          <p>{item.productId} - Qty: {item.quantity}</p>
          <button
            onClick={() => removeFromCartMutation.mutate(item.id)}
            disabled={removeFromCartMutation.isPending}
          >
            Remove
          </button>
        </div>
      ))}

      <div className="cart-totals">
        <p>Subtotal: ${cart?.data?.subtotal.toFixed(2)}</p>
        <p>Tax: ${cart?.data?.tax.toFixed(2)}</p>
        <p className="font-bold">Total: ${cart?.data?.total.toFixed(2)}</p>
      </div>
    </div>
  );
}
```

---

## Phase 6: Integration Checklist

### Setup

- [ ] Install dependencies: `npm install @tanstack/react-query`
- [ ] Create query-client instance
- [ ] Setup axios instance with interceptors
- [ ] Create TypeScript interfaces for all API responses

### Core Modules (Create in order)

- [ ] `lib/api/client/` - axios setup
- [ ] `lib/api/modules/auth.api.ts`
- [ ] `lib/api/modules/users.api.ts`
- [ ] `lib/api/modules/products.api.ts`
- [ ] `lib/api/modules/cart.api.ts`
- [ ] `lib/api/modules/orders.api.ts`
- [ ] `lib/api/modules/payments.api.ts`
- [ ] `lib/api/modules/shipping.api.ts`
- [ ] `lib/api/modules/reviews.api.ts`
- [ ] `lib/api/modules/wishlist.api.ts`
- [ ] `lib/api/modules/coupons.api.ts`
- [ ] `lib/api/modules/notifications.api.ts`
- [ ] `lib/api/modules/inventory.api.ts`
- [ ] `lib/api/modules/analytics.api.ts`
- [ ] `lib/api/modules/admin.api.ts`

### React Query Hooks

- [ ] `lib/api/hooks/useAuth.ts`
- [ ] `lib/api/hooks/useProducts.ts`
- [ ] `lib/api/hooks/useCart.ts`
- [ ] `lib/api/hooks/useOrders.ts`
- [ ] `lib/api/hooks/useUsers.ts`
- [ ] `lib/api/hooks/usePayments.ts`
- [ ] `lib/api/hooks/useNotifications.ts`
- [ ] `lib/api/hooks/useShipping.ts`
- [ ] `lib/api/hooks/useReviews.ts`
- [ ] `lib/api/hooks/useWishlist.ts`

### Utilities & Error Handling

- [ ] `lib/api/errors/error-handler.ts`
- [ ] `lib/query-client.ts`
- [ ] `lib/api/index.ts` - Export all APIs

### Configuration

- [ ] Add `NEXT_PUBLIC_API_URL` to `.env.local`
- [ ] Setup QueryClientProvider in `layout.tsx`
- [ ] Configure retry policies

### Testing

- [ ] Test authentication flow
- [ ] Test product listing
- [ ] Test cart operations
- [ ] Test order creation
- [ ] Test error handling
- [ ] Test token refresh

---

## Best Practices

### 1. **Query Key Factories** (Optional but recommended)

```typescript
export const productKeys = {
  all: ["products"] as const,
  lists: () => [...productKeys.all, "list"] as const,
  list: (filters?: any) => [...productKeys.lists(), filters] as const,
  details: () => [...productKeys.all, "detail"] as const,
  detail: (id: string) => [...productKeys.details(), id] as const,
};
```

### 2. **Automatic Error Toast**

```typescript
useEffect(() => {
  if (error) {
    toast.error(getErrorMessage(error));
  }
}, [error, toast]);
```

### 3. **Debounced Search**

```typescript
const debouncedSearch = useDebouncedCallback((query: string) => {
  refetch({ q: query });
}, 300);
```

### 4. **Infinite Queries for Pagination**

```typescript
const { data, fetchNextPage, hasNextPage } = useInfiniteQuery({
  queryKey: ["products"],
  queryFn: ({ pageParam = 1 }) => productsAPI.getAll({ page: pageParam }),
  getNextPageParam: (lastPage) => lastPage.pagination.page + 1,
});
```

---

## Environment Variables

**`.env.local`**

```
NEXT_PUBLIC_API_URL=http://localhost:3000/api
NEXT_PUBLIC_STRIPE_KEY=pk_test_xxx
NEXT_PUBLIC_PAYPAL_CLIENT_ID=xxx
```

---

## File Structure Summary

```
frontend/lib/
├── api/
│   ├── client/
│   │   ├── axios-instance.ts      ✅ Main axios setup
│   │   ├── interceptors.ts        ✅ Request/response handlers
│   │   └── types.ts               ✅ Common types
│   ├── modules/                   ✅ 16 API modules
│   ├── hooks/                     ✅ React Query hooks
│   ├── errors/                    ✅ Error handling
│   ├── utils/                     ✅ Helper utilities
│   └── index.ts                   ✅ Export all
├── stores/                        ✅ Zustand stores
├── constants/
└── utils/
```

---

## Next Steps

1. **Start with Phase 1** - Setup core axios infrastructure
2. **Create modules incrementally** - Start with auth, then products
3. **Add hooks layer** - Create React Query hooks for each module
4. **Implement error handling** - Global error handling strategy
5. **Test everything** - Integration testing before moving to UI
6. **UI Integration** - Connect components to hooks

---

**Created:** May 13, 2026
**Status:** Ready for Implementation
**Estimated Time:** 2-3 days for full integration
