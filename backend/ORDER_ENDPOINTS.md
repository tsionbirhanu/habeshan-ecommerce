# Order Module API - Postman Endpoints

## Base URL
```
{{base_url}}/orders
```

**Set `base_url` = `http://localhost:3001/api`**

---

## 🔐 AUTHENTICATION & ROLES

All order endpoints require authentication. Access depends on user role:

| Endpoint | Customer | Vendor | Admin |
|----------|----------|--------|-------|
| GET /orders | - | - | ✅ |
| POST /orders | ✅ | - | - |
| GET /orders/my | ✅ | - | - |
| GET /orders/:id | ✅ (own) | - | ✅ (any) |
| PUT /orders/:id/status | - | ✅ | ✅ |
| POST /orders/:id/cancel | ✅ (own) | - | ✅ (any) |
| GET /orders/:id/tracking | ✅ (own) | - | ✅ (any) |
| POST /orders/:id/notes | - | - | ✅ |

**Headers:**
```
Authorization: Bearer {{access_token}}
Content-Type: application/json
```

---

## 📦 ORDER STATUSES

| Status | Description |
|--------|-------------|
| `PENDING_PAYMENT` | Order created, awaiting payment |
| `CONFIRMED` | Payment received, order confirmed |
| `PROCESSING` | Order being prepared for shipment |
| `SHIPPED` | Order has been shipped |
| `IN_TRANSIT` | Package in transit |
| `DELIVERED` | Package delivered to customer |
| `COMPLETED` | Order completed (customer confirmed) |
| `CANCELLED` | Order cancelled |
| `RETURNED` | Items returned by customer |
| `REFUNDED` | Refund processed |

**Status Transitions:**
```
PENDING_PAYMENT → CONFIRMED, CANCELLED
CONFIRMED → PROCESSING, CANCELLED
PROCESSING → SHIPPED
SHIPPED → IN_TRANSIT
IN_TRANSIT → DELIVERED
DELIVERED → COMPLETED, RETURNED
RETURNED → REFUNDED
CANCELLED → REFUNDED
```

---

## 📦 ORDER ENDPOINTS

### 1. POST /orders - Create Order

**Auth Required:** Bearer Token (CUSTOMER only)

**Description:** Creates an order from the customer's cart. Validates cart contents, addresses, stock availability. Applies coupon if provided. Creates order items as snapshots of current products/prices. Reserves inventory. Clears cart. Returns order ID and payment required flag.

**Request:**
```http
POST {{base_url}}/orders
Authorization: Bearer {{access_token}}
Content-Type: application/json

{
  "deliveryAddressId": "abc123-address-uuid",
  "billingAddressId": "abc123-address-uuid",
  "shippingMethod": "STANDARD",
  "couponCode": "SAVE10"
}
```

**Request Body:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| deliveryAddressId | UUID | Yes | Customer's delivery address ID |
| billingAddressId | UUID | No | Billing address (defaults to delivery address) |
| shippingMethod | Enum | Yes | `STANDARD`, `EXPRESS`, `PICKUP` |
| couponCode | string | No | Coupon code (1-20 chars) |

**Shipping Methods:**
- `STANDARD` - Standard shipping
- `EXPRESS` - Express/Expedited shipping
- `PICKUP` - In-store pickup

