# Cart Module - Quick Reference

## Base URL

```
http://localhost:3001/api/cart
```

## Authentication

- **Required:** Yes (Bearer Token)
- **Role:** CUSTOMER only
- **Token Header:** `Authorization: Bearer {accessToken}`

---

## Quick Endpoint Summary

| Method | Endpoint     | Description            | Request Body                 |
| ------ | ------------ | ---------------------- | ---------------------------- |
| GET    | `/`          | Get customer cart      | None                         |
| POST   | `/add`       | Add product to cart    | `{ productId, quantity }`    |
| PUT    | `/items/:id` | Update item quantity   | `{ quantity }`               |
| DELETE | `/items/:id` | Remove item            | None                         |
| DELETE | `/`          | Clear entire cart      | None                         |
| POST   | `/validate`  | Validate cart contents | None                         |
| POST   | `/coupon`    | Apply coupon code      | `{ couponCode, orderTotal }` |

---

## Key Use Cases

### 1. Customer Adds Product to Cart

```bash
POST /api/cart/add
Content-Type: application/json
Authorization: Bearer {token}

{
  "productId": "prod-uuid-001",
  "quantity": 2
}
```

### 2. Customer Updates Item Quantity

```bash
PUT /api/cart/items/item-uuid-001
Content-Type: application/json
Authorization: Bearer {token}

{
  "quantity": 5
}
```

### 3. Customer Applies Coupon Before Checkout

```bash
POST /api/cart/coupon
Content-Type: application/json
Authorization: Bearer {token}

{
  "couponCode": "WELCOME10",
  "orderTotal": 150.00
}
```

### 4. Validate Cart Before Checkout

```bash
POST /api/cart/validate
Content-Type: application/json
Authorization: Bearer {token}
```

---

## Response Structure

### Success Response

```json
{
  "success": true,
  "data": {
    /* endpoint-specific data */
  },
  "message": "Optional message"
}
```

### Error Response

```json
{
  "success": false,
  "error": "Error description",
  "code": "ERROR_CODE"
}
```

---

## Common Error Codes

| Code                  | HTTP | Description                               |
| --------------------- | ---- | ----------------------------------------- |
| INVALID_TOKEN         | 401  | Missing or invalid authentication token   |
| FORBIDDEN             | 403  | User doesn't have CUSTOMER role           |
| NOT_FOUND             | 404  | Product or cart item not found            |
| VALIDATION_ERROR      | 400  | Request validation failed                 |
| CONFLICT              | 409  | Insufficient stock or product unavailable |
| INTERNAL_SERVER_ERROR | 500  | Server error                              |

---

## Cart Totals Calculation

**Subtotal:** Sum of all item prices (current price × quantity)

**Taxes:**

- Food items (7% VAT): Fruits, vegetables, grains, spices
- General items (19% VAT): All others

**Shipping:**

- Free: Orders ≥ €50
- €4.99: Orders < €50

**Total:** Subtotal + Taxes + Shipping - Discount

---

## Coupon Types

| Type         | Example | Calculation                                   |
| ------------ | ------- | --------------------------------------------- |
| PERCENTAGE   | 10% off | `discount = orderTotal × (couponValue / 100)` |
| FIXED_AMOUNT | €20 off | `discount = couponValue`                      |

**Coupon Validation Rules:**

- Code must be active and not expired
- Usage limit must not be exceeded
- Minimum order value must be met
- Discount cannot exceed order total

---

## Common Scenarios

### Scenario 1: First-time Cart

1. Customer adds product → Cart created automatically
2. Get cart → Returns cart with one item

### Scenario 2: Quantity Already in Cart

1. Add product already in cart → Quantity incremented
2. Example: Add 2, then add 3 → Total 5 in cart

### Scenario 3: Price Change After Add

1. Product price changes → Warning appears in cart
2. Validate cart → Reports price change
3. Proceed → Uses current price at checkout

### Scenario 4: Stock Unavailable

1. Item removed from stock → Warning in cart
2. Validate cart → Reports error
3. Cannot proceed to checkout until resolved

### Scenario 5: Apply Coupon Discount

1. Add items to cart
2. Apply coupon code
3. Discount calculated and validated
4. Customer sees new total in checkout

---

## Cart Item Object Structure

```json
{
  "id": "item-uuid",
  "productId": "prod-uuid",
  "quantity": 2,
  "priceAtAdd": 29.99,
  "addedAt": "2026-05-08T10:30:00Z",
  "product": {
    "id": "prod-uuid",
    "name": "Product Name",
    "nameEn": "English Name",
    "nameDe": "German Name",
    "sku": "PROD-001",
    "price": 29.99,
    "vatRate": 0.07,
    "stockQuantity": 50,
    "status": "ACTIVE",
    "category": {
      "id": "cat-uuid",
      "name": "Category Name",
      "nameEn": "English Category",
      "nameDe": "German Category"
    },
    "images": ["url1", "url2"],
    "thumbnailUrl": "thumb-url"
  },
  "currentPrice": 29.99,
  "totalPrice": 59.98,
  "warnings": []
}
```

---

## Validation Rules

### Add to Cart

- `productId`: Valid UUID required
- `quantity`: 1-999 (positive integer)

### Update Item

- `quantity`: 0-999 (0 removes item)

### Apply Coupon

- `couponCode`: 1-20 characters
- `orderTotal`: Positive number

---

## Testing Tips

1. **Use Bearer Token:** All requests require valid CUSTOMER token
2. **Check Cart Warnings:** Monitor price changes and stock issues
3. **Test Validation:** Use `/validate` before checkout
4. **Coupon Testing:** Test both valid and invalid codes
5. **Stock Limits:** Try adding more than available stock
6. **Tax Breakdown:** Verify food vs general tax calculation
7. **Shipping:** Check free shipping trigger at €50

---

## Related Modules

- **Products:** Used in cart items
- **Coupons:** Used for discount codes
- **Orders:** Cart data flows to order creation
- **Categories:** Product categorization
