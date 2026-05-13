# Quick Integration Setup Guide

## Step 1: Update Layout with QueryClient

**File:** `app/layout.tsx`

```typescript
'use client';

import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/lib/query-client';
import { ReactNode } from 'react';

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html>
      <body>
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      </body>
    </html>
  );
}
```

## Step 2: Setup Environment Variables

**File:** `.env.local`

```
NEXT_PUBLIC_API_URL=http://localhost:3000/api
NEXT_PUBLIC_STRIPE_KEY=pk_test_your_key
NEXT_PUBLIC_PAYPAL_CLIENT_ID=your_paypal_id
```

## Step 3: Test Authentication Flow

### Login Page Example

**File:** `app/(auth)/login/page.tsx`

```typescript
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthHooks } from '@/lib/api/hooks/useAuth';
import { getErrorMessage } from '@/lib/api/errors/error-handler';

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
      setError(getErrorMessage(err));
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 border rounded">
      <h1 className="text-2xl font-bold mb-6">Login</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Email</label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="w-full px-3 py-2 border rounded"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Password</label>
          <input
            type="password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            className="w-full px-3 py-2 border rounded"
            required
          />
        </div>

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <button
          type="submit"
          disabled={loginMutation.isPending}
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:bg-gray-400"
        >
          {loginMutation.isPending ? 'Logging in...' : 'Login'}
        </button>
      </form>
    </div>
  );
}
```

## Step 4: Create Products List

**File:** `app/(shop)/products/page.tsx`

```typescript
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useProductsHooks } from '@/lib/api/hooks/useProducts';
import { getErrorMessage } from '@/lib/api/errors/error-handler';

export default function ProductsPage() {
  const [page, setPage] = useState(1);
  const { getProductsQuery } = useProductsHooks();

  const { data, isLoading, error } = getProductsQuery({
    page,
    limit: 12,
  });

  if (isLoading) return <div className="text-center py-10">Loading products...</div>;
  if (error) return <div className="text-red-500 text-center py-10">{getErrorMessage(error)}</div>;

  const products = data?.data || [];
  const pagination = data?.pagination;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Products</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-10">
        {products.map((product) => (
          <Link
            key={product.id}
            href={`/products/${product.id}`}
            className="border rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
          >
            <div className="bg-gray-200 h-48 flex items-center justify-center">
              {product.images[0] ? (
                <img
                  src={product.images[0]}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-gray-400">No image</span>
              )}
            </div>
            <div className="p-4">
              <h3 className="font-semibold text-lg truncate">{product.name}</h3>
              <p className="text-gray-600 text-sm line-clamp-2">{product.description}</p>
              <div className="flex justify-between items-center mt-4">
                <span className="text-xl font-bold">${product.price.toFixed(2)}</span>
                <span className="text-sm text-gray-500">Stock: {product.stock}</span>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Pagination */}
      <div className="flex justify-center gap-2">
        {Array.from({ length: pagination?.pages || 1 }).map((_, i) => (
          <button
            key={i + 1}
            onClick={() => setPage(i + 1)}
            className={`px-4 py-2 rounded ${
              i + 1 === page
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 hover:bg-gray-300'
            }`}
          >
            {i + 1}
          </button>
        ))}
      </div>
    </div>
  );
}
```

## Step 5: Create Cart Component

**File:** `components/cart/CartSummary.tsx`

```typescript
'use client';

import { useCartHooks } from '@/lib/api/hooks/useCart';
import { getErrorMessage } from '@/lib/api/errors/error-handler';

export function CartSummary() {
  const { getCartQuery, removeFromCartMutation } = useCartHooks();

  const { data: cartResponse, isLoading, error } = getCartQuery();
  const cart = cartResponse?.data;

  if (isLoading) return <div>Loading cart...</div>;
  if (error) return <div className="text-red-500">{getErrorMessage(error)}</div>;

  if (!cart || cart.items.length === 0) {
    return <div className="text-center py-8">Your cart is empty</div>;
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Shopping Cart ({cart.items.length})</h2>

      <div className="space-y-2 border-b pb-4">
        {cart.items.map((item) => (
          <div key={item.id} className="flex justify-between items-center py-2">
            <div>
              <p className="font-medium">{item.productId}</p>
              <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
            </div>
            <div className="flex gap-4 items-center">
              <span className="font-semibold">${(item.price * item.quantity).toFixed(2)}</span>
              <button
                onClick={() => removeFromCartMutation.mutate(item.id)}
                disabled={removeFromCartMutation.isPending}
                className="text-red-600 hover:text-red-800 disabled:text-gray-400"
              >
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="space-y-2">
        <div className="flex justify-between">
          <span>Subtotal:</span>
          <span>${cart.subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <span>Tax:</span>
          <span>${cart.tax.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-lg font-bold border-t pt-2">
          <span>Total:</span>
          <span>${cart.total.toFixed(2)}</span>
        </div>
      </div>

      <button className="w-full bg-green-600 text-white py-3 rounded hover:bg-green-700">
        Proceed to Checkout
      </button>
    </div>
  );
}
```

