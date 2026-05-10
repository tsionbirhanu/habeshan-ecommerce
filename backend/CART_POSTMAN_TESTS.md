# Cart Module - Postman Test Collection

**Base URL:** `http://localhost:3001/api/cart`  
**Authentication:** Required (Bearer Token - CUSTOMER role only)  
**Total Endpoints:** 7

---

## 1. Get Customer Cart

**Endpoint:** `GET /api/cart`

**Description:** Retrieve the current customer's cart with all items, calculations, and warnings.

**Authentication:** Bearer Token (CUSTOMER)

**Headers:**

```
Authorization: Bearer {accessToken}
Content-Type: application/json
```

**Request Body:** None

**Response - Success (200):**

```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "customerId": "123e4567-e89b-12d3-a456-426614174000",
    "items": [
      {
        "id": "item-uuid-001",
        "productId": "prod-uuid-001",
        "quantity": 2,
        "priceAtAdd": 29.99,
        "addedAt": "2026-05-08T10:30:00Z",
        "product": {
          "id": "prod-uuid-001",
          "name": "Injera (1kg)",
          "nameEn": "Injera (1kg)",
          "nameDe": "Injera (1kg)",
          "nameAm": "ኢንጄራ",
          "sku": "INJ-001",
          "price": 29.99,
          "vatRate": 0.07,
          "stockQuantity": 50,
          "status": "ACTIVE",
          "category": {
            "id": "cat-uuid-001",
            "name": "Grains",
            "nameEn": "Grains",
            "nameDe": "Getreide"
          },
          "images": ["https://cdn.example.com/injera1.jpg"],
          "thumbnailUrl": "https://cdn.example.com/injera1-thumb.jpg"
        },
        "currentPrice": 29.99,
        "totalPrice": 59.98,
        "warnings": []
      },
      {
        "id": "item-uuid-002",
        "productId": "prod-uuid-002",
        "quantity": 1,
        "priceAtAdd": 15.5,
        "addedAt": "2026-05-08T11:00:00Z",
        "product": {
          "id": "prod-uuid-002",
          "name": "Berbere Spice Mix (500g)",
          "nameEn": "Berbere Spice Mix (500g)",
          "nameDe": "Berbere Gewürzmischung (500g)",
          "sku": "BER-001",
          "price": 18.99,
          "vatRate": 0.07,
          "stockQuantity": 100,
          "status": "ACTIVE",
          "category": {
            "id": "cat-uuid-002",
            "name": "Spices",
            "nameEn": "Spices",
            "nameDe": "Gewürze"
          },
          "images": ["https://cdn.example.com/berbere.jpg"],
          "thumbnailUrl": "https://cdn.example.com/berbere-thumb.jpg"
        },
        "currentPrice": 18.99,
        "totalPrice": 18.99,
        "warnings": ["Price changed since added to cart"]
      }
    ],
    "totals": {
      "subtotal": 78.97,
      "taxBreakdown": {
        "food": 5.53,
        "general": 0.0
      },
      "totalTax": 5.53,
      "shippingCost": 0.0,
      "discount": 0,
      "total": 84.5
    },
    "warnings": ["Price changed since added to cart"],
    "createdAt": "2026-05-01T12:00:00Z",
    "updatedAt": "2026-05-08T11:00:00Z"
  }
}
```

**Response - Empty Cart (200):**

```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "customerId": "123e4567-e89b-12d3-a456-426614174000",
    "items": [],
    "totals": {
      "subtotal": 0,
      "taxBreakdown": {
        "food": 0,
        "general": 0
      },
      "totalTax": 0,
      "shippingCost": 4.99,
      "discount": 0,
      "total": 4.99
    },
    "warnings": [],
    "createdAt": "2026-05-01T12:00:00Z",
    "updatedAt": "2026-05-08T11:00:00Z"
  }
}
```

**Response - Error (401):**

```json
{
  "success": false,
  "error": "No token provided",
  "code": "INVALID_TOKEN"
}
```

---

