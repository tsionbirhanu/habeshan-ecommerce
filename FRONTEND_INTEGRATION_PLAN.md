# Frontend-Backend Integration Plan

## Habeshan E-Commerce Platform

---

## EXECUTIVE SUMMARY

This plan outlines the complete integration of 119 backend API endpoints into the Next.js 16 frontend with a decoupled, production-ready architecture. The integration uses Axios for HTTP requests, React Query for state management, and Zustand for auth state, organized in a 4-layer architecture for maintainability and scalability.

### Key Metrics:

- **Total Endpoints**: 119 (across 14 modules)
- **Protected Endpoints**: 104 (require JWT auth)
- **Public Endpoints**: 15
- **Modules to Create**: 14 API modules + 14 React Query hook sets
- **Pages to Create/Update**: 35+ pages organized by role (customer, vendor, admin)
- **Integration Approach**: Backend-first, UI follows API structure

---

## PHASE 1: ARCHITECTURE OVERVIEW

### Layer 1: Axios HTTP Client

**File**: `lib/api/client/axios-instance.ts`

- Centralized axios instance with base URL
- Request interceptor: Auto-inject JWT token from Zustand store
- Response interceptor: Handle 401 (token refresh), 403 (redirect), error normalization
- Token refresh logic with request queuing to prevent race conditions

### Layer 2: API Types & Error Handling

**Files**:

- `lib/api/client/types.ts` - Global TypeScript interfaces
- `lib/api/errors/error-handler.ts` - Centralized error parsing with user-friendly messages

### Layer 3: API Modules (14 total)

**Location**: `lib/api/modules/`
Each module follows class-based pattern with static methods:

```typescript
class ModuleAPI {
  async method(data) { return apiClient.post(...) }
}
export const moduleAPI = new ModuleAPI()
```

**Modules**:

1. `auth.api.ts` (9 endpoints)
2. `users.api.ts` (9 endpoints)
3. `products.api.ts` (9 endpoints)
4. `cart.api.ts` (7 endpoints)
5. `orders.api.ts` (8 endpoints)
6. `payments.api.ts` (12 endpoints)
7. `shipping.api.ts` (5 endpoints)
8. `reviews.api.ts` (8 endpoints)
9. `wishlist.api.ts` (4 endpoints)
10. `coupons.api.ts` (5 endpoints)
11. `notifications.api.ts` (7 endpoints)
12. `inventory.api.ts` (5 endpoints)
13. `analytics.api.ts` (6 endpoints)
14. `admin.api.ts` (14 endpoints)

### Layer 4: React Query Hooks (14 total)

**Location**: `lib/api/hooks/`
Each hook set exports queries and mutations for its module:

```typescript
export const useModuleHooks = () => {
  // Queries for GET operations
  // Mutations for POST/PUT/DELETE operations
  return { ...queries, ...mutations };
};
```

### State Management Layer

- **Auth Store**: `lib/stores/auth.store.ts` (Zustand)
  - Persisted to localStorage
  - Methods: login(), logout(), updateUser(), setTokens()
- **Cart Store**: Optional Zustand store for local state
- **UI State**: Component-level useState (React Query for server state)

---

## PHASE 2: DETAILED MODULE BREAKDOWN

### Module 1: Authentication (9 endpoints)

**API Endpoints**:

1. POST `/api/auth/register-customer` - Register new customer
2. GET `/api/auth/verify-email` - Verify email with token
3. POST `/api/auth/resend-verification` - Resend verification email
4. POST `/api/auth/login` - Login with credentials
5. POST `/api/auth/refresh-token` - Get new access token
6. POST `/api/auth/forgot-password` - Request password reset
7. POST `/api/auth/reset-password` - Reset password with token
8. POST `/api/auth/logout` - Logout and blacklist token
9. GET `/api/auth/me` - Get current user info

**UI Pages to Create**:

- `/auth/login` - Login form
- `/auth/register` - Registration form with 4 steps
- `/auth/forgot-password` - Password reset request
- `/auth/reset-password/[token]` - Password reset form
- `/auth/verify-email/[token]` - Email verification success page

**API Module Structure**:

```typescript
class AuthAPI {
  registerCustomer(data) {}
  verifyEmail(token) {}
  resendVerification(email) {}
  login(email, password) {}
  refreshToken(refreshToken) {}
  forgotPassword(email) {}
  resetPassword(token, newPassword) {}
  logout() {}
  getCurrentUser() {}
}
```

