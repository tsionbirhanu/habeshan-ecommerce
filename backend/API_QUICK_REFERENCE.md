# Quick Reference Guide - API Endpoints

## 🚀 Quick Start

1. **Start Server**: `npm run dev` (http://localhost:3001)
2. **View Docs**: http://localhost:3001/api-docs
3. **Get Token**: POST `/api/auth/login`
4. **Authorize**: Click "Authorize" in Swagger UI, paste `Bearer <token>`

---

## 🔐 Authentication Endpoints

### Register Customer

```
POST /api/auth/register-customer
{
  "email": "customer@example.com",
  "password": "SecurePass123!",
  "firstName": "John",
  "lastName": "Doe"
}
→ Returns: { accessToken, refreshToken, user }
```

### Create Vendor (Admin Only)

**Note**: Vendor registration is ADMIN-ONLY. Use the admin endpoint below to create vendor accounts.

```
POST /api/admin/vendors (ADMIN ONLY)
{
  "email": "vendor@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "businessName": "My Store",
  "description": "Store description"
}
→ Vendor receives invitation email to set password
```

See **Admin Endpoints** section below for more details.

### Login

```
POST /api/auth/login
{
  "email": "customer@example.com",
  "password": "SecurePass123!"
}
→ Returns: { accessToken, refreshToken, user }
```

### Refresh Token

```
POST /api/auth/refresh-token
{
  "refreshToken": "..."
}
→ Returns: { accessToken }
```

### Get Current User

```
GET /api/auth/me
Authorization: Bearer <token>
→ Returns: { user }
```

### Logout

```
POST /api/auth/logout
Authorization: Bearer <token>
→ Returns: { success: true }
```

### Forgot Password

```
POST /api/auth/forgot-password
{
  "email": "user@example.com"
}
→ Sends reset link to email
```

### Reset Password

```
POST /api/auth/reset-password
{
  "token": "...",
  "newPassword": "NewPass123!"
}
→ Returns: { success: true }
```

---

## 👥 User Management

### Get User Profile

```
GET /api/users/:id
Authorization: Bearer <token>
```

### Update User Profile

```
PUT /api/users/:id
Authorization: Bearer <token>
{
  "firstName": "Jane",
  "lastName": "Smith",
  "phone": "+1234567890"
}
```

### Get User Addresses

```
GET /api/users/:userId/addresses
Authorization: Bearer <token>
```

### Create Address

```
POST /api/users/:userId/addresses
Authorization: Bearer <token>
{
  "street": "123 Main St",
  "city": "Berlin",
  "zipCode": "10115",
  "country": "Germany",
  "isDefault": true
}
```

### Update Address

```
PUT /api/addresses/:id
Authorization: Bearer <token>
{ ... }
```

### Delete Address

```
DELETE /api/addresses/:id
Authorization: Bearer <token>
```

---

## 📦 Products

### List Products

```
GET /api/products?page=1&limit=20&search=&categoryId=&minPrice=&maxPrice=
```

**Query Parameters:**

- `page` (int): Page number (default: 1)
- `limit` (int): Items per page (default: 20)
- `search` (str): Search by name
- `categoryId` (uuid): Filter by category
- `minPrice` (float): Minimum price filter
- `maxPrice` (float): Maximum price filter
- `sortBy` (str): Field to sort by (default: createdAt)
- `order` (str): asc or desc

### Get Product Details

```
GET /api/products/:id
→ Includes: details, reviews, ratings, related products
```

### Create Product (Admin Only)

```
POST /api/products
Authorization: Bearer <admin-token>
{
  "name": "Product Name",
  "nameEn": "Product Name",
  "nameDe": "Produktname",
  "categoryId": "...",
  "price": 29.99,
  "sku": "SKU-001",
  "stockQuantity": 100,
  "description": "...",
  "images": [],
  "vatRate": 0.19
}
```

### Update Product (Admin Only)

```
PUT /api/products/:id
Authorization: Bearer <admin-token>
{ price, stockQuantity, description, ... }
```

### Delete Product (Admin Only)

```
DELETE /api/products/:id
Authorization: Bearer <admin-token>
```

### List Categories

```
GET /api/categories
```

### Create Category (Admin Only)

```
POST /api/categories
Authorization: Bearer <admin-token>
{
  "name": "Electronics",
  "nameEn": "Electronics",
  "nameDe": "Elektronik",
  "description": "..."
}
```

---

## 🛒 Shopping Cart

### Get Cart

```
GET /api/cart
Authorization: Bearer <token>
→ Returns: items[], total, subtotal, tax, discountAmount
```

### Add to Cart

```
POST /api/cart
Authorization: Bearer <token>
{
  "productId": "...",
  "quantity": 2,
  "selectedVariant": { "size": "L", "color": "red" }
}
```

### Update Cart Item

```
PUT /api/cart/:itemId
Authorization: Bearer <token>
{
  "quantity": 3
}
```

### Remove from Cart

```
DELETE /api/cart/:itemId
Authorization: Bearer <token>
```

### Clear Cart

```
DELETE /api/cart
Authorization: Bearer <token>
```

### Apply Coupon to Cart

```
POST /api/cart/apply-coupon
Authorization: Bearer <token>
{
  "couponCode": "WELCOME10"
}
→ Returns: updated cart with discount
```

### Remove Coupon from Cart

```
POST /api/cart/remove-coupon
Authorization: Bearer <token>
→ Removes applied coupon
```

---

## 🎁 Coupons

### List Coupons (Admin Only)

```
GET /api/coupons?page=1&limit=20&isActive=true&type=
Authorization: Bearer <admin-token>
```

### Create Coupon (Admin Only)

```
POST /api/coupons
Authorization: Bearer <admin-token>
{
  "code": "WELCOME10",
  "type": "PERCENTAGE",           // or FIXED_AMOUNT, FREE_SHIPPING
  "value": 10,                     // percentage (1-100) or fixed amount
  "minOrderValue": 25.00,          // minimum order total to apply
  "maxUses": 100,                  // total max uses
  "usagePerCustomer": 1,           // max uses per customer
  "expirationDate": "2024-12-31",
  "description": "Welcome coupon"
}
```

### Get Coupon Details (Admin Only)

```
GET /api/coupons/:code
Authorization: Bearer <admin-token>
```

### Validate Coupon (Customer)

```
POST /api/coupons/validate
Authorization: Bearer <token>
{
  "code": "WELCOME10",
  "orderTotal": 50.00
}
→ Returns: { valid, discountAmount, message, coupon }
```

### Update Coupon (Admin Only)

```
PUT /api/coupons/:id
Authorization: Bearer <admin-token>
{
  "isActive": false,
  "expirationDate": "2024-12-31"
}
```

### Delete Coupon (Admin Only)

```
DELETE /api/coupons/:id
Authorization: Bearer <admin-token>
```

### Get Coupon Statistics (Admin Only)

```
GET /api/coupons/stats
Authorization: Bearer <admin-token>
→ Returns: totalCoupons, activeCoupons, totalDiscount, topCoupon
```

---

## 📝 Orders

### Create Order

```
POST /api/orders
Authorization: Bearer <token>
{
  "deliveryAddressId": "...",
  "billingAddressId": "...",      // optional, defaults to delivery
  "shippingMethod": "DHL",        // DHL, DPD, UPS, PICKUP
  "couponCode": "WELCOME10",      // optional
  "notes": "..."
}
→ Returns: order with orderId, status, totals
```

### List Orders

```
GET /api/orders?page=1&status=
Authorization: Bearer <token>
```

### Get Order Details

```
GET /api/orders/:id
Authorization: Bearer <token>
```

### Update Order Status (Admin Only)

```
PUT /api/orders/:id
Authorization: Bearer <admin-token>
{
  "status": "SHIPPED"  // PENDING, CONFIRMED, PROCESSING, SHIPPED, DELIVERED, CANCELLED
}
```

### Cancel Order

```
POST /api/orders/:id/cancel
Authorization: Bearer <token>
```

### Get Order Tracking

```
GET /api/orders/:id/tracking
Authorization: Bearer <token>
→ Returns: shipment status, tracking number, carrier, estimated delivery
```

---

## 💳 Payments

### Create Payment Intent

```
POST /api/payments/intent
Authorization: Bearer <token>
{
  "orderId": "...",
  "paymentMethod": "STRIPE"  // or PAYPAL, KLARNA
}
→ Returns: clientSecret, paymentIntentId
```

### Confirm Payment

```
POST /api/payments/confirm
Authorization: Bearer <token>
{
  "paymentIntentId": "...",
  "paymentMethodId": "..."
}
→ Returns: { success, status, transactionId }
```

### Get Payment History

```
GET /api/payments?orderId=
Authorization: Bearer <token>
```

### Webhook (Payment Provider)

```
POST /api/payments/webhook
```

---

## ⭐ Reviews

### Get Product Reviews

```
GET /api/reviews?productId=&page=1&limit=20
```

### Create Review

```
POST /api/reviews
Authorization: Bearer <token>
{
  "productId": "...",
  "rating": 5,           // 1-5
  "title": "Great product!",
  "content": "Very satisfied with this purchase..."
}
```

### Update Review

```
PUT /api/reviews/:id
Authorization: Bearer <token>
{
  "rating": 4,
  "title": "...",
  "content": "..."
}
```

### Delete Review

```
DELETE /api/reviews/:id
Authorization: Bearer <token>
```

### Approve Review (Admin Only)

```
PUT /api/reviews/:id/approve
Authorization: Bearer <admin-token>
```

### Flag Review for Moderation

```
POST /api/reviews/:id/flag
Authorization: Bearer <token>
{
  "reason": "INAPPROPRIATE"
}
```

---

## 📊 Admin Dashboard

### Get Dashboard Statistics

```
GET /api/admin/dashboard/stats
Authorization: Bearer <admin-token>
→ Returns: revenue, orders, customers, products KPIs
```

### Get Sales Chart Data

```
GET /api/admin/dashboard/sales-chart?period=
Authorization: Bearer <admin-token>
Parameters: period = DAY, WEEK, MONTH, YEAR
→ Returns: date-grouped sales data
```

### Get Top Products

```
GET /api/admin/dashboard/top-products?limit=10
Authorization: Bearer <admin-token>
→ Returns: products sorted by sales revenue
```

### Get Recent Orders

```
GET /api/admin/dashboard/recent-orders?limit=10
Authorization: Bearer <admin-token>
→ Returns: latest orders with status, customer, total
```

### Get Dashboard Alerts

```
GET /api/admin/dashboard/alerts
Authorization: Bearer <admin-token>
→ Returns: low stock warnings, pending orders, pending reviews
```

---

## 🏪 Admin User Management

### List All Users

```
GET /api/admin/users?role=&status=
Authorization: Bearer <admin-token>
```

### Get User Details

```
GET /api/admin/users/:id
Authorization: Bearer <admin-token>
```

### Suspend User

```
PUT /api/admin/users/:id
Authorization: Bearer <admin-token>
{
  "status": "SUSPENDED",
  "suspensionReason": "..."
}
```

### Approve Vendor

```
POST /api/admin/vendors/:id/approve
Authorization: Bearer <admin-token>
→ Activates pending vendor account
```

### Reject Vendor

```
POST /api/admin/vendors/:id/reject
Authorization: Bearer <admin-token>
{
  "reason": "..."
}
```

---

## ❤️ Wishlist

### Get Wishlist

```
GET /api/wishlist
Authorization: Bearer <token>
```

### Add to Wishlist

```
POST /api/wishlist
Authorization: Bearer <token>
{
  "productId": "..."
}
```

### Remove from Wishlist

```
DELETE /api/wishlist/:productId
Authorization: Bearer <token>
```

### Check if in Wishlist

```
GET /api/wishlist/check/:productId
Authorization: Bearer <token>
→ Returns: { inWishlist: boolean }
```

---

## 🔔 Notifications

### Get Notifications

```
GET /api/notifications?page=1&limit=20&read=
Authorization: Bearer <token>
```

### Mark as Read

```
PUT /api/notifications/:id
Authorization: Bearer <token>
{
  "read": true
}
```

### Mark All as Read

```
PUT /api/notifications/read-all
Authorization: Bearer <token>
```

### Delete Notification

```
DELETE /api/notifications/:id
Authorization: Bearer <token>
```

### Get Notification Preferences

```
GET /api/notifications/preferences
Authorization: Bearer <token>
```

### Update Notification Preferences

```
PUT /api/notifications/preferences
Authorization: Bearer <token>
{
  "emailNotifications": true,
  "pushNotifications": true,
  "smsNotifications": false,
  "orderUpdates": true,
  "promotions": true
}
```

---

## 🚚 Shipping & Tracking

### Get Shipment Tracking

```
GET /api/shipments/:trackingNumber
→ Returns: status, location, estimated delivery, events
```

### Update Shipment Status

```
PUT /api/shipments/:id
Authorization: Bearer <token>
{
  "status": "IN_TRANSIT"
}
```

### Get Delivery Methods

```
GET /api/shipping/methods
→ Returns: { name, price, estimatedDays, carriers }
```

---

## 📊 Inventory Management

### Get Stock Levels

```
GET /api/inventory?productId=&status=
Authorization: Bearer <token>
```

### Reserve Stock (Internal)

```
POST /api/inventory/reserve
Authorization: Bearer <token>
{
  "productId": "...",
  "quantity": 2,
  "orderId": "..."
}
```

### Get Inventory History

```
GET /api/inventory/:productId/history
Authorization: Bearer <token>
→ Returns: stock adjustments, transactions
```

---

## Error Responses

All error responses follow this format:

```json
{
  "success": false,
  "message": "Error description",
  "error": {
    "code": "ERROR_CODE",
    "statusCode": 400
  }
}
```

**Common Status Codes:**

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized (missing/invalid token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `409` - Conflict (duplicate, etc.)
- `500` - Server Error

---

## Rate Limiting

The API implements rate limiting:

- **Default**: 100 requests per 15 minutes
- **Auth endpoints**: 5 requests per 15 minutes
- **Admin endpoints**: 1000 requests per 15 minutes

Exceeded limits return `429 Too Many Requests`

---

## Pagination

All list endpoints support pagination:

```
GET /api/resource?page=1&limit=20

Response:
{
  "success": true,
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "totalPages": 8
  }
}
```

---

## Testing with Curl

```bash
# Get token
TOKEN=$(curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@test.com","password":"Pass123!"}' | jq -r '.data.accessToken')

# Use token in request
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:3001/api/cart
```

---

## Testing with Postman

1. Create environment with variables:
   - `base_url` = `http://localhost:3001`
   - `token` = (set after login)

2. Import API calls:
   - Authentication folder
   - Products folder
   - Orders folder
   - etc.

3. Use `{{base_url}}` and `{{token}}` in requests

---

## Additional Resources

- 📖 Full Swagger Docs: http://localhost:3001/api-docs
- 📝 Testing Guide: TESTING_GUIDE.md
- 📊 Documentation Summary: API_DOCUMENTATION_SUMMARY.md
- 📋 Database Setup: DATABASE_SETUP.md
- 🛠️ Admin Endpoints: ADMIN_ENDPOINTS_REPORT.md
- 📦 Coupon Management: Full integration with orders
- 💰 Payment Processing: Stripe, PayPal, Klarna support

---

Happy API usage! 🚀