## Step 6: Usage in Component

```typescript
'use client';

import { useAuthHooks } from '@/lib/api/hooks/useAuth';
import { useCartHooks } from '@/lib/api/hooks/useCart';
import { useProductsHooks } from '@/lib/api/hooks/useProducts';

export function ExampleComponent() {
  // Auth hooks
  const { loginMutation, logoutMutation, getCurrentUserQuery } = useAuthHooks();

  // Products hooks
  const { getProductsQuery, getProductByIdQuery, searchProductsQuery } = useProductsHooks();

  // Cart hooks
  const { getCartQuery, addToCartMutation } = useCartHooks();

  return (
    <div>
      {/* Your component code */}
    </div>
  );
}
```

## Step 7: Create API Index (Export all APIs)

**File:** `lib/api/index.ts`

```typescript
export { authAPI } from "./modules/auth.api";
export { productsAPI } from "./modules/products.api";
export { cartAPI } from "./modules/cart.api";
// Add other module exports as you create them

export { useAuthHooks } from "./hooks/useAuth";
export { useProductsHooks } from "./hooks/useProducts";
export { useCartHooks } from "./hooks/useCart";
// Add other hook exports as you create them

export {
  getErrorMessage,
  getErrorDetails,
  parseApiError,
} from "./errors/error-handler";
export type { ApiResponse, PaginatedResponse, ApiError } from "./client/types";
```

---

## Complete Integration Checklist

### Core Setup ✅

- [x] Axios instance with interceptors
- [x] Query client configuration
- [x] Error handler
- [x] TypeScript types

### Initial Modules (In Progress)

- [x] Auth API & Hooks
- [x] Products API & Hooks
- [x] Cart API & Hooks
- [ ] Users API & Hooks
- [ ] Orders API & Hooks
- [ ] Payments API & Hooks
- [ ] Wishlist API & Hooks
- [ ] Reviews API & Hooks
- [ ] Shipping API & Hooks
- [ ] Coupons API & Hooks
- [ ] Notifications API & Hooks
- [ ] Inventory API & Hooks
- [ ] Analytics API & Hooks
- [ ] Admin API & Hooks

### Layout & Providers

- [ ] Add QueryClientProvider to layout.tsx
- [ ] Setup environment variables

### Pages & Components

- [ ] Login page
- [ ] Products page
- [ ] Product detail page
- [ ] Cart page
- [ ] Checkout page
- [ ] Dashboard page
- [ ] Admin pages

---

## Common Patterns

### Query with Dependencies

```typescript
const { data: product } = useProductsHooks().getProductByIdQuery(productId);

const { data: reviews } = useReviewsHooks().getReviewsByProductQuery(
  product?.data?.id || "",
  { enabled: !!product?.data?.id },
);
```

### Loading & Error States

```typescript
const { data, isLoading, error, isPending } = useProductsHooks().getProductsQuery();

if (isLoading || isPending) return <LoadingSpinner />;
if (error) return <ErrorAlert message={getErrorMessage(error)} />;
if (!data) return <div>No data</div>;

return <div>{/* Your content */}</div>;
```

### Mutations with Toast

```typescript
const { mutateAsync, isPending } = useCartHooks().addToCartMutation;

const handleAddToCart = async () => {
  try {
    await mutateAsync({ productId, quantity });
    toast.success("Added to cart!");
  } catch (error) {
    toast.error(getErrorMessage(error));
  }
};
```

---

## Next Steps

1. Run `npm install` to ensure all dependencies are installed
2. Update `.env.local` with your API URL
3. Test login flow
4. Gradually create remaining API modules
5. Create React Query hooks for each module
6. Build components using the hooks
7. Test each integration thoroughly

---

**Status:** Ready for Implementation
**Last Updated:** May 13, 2026