**React Query Hooks**:

```typescript
useAuthHooks() {
  // Queries
  getCurrentUserQuery()
  // Mutations
  registerMutation
  loginMutation
  logoutMutation
  verifyEmailMutation
  resendVerificationMutation
  resetPasswordMutation
}
```

---

### Module 2: Users (9 endpoints)

**API Endpoints**:

1. GET `/api/users/profile` - Get user profile
2. PUT `/api/users/profile` - Update profile
3. POST `/api/users/change-password` - Change password
4. DELETE `/api/users/account` - Delete account
5. GET `/api/users/personal-data` - Download personal data
6. POST `/api/users/addresses` - Create address
7. GET `/api/users/addresses` - Get all addresses
8. PUT `/api/users/addresses/{id}` - Update address
9. DELETE `/api/users/addresses/{id}` - Delete address

**UI Pages to Create**:

- `/dashboard/profile` - View/edit profile
- `/dashboard/account-settings` - Account security & deletion
- `/dashboard/addresses` - Manage delivery addresses
- `/dashboard/privacy` - GDPR & personal data

**React Query Hooks**:

```typescript
useUsersHooks() {
  // Queries
  getProfileQuery()
  getAddressesQuery()
  // Mutations
  updateProfileMutation
  changePasswordMutation
  deleteAccountMutation
  createAddressMutation
  updateAddressMutation
  deleteAddressMutation
}
```

---

### Module 3: Products (9 endpoints)

**API Endpoints**:

1. POST `/api/products` - Create product (ADMIN/VENDOR)
2. GET `/api/products` - List products with pagination
3. GET `/api/products/{id}` - Get product details
4. PUT `/api/products/{id}` - Update product (ADMIN/VENDOR)
5. DELETE `/api/products/{id}` - Delete product (ADMIN)
6. POST `/api/products/{id}/images` - Upload product images
7. GET `/api/products/search` - Search products
8. GET `/api/products/featured` - Get featured products
9. GET `/api/products/new-arrivals` - Get new products

**UI Pages to Create**:

- `/shop` - Product listing with filters
- `/shop/[id]` - Product detail page
- `/search` - Search results page
- `/vendor/products` - Vendor product management
- `/admin/products` - Admin product management

**React Query Hooks**:

```typescript
useProductsHooks() {
  // Queries
  getProductsQuery(filters)
  getProductByIdQuery(id)
  searchProductsQuery(query)
  getFeaturedQuery()
  getNewArrivalsQuery()
  // Mutations (for admin/vendor)
  createProductMutation
  updateProductMutation
  deleteProductMutation
  uploadImagesMutation
}
```

---

### Module 4: Cart (7 endpoints)

**API Endpoints**:

1. GET `/api/cart` - Get cart items
2. POST `/api/cart/add` - Add product to cart
3. PUT `/api/cart/items/{id}` - Update item quantity
4. DELETE `/api/cart/items/{id}` - Remove item
5. DELETE `/api/cart` - Clear entire cart
6. GET `/api/cart/validate` - Validate cart
7. POST `/api/cart/apply-coupon` - Apply coupon code

**UI Pages to Create**:

- `/cart` - Shopping cart view
- `/checkout` - Checkout process

**React Query Hooks**:

```typescript
useCartHooks() {
  // Queries
  getCartQuery()
  // Mutations
  addToCartMutation
  updateCartItemMutation
  removeFromCartMutation
  clearCartMutation
  applyCouponMutation
}
```

---

### Module 5: Orders (8 endpoints)

**API Endpoints**:

1. POST `/api/orders` - Create order
2. GET `/api/orders` - Get all orders (ADMIN)
3. GET `/api/orders/my` - Get customer's orders
4. GET `/api/orders/{id}` - Get order details
5. PUT `/api/orders/{id}` - Update order status (ADMIN/VENDOR)
6. POST `/api/orders/{id}/cancel` - Cancel order
7. GET `/api/orders/{id}/tracking` - Get tracking info
8. POST `/api/orders/{id}/notes` - Add order notes

**UI Pages to Create**:

- `/dashboard/orders` - Customer order history
- `/dashboard/orders/[id]` - Order details & tracking
- `/admin/orders` - Admin order management
- `/vendor/orders` - Vendor order management

**React Query Hooks**:

```typescript
useOrdersHooks() {
  // Queries
  getOrdersQuery(filters)
  getMyOrdersQuery()
  getOrderByIdQuery(id)
  // Mutations
  createOrderMutation
  updateOrderStatusMutation
  cancelOrderMutation
  addOrderNoteMutation
}
```