## 2. Add Product to Cart

**Endpoint:** `POST /api/cart/add`

**Description:** Add a product to the customer's cart. If product already exists, quantity is incremented.

**Authentication:** Bearer Token (CUSTOMER)

**Headers:**

```
Authorization: Bearer {accessToken}
Content-Type: application/json
```

**Request Body:**

```json
{
  "productId": "prod-uuid-001",
  "quantity": 2
}
```

**Validation Rules:**

- `productId`: Must be valid UUID format
- `quantity`: Must be positive integer, max 999

**Response - Success (200):**

```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "customerId": "123e4567-e89b-12d3-a456-426614174000",
    "items": [
      {
        "id": "item-uuid-001",
        "productId": "prod-uuid-001",
        "quantity": 2,
        "priceAtAdd": 29.99,
        "addedAt": "2026-05-08T10:30:00Z",
        "product": {
          "id": "prod-uuid-001",
          "name": "Injera (1kg)",
          "nameEn": "Injera (1kg)",
          "nameDe": "Injera (1kg)",
          "sku": "INJ-001",
          "price": 29.99,
          "vatRate": 0.07,
          "stockQuantity": 48,
          "status": "ACTIVE",
          "category": {
            "id": "cat-uuid-001",
            "name": "Grains",
            "nameEn": "Grains",
            "nameDe": "Getreide"
          },
          "images": ["https://cdn.example.com/injera1.jpg"]
        },
        "currentPrice": 29.99,
        "totalPrice": 59.98,
        "warnings": []
      }
    ],
    "totals": {
      "subtotal": 59.98,
      "taxBreakdown": {
        "food": 4.2,
        "general": 0
      },
      "totalTax": 4.2,
      "shippingCost": 0.0,
      "discount": 0,
      "total": 64.18
    },
    "warnings": [],
    "createdAt": "2026-05-01T12:00:00Z",
    "updatedAt": "2026-05-08T10:30:00Z"
  },
  "message": "Product added to cart"
}
```

**Response - Invalid Quantity (400):**

```json
{
  "success": false,
  "error": "Quantity must be positive",
  "code": "VALIDATION_ERROR"
}
```

**Response - Product Not Found (404):**

```json
{
  "success": false,
  "error": "Product not found",
  "code": "NOT_FOUND"
}
```

**Response - Insufficient Stock (409):**

```json
{
  "success": false,
  "error": "Insufficient stock. Available: 5, Requested: 10",
  "code": "CONFLICT"
}
```

**Response - Product Unavailable (409):**

```json
{
  "success": false,
  "error": "Product is not available",
  "code": "CONFLICT"
}
```

---

## 3. Update Cart Item Quantity

**Endpoint:** `PUT /api/cart/items/:id`

**Description:** Update the quantity of an item in the cart. Set quantity to 0 to remove the item.

**Authentication:** Bearer Token (CUSTOMER)

**Path Parameters:**

- `id`: Cart item ID (UUID)

**Headers:**

```
Authorization: Bearer {accessToken}
Content-Type: application/json
```

**Request Body:**

```json
{
  "quantity": 5
}
```

**Validation Rules:**

- `quantity`: Must be non-negative integer, max 999

**Response - Success (200):**

```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "customerId": "123e4567-e89b-12d3-a456-426614174000",
    "items": [
      {
        "id": "item-uuid-001",
        "productId": "prod-uuid-001",
        "quantity": 5,
        "priceAtAdd": 29.99,
        "addedAt": "2026-05-08T10:30:00Z",
        "product": {
          "id": "prod-uuid-001",
          "name": "Injera (1kg)",
          "nameEn": "Injera (1kg)",
          "nameDe": "Injera (1kg)",
          "sku": "INJ-001",
          "price": 29.99,
          "vatRate": 0.07,
          "stockQuantity": 45,
          "status": "ACTIVE",
          "category": {
            "id": "cat-uuid-001",
            "name": "Grains",
            "nameEn": "Grains",
            "nameDe": "Getreide"
          },
          "images": ["https://cdn.example.com/injera1.jpg"]
        },
        "currentPrice": 29.99,
        "totalPrice": 149.95,
        "warnings": []
      }
    ],
    "totals": {
      "subtotal": 149.95,
      "taxBreakdown": {
        "food": 10.5,
        "general": 0
      },
      "totalTax": 10.5,
      "shippingCost": 0.0,
      "discount": 0,
      "total": 160.45
    },
    "warnings": [],
    "createdAt": "2026-05-01T12:00:00Z",
    "updatedAt": "2026-05-08T10:45:00Z"
  },
  "message": "Cart item updated"
}
```