**Response (201):**
```json
{
  "success": true,
  "data": {
    "orderId": "550e8400-e29b-41d4-a716-446655440000",
    "status": "PENDING_PAYMENT",
    "totalAmount": 31.88,
    "paymentRequired": true,
    "order": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "customerId": "ad1c00e0-c26c-4121-92c5-6b8d4431b36b",
      "subtotal": 25.98,
      "taxAmount": 0.91,
      "shippingCost": 4.99,
      "discountAmount": 0,
      "totalAmount": 31.88,
      "status": "PENDING_PAYMENT",
      "paymentStatus": "PENDING",
      "deliveryAddress": {
        "id": "abc123-address-uuid",
        "firstName": "John",
        "lastName": "Doe",
        "street": "123 Main St",
        "city": "Berlin",
        "postalCode": "10115",
        "country": "DE"
      },
      "billingAddress": {...},
      "shippingMethod": "STANDARD",
      "couponCode": "SAVE10",
      "items": [
        {
          "id": "item-uuid-1",
          "productId": "fe655426-1907-451b-aca5-ab111ddb33f6",
          "quantity": 2,
          "unitPrice": 12.99,
          "totalPrice": 25.98,
          "product": {
            "id": "fe655426-1907-451b-aca5-ab111ddb33f6",
            "name": "Teff Flour White",
            "nameEn": "Teff Flour White",
            "nameDe": "Teffmehl Weiß",
            "sku": "TEFF-W-001",
            "images": ["/uploads/products/teff-1.jpg"]
          }
        }
      ],
      "payment": {
        "id": "pay-uuid",
        "status": "PENDING",
        "amount": 31.88
      },
      "customer": {
        "id": "ad1c00e0-c26c-4121-92c5-6b8d4431b36b",
        "email": "john@example.com",
        "firstName": "John",
        "lastName": "Doe"
      },
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T10:30:00.000Z"
    }
  },
  "message": "Order created successfully"
}
```

**Error - Empty Cart (409):**
```json
{
  "success": false,
  "error": "Cannot create order with empty cart",
  "code": "CONFLICT"
}
```

**Error - Address Not Found (404):**
```json
{
  "success": false,
  "error": "Delivery address not found",
  "code": "NOT_FOUND"
}
```

**Error - Insufficient Stock (409):**
```json
{
  "success": false,
  "error": "Insufficient stock for Teff Flour White. Available: 5, Requested: 10",
  "code": "CONFLICT"
}
```

**Error - Invalid Coupon (409):**
```json
{
  "success": false,
  "error": "Invalid coupon code",
  "code": "CONFLICT"
}
```

---

### 2. GET /orders/my - Get Customer's Orders

**Auth Required:** Bearer Token (CUSTOMER only)

**Description:** Retrieves paginated list of the authenticated customer's orders with items and payment status.

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| page | number | 1 | Page number |
| limit | number | 20 | Items per page (max 100) |
| status | Enum | - | Filter by status |

**Request:**
```http
GET {{base_url}}/orders/my?page=1&limit=20&status=CONFIRMED
Authorization: Bearer {{access_token}}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "orders": [
      {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "status": "CONFIRMED",
        "paymentStatus": "COMPLETED",
        "subtotal": 25.98,
        "totalAmount": 31.88,
        "items": [
          {
            "id": "item-uuid-1",
            "quantity": 2,
            "unitPrice": 12.99,
            "totalPrice": 25.98,
            "product": {
              "id": "fe655426-1907-451b-aca5-ab111ddb33f6",
              "name": "Teff Flour White",
              "nameEn": "Teff Flour White",
              "nameDe": "Teffmehl Weiß",
              "sku": "TEFF-W-001",
              "images": ["/uploads/products/teff-1.jpg"]
            }
          }
        ],
        "payment": {
          "id": "pay-uuid",
          "status": "COMPLETED"
        },
        "createdAt": "2024-01-15T10:30:00.000Z",
        "updatedAt": "2024-01-15T10:30:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 5,
      "pages": 1
    }
  }
}
```

---

### 3. GET /orders - Get All Orders (Admin)

**Auth Required:** Bearer Token (ADMIN only)

**Description:** Retrieves paginated list of all orders with advanced filtering. Admin can see all customer orders.

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| page | number | 1 | Page number |
| limit | number | 20 | Items per page (max 100) |
| status | Enum | - | Filter by order status |
| customerId | UUID | - | Filter by customer ID |
| dateFrom | datetime | - | Orders after this date |
| dateTo | datetime | - | Orders before this date |
| minAmount | number | - | Minimum order amount |
| search | string | - | Search in order ID, customer name |