---

### Module 6: Payments (12 endpoints)

**API Endpoints**:

1. GET `/api/payments/methods` - Get payment methods
2. POST `/api/payments/stripe/create-intent` - Stripe payment intent
3. POST `/api/payments/paypal/create` - PayPal order creation
4. POST `/api/payments/paypal/capture` - PayPal capture
5. POST `/api/payments/klarna/session` - Klarna session
6. POST `/api/payments/klarna/confirm` - Klarna confirm
7. GET `/api/payments/{orderId}` - Get payment status
8. POST `/api/payments/{orderId}/refund` - Refund payment
9. GET `/api/payments/{orderId}/invoice` - Get invoice
10. GET `/api/payments/{orderId}/invoice/download` - Download invoice PDF
11. POST `/api/payments/{orderId}/invoice/send` - Send invoice email
12. GET `/api/payments/{orderId}/receipt` - Get receipt

**UI Pages to Create**:

- `/checkout/payment` - Payment method selection & processing
- `/dashboard/invoices` - View invoices
- `/admin/refunds` - Manage refunds

**React Query Hooks**:

```typescript
usePaymentsHooks() {
  // Queries
  getPaymentMethodsQuery()
  getPaymentStatusQuery(orderId)
  getInvoiceQuery(orderId)
  // Mutations
  stripeCreateIntentMutation
  paypalCreateMutation
  paypalCaptureMutation
  klarnaSessionMutation
  klarnaConfirmMutation
  refundPaymentMutation
}
```

---

### Module 7: Shipping (5 endpoints)

**API Endpoints**:

1. POST `/api/shipping/rates` - Calculate shipping rates
2. POST `/api/shipping` - Create shipment (ADMIN)
3. GET `/api/shipping/track/{trackingNumber}` - Track shipment
4. GET `/api/shipping/order/{orderId}` - Get order shipment
5. GET `/api/shipping/{shipmentId}/label` - Download shipping label

**UI Pages to Create**:

- `/checkout/shipping` - Shipping method selection & rates
- `/dashboard/orders/[id]` - Tracking info section
- `/admin/shipments` - Manage shipments

**React Query Hooks**:

```typescript
useShippingHooks() {
  // Queries
  getShippingRatesQuery(weight, postalCode, country)
  getShipmentQuery(orderId)
  // Mutations
  createShipmentMutation
}
```

---

### Module 8: Reviews (8 endpoints)

**API Endpoints**:

1. POST `/api/reviews` - Create review
2. GET `/api/products/{productId}/reviews` - Get product reviews
3. GET `/api/reviews/pending` - Get pending reviews (ADMIN)
4. PUT `/api/reviews/{reviewId}` - Update review
5. DELETE `/api/reviews/{reviewId}` - Delete review
6. POST `/api/reviews/{reviewId}/approve` - Approve review (ADMIN)
7. POST `/api/reviews/{reviewId}/reject` - Reject review (ADMIN)
8. POST `/api/reviews/{reviewId}/helpful` - Mark helpful

**UI Sections to Create**:

- Product detail page: Reviews section
- Customer dashboard: Submit review button
- Admin dashboard: Review moderation section

**React Query Hooks**:

```typescript
useReviewsHooks() {
  // Queries
  getReviewsQuery(productId)
  getPendingReviewsQuery()
  // Mutations
  createReviewMutation
  updateReviewMutation
  deleteReviewMutation
  approveReviewMutation
  markHelpfulMutation
}
```

---

### Module 9: Wishlist (4 endpoints)

**API Endpoints**:

1. GET `/api/wishlist` - Get wishlist
2. POST `/api/wishlist/{productId}` - Add to wishlist
3. DELETE `/api/wishlist/{productId}` - Remove from wishlist
4. POST `/api/wishlist/{productId}/move-to-cart` - Move to cart

**UI Pages to Create**:

- `/dashboard/wishlist` - View wishlist

**React Query Hooks**:

```typescript
useWishlistHooks() {
  // Queries
  getWishlistQuery()
  // Mutations
  addToWishlistMutation
  removeFromWishlistMutation
  moveToCartMutation
}
```

---

### Module 10: Coupons (5 endpoints)

**API Endpoints**:

1. POST `/api/coupons` - Create coupon (ADMIN)
2. GET `/api/coupons` - Get all coupons (ADMIN)
3. GET `/api/coupons/code/{code}` - Get coupon by code
4. PUT `/api/coupons/{id}` - Update coupon (ADMIN)
5. DELETE `/api/coupons/{id}` - Delete coupon (ADMIN)

**UI Pages to Create**:

- `/admin/coupons` - Coupon management
- Checkout: Coupon code input field

**React Query Hooks**:

```typescript
useCouponsHooks() {
  // Queries
  getCouponsQuery()
  // Mutations
  createCouponMutation
  updateCouponMutation
  deleteCouponMutation
}
```

---

### Module 11: Notifications (7 endpoints)

**API Endpoints**:

1. GET `/api/notifications` - Get notifications
2. GET `/api/notifications/stats` - Get notification stats
3. PUT `/api/notifications/{id}/read` - Mark as read
4. PUT `/api/notifications/read-all` - Mark all read
5. DELETE `/api/notifications/{id}` - Delete notification
6. DELETE `/api/notifications/delete-all` - Delete all

**UI Sections to Create**:

- Header: Notification bell icon with dropdown
- Dashboard: Full notifications page

**React Query Hooks**:

```typescript
useNotificationsHooks() {
  // Queries
  getNotificationsQuery()
  getStatsQuery()
  // Mutations
  markAsReadMutation
  markAllReadMutation
  deleteNotificationMutation
}
```

---

### Module 12: Inventory (5 endpoints)

**API Endpoints**:

1. GET `/api/inventory` - Get inventory (ADMIN/VENDOR)
2. GET `/api/inventory/alerts` - Get low stock alerts
3. GET `/api/inventory/summary` - Get inventory summary
4. PUT `/api/inventory/{productId}` - Update inventory
5. GET `/api/inventory/{productId}/history` - Get history

**UI Pages to Create**:

- `/vendor/inventory` - Vendor inventory management
- `/admin/inventory` - Admin inventory management
- `/admin/inventory/alerts` - Low stock alerts

**React Query Hooks**:

```typescript
useInventoryHooks() {
  // Queries
  getInventoryQuery()
  getAlertsQuery()
  getSummaryQuery()
  getHistoryQuery(productId)
  // Mutations
  updateInventoryMutation
}
```

---

### Module 13: Analytics (6 endpoints)

**API Endpoints**:

1. GET `/api/analytics/sales` - Sales report
2. GET `/api/analytics/products` - Product analytics
3. GET `/api/analytics/customers` - Customer analytics
4. GET `/api/analytics/inventory` - Inventory analytics
5. GET `/api/analytics/payments` - Payment analytics
6. GET `/api/analytics/export` - Export report

**UI Pages to Create**:

- `/admin/analytics` - Main analytics dashboard
- `/admin/analytics/sales` - Sales reports
- `/admin/analytics/products` - Product performance
- `/admin/analytics/customers` - Customer insights

**React Query Hooks**:

```typescript
useAnalyticsHooks() {
  // Queries
  getSalesQuery(filters)
  getProductsQuery(filters)
  getCustomersQuery(filters)
  getInventoryQuery()
  getPaymentsQuery(filters)
  // Mutations
  exportReportMutation
}
```

---

### Module 14: Admin (14 endpoints)

**API Endpoints**:

1. GET `/api/admin/dashboard` - Dashboard stats
2. GET `/api/admin/dashboard/charts` - Chart data
3. GET `/api/admin/dashboard/alerts` - System alerts
4. GET `/api/admin/dashboard/top-products` - Top products
5. GET `/api/admin/dashboard/orders` - Recent orders
6. GET `/api/admin/users` - List users
7. GET `/api/admin/users/{userId}` - User details
8. PUT `/api/admin/users/{userId}/role` - Update role
9. PUT `/api/admin/users/{userId}/status` - Toggle status
10. POST `/api/admin/vendors` - Create vendor
11. GET `/api/admin/vendors` - List vendors
12. GET `/api/admin/vendors/{vendorId}` - Vendor details
13. GET `/api/admin/activity-log` - Activity log
14. GET `/api/admin/settings` / PUT `/api/admin/settings` - Settings

**UI Pages to Create**:

- `/admin` - Admin dashboard
- `/admin/users` - User management
- `/admin/vendors` - Vendor management
- `/admin/activity-log` - Activity log
- `/admin/settings` - System settings

**React Query Hooks**:

```typescript
useAdminHooks() {
  // Queries
  getDashboardQuery()
  getChartDataQuery()
  getAlertsQuery()
  getUsersQuery()
  getVendorsQuery()
  getActivityLogQuery()
  getSettingsQuery()
  // Mutations
  updateUserRoleMutation
  toggleUserStatusMutation
  createVendorMutation
  updateSettingsMutation
}
```

---

## PHASE 3: FOLDER STRUCTURE

```
frontend/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   │   └── page.tsx
│   │   ├── register/
│   │   │   └── page.tsx
│   │   ├── forgot-password/
│   │   │   └── page.tsx
│   │   └── reset-password/[token]/
│   │       └── page.tsx
│   ├── (customer)/
│   │   ├── layout.tsx
│   │   ├── dashboard/
│   │   │   ├── page.tsx (dashboard home)
│   │   │   ├── profile/
│   │   │   ├── account-settings/
│   │   │   ├── addresses/
│   │   │   ├── orders/
│   │   │   │   └── [id]/
│   │   │   ├── wishlist/
│   │   │   ├── notifications/
│   │   │   └── invoices/
│   │   ├── (shop)/
│   │   │   ├── page.tsx (shop home)
│   │   │   ├── [id]/
│   │   │   │   └── page.tsx (product detail)
│   │   │   ├── search/
│   │   │   │   └── page.tsx
│   │   │   ├── cart/
│   │   │   │   └── page.tsx
│   │   │   └── checkout/
│   │   │       ├── page.tsx
│   │   │       ├── shipping/
│   │   │       ├── payment/
│   │   │       └── review/
│   ├── (vendor)/
│   │   ├── layout.tsx
│   │   ├── dashboard/
│   │   │   ├── page.tsx
│   │   │   ├── products/
│   │   │   ├── orders/
│   │   │   ├── inventory/
│   │   │   └── analytics/
│   ├── (admin)/
│   │   ├── layout.tsx
│   │   ├── dashboard/
│   │   │   ├── page.tsx
│   │   │   ├── analytics/
│   │   │   ├── users/
│   │   │   ├── vendors/
│   │   │   ├── products/
│   │   │   ├── orders/
│   │   │   ├── coupons/
│   │   │   ├── inventory/
│   │   │   ├── activity-log/
│   │   │   └── settings/
│   ├── layout.tsx
│   ├── page.tsx (home)
│   └── providers.tsx
├── lib/
│   ├── api/
│   │   ├── client/
│   │   │   ├── axios-instance.ts
│   │   │   └── types.ts
│   │   ├── errors/
│   │   │   └── error-handler.ts
│   │   ├── modules/
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
│   │   │   └── admin.api.ts
│   │   └── hooks/
│   │       ├── useAuth.ts
│   │       ├── useUsers.ts
│   │       ├── useProducts.ts
│   │       ├── useCart.ts
│   │       ├── useOrders.ts
│   │       ├── usePayments.ts
│   │       ├── useShipping.ts
│   │       ├── useReviews.ts
│   │       ├── useWishlist.ts
│   │       ├── useCoupons.ts
│   │       ├── useNotifications.ts
│   │       ├── useInventory.ts
│   │       ├── useAnalytics.ts
│   │       └── useAdmin.ts
│   ├── stores/
│   │   ├── auth.store.ts
│   │   └── cart.store.ts (optional)
│   ├── i18n/
│   └── utils/
├── components/
│   ├── auth/
│   ├── products/
│   ├── cart/
│   ├── checkout/
│   ├── admin/
│   ├── vendor/
│   ├── layout/
│   └── shared/
└── public/
```

---

## PHASE 4: IMPLEMENTATION STEPS

### Step 1: Setup Infrastructure (Week 1)

1. Create `lib/api/client/axios-instance.ts` with JWT handling
2. Create `lib/api/client/types.ts` with TypeScript interfaces
3. Create `lib/api/errors/error-handler.ts` with error normalization
4. Setup `lib/stores/auth.store.ts` (Zustand with persistence)
5. Verify axios instance with a simple test endpoint

### Step 2: Create API Modules (Week 1-2)

1. Create all 14 API modules in `lib/api/modules/`
2. Each module exports API class instance
3. Test each module method individually
4. Document request/response patterns

### Step 3: Create React Query Hooks (Week 2-3)

1. Create all 14 hook files in `lib/api/hooks/`
2. Each hook exports queries and mutations
3. Configure cache strategy (staleTime, gcTime)
4. Test each hook with mock data
5. Setup error handling in hooks

### Step 4: Create Auth Pages (Week 3)