**Response - Item Removed (200) - When quantity = 0:**

```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "customerId": "123e4567-e89b-12d3-a456-426614174000",
    "items": [],
    "totals": {
      "subtotal": 0,
      "taxBreakdown": {
        "food": 0,
        "general": 0
      },
      "totalTax": 0,
      "shippingCost": 4.99,
      "discount": 0,
      "total": 4.99
    },
    "warnings": [],
    "createdAt": "2026-05-01T12:00:00Z",
    "updatedAt": "2026-05-08T10:45:00Z"
  },
  "message": "Cart item updated"
}
```

**Response - Insufficient Stock (409):**

```json
{
  "success": false,
  "error": "Insufficient stock. Available: 3, Requested: 10",
  "code": "CONFLICT"
}
```

**Response - Item Not Found (404):**

```json
{
  "success": false,
  "error": "Cart item not found",
  "code": "NOT_FOUND"
}
```

---

## 4. Remove Item from Cart

**Endpoint:** `DELETE /api/cart/items/:id`

**Description:** Remove a specific item from the customer's cart.

**Authentication:** Bearer Token (CUSTOMER)

**Path Parameters:**

- `id`: Cart item ID (UUID)

**Headers:**

```
Authorization: Bearer {accessToken}
Content-Type: application/json
```

**Request Body:** None

**Response - Success (200):**

```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "customerId": "123e4567-e89b-12d3-a456-426614174000",
    "items": [
      {
        "id": "item-uuid-002",
        "productId": "prod-uuid-002",
        "quantity": 1,
        "priceAtAdd": 15.5,
        "addedAt": "2026-05-08T11:00:00Z",
        "product": {
          "id": "prod-uuid-002",
          "name": "Berbere Spice Mix (500g)",
          "nameEn": "Berbere Spice Mix (500g)",
          "nameDe": "Berbere Gewürzmischung (500g)",
          "sku": "BER-001",
          "price": 18.99,
          "vatRate": 0.07,
          "stockQuantity": 100,
          "status": "ACTIVE",
          "category": {
            "id": "cat-uuid-002",
            "name": "Spices",
            "nameEn": "Spices",
            "nameDe": "Gewürze"
          },
          "images": ["https://cdn.example.com/berbere.jpg"]
        },
        "currentPrice": 18.99,
        "totalPrice": 18.99,
        "warnings": []
      }
    ],
    "totals": {
      "subtotal": 18.99,
      "taxBreakdown": {
        "food": 1.33,
        "general": 0
      },
      "totalTax": 1.33,
      "shippingCost": 4.99,
      "discount": 0,
      "total": 25.31
    },
    "warnings": [],
    "createdAt": "2026-05-01T12:00:00Z",
    "updatedAt": "2026-05-08T11:15:00Z"
  },
  "message": "Item removed from cart"
}
```

**Response - Item Not Found (404):**

```json
{
  "success": false,
  "error": "Cart item not found",
  "code": "NOT_FOUND"
}
```

---

## 5. Clear Entire Cart

**Endpoint:** `DELETE /api/cart`

**Description:** Remove all items from the customer's cart in one operation.

**Authentication:** Bearer Token (CUSTOMER)

**Headers:**

```
Authorization: Bearer {accessToken}
Content-Type: application/json
```

**Request Body:** None

**Response - Success (200):**

```json
{
  "success": true,
  "message": "Cart cleared"
}
```