**Request:**
```http
GET {{base_url}}/orders?page=1&limit=20&status=PENDING_PAYMENT&minAmount=50
Authorization: Bearer {{admin_token}}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "orders": [
      {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "customerId": "ad1c00e0-c26c-4121-92c5-6b8d4431b36b",
        "status": "PENDING_PAYMENT",
        "paymentStatus": "PENDING",
        "subtotal": 25.98,
        "taxAmount": 0.91,
        "shippingCost": 4.99,
        "discountAmount": 0,
        "totalAmount": 31.88,
        "deliveryAddress": {...},
        "billingAddress": {...},
        "shippingMethod": "STANDARD",
        "couponCode": null,
        "items": [...],
        "payment": {...},
        "customer": {...},
        "createdAt": "2024-01-15T10:30:00.000Z",
        "updatedAt": "2024-01-15T10:30:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 100,
      "pages": 5
    }
  }
}
```

---

### 4. GET /orders/:id - Get Order by ID

**Auth Required:** Bearer Token (CUSTOMER - own orders only, ADMIN - any order)

**Description:** Retrieves detailed order information including items, customer details, payment, shipment, and invoice.

**Request:**
```http
GET {{base_url}}/orders/550e8400-e29b-41d4-a716-446655440000
Authorization: Bearer {{access_token}}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "customerId": "ad1c00e0-c26c-4121-92c5-6b8d4431b36b",
    "subtotal": 25.98,
    "taxAmount": 0.91,
    "shippingCost": 4.99,
    "discountAmount": 0,
    "totalAmount": 31.88,
    "status": "CONFIRMED",
    "paymentStatus": "COMPLETED",
    "deliveryAddress": {
      "id": "abc123-address-uuid",
      "firstName": "John",
      "lastName": "Doe",
      "street": "123 Main St",
      "street2": "Apt 4B",
      "city": "Berlin",
      "state": "Berlin",
      "postalCode": "10115",
      "country": "DE",
      "phone": "+49123456789"
    },
    "billingAddress": {...},
    "shippingMethod": "STANDARD",
    "couponCode": null,
    "items": [
      {
        "id": "item-uuid-1",
        "productId": "fe655426-1907-451b-aca5-ab111ddb33f6",
        "quantity": 2,
        "unitPrice": 12.99,
        "totalPrice": 25.98,
        "product": {
          "id": "fe655426-1907-451b-aca5-ab111ddb33f6",
          "name": "Teff Flour White",
          "nameEn": "Teff Flour White",
          "nameDe": "Teffmehl Weiß",
          "nameAm": "ጤፍ ስኳር",
          "sku": "TEFF-W-001",
          "images": ["/uploads/products/teff-1.jpg"],
          "thumbnailUrl": "/uploads/products/teff-1.jpg"
        }
      }
    ],
    "payment": {
      "id": "pay-uuid",
      "orderId": "550e8400-e29b-41d4-a716-446655440000",
      "amount": 31.88,
      "status": "COMPLETED",
      "method": "STRIPE",
      "createdAt": "2024-01-15T10:30:00.000Z"
    },
    "shipment": {
      "id": "ship-uuid",
      "orderId": "550e8400-e29b-41d4-a716-446655440000",
      "trackingNumber": "DHL123456789",
      "carrier": "DHL",
      "status": "SHIPPED",
      "estimatedDelivery": "2024-01-18T00:00:00.000Z"
    },
    "invoice": {
      "id": "inv-uuid",
      "orderId": "550e8400-e29b-41d4-a716-446655440000",
      "invoiceNumber": "INV-2024-0001",
      "total": 31.88,
      "status": "ISSUED"
    },
    "customer": {
      "id": "ad1c00e0-c26c-4121-92c5-6b8d4431b36b",
      "email": "john@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "phone": "+49123456789"
    },
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T11:30:00.000Z"
  }
}
```

**Error - Not Found (404):**
```json
{
  "success": false,
  "error": "Order not found",
  "code": "NOT_FOUND"
}
```