1. Login page with API integration
2. Register page with multi-step form
3. Forgot password page
4. Reset password page
5. Email verification handler
6. Test full auth flow

### Step 5: Create Customer Pages (Week 4-5)

1. Product listing with filters
2. Product detail page with reviews
3. Shopping cart page
4. Checkout process (3-4 steps)
5. Order history page
6. Order tracking page
7. Account settings pages
8. Wishlist page

### Step 6: Create Admin Pages (Week 5-6)

1. Dashboard with KPIs
2. User management
3. Vendor management
4. Product management
5. Order management
6. Analytics pages
7. Coupons management
8. Settings page

### Step 7: Create Vendor Pages (Week 6)

1. Vendor dashboard
2. Product management
3. Order fulfillment
4. Inventory management

### Step 8: Integration Testing (Week 7)

1. End-to-end flow testing
2. Error handling verification
3. Token refresh testing
4. Pagination testing
5. Performance optimization

### Step 9: Deployment (Week 8)

1. Environment configuration
2. Build optimization
3. Deployment to staging
4. Final testing
5. Production deployment

---

## PHASE 5: VALIDATION CHECKLIST

### API Integration Validation

- [ ] All 119 endpoints mapped to frontend
- [ ] Request bodies match backend specs
- [ ] Response types properly typed
- [ ] Error messages user-friendly
- [ ] Pagination working correctly
- [ ] File uploads functional

### Authentication Validation

- [ ] Login flow working
- [ ] Token stored in Zustand store
- [ ] JWT auto-injected in requests
- [ ] Token refresh on 401
- [ ] Logout clears auth state
- [ ] Protected routes redirect to login

### UI Validation

- [ ] All pages created
- [ ] UI follows backend structure
- [ ] Forms match API requirements
- [ ] Validation messages helpful
- [ ] Loading states present
- [ ] Error boundaries implemented

### Performance Validation

- [ ] React Query caching working
- [ ] No unnecessary re-renders
- [ ] Images lazy-loaded
- [ ] API requests batched where possible
- [ ] Bundle size acceptable

---

## PHASE 6: KEY INTEGRATION PATTERNS

### Pattern 1: Fetching Data

```typescript
// In page/component
const { data: products } = useProductsHooks().getProductsQuery();

// Hook structure
export const useProductsHooks = () => {
  return {
    getProductsQuery: (filters) =>
      useQuery({
        queryKey: ["products", filters],
        queryFn: () => productsAPI.getAll(filters),
        staleTime: 5 * 60 * 1000,
      }),
  };
};
```

### Pattern 2: Mutations with Error Handling

```typescript
// In page/component
const { loginMutation } = useAuthHooks();
const handleLogin = async (email, password) => {
  try {
    await loginMutation.mutateAsync({ email, password });
    router.push("/dashboard");
  } catch (err) {
    setError(getErrorMessage(err));
  }
};

// Hook structure
loginMutation: useMutation({
  mutationFn: (data) => authAPI.login(data),
  onSuccess: (data) => {
    authStore.login(data.user, data.accessToken, data.refreshToken);
  },
  onError: (error) => {
    // Error handled by useErrorBoundary or component catch
  },
});
```

### Pattern 3: Pagination

```typescript
// Component state
const [page, setPage] = useState(1)

// Query with pagination
const { data } = useProductsHooks().getProductsQuery({ page, limit: 10 })

// Response
{
  products: [...],
  pagination: { page, limit, total, pages }
}
```

### Pattern 4: Protected Routes

```typescript
// Layout component
export default function AdminLayout() {
  const { user } = useAuthStore()

  if (!user || user.role !== 'ADMIN') {
    redirect('/login')
  }

  return <>{children}</>
}
```

---

## DEPENDENCIES REQUIRED

```json
{
  "dependencies": {
    "axios": "^1.6.2",
    "@tanstack/react-query": "^5.28.0",
    "zustand": "^4.4.6",
    "next": "^16.2.6",
    "react": "^19.2.4"
  }
}
```

---

## NEXT STEPS

1. Review this plan with the team
2. Start with Phase 1 infrastructure setup
3. Create API modules (Phase 2)
4. Test each module before moving to next
5. Build UI pages following API structure
6. Integrate gradually with testing at each step
7. Deploy incrementally to staging

---

**Total Estimated Timeline**: 8 weeks  
**Team Size**: 2-3 developers  
**Complexity**: Medium-High  
**Priority**: HIGH - Foundation for entire application