**Response - Error (401):**

```json
{
  "success": false,
  "error": "No token provided",
  "code": "INVALID_TOKEN"
}
```

---

## 6. Validate Cart Contents

**Endpoint:** `POST /api/cart/validate`

**Description:** Validate all cart items for availability, pricing changes, and stock levels. Identifies errors (critical) and warnings (non-critical).

**Authentication:** Bearer Token (CUSTOMER)

**Headers:**

```
Authorization: Bearer {accessToken}
Content-Type: application/json
```

**Request Body:** None

**Response - Valid Cart (200):**

```json
{
  "success": true,
  "data": {
    "valid": true,
    "issues": [],
    "cart": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "customerId": "123e4567-e89b-12d3-a456-426614174000",
      "items": [
        {
          "id": "item-uuid-001",
          "productId": "prod-uuid-001",
          "quantity": 2,
          "priceAtAdd": 29.99,
          "addedAt": "2026-05-08T10:30:00Z",
          "product": {
            "id": "prod-uuid-001",
            "name": "Injera (1kg)",
            "nameEn": "Injera (1kg)",
            "nameDe": "Injera (1kg)",
            "sku": "INJ-001",
            "price": 29.99,
            "vatRate": 0.07,
            "stockQuantity": 50,
            "status": "ACTIVE",
            "category": {
              "id": "cat-uuid-001",
              "name": "Grains",
              "nameEn": "Grains",
              "nameDe": "Getreide"
            },
            "images": ["https://cdn.example.com/injera1.jpg"]
          },
          "currentPrice": 29.99,
          "totalPrice": 59.98,
          "warnings": []
        }
      ],
      "totals": {
        "subtotal": 59.98,
        "taxBreakdown": {
          "food": 4.2,
          "general": 0
        },
        "totalTax": 4.2,
        "shippingCost": 0.0,
        "discount": 0,
        "total": 64.18
      },
      "warnings": [],
      "createdAt": "2026-05-01T12:00:00Z",
      "updatedAt": "2026-05-08T10:30:00Z"
    }
  }
}
```

**Response - Cart with Issues (200):**

```json
{
  "success": true,
  "data": {
    "valid": false,
    "issues": [
      {
        "productId": "prod-uuid-001",
        "issue": "Product is no longer available",
        "severity": "error"
      },
      {
        "productId": "prod-uuid-002",
        "issue": "Insufficient stock. Available: 2, Requested: 5",
        "severity": "error"
      },
      {
        "productId": "prod-uuid-003",
        "issue": "Price has changed since added to cart",
        "severity": "warning"
      }
    ],
    "cart": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "customerId": "123e4567-e89b-12d3-a456-426614174000",
      "items": [
        {
          "id": "item-uuid-001",
          "productId": "prod-uuid-001",
          "quantity": 2,
          "priceAtAdd": 29.99,
          "addedAt": "2026-05-08T10:30:00Z",
          "product": {
            "id": "prod-uuid-001",
            "name": "Injera (1kg)",
            "nameEn": "Injera (1kg)",
            "nameDe": "Injera (1kg)",
            "sku": "INJ-001",
            "price": 29.99,
            "vatRate": 0.07,
            "stockQuantity": 0,
            "status": "INACTIVE",
            "category": {
              "id": "cat-uuid-001",
              "name": "Grains",
              "nameEn": "Grains",
              "nameDe": "Getreide"
            },
            "images": ["https://cdn.example.com/injera1.jpg"]
          },
          "currentPrice": 29.99,
          "totalPrice": 59.98,
          "warnings": ["Product is no longer available"]
        }
      ],
      "totals": {
        "subtotal": 59.98,
        "taxBreakdown": {
          "food": 4.2,
          "general": 0
        },
        "totalTax": 4.2,
        "shippingCost": 0.0,
        "discount": 0,
        "total": 64.18
      },
      "warnings": ["Product is no longer available"],
      "createdAt": "2026-05-01T12:00:00Z",
      "updatedAt": "2026-05-08T10:30:00Z"
    }
  }
}
```