**Error - Forbidden (403):**
```json
{
  "success": false,
  "error": "Access denied - not your order",
  "code": "FORBIDDEN"
}
```

---

### 5. PUT /orders/:id/status - Update Order Status

**Auth Required:** Bearer Token (ADMIN or VENDOR)

**Description:** Updates order status following valid status transition rules. Triggers inventory actions (deduct/restore stock) based on status change.

**Status Transition Rules:**
- `PENDING_PAYMENT` → `CONFIRMED` (deducts stock), `CANCELLED`
- `CONFIRMED` → `PROCESSING`, `CANCELLED`
- `PROCESSING` → `SHIPPED`
- `SHIPPED` → `IN_TRANSIT`
- `IN_TRANSIT` → `DELIVERED`
- `DELIVERED` → `COMPLETED`, `RETURNED`
- `RETURNED` → `REFUNDED`
- `CANCELLED` → `REFUNDED`

**Request:**
```http
PUT {{base_url}}/orders/550e8400-e29b-41d4-a716-446655440000/status
Authorization: Bearer {{admin_token}}
Content-Type: application/json

{
  "status": "CONFIRMED",
  "notes": "Payment received via Stripe"
}
```

**Request Body:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| status | Enum | Yes | New order status |
| notes | string | No | Optional notes (max 500 chars) |

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "status": "CONFIRMED",
    "items": [...],
    "customer": {...},
    "updatedAt": "2024-01-15T11:30:00.000Z"
  },
  "message": "Order status updated successfully"
}
```

**Error - Invalid Transition (409):**
```json
{
  "success": false,
  "error": "Invalid status transition from PENDING_PAYMENT to SHIPPED",
  "code": "CONFLICT"
}
```

---

### 6. POST /orders/:id/cancel - Cancel Order

**Auth Required:** Bearer Token (CUSTOMER - own orders only, ADMIN - any order)

**Description:** Cancels an order. Customers can only cancel `PENDING_PAYMENT` or `CONFIRMED` orders. Admin can cancel any order. Releases inventory reservations and initiates refund if payment was completed.

**Request:**
```http
POST {{base_url}}/orders/550e8400-e29b-41d4-a716-446655440000/cancel
Authorization: Bearer {{access_token}}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "status": "CANCELLED",
    "items": [...],
    "customer": {...},
    "updatedAt": "2024-01-15T11:30:00.000Z"
  },
  "message": "Order cancelled successfully"
}
```

**Error - Cannot Cancel (409) - Customer:**
```json
{
  "success": false,
  "error": "This order cannot be cancelled at this stage",
  "code": "CONFLICT"
}
```

**Error - Not Your Order (403):**
```json
{
  "success": false,
  "error": "You can only cancel your own orders",
  "code": "FORBIDDEN"
}
```

---

### 7. GET /orders/:id/tracking - Get Order Tracking

**Auth Required:** Bearer Token (CUSTOMER - own orders only, ADMIN - any order)

**Description:** Retrieves order tracking information with timeline of status changes, shipment details, and estimated delivery.

**Request:**
```http
GET {{base_url}}/orders/550e8400-e29b-41d4-a716-446655440000/tracking
Authorization: Bearer {{access_token}}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "orderId": "550e8400-e29b-41d4-a716-446655440000",
    "status": "SHIPPED",
    "timeline": [
      {
        "status": "PENDING_PAYMENT",
        "timestamp": "2024-01-15T10:30:00.000Z",
        "notes": "Order placed successfully"
      },
      {
        "status": "CONFIRMED",
        "timestamp": "2024-01-15T10:35:00.000Z",
        "notes": "Payment confirmed, order processing started"
      },
      {
        "status": "SHIPPED",
        "timestamp": "2024-01-16T08:00:00.000Z",
        "notes": "Shipment created - Tracking: DHL123456789"
      }
    ],
    "shipment": {
      "trackingNumber": "DHL123456789",
      "carrier": "DHL",
      "status": "IN_TRANSIT",
      "estimatedDelivery": "2024-01-18T00:00:00.000Z"
    },
    "items": [
      {
        "id": "item-uuid-1",
        "quantity": 2,
        "product": {
          "id": "fe655426-1907-451b-aca5-ab111ddb33f6",
          "name": "Teff Flour White",
          "sku": "TEFF-W-001",
          "images": ["/uploads/products/teff-1.jpg"]
        }
      }
    ],
    "customer": {
      "id": "ad1c00e0-c26c-4121-92c5-6b8d4431b36b",
      "email": "john@example.com",
      "firstName": "John",
      "lastName": "Doe"
    }
  }
}
```

**Response - No Shipment Yet:**
```json
{
  "success": true,
  "data": {
    "orderId": "550e8400-e29b-41d4-a716-446655440000",
    "status": "CONFIRMED",
    "timeline": [
      {
        "status": "PENDING_PAYMENT",
        "timestamp": "2024-01-15T10:30:00.000Z",
        "notes": "Order placed successfully"
      },
      {
        "status": "CONFIRMED",
        "timestamp": "2024-01-15T10:35:00.000Z",
        "notes": "Payment confirmed, order processing started"
      }
    ],
    "shipment": null,
    "items": [...],
    "customer": {...}
  }
}
```

---

### 8. POST /orders/:id/notes - Add Order Note (Admin)

**Auth Required:** Bearer Token (ADMIN only)

**Description:** Adds an administrative note to an order. Creates audit log entry. Note text is not stored directly but action is logged.

**Request:**
```http
POST {{base_url}}/orders/550e8400-e29b-41d4-a716-446655440000/notes
Authorization: Bearer {{admin_token}}
Content-Type: application/json

