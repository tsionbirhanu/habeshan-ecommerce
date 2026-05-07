# Cart Module API - Postman Endpoints

## Base URL
```
{{base_url}}/cart
```

**Set `base_url` = `http://localhost:3001/api`**

---

## 🔐 AUTHENTICATION & ROLES

**All cart endpoints require:**
- **Authentication:** Bearer Token
- **Role:** CUSTOMER only

**Headers:**
```
Authorization: Bearer {{access_token}}
Content-Type: application/json
```

---

## 📦 CART ENDPOINTS

### 1. GET /cart - Get Customer's Cart

**Auth Required:** Bearer Token (CUSTOMER)

**Description:** Retrieves the customer's cart with all items, product details, calculated totals (subtotal, tax, shipping), and warnings (price changes, stock issues, unavailable products).

**Request:**
```http
GET {{base_url}}/cart
Authorization: Bearer {{access_token}}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "customerId": "ad1c00e0-c26c-4121-92c5-6b8d4431b36b",
    "items": [
      {
        "id": "item-uuid-1",
        "productId": "fe655426-1907-451b-aca5-ab111ddb33f6",
        "quantity": 2,
        "priceAtAdd": 12.99,
        "addedAt": "2024-01-15T10:30:00.000Z",
        "product": {
          "id": "fe655426-1907-451b-aca5-ab111ddb33f6",
          "name": "Teff Flour White",
          "nameEn": "Teff Flour White",
          "nameDe": "Teffmehl Weiß",
          "nameAm": "ጤፍ ስኳር",
          "sku": "TEFF-W-001",
          "price": 12.99,
          "vatRate": 0.19,
          "stockQuantity": 50,
          "status": "ACTIVE",
          "category": {
            "id": "d1c9b64f-61df-4f05-a4f7-49609f0577a0",
            "name": "Flour",
            "nameEn": "Flour",
            "nameDe": "Mehl",
            "nameAm": "ዱቄት"
          },
          "images": ["/uploads/products/teff-1.jpg"],
          "thumbnailUrl": "/uploads/products/teff-1.jpg"
        },
        "currentPrice": 12.99,
        "totalPrice": 25.98,
        "warnings": []
      }
    ],
    "totals": {
      "subtotal": 25.98,
      "taxBreakdown": {
        "food": 0.91,
        "general": 0
      },
      "totalTax": 0.91,
      "shippingCost": 4.99,
      "discount": 0,
      "total": 31.88
    },
    "warnings": [],
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

**Response - Empty Cart:**
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "customerId": "ad1c00e0-c26c-4121-92c5-6b8d4431b36b",
    "items": [],
    "totals": {
      "subtotal": 0,
      "taxBreakdown": {
        "food": 0,
        "general": 0
      },
      "totalTax": 0,
      "shippingCost": 0,
      "discount": 0,
      "total": 0
    },
    "warnings": [],
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

**Note:** Cart is auto-created if it doesn't exist.

---

### 2. POST /cart/add - Add Product to Cart

**Auth Required:** Bearer Token (CUSTOMER)

**Description:** Adds a product to cart. If product already exists, quantity is increased. Validates product availability, active status, and stock.

**Request:**
```http
POST {{base_url}}/cart/add
Authorization: Bearer {{access_token}}
Content-Type: application/json

{
  "productId": "fe655426-1907-451b-aca5-ab111ddb33f6",
  "quantity": 2
}
```

**Request Body:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| productId | UUID | Yes | Product ID to add |
| quantity | integer | Yes | Quantity (1-999) |

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "customerId": "ad1c00e0-c26c-4121-92c5-6b8d4431b36b",
    "items": [...],
    "totals": {...},
    "warnings": []
  },
  "message": "Product added to cart"
}
```

**Error - Product Not Found (404):**
```json
{
  "success": false,
  "error": "Product not found",
  "code": "NOT_FOUND"
}
```

**Error - Product Not Available (409):**
```json
{
  "success": false,
  "error": "Product is not available",
  "code": "CONFLICT"
}
```

**Error - Insufficient Stock (409):**
```json
{
  "success": false,
  "error": "Insufficient stock. Available: 50, Requested: 100",
  "code": "CONFLICT"
}
```

---

### 3. PUT /cart/items/:id - Update Cart Item Quantity

**Auth Required:** Bearer Token (CUSTOMER)