---

## 7. Apply Coupon Code

**Endpoint:** `POST /api/cart/coupon`

**Description:** Validate and apply a coupon code to the order. Supports both PERCENTAGE and FIXED_AMOUNT discount types.

**Authentication:** Bearer Token (CUSTOMER)

**Headers:**

```
Authorization: Bearer {accessToken}
Content-Type: application/json
```

**Request Body:**

```json
{
  "couponCode": "WELCOME10",
  "orderTotal": 150.0
}
```

**Validation Rules:**

- `couponCode`: Required string, max 20 characters
- `orderTotal`: Required positive number

**Response - Valid Coupon (200):**

```json
{
  "success": true,
  "data": {
    "valid": true,
    "discount": 15.0,
    "message": "Coupon applied successfully",
    "couponType": "PERCENTAGE",
    "couponValue": 10
  }
}
```

**Response - Fixed Amount Coupon (200):**

```json
{
  "success": true,
  "data": {
    "valid": true,
    "discount": 20.0,
    "message": "Coupon applied successfully",
    "couponType": "FIXED_AMOUNT",
    "couponValue": 20
  }
}
```

**Response - Invalid Coupon Code (200):**

```json
{
  "success": true,
  "data": {
    "valid": false,
    "discount": 0,
    "message": "Invalid coupon code"
  }
}
```

**Response - Coupon Expired (200):**

```json
{
  "success": true,
  "data": {
    "valid": false,
    "discount": 0,
    "message": "Coupon has expired"
  }
}
```

**Response - Coupon Not Active (200):**

```json
{
  "success": true,
  "data": {
    "valid": false,
    "discount": 0,
    "message": "Coupon is not active"
  }
}
```

**Response - Coupon Usage Limit Exceeded (200):**

```json
{
  "success": true,
  "data": {
    "valid": false,
    "discount": 0,
    "message": "Coupon usage limit exceeded"
  }
}
```

**Response - Minimum Order Value Not Met (200):**

```json
{
  "success": true,
  "data": {
    "valid": false,
    "discount": 0,
    "message": "Minimum order value of 100.00 required"
  }
}
```

**Response - Invalid Request (400):**

```json
{
  "success": false,
  "error": "Coupon code is required",
  "code": "VALIDATION_ERROR"
}
```

---

## Cart Module Features Summary

| Feature                    | Description                                                       |
| -------------------------- | ----------------------------------------------------------------- |
| **Multi-language Support** | Product names in English, German, and Amharic                     |
| **Tax Calculation**        | Automatic split between food (7% VAT) and general items (19% VAT) |
| **Free Shipping**          | Automatically applied for orders €50+                             |
| **Stock Validation**       | Real-time stock availability checks                               |
| **Price Tracking**         | Monitors price changes since item was added                       |
| **Coupon System**          | Supports percentage and fixed-amount discounts                    |
| **Item Warnings**          | Alerts for unavailable products, price changes, low stock         |
| **Cart Persistence**       | Auto-creates cart if not exists                                   |
| **Quantity Limits**        | Max 999 items per product                                         |

---

## Testing Checklist

- [ ] Get empty cart (create cart if not exists)
- [ ] Add product to new cart
- [ ] Add duplicate product (verify quantity increment)
- [ ] Get cart with multiple items
- [ ] Update item quantity
- [ ] Remove single item from cart
- [ ] Clear entire cart
- [ ] Validate cart with valid items
- [ ] Validate cart with stock issues
- [ ] Apply valid percentage coupon
- [ ] Apply valid fixed-amount coupon
- [ ] Apply invalid coupon code
- [ ] Apply expired coupon
- [ ] Test minimum order value requirement
- [ ] Test coupon usage limit
- [ ] Verify tax breakdown calculation
- [ ] Verify shipping cost calculation
- [ ] Test error handling for unauthorized requests
- [ ] Test validation for invalid product IDs
- [ ] Test validation for negative quantities