{
  "note": "Customer requested gift wrapping. Contacted via email."
}
```

**Request Body:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| note | string | Yes | Note text (1-1000 chars) |

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "status": "CONFIRMED",
    "items": [...],
    "customer": {...},
    ...
  },
  "message": "Note added successfully"
}
```

---

## 📊 ORDER CALCULATION

The order automatically calculates:

| Field | Calculation |
|-------|-------------|
| **Subtotal** | Sum of (unitPrice × quantity) for all items |
| **Tax Amount** | 7% on food/spices (vatRate ≤ 0.1), 19% on general items |
| **Shipping Cost** | €0 if subtotal ≥ €50, else €4.99 |
| **Discount Amount** | From coupon (if applied) |
| **Total Amount** | Subtotal + Tax + Shipping - Discount |

---

## 🐛 COMMON ERRORS

### 400 - Validation Error
```json
{
  "success": false,
  "error": "Invalid request body",
  "code": "VALIDATION_ERROR",
  "details": [
    "deliveryAddressId: Invalid delivery address ID",
    "shippingMethod: Invalid shipping method"
  ]
}
```

### 401 - Unauthorized
```json
{
  "success": false,
  "error": "Access token required",
  "code": "UNAUTHORIZED"
}
```

### 403 - Forbidden
```json
{
  "success": false,
  "error": "Customer access required",
  "code": "FORBIDDEN"
}
```

### 404 - Not Found
```json
{
  "success": false,
  "error": "Order not found",
  "code": "NOT_FOUND"
}
```

### 404 - Address Not Found
```json
{
  "success": false,
  "error": "Delivery address not found",
  "code": "NOT_FOUND"
}
```

### 409 - Conflict (Stock/Transition)
```json
{
  "success": false,
  "error": "Invalid status transition from PENDING_PAYMENT to SHIPPED",
  "code": "CONFLICT"
}
```

### 409 - Cannot Cancel
```json
{
  "success": false,
  "error": "This order cannot be cancelled at this stage",
  "code": "CONFLICT"
}
```

---

## 🔧 POSTMAN WORKFLOWS

### Complete Order Workflow (Customer)

