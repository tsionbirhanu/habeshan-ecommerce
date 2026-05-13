# Habeshan E-Commerce API Documentation

## Table of Contents

1. [Authentication](#authentication)
2. [Users](#users)
3. [Products](#products)
4. [Cart](#cart)
5. [Orders](#orders)
6. [Payments](#payments)
7. [Shipping](#shipping)
8. [Reviews](#reviews)
9. [Wishlist](#wishlist)
10. [Coupons](#coupons)
11. [Notifications](#notifications)
12. [Inventory](#inventory)
13. [Analytics](#analytics)
14. [Admin](#admin)

---

## Authentication

### Register Customer

**POST** `/api/auth/register-customer`

Register a new customer account. Email verification is required.

**Request Body:**

```json
{
  "email": "user@example.com",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+1234567890"
}
```

**Response:**

- **201 Created**
  ```json
  {
    "success": true,
    "data": {
      "user": {
        "id": "uuid",
        "email": "user@example.com",
        "firstName": "John",
        "lastName": "Doe",
        "role": "CUSTOMER"
      }
    },
    "message": "Account created successfully. Please verify your email to start shopping."
  }
  ```
- **400 Bad Request** - Validation error
- **409 Conflict** - Email already exists

---

### Verify Email

**GET** `/api/auth/verify-email`

Verify customer email using verification token from registration email.

**Query Parameters:**

- `token` (required, string) - Email verification token

**Response:**

- **200 OK**
  ```json
  {
    "success": true,
    "message": "Email verified successfully"
  }
  ```
- **400 Bad Request** - Invalid or expired token

---

### Resend Verification Email

**POST** `/api/auth/resend-verification`

Resend verification email for unverified accounts.

**Request Body:**

```json
{
  "email": "user@example.com"
}
```

**Response:**

- **200 OK**
  ```json
  {
    "success": true,
    "message": "Verification email sent"
  }
  ```
- **404 Not Found** - User not found

---

### Login

**POST** `/api/auth/login`

Authenticate user and receive JWT token.

**Request Body:**

```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**

- **200 OK**
  ```json
  {
    "success": true,
    "data": {
      "accessToken": "jwt_token",
      "refreshToken": "refresh_token",
      "user": { ... }
    },
    "message": "Login successful"
  }
  ```
- **401 Unauthorized** - Invalid credentials

---

### Refresh Token

**POST** `/api/auth/refresh-token`

Get a new access token using refresh token.

**Request Body:**

```json
{
  "refreshToken": "refresh_token"
}
```

**Response:**

- **200 OK**
  ```json
  {
    "success": true,
    "data": {
      "accessToken": "new_jwt_token",
      "refreshToken": "new_refresh_token"
    },
    "message": "Token refreshed successfully"
  }
  ```

---

### Forgot Password

**POST** `/api/auth/forgot-password`

Request password reset link.

**Request Body:**

```json
{
  "email": "user@example.com"
}
```

**Response:**

- **200 OK**
  ```json
  {
    "success": true,
    "message": "If that email exists, a reset link has been sent."
  }
  ```

---

### Reset Password

**POST** `/api/auth/reset-password`

Reset password using reset token.

**Request Body:**

```json
{
  "token": "reset_token",
  "newPassword": "newpassword123"
}
```

**Response:**

- **200 OK**
  ```json
  {
    "success": true,
    "message": "Password reset successfully."
  }
  ```
- **400 Bad Request** - Invalid or expired token

---

### Logout

**POST** `/api/auth/logout`

Logout user (blacklist token).

**Headers Required:**

- Authorization: Bearer `{token}`

**Response:**

- **200 OK**
  ```json
  {
    "success": true,
    "message": "Logged out successfully"
  }
  ```

---

### Get Current User

**GET** `/api/auth/me`

Get authenticated user information.

**Headers Required:**

- Authorization: Bearer `{token}`

**Response:**

- **200 OK**
  ```json
  {
    "success": true,
    "data": {
      "user": { ... }
    }
  }
  ```
- **401 Unauthorized** - No valid token

---

## Users

### Get User Profile

**GET** `/api/users/profile`

Retrieve the authenticated user's profile information.

**Headers Required:**

- Authorization: Bearer `{token}`

**Response:**

- **200 OK**
  ```json
  {
    "success": true,
    "data": {
      "user": {
        "id": "uuid",
        "email": "user@example.com",
        "firstName": "John",
        "lastName": "Doe",
        "phone": "+1234567890",
        "role": "CUSTOMER"
      }
    }
  }
  ```
- **401 Unauthorized** - No valid token

---

### Update User Profile

**PUT** `/api/users/profile`

Update the authenticated user's profile (partial update allowed).

**Headers Required:**

- Authorization: Bearer `{token}`

**Request Body:**

```json
{
  "firstName": "Jane",
  "lastName": "Smith",
  "phone": "+0987654321",
  "email": "newemail@example.com"
}
```

**Response:**

- **200 OK**
  ```json
  {
    "success": true,
    "data": {
      "user": { ... }
    },
    "message": "Profile updated successfully"
  }
  ```
- **400 Bad Request** - Validation error
- **401 Unauthorized** - No valid token

---

### Change Password

**POST** `/api/users/change-password`

Change the authenticated user's password.

**Headers Required:**

- Authorization: Bearer `{token}`

**Request Body:**

```json
{
  "oldPassword": "currentpassword",
  "newPassword": "newpassword123",
  "confirmPassword": "newpassword123"
}
```

**Response:**

- **200 OK**
  ```json
  {
    "success": true,
    "message": "Password changed successfully"
  }
  ```
- **400 Bad Request** - Invalid old password
- **401 Unauthorized** - No valid token

---

### Delete Account

**DELETE** `/api/users/account`

Delete the authenticated user's account (Customer only). Account will be soft-deleted.

**Headers Required:**

- Authorization: Bearer `{token}`

**Response:**

- **200 OK**
  ```json
  {
    "success": true,
    "message": "Account deleted. Your order history is retained."
  }
  ```
- **401 Unauthorized** - No valid token
- **403 Forbidden** - Customer role required

---

### Download Personal Data

**GET** `/api/users/personal-data`

Download user's personal data in a portable format (GDPR compliance).

**Headers Required:**

- Authorization: Bearer `{token}`

**Response:**

- **200 OK** - JSON file with personal data export

---

### Create Address

**POST** `/api/users/addresses`

Create a new delivery address for the user.

**Headers Required:**

- Authorization: Bearer `{token}`

**Request Body:**

```json
{
  "type": "SHIPPING",
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+1234567890",
  "street": "123 Main St",
  "city": "New York",
  "state": "NY",
  "postalCode": "10001",
  "country": "USA",
  "isDefault": true
}
```

**Response:**

- **201 Created**
  ```json
  {
    "success": true,
    "data": { ... },
    "message": "Address created successfully"
  }
  ```

---

### Get Addresses

**GET** `/api/users/addresses`

Get all addresses for the authenticated user.

**Headers Required:**

- Authorization: Bearer `{token}`

**Query Parameters:**

- `type` (optional) - SHIPPING, BILLING, or both

**Response:**

- **200 OK**
  ```json
  {
    "success": true,
    "data": {
      "addresses": [ ... ]
    }
  }
  ```

---

### Update Address

**PUT** `/api/users/addresses/{addressId}`

Update an existing address.

**Headers Required:**

- Authorization: Bearer `{token}`

**Path Parameters:**

- `addressId` (required, UUID)

**Request Body:**

```json
{
  "street": "456 New St",
  "city": "Boston",
  "postalCode": "02101"
}
```

**Response:**

- **200 OK** - Updated address
- **404 Not Found** - Address not found

---

### Delete Address

**DELETE** `/api/users/addresses/{addressId}`

Delete an address.

**Headers Required:**

- Authorization: Bearer `{token}`

**Path Parameters:**

- `addressId` (required, UUID)

**Response:**

- **200 OK**
  ```json
  {
    "success": true,
    "message": "Address deleted successfully"
  }
  ```

---

## Products

### Create Product

**POST** `/api/products`

Create a new product (Admin or Vendor only).

**Headers Required:**

- Authorization: Bearer `{token}`

**Request Body:**

```json
{
  "name": "Product Name",
  "nameEn": "Product Name English",
  "nameDe": "Product Name Deutsch",
  "description": "Product description",
  "price": 99.99,
  "stock": 100,
  "categoryId": "uuid",
  "sku": "SKU123",
  "images": ["image_url_1", "image_url_2"]
}
```

**Response:**

- **201 Created** - Product created successfully
- **400 Bad Request** - Validation error
- **401 Unauthorized** - No valid token
- **403 Forbidden** - Admin or Vendor role required

---

### Get All Products

**GET** `/api/products`

Retrieve paginated list of products (public).

**Query Parameters:**

- `page` (optional, integer, default: 1)
- `limit` (optional, integer, default: 10)
- `category` (optional, string) - Filter by category
- `minPrice` (optional, number)
- `maxPrice` (optional, number)
- `sortBy` (optional, enum: name, price, rating, createdAt)
- `sortOrder` (optional, enum: asc, desc)

**Response:**

- **200 OK**
  ```json
  {
    "success": true,
    "data": [
      {
        "id": "uuid",
        "name": "Product Name",
        "price": 99.99,
        "stock": 100,
        "rating": 4.5
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 50
    }
  }
  ```

---

### Get Product by ID

**GET** `/api/products/{id}`

Get detailed information about a specific product.

**Path Parameters:**

- `id` (required, UUID)

**Response:**

- **200 OK** - Product details
- **404 Not Found** - Product not found

---

### Update Product

**PUT** `/api/products/{id}`

Update product details (Admin or Vendor only).

**Headers Required:**

- Authorization: Bearer `{token}`

**Path Parameters:**

- `id` (required, UUID)

**Request Body:**

```json
{
  "name": "Updated Name",
  "price": 89.99,
  "stock": 50
}
```

**Response:**

- **200 OK** - Updated product
- **403 Forbidden** - Permission denied
- **404 Not Found** - Product not found

---

### Delete Product

**DELETE** `/api/products/{id}`

Discontinue a product (Admin only).

**Headers Required:**

- Authorization: Bearer `{token}`

**Path Parameters:**

- `id` (required, UUID)

**Response:**

- **200 OK**
  ```json
  {
    "success": true,
    "message": "Product discontinued"
  }
  ```

---

### Upload Product Images

**POST** `/api/products/{id}/images`

Upload images for a product.

**Headers Required:**

- Authorization: Bearer `{token}`

**Path Parameters:**

- `id` (required, UUID)

**Request:**

- Multipart form data with file field

**Response:**

- **200 OK** - Images uploaded successfully
- **404 Not Found** - Product not found

---

### Search Products

**GET** `/api/products/search`

Search products by keyword with filters.

**Query Parameters:**

- `q` (optional, string) - Search keyword
- `category` (optional, string)
- `minPrice` (optional, number)
- `maxPrice` (optional, number)
- `page` (optional, integer, default: 1)
- `limit` (optional, integer, default: 10)

**Response:**

- **200 OK** - Search results with pagination

---

### Get Featured Products

**GET** `/api/products/featured`

Retrieve featured/promoted products.

**Response:**

- **200 OK** - Array of featured products

---

### Get New Arrivals

**GET** `/api/products/new-arrivals`

Get recently added products.

**Response:**

- **200 OK** - Array of new products

---

### Get Related Products

**GET** `/api/products/{id}/related`

Get products related to a specific product.

**Path Parameters:**

- `id` (required, UUID)

**Response:**

- **200 OK** - Array of related products

---

## Cart

**Note:** All cart routes require CUSTOMER role.

### Get Shopping Cart

**GET** `/api/cart`

Retrieve the authenticated customer's shopping cart.

**Headers Required:**

- Authorization: Bearer `{token}`

**Response:**

- **200 OK**
  ```json
  {
    "success": true,
    "data": {
      "id": "uuid",
      "items": [
        {
          "id": "uuid",
          "productId": "uuid",
          "quantity": 2,
          "price": 99.99
        }
      ],
      "subtotal": 199.98,
      "tax": 20.0,
      "total": 219.98
    }
  }
  ```

---

### Add to Cart

**POST** `/api/cart/add`

Add a product to the customer's shopping cart.

**Headers Required:**

- Authorization: Bearer `{token}`

**Request Body:**

```json
{
  "productId": "uuid",
  "quantity": 2
}
```

**Response:**

- **200 OK** - Updated cart
  ```json
  {
    "success": true,
    "data": { ... },
    "message": "Product added to cart"
  }
  ```
- **400 Bad Request** - Validation error or insufficient stock
- **404 Not Found** - Product not found

---

### Update Cart Item Quantity

**PUT** `/api/cart/items/{id}`

Update the quantity of a cart item.

**Headers Required:**

- Authorization: Bearer `{token}`

**Path Parameters:**

- `id` (required, UUID) - Cart item ID

**Request Body:**

```json
{
  "quantity": 5
}
```

**Response:**

- **200 OK** - Updated cart
  ```json
  {
    "success": true,
    "data": { ... },
    "message": "Cart item updated"
  }
  ```

---

### Remove from Cart

**DELETE** `/api/cart/items/{id}`

Remove a product from the shopping cart.

**Headers Required:**

- Authorization: Bearer `{token}`

**Path Parameters:**

- `id` (required, UUID) - Cart item ID

**Response:**

- **200 OK**
  ```json
  {
    "success": true,
    "data": { ... },
    "message": "Item removed from cart"
  }
  ```

---

### Clear Cart

**DELETE** `/api/cart`

Remove all items from the shopping cart.

**Headers Required:**

- Authorization: Bearer `{token}`

**Response:**

- **200 OK**
  ```json
  {
    "success": true,
    "message": "Cart cleared"
  }
  ```

---

### Validate Cart

**GET** `/api/cart/validate`

Validate cart items (check stock, prices, etc).

**Headers Required:**

- Authorization: Bearer `{token}`

**Response:**

- **200 OK** - Validation result

---

### Apply Coupon

**POST** `/api/cart/apply-coupon`

Apply a coupon code to the cart.

**Headers Required:**

- Authorization: Bearer `{token}`

**Request Body:**

```json
{
  "couponCode": "SAVE10",
  "orderTotal": 199.98
}
```

**Response:**

- **200 OK**
  ```json
  {
    "success": true,
    "data": {
      "discount": 20.0,
      "newTotal": 179.98
    }
  }
  ```

---

## Orders

### Create Order

**POST** `/api/orders`

Create a new order from customer's cart (Customer only).

**Headers Required:**

- Authorization: Bearer `{token}`

**Request Body:**

```json
{
  "deliveryAddressId": "uuid",
  "billingAddressId": "uuid",
  "paymentMethod": "STRIPE",
  "couponCode": "SAVE10"
}
```

**Response:**

- **201 Created**
  ```json
  {
    "success": true,
    "data": {
      "id": "uuid",
      "orderNumber": "ORD-001",
      "status": "PENDING_PAYMENT",
      "totalAmount": 179.98,
      "items": [ ... ]
    },
    "message": "Order created successfully"
  }
  ```
- **400 Bad Request** - Validation error or insufficient inventory
- **403 Forbidden** - Customer role required

---

### Get All Orders (Admin)

**GET** `/api/orders`

Retrieve paginated list of all orders (Admin only).

**Headers Required:**

- Authorization: Bearer `{token}`

**Query Parameters:**

- `page` (optional, integer, default: 1)
- `limit` (optional, integer, default: 10)
- `status` (optional) - Filter by status
- `dateRange` (optional)
- `customerId` (optional)

**Response:**

- **200 OK** - Paginated orders list
- **403 Forbidden** - Admin role required

---

### Get My Orders

**GET** `/api/orders/my`

Retrieve customer's own orders.

**Headers Required:**

- Authorization: Bearer `{token}`

**Query Parameters:**

- `page` (optional, integer, default: 1)
- `limit` (optional, integer, default: 10)
- `status` (optional)

**Response:**

- **200 OK** - Customer's orders

---

### Get Order by ID

**GET** `/api/orders/{id}`

Retrieve detailed information about a specific order.

**Headers Required:**

- Authorization: Bearer `{token}`

**Path Parameters:**

- `id` (required, UUID)

**Response:**

- **200 OK** - Order details
- **404 Not Found** - Order not found

---

### Update Order Status

**PUT** `/api/orders/{id}`

Update order status (Admin or Vendor only).

**Headers Required:**

- Authorization: Bearer `{token}`

**Path Parameters:**

- `id` (required, UUID)

**Request Body:**

```json
{
  "status": "PROCESSING",
  "notes": "Order is being prepared"
}
```

**Response:**

- **200 OK**
  ```json
  {
    "success": true,
    "data": { ... },
    "message": "Order status updated successfully"
  }
  ```

---

### Cancel Order

**POST** `/api/orders/{id}/cancel`

Cancel an order (Customer or Admin).

**Headers Required:**

- Authorization: Bearer `{token}`

**Path Parameters:**

- `id` (required, UUID)

**Response:**

- **200 OK**
  ```json
  {
    "success": true,
    "data": { ... },
    "message": "Order cancelled successfully"
  }
  ```

---

### Get Order Tracking

**GET** `/api/orders/{id}/tracking`

Get tracking information for an order.

**Headers Required:**

- Authorization: Bearer `{token}`

**Path Parameters:**

- `id` (required, UUID)

**Response:**

- **200 OK** - Tracking details

---

### Add Order Note

**POST** `/api/orders/{id}/notes`

Add a note to an order.

**Headers Required:**

- Authorization: Bearer `{token}`

**Path Parameters:**

- `id` (required, UUID)

**Request Body:**

```json
{
  "note": "Please deliver after 5 PM"
}
```

**Response:**

- **200 OK**
  ```json
  {
    "success": true,
    "data": { ... },
    "message": "Note added successfully"
  }
  ```

---

## Payments

### Get Available Payment Methods

**GET** `/api/payments/methods`

Get available payment methods (public).

**Response:**

- **200 OK** - List of available payment methods

---

### Create Stripe Payment Intent

**POST** `/api/payments/stripe/create-intent`

Create a Stripe PaymentIntent for an order (Customer only).

**Headers Required:**

- Authorization: Bearer `{token}`

**Request Body:**

```json
{
  "orderId": "uuid"
}
```

**Response:**

- **200 OK**
  ```json
  {
    "success": true,
    "data": {
      "clientSecret": "pi_xxx",
      "paymentIntentId": "pi_xxx",
      "publishableKey": "pk_xxx",
      "amount": 17998,
      "amountFormatted": "179.98",
      "orderId": "uuid"
    },
    "message": "PaymentIntent created successfully"
  }
  ```

---

### Create PayPal Order

**POST** `/api/payments/paypal/create`

Create PayPal order (Customer only).

**Headers Required:**

- Authorization: Bearer `{token}`

**Request Body:**

```json
{
  "orderId": "uuid"
}
```

**Response:**

- **200 OK** - PayPal order created

---

### Capture PayPal Order

**POST** `/api/payments/paypal/capture`

Capture PayPal order after approval (Customer only).

**Headers Required:**

- Authorization: Bearer `{token}`

**Request Body:**

```json
{
  "orderId": "uuid",
  "paypalOrderId": "paypal_order_id"
}
```

**Response:**

- **200 OK** - Order captured successfully

---

### Create Klarna Session

**POST** `/api/payments/klarna/session`

Create Klarna checkout session (Customer only).

**Headers Required:**

- Authorization: Bearer `{token}`

**Request Body:**

```json
{
  "orderId": "uuid"
}
```

**Response:**

- **200 OK** - Klarna session created

---

### Confirm Klarna Order

**POST** `/api/payments/klarna/confirm`

Confirm Klarna order (Customer only).

**Headers Required:**

- Authorization: Bearer `{token}`

**Request Body:**

```json
{
  "orderId": "uuid",
  "sessionId": "klarna_session_id"
}
```

**Response:**

- **200 OK** - Klarna order confirmed

---

### Get Payment Status

**GET** `/api/payments/{orderId}`

Get payment status (Customer own or Admin).

**Headers Required:**

- Authorization: Bearer `{token}`

**Path Parameters:**

- `orderId` (required, UUID)

**Response:**

- **200 OK** - Payment status details

---

### Refund Payment

**POST** `/api/payments/{orderId}/refund`

Refund a payment (Admin only).

**Headers Required:**

- Authorization: Bearer `{token}`

**Path Parameters:**

- `orderId` (required, UUID)

**Request Body:**

```json
{
  "reason": "Customer request",
  "amount": 179.98
}
```

**Response:**

- **200 OK** - Refund processed

---

### Get Invoice Data

**GET** `/api/payments/{orderId}/invoice`

Get invoice data as JSON (Customer own or Admin).

**Headers Required:**

- Authorization: Bearer `{token}`

**Path Parameters:**

- `orderId` (required, UUID)

**Response:**

- **200 OK** - Invoice data

---

### Download Invoice PDF

**GET** `/api/payments/{orderId}/invoice/download`

Download invoice as PDF (Customer own or Admin).

**Headers Required:**

- Authorization: Bearer `{token}`

**Path Parameters:**

- `orderId` (required, UUID)

**Response:**

- **200 OK** - PDF file

---

### Send Invoice Email

**POST** `/api/payments/{orderId}/invoice/send`

Send invoice via email (Admin only).

**Headers Required:**

- Authorization: Bearer `{token}`

**Path Parameters:**

- `orderId` (required, UUID)

**Response:**

- **200 OK** - Invoice sent

---

### Get Payment Receipt

**GET** `/api/payments/{orderId}/receipt`

Get payment receipt (Customer own or Admin).

**Headers Required:**

- Authorization: Bearer `{token}`

**Path Parameters:**

- `orderId` (required, UUID)

**Response:**

- **200 OK** - Payment receipt

---

## Shipping

### Get Shipping Rates

**POST** `/api/shipping/rates`

Calculate available shipping rates for a package (public).

**Request Body:**

```json
{
  "weightKg": 2.5,
  "postalCode": "10001",
  "country": "USA",
  "orderTotal": 179.98
}
```

**Response:**

- **200 OK** - Available shipping rates
  ```json
  {
    "success": true,
    "data": [
      {
        "method": "DHL",
        "cost": 10.0,
        "estimatedDays": 2
      },
      {
        "method": "HERMES",
        "cost": 8.0,
        "estimatedDays": 3
      }
    ]
  }
  ```

---

### Create Shipment

**POST** `/api/shipping`

Create a shipment for an order (Admin only).

**Headers Required:**

- Authorization: Bearer `{token}`

**Request Body:**

```json
{
  "orderId": "uuid",
  "method": "DHL"
}
```

**Response:**

- **201 Created** - Shipment created
- **404 Not Found** - Order not found

---

### Get Tracking Information

**GET** `/api/shipping/track/{trackingNumber}`

Get tracking information for a shipment.

**Headers Required:**

- Authorization: Bearer `{token}`

**Path Parameters:**

- `trackingNumber` (required, string)

**Response:**

- **200 OK** - Tracking details

---

### Get Order Shipment

**GET** `/api/shipping/order/{orderId}`

Get shipment details for an order.

**Headers Required:**

- Authorization: Bearer `{token}`

**Path Parameters:**

- `orderId` (required, UUID)

**Response:**

- **200 OK** - Shipment information

---

### Download Shipping Label

**GET** `/api/shipping/{shipmentId}/label`

Download shipping label as PDF (Admin only).

**Headers Required:**

- Authorization: Bearer `{token}`

**Path Parameters:**

- `shipmentId` (required, UUID)

**Response:**

- **200 OK** - PDF file

---

## Reviews

### Create Review

**POST** `/api/reviews`

Create a new product review (Customer only).

**Headers Required:**

- Authorization: Bearer `{token}`

**Request Body:**

```json
{
  "productId": "uuid",
  "rating": 5,
  "title": "Great product!",
  "comment": "This product exceeded my expectations. Highly recommend!"
}
```

**Response:**

- **201 Created**
  ```json
  {
    "success": true,
    "data": { ... },
    "message": "Review created successfully"
  }
  ```

---

### Get Product Reviews

**GET** `/api/products/{productId}/reviews`

Get all reviews for a product.

**Path Parameters:**

- `productId` (required, UUID)

**Query Parameters:**

- `page` (optional, integer, default: 1)
- `limit` (optional, integer, default: 10)
- `sortBy` (optional) - helpful, recent, rating

**Response:**

- **200 OK** - Paginated reviews

---

### Get Pending Reviews (Admin)

**GET** `/api/reviews/pending`

Get reviews pending moderation (Admin only).

**Headers Required:**

- Authorization: Bearer `{token}`

**Response:**

- **200 OK** - Pending reviews

---

### Update Review

**PUT** `/api/reviews/{reviewId}`

Update a product review (review owner only).

**Headers Required:**

- Authorization: Bearer `{token}`

**Path Parameters:**

- `reviewId` (required, UUID)

**Request Body:**

```json
{
  "rating": 4,
  "title": "Good product",
  "comment": "Updated review text"
}
```

**Response:**

- **200 OK** - Updated review

---

### Delete Review

**DELETE** `/api/reviews/{reviewId}`

Delete a review.

**Headers Required:**

- Authorization: Bearer `{token}`

**Path Parameters:**

- `reviewId` (required, UUID)

**Response:**

- **200 OK**
  ```json
  {
    "success": true,
    "message": "Review deleted successfully"
  }
  ```

---

### Approve Review (Admin)

**POST** `/api/reviews/{reviewId}/approve`

Approve a review for publication (Admin only).

**Headers Required:**

- Authorization: Bearer `{token}`

**Path Parameters:**

- `reviewId` (required, UUID)

**Response:**

- **200 OK** - Review approved

---

### Reject Review (Admin)

**POST** `/api/reviews/{reviewId}/reject`

Reject a review (Admin only).

**Headers Required:**

- Authorization: Bearer `{token}`

**Path Parameters:**

- `reviewId` (required, UUID)

**Response:**

- **200 OK** - Review rejected

---

### Mark Review as Helpful

**POST** `/api/reviews/{reviewId}/helpful`

Toggle helpful status on a review.

**Headers Required:**

- Authorization: Bearer `{token}`

**Path Parameters:**

- `reviewId` (required, UUID)

**Response:**

- **200 OK** - Helpful status toggled

---

## Wishlist

**Note:** All wishlist routes require authentication.

### Get Wishlist

**GET** `/api/wishlist`

Retrieve the customer's wishlist.

**Headers Required:**

- Authorization: Bearer `{token}`

**Response:**

- **200 OK**
  ```json
  {
    "success": true,
    "data": {
      "items": [
        {
          "id": "uuid",
          "productId": "uuid",
          "name": "Product Name",
          "price": 99.99
        }
      ]
    }
  }
  ```

---

### Add to Wishlist

**POST** `/api/wishlist/{productId}`

Add a product to the customer's wishlist.

**Headers Required:**

- Authorization: Bearer `{token}`

**Path Parameters:**

- `productId` (required, UUID)

**Response:**

- **201 Created** - Product added to wishlist
- **409 Conflict** - Product already in wishlist

---

### Remove from Wishlist

**DELETE** `/api/wishlist/{productId}`

Remove a product from the customer's wishlist.

**Headers Required:**

- Authorization: Bearer `{token}`

**Path Parameters:**

- `productId` (required, UUID)

**Response:**

- **200 OK** - Product removed from wishlist

---

### Move to Cart

**POST** `/api/wishlist/{productId}/move-to-cart`

Move a product from wishlist to cart.

**Headers Required:**

- Authorization: Bearer `{token}`

**Path Parameters:**

- `productId` (required, UUID)

**Response:**

- **200 OK** - Product moved to cart

---

## Coupons

### Create Coupon (Admin)

**POST** `/api/coupons`

Create a new coupon (Admin only).

**Headers Required:**

- Authorization: Bearer `{token}`

**Request Body:**

```json
{
  "code": "SAVE10",
  "type": "PERCENTAGE",
  "value": 10,
  "minOrderValue": 50.0,
  "maxUses": 100,
  "expiresAt": "2024-12-31T23:59:59Z",
  "isActive": true
}
```

**Response:**

- **201 Created** - Coupon created
- **409 Conflict** - Coupon code already exists

---

### Get All Coupons (Admin)

**GET** `/api/coupons`

List all coupons with filters (Admin only).

**Headers Required:**

- Authorization: Bearer `{token}`

**Query Parameters:**

- `page` (optional, integer, default: 1)
- `limit` (optional, integer, default: 10)
- `isActive` (optional, boolean)
- `type` (optional) - PERCENTAGE, FIXED_AMOUNT, FREE_SHIPPING

**Response:**

- **200 OK** - Paginated coupons list

---

### Get Coupon by Code (Admin)

**GET** `/api/coupons/code/{code}`

Get detailed coupon information by code (Admin only).

**Headers Required:**

- Authorization: Bearer `{token}`

**Path Parameters:**

- `code` (required, string)

**Response:**

- **200 OK** - Coupon details
- **404 Not Found** - Coupon not found

---

### Update Coupon (Admin)

**PUT** `/api/coupons/{id}`

Update coupon details (Admin only).

**Headers Required:**

- Authorization: Bearer `{token}`

**Path Parameters:**

- `id` (required, UUID)

**Request Body:**

```json
{
  "isActive": false,
  "maxUses": 50,
  "expiresAt": "2024-11-30T23:59:59Z"
}
```

**Response:**

- **200 OK** - Updated coupon

---

### Delete Coupon (Admin)

**DELETE** `/api/coupons/{id}`

Delete a coupon (Admin only).

**Headers Required:**

- Authorization: Bearer `{token}`

**Path Parameters:**

- `id` (required, UUID)

**Response:**

- **200 OK** - Coupon deleted

---

## Notifications

**Note:** All notification routes require authentication.

### Get Notifications

**GET** `/api/notifications`

Retrieve paginated notifications for the current user.

**Headers Required:**

- Authorization: Bearer `{token}`

**Query Parameters:**

- `page` (optional, integer, default: 1)
- `limit` (optional, integer, default: 20)
- `unreadOnly` (optional, boolean)

**Response:**

- **200 OK**
  ```json
  {
    "success": true,
    "data": {
      "notifications": [ ... ],
      "pagination": { ... }
    }
  }
  ```

---

### Get Notification Statistics

**GET** `/api/notifications/stats`

Get notification counts (total, unread, read).

**Headers Required:**

- Authorization: Bearer `{token}`

**Response:**

- **200 OK**
  ```json
  {
    "success": true,
    "data": {
      "total": 15,
      "unread": 3,
      "read": 12
    }
  }
  ```

---

### Mark as Read

**PUT** `/api/notifications/{notificationId}/read`

Mark a single notification as read.

**Headers Required:**

- Authorization: Bearer `{token}`

**Path Parameters:**

- `notificationId` (required, UUID)

**Response:**

- **200 OK** - Notification marked as read

---

### Mark All as Read

**PUT** `/api/notifications/read-all`

Mark all notifications as read for the current user.

**Headers Required:**

- Authorization: Bearer `{token}`

**Response:**

- **200 OK** - All notifications marked as read

---

### Delete Notification

**DELETE** `/api/notifications/{notificationId}`

Delete a single notification.

**Headers Required:**

- Authorization: Bearer `{token}`

**Path Parameters:**

- `notificationId` (required, UUID)

**Response:**

- **200 OK** - Notification deleted

---

### Delete All Notifications

**DELETE** `/api/notifications/delete-all`

Delete all notifications for the current user.

**Headers Required:**

- Authorization: Bearer `{token}`

**Response:**

- **200 OK** - All notifications deleted

---

## Inventory

**Note:** Inventory routes require Admin or Vendor role.

### Get Inventory List

**GET** `/api/inventory`

Retrieve paginated inventory list (Admin or Vendor).

**Headers Required:**

- Authorization: Bearer `{token}`

**Query Parameters:**

- `page` (optional, integer, default: 1)
- `limit` (optional, integer, default: 10)
- `productId` (optional, string)
- `lowStockOnly` (optional, boolean)

**Response:**

- **200 OK** - Paginated inventory

---

### Get Low Stock Alerts

**GET** `/api/inventory/alerts`

Retrieve products with low stock levels (Admin only).

**Headers Required:**

- Authorization: Bearer `{token}`

**Response:**

- **200 OK** - Low stock products

---

### Get Inventory Summary

**GET** `/api/inventory/summary`

Retrieve inventory summary statistics (Admin only).

**Headers Required:**

- Authorization: Bearer `{token}`

**Response:**

- **200 OK** - Inventory statistics

---

### Update Inventory

**PUT** `/api/inventory/{productId}`

Update product inventory (Admin or Vendor).

**Headers Required:**

- Authorization: Bearer `{token}`

**Path Parameters:**

- `productId` (required, UUID)

**Request Body:**

```json
{
  "quantity": 100,
  "reason": "Manual restock"
}
```

**Response:**

- **200 OK** - Inventory updated

---

### Get Inventory History

**GET** `/api/inventory/{productId}/history`

Get inventory change history for a product.

**Headers Required:**

- Authorization: Bearer `{token}`

**Path Parameters:**

- `productId` (required, UUID)

**Query Parameters:**

- `page` (optional, integer, default: 1)
- `limit` (optional, integer, default: 10)

**Response:**

- **200 OK** - Paginated history

---

## Analytics

**Note:** All analytics routes require Admin role.

### Get Sales Report

**GET** `/api/analytics/sales`

Retrieve sales data with date range and grouping options.

**Headers Required:**

- Authorization: Bearer `{token}`

**Query Parameters:**

- `startDate` (optional, string, format: date)
- `endDate` (optional, string, format: date)
- `groupBy` (optional) - day, week, month
- `currency` (optional)

**Response:**

- **200 OK** - Sales report data

---

### Get Product Report

**GET** `/api/analytics/products`

Retrieve product sales and performance metrics.

**Headers Required:**

- Authorization: Bearer `{token}`

**Query Parameters:**

- `productId` (optional)
- `startDate` (optional)
- `endDate` (optional)
- `sortBy` (optional) - sales, revenue, reviews, trending

**Response:**

- **200 OK** - Product performance report

---

### Get Customer Report

**GET** `/api/analytics/customers`

Retrieve customer metrics and demographics.

**Headers Required:**

- Authorization: Bearer `{token}`

**Query Parameters:**

- `startDate` (optional)
- `endDate` (optional)

**Response:**

- **200 OK** - Customer analytics

---

### Get Inventory Report

**GET** `/api/analytics/inventory`

Retrieve inventory analytics and stock levels.

**Headers Required:**

- Authorization: Bearer `{token}`

**Response:**

- **200 OK** - Inventory report

---

### Get Payment Report

**GET** `/api/analytics/payments`

Retrieve payment method usage and revenue breakdown.

**Headers Required:**

- Authorization: Bearer `{token}`

**Query Parameters:**

- `startDate` (optional)
- `endDate` (optional)

**Response:**

- **200 OK** - Payment analytics

---

### Export Report

**GET** `/api/analytics/export`

Export analytics report in various formats.

**Headers Required:**

- Authorization: Bearer `{token}`

**Query Parameters:**

- `format` (optional) - CSV, PDF, EXCEL
- `reportType` (optional) - sales, products, customers, inventory, payments

**Response:**

- **200 OK** - Exported file

---

## Admin

**Note:** All admin routes require Admin role.

### Get Dashboard Statistics

**GET** `/api/admin/dashboard`

Get admin dashboard KPIs and statistics.

**Headers Required:**

- Authorization: Bearer `{token}`

**Response:**

- **200 OK**
  ```json
  {
    "success": true,
    "data": {
      "revenue": {
        "today": 1500.0,
        "thisWeek": 8000.0,
        "thisMonth": 35000.0,
        "thisYear": 250000.0
      },
      "orders": {
        "total": 500,
        "pending": 25,
        "processing": 10,
        "today": 15
      },
      "customers": {
        "total": 1200,
        "new": 45,
        "active": 980
      },
      "products": {
        "total": 350,
        "active": 340,
        "outOfStock": 5,
        "lowStock": 5
      }
    }
  }
  ```

---

### Get Sales Chart Data

**GET** `/api/admin/dashboard/charts`

Get sales and order trend charts.

**Headers Required:**

- Authorization: Bearer `{token}`

**Query Parameters:**

- `period` (optional) - 7d, 30d, 12m

**Response:**

- **200 OK** - Chart data for visualization

---

### Get Dashboard Alerts

**GET** `/api/admin/dashboard/alerts`

Get system alerts and notifications.

**Headers Required:**

- Authorization: Bearer `{token}`

**Response:**

- **200 OK** - Array of alerts

---

### Get Top Products

**GET** `/api/admin/dashboard/top-products`

Get top-selling products with performance metrics.

**Headers Required:**

- Authorization: Bearer `{token}`

**Response:**

- **200 OK** - Top products list

---

### Get Recent Orders

**GET** `/api/admin/dashboard/orders`

Get recent orders with summary details.

**Headers Required:**

- Authorization: Bearer `{token}`

**Response:**

- **200 OK** - Recent orders

---

### Get All Users

**GET** `/api/admin/users`

Get all users with pagination and filtering.

**Headers Required:**

- Authorization: Bearer `{token}`

**Query Parameters:**

- `page` (optional, integer, default: 1)
- `limit` (optional, integer, default: 10)
- `role` (optional) - ADMIN, VENDOR, CUSTOMER, DELIVERY
- `isActive` (optional, boolean)
- `search` (optional, string)

**Response:**

- **200 OK** - Paginated users list

---

### Get User Details

**GET** `/api/admin/users/{userId}`

Get detailed information about a specific user.

**Headers Required:**

- Authorization: Bearer `{token}`

**Path Parameters:**

- `userId` (required, UUID)

**Response:**

- **200 OK** - User details
- **404 Not Found** - User not found

---

### Update User Role

**PUT** `/api/admin/users/{userId}/role`

Update the role of a user (ADMIN, VENDOR, CUSTOMER, DELIVERY).

**Headers Required:**

- Authorization: Bearer `{token}`

**Path Parameters:**

- `userId` (required, UUID)

**Request Body:**

```json
{
  "role": "VENDOR"
}
```

**Response:**

- **200 OK** - User role updated

---

### Toggle User Status

**PUT** `/api/admin/users/{userId}/status`

Activate or deactivate a user account.

**Headers Required:**

- Authorization: Bearer `{token}`

**Path Parameters:**

- `userId` (required, UUID)

**Request Body:**

```json
{
  "isActive": false
}
```

**Response:**

- **200 OK** - User status updated

---

### Create Vendor

**POST** `/api/admin/vendors`

Create a new vendor account (Admin only).

**Headers Required:**

- Authorization: Bearer `{token}`

**Request Body:**

```json
{
  "email": "vendor@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "businessName": "John's Store",
  "phone": "+1234567890"
}
```

**Response:**

- **201 Created** - Vendor created
- **409 Conflict** - Email already exists

---

### Get All Vendors

**GET** `/api/admin/vendors`

Get all vendors with pagination and filtering.

**Headers Required:**

- Authorization: Bearer `{token}`

**Query Parameters:**

- `page` (optional, integer, default: 1)
- `limit` (optional, integer, default: 10)
- `isActive` (optional, boolean)
- `search` (optional, string)

**Response:**

- **200 OK** - Paginated vendors list

---

### Get Vendor Details

**GET** `/api/admin/vendors/{vendorId}`

Get detailed information about a specific vendor.

**Headers Required:**

- Authorization: Bearer `{token}`

**Path Parameters:**

- `vendorId` (required, UUID)

**Response:**

- **200 OK** - Vendor details

---

### Get Activity Log

**GET** `/api/admin/activity-log`

Get system activity log with filtering options (Admin only).

**Headers Required:**

- Authorization: Bearer `{token}`

**Query Parameters:**

- `page` (optional, integer, default: 1)
- `limit` (optional, integer, default: 10)
- `userId` (optional)
- `action` (optional)
- `entity` (optional)
- `startDate` (optional)
- `endDate` (optional)

**Response:**

- **200 OK** - Paginated activity log

---

### Get Admin Settings

**GET** `/api/admin/settings`

Get system settings and configuration.

**Headers Required:**

- Authorization: Bearer `{token}`

**Response:**

- **200 OK** - System settings

---

### Update Admin Settings

**PUT** `/api/admin/settings`

Update system settings and configuration.

**Headers Required:**

- Authorization: Bearer `{token}`

**Request Body:**

```json
{
  "siteName": "Habeshan Market",
  "taxRate": 0.08,
  "shippingPolicy": "Free shipping over $50",
  "maintenanceMode": false
}
```

**Response:**

- **200 OK** - Settings updated

---

## Error Responses

All error responses follow this format:

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": {}
  }
}
```

### Common Status Codes

- **200 OK** - Successful GET/PUT/DELETE request
- **201 Created** - Successful POST request creating a resource
- **400 Bad Request** - Validation error
- **401 Unauthorized** - Missing or invalid authentication token
- **403 Forbidden** - Insufficient permissions
- **404 Not Found** - Resource not found
- **409 Conflict** - Resource already exists or conflict
- **500 Internal Server Error** - Server error

---

## Authentication

Most endpoints require JWT Bearer token authentication.

**Header Format:**

```
Authorization: Bearer <token>
```

**Token Structure:**

- Obtained from login endpoint
- Valid for 1 hour (access token)
- Refresh token can be used to get new access token

---

## Pagination

List endpoints support pagination with the following parameters:

**Query Parameters:**

- `page` (integer, default: 1) - Page number
- `limit` (integer, default: 10-20) - Items per page

**Response Format:**

```json
{
  "success": true,
  "data": [ ... ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 50,
    "pages": 5
  }
}
```

---

## Rate Limiting

API endpoints have rate limiting enabled:

- **Public endpoints**: 100 requests per hour
- **Authenticated endpoints**: 500 requests per hour
- **Admin endpoints**: 1000 requests per hour

---

## Webhook Endpoints

### Stripe Webhook

**POST** `/api/payments/stripe/webhook`

Receives Stripe webhook events. Requires raw body for signature verification.

**Events Handled:**

- `payment_intent.succeeded`
- `payment_intent.payment_failed`
- `charge.refunded`

---

### PayPal Webhook

**POST** `/api/payments/paypal/webhook`

Receives PayPal webhook events for payment updates.

---

### Klarna Webhook

**POST** `/api/payments/klarna/webhook`

Receives Klarna webhook events for order confirmation.

---

## File Uploads

### Image Upload Requirements

- **Max Size**: 5MB per file
- **Allowed Formats**: JPG, PNG, GIF, WebP
- **Max Files**: 10 per request

### Response Format:

```json
{
  "success": true,
  "data": {
    "url": "https://cdn.example.com/image.jpg",
    "filename": "image.jpg",
    "size": 102400
  }
}
```

---

## Base URL

All endpoints are relative to:

```
https://api.habeshanmarket.com
```

For development:

```
http://localhost:3000
```

---

**Last Updated:** May 2026
**API Version:** 1.0