**Description:** Updates quantity of a specific cart item. Set quantity to 0 to remove item. Validates stock availability.

**Request:**
```http
PUT {{base_url}}/cart/items/item-uuid-1
Authorization: Bearer {{access_token}}
Content-Type: application/json

{
  "quantity": 5
}
```

**Request Body:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| quantity | integer | Yes | New quantity (0-999) |

**Response (200) - Updated:**
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "customerId": "ad1c00e0-c26c-4121-92c5-6b8d4431b36b",
    "items": [...],
    "totals": {...},
    "warnings": []
  },
  "message": "Cart item updated"
}
```

**Response (200) - Quantity 0 (Item Removed):**
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "customerId": "ad1c00e0-c26c-4121-92c5-6b8d4431b36b",
    "items": [...], // Item removed
    "totals": {...},
    "warnings": []
  },
  "message": "Cart item updated"
}
```

**Error - Cart Item Not Found (404):**
```json
{
  "success": false,
  "error": "Cart item not found",
  "code": "NOT_FOUND"
}
```

**Error - Insufficient Stock (409):**
```json
{
  "success": false,
  "error": "Insufficient stock. Available: 50, Requested: 100",
  "code": "CONFLICT"
}
```

---

### 4. DELETE /cart/items/:id - Remove Item from Cart

**Auth Required:** Bearer Token (CUSTOMER)

**Description:** Removes a specific item from cart entirely.

**Request:**
```http
DELETE {{base_url}}/cart/items/item-uuid-1
Authorization: Bearer {{access_token}}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "customerId": "ad1c00e0-c26c-4121-92c5-6b8d4431b36b",
    "items": [...], // Item removed
    "totals": {...},
    "warnings": []
  },
  "message": "Item removed from cart"
}
```

**Error - Cart Item Not Found (404):**
```json
{
  "success": false,
  "error": "Cart item not found",
  "code": "NOT_FOUND"
}
```

---

### 5. DELETE /cart - Clear Entire Cart

**Auth Required:** Bearer Token (CUSTOMER)

**Description:** Removes all items from cart. Cart itself is kept but emptied.

**Request:**
```http
DELETE {{base_url}}/cart
Authorization: Bearer {{access_token}}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Cart cleared"
}
```

---

### 6. POST /cart/validate - Validate Cart Contents

**Auth Required:** Bearer Token (CUSTOMER)

**Description:** Validates cart for checkout. Checks: product availability, stock levels, price changes. Returns validation status and any issues.

**Request:**
```http
POST {{base_url}}/cart/validate
Authorization: Bearer {{access_token}}
```

**Response (200) - Valid Cart:**
```json
{
  "success": true,
  "data": {
    "valid": true,
    "issues": [],
    "cart": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "items": [...],
      "totals": {...},
      "warnings": []
    }
  }
}
```

**Response (200) - Invalid Cart (Has Issues):**
```json
{
  "success": true,
  "data": {
    "valid": false,
    "issues": [
      {
        "productId": "fe655426-1907-451b-aca5-ab111ddb33f6",
        "issue": "Product is no longer available",
        "severity": "error"
      },
      {
        "productId": "02f7d9cf-f63c-4546-ac40-26d328809e14",
        "issue": "Insufficient stock. Available: 5, Requested: 10",
        "severity": "error"
      },
      {
        "productId": "abc123...",
        "issue": "Price has changed since added to cart",
        "severity": "warning"
      }
    ],
    "cart": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "items": [...],
      "totals": {...},
      "warnings": [...]
    }
  }
}
```

**Issue Severity:**
- `error` - Blocks checkout (unavailable product, insufficient stock)
- `warning` - Doesn't block but user should know (price changed)

---

### 7. POST /cart/coupon - Apply Coupon Code

**Auth Required:** Bearer Token (CUSTOMER)

**Description:** Validates and applies a coupon code. Returns discount amount if valid.

**Request:**
```http
POST {{base_url}}/cart/coupon
Authorization: Bearer {{access_token}}
Content-Type: application/json

{
  "couponCode": "SAVE10",
  "orderTotal": 100.00
}
```

**Request Body:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| couponCode | string | Yes | Coupon code (1-20 chars) |
| orderTotal | number | Yes | Current order total |