```
1. POST /auth/login (as Customer)
   → Save access_token

2. GET /cart
   → Verify cart has items

3. GET /users/addresses
   → Get delivery/billing address IDs

4. POST /orders (Create Order)
   {
     "deliveryAddressId": "address-uuid",
     "billingAddressId": "address-uuid",
     "shippingMethod": "STANDARD",
     "couponCode": "SAVE10"
   }
   → Returns orderId, totalAmount, paymentRequired: true
   → Save orderId for payment

5. POST /payments/create-checkout-session (Stripe)
   {
     "orderId": "order-uuid",
     "successUrl": "http://localhost:3000/order-success",
     "cancelUrl": "http://localhost:3000/order-cancel"
   }
   → Returns checkout URL, redirect customer

6. GET /orders/my
   → Check order status after payment

7. GET /orders/:id/tracking
   → Track order shipment

8. POST /orders/:id/cancel (if needed)
   → Cancel order before shipment
```

### Order Management Workflow (Admin)

```
1. GET /orders
   → List all orders with filters

2. GET /orders/:id
   → View order details

3. PUT /orders/:id/status
   {
     "status": "CONFIRMED",
     "notes": "Payment verified"
   }
   → Confirm order (triggers stock deduction)

4. PUT /orders/:id/status
   {
     "status": "PROCESSING"
   }
   → Start preparing order

5. PUT /orders/:id/status
   {
     "status": "SHIPPED"
   }
   → Mark as shipped (requires shipment record)

6. POST /orders/:id/notes
   {
     "note": "Customer called about delivery time"
   }
   → Add admin note

7. POST /orders/:id/cancel
   → Cancel problematic order (triggers refund if paid)
```

---

## 📋 VALIDATION RULES

### Create Order
| Field | Rules |
|-------|-------|
| deliveryAddressId | Valid UUID, must belong to customer |
| billingAddressId | Valid UUID, optional, defaults to delivery address |
| shippingMethod | Enum: `STANDARD`, `EXPRESS`, `PICKUP` |
| couponCode | 1-20 chars, optional |

### Update Status
| Field | Rules |
|-------|-------|
| status | Valid OrderStatus enum value |
| notes | Max 500 chars, optional |

### Get Orders (Query)
| Field | Rules |
|-------|-------|
| page | Integer, min 1, default 1 |
| limit | Integer, 1-100, default 20 |
| status | Valid OrderStatus, optional |
| customerId | Valid UUID, optional (Admin) |
| dateFrom | ISO datetime, optional |
| dateTo | ISO datetime, optional |
| minAmount | Positive number, optional |
| search | Max 100 chars, optional |

### Add Note
| Field | Rules |
|-------|-------|
| note | 1-1000 chars, required |

---

## 💡 IMPORTANT NOTES

1. **Order Items Snapshot:** Product details are stored at order creation time. Future price changes don't affect existing orders.

2. **Inventory Management:**
   - Stock is reserved when order is created
   - Stock is deducted when order is confirmed
   - Stock is restored when order is cancelled

3. **Payment Flow:**
   - Order starts as `PENDING_PAYMENT`
   - After payment confirmation, status changes to `CONFIRMED`
   - Payment status tracks separately (`PENDING` → `COMPLETED` → `REFUNDED`)

4. **Shipping Methods:**
   - `STANDARD`: Regular shipping (free over €50, else €4.99)
   - `EXPRESS`: Faster shipping (pricing may vary)
   - `PICKUP`: In-store pickup (no shipping cost)

5. **Coupon Usage:**
   - Coupon is validated at order creation
   - If valid, discount is applied and coupon usage count increases
   - Coupon code is stored on order for reference

6. **Cancellation Rules:**
   - Customers: Can cancel only `PENDING_PAYMENT` or `CONFIRMED` orders
   - Admin: Can cancel any order at any stage
   - Cancelled paid orders trigger refund process

7. **Audit Logging:**
   - All order status changes are logged
   - Admin actions (notes, cancellations) are tracked
   - Payment events are recorded