**Response (200) - Valid Coupon:**
```json
{
  "success": true,
  "data": {
    "valid": true,
    "discount": 10.00,
    "message": "Coupon applied successfully",
    "couponType": "PERCENTAGE",
    "couponValue": "10"
  }
}
```

**Response (200) - Invalid Coupon:**
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

**Response (200) - Expired Coupon:**
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

**Response (200) - Minimum Order Not Met:**
```json
{
  "success": true,
  "data": {
    "valid": false,
    "discount": 0,
    "message": "Minimum order value of 50 required"
  }
}
```

---

## 📊 CART TOTALS CALCULATION

The cart automatically calculates:

| Field | Calculation |
|-------|-------------|
| **Subtotal** | Sum of (price × quantity) for all items |
| **Food Tax (7%)** | 7% on food/spices (vatRate ≤ 0.1) |
| **General Tax (19%)** | 19% on other items (vatRate > 0.1) |
| **Total Tax** | Food tax + General tax |
| **Shipping** | €0 if subtotal ≥ €50, else €4.99 |
| **Discount** | From coupon (if applied) |
| **Total** | Subtotal + Total Tax + Shipping - Discount |

---

## ⚠️ CART WARNINGS

Warnings appear when:

| Warning | Cause |
|---------|-------|
| "Product is no longer available" | Product status changed to DRAFT/DISCONTINUED |
| "Insufficient stock" | Requested quantity > available stock |
| "Price changed since added to cart" | Product price changed after adding to cart |

---

## 🐛 COMMON ERRORS

### 401 - Unauthorized
```json
{
  "success": false,
  "error": "Access token required",
  "code": "UNAUTHORIZED"
}
```

### 403 - Forbidden (Not Customer)
```json
{
  "success": false,
  "error": "Customer access required",
  "code": "FORBIDDEN"
}
```

### 400 - Validation Error
```json
{
  "success": false,
  "error": "Invalid request body",
  "code": "VALIDATION_ERROR",
  "details": [
    "productId: Invalid product ID",
    "quantity: Quantity must be positive"
  ]
}
```

### 404 - Product/Cart Item Not Found
```json
{
  "success": false,
  "error": "Product not found",
  "code": "NOT_FOUND"
}
```

### 409 - Conflict (Stock/Availability)
```json
{
  "success": false,
  "error": "Insufficient stock. Available: 10, Requested: 20",
  "code": "CONFLICT"
}
```

---

## 🔧 POSTMAN WORKFLOWS

### Complete Shopping Workflow

```
1. POST /auth/login (as Customer)
   → Save access_token

2. GET /products
   → Browse products, get productId

3. POST /cart/add
   {
     "productId": "fe655426-1907-451b-aca5-ab111ddb33f6",
     "quantity": 2
   }
   → Product added to cart

4. GET /cart
   → View cart with totals

5. POST /cart/add (another product)
   → Add more items

6. PUT /cart/items/:id
   { "quantity": 3 }
   → Update quantity

7. POST /cart/validate
   → Check cart is ready for checkout

8. POST /cart/coupon
   {
     "couponCode": "SAVE10",
     "orderTotal": 50.00
   }
   → Apply discount

9. DELETE /cart/items/:id (if needed)
   → Remove unwanted item

10. DELETE /cart (if abandoning)
    → Clear cart entirely
```

---

## 📋 VALIDATION RULES

### Add to Cart
| Field | Rules |
|-------|-------|
| productId | Valid UUID format |
| quantity | Integer, 1-999, positive |

### Update Cart Item
| Field | Rules |
|-------|-------|
| quantity | Integer, 0-999, non-negative |

### Apply Coupon
| Field | Rules |
|-------|-------|
| couponCode | 1-20 characters, required |
| orderTotal | Positive number, required |

---

## 💡 IMPORTANT NOTES

1. **Cart Persistence:** Cart is linked to customer account and persists across sessions
2. **Auto-Create:** Cart is automatically created on first `GET /cart` or `POST /cart/add`
3. **Price Lock:** `priceAtAdd` is stored - if product price changes, warning is shown but original price is kept
4. **Stock Check:** Stock is checked at add/update time, not continuously
5. **Tax Calculation:** Based on product `vatRate` (7% for food/spices, 19% for general)
6. **Shipping:** Free for orders €50+, otherwise €4.99
7. **Coupon:** Does not persist in cart - must be applied during checkout
