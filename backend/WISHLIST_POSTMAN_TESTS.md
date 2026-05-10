# Wishlist Module - Postman Tests

Base URL: `http://localhost:3001/api/wishlist`
Authentication: Bearer Token (CUSTOMER)

---

## 1) Get Wishlist

- Method: GET
- Path: `/`
- Description: Retrieve authenticated customer's wishlist. Auto-creates wishlist if none exists.
- Headers:
  - `Authorization: Bearer {accessToken}`

Request body: none

Success (200):

```json
{
  "success": true,
  "data": {
    "id": "wishlist-uuid",
    "itemCount": 2,
    "items": [
      {
        "id": "item-uuid-1",
        "addedAt": "2026-05-08T10:00:00Z",
        "product": {
          "id": "prod-uuid-1",
          "name": "Injera (1kg)",
          "price": 29.99,
          "originalPrice": 34.99,
          "image": "https://cdn.../injer-thumb.jpg",
          "stockQuantity": 50,
          "inStock": true,
          "slug": "injera-1kg"
        }
      }
    ]
  }
}
```

Errors:

- 401 No token provided / invalid token
- 500 WISHLIST_ERROR on unexpected DB failure

---

## 2) Add Product to Wishlist

- Method: POST
- Path: `/:productId` (e.g. `/a1b2c3d4-...`)
- Description: Add a product to authenticated customer's wishlist.
- Headers:
  - `Authorization: Bearer {accessToken}`

Request body: none (productId passed in path)

Success (200):

```json
{
  "success": true,
  "message": "Product added to wishlist",
  "data": {
    /* updated wishlist object (same format as Get Wishlist) */
  }
}
```

Errors:

- 400 PRODUCT_UNAVAILABLE — product exists but not ACTIVE
- 400 ALREADY_IN_WISHLIST — product already present
- 404 PRODUCT_NOT_FOUND — product id invalid
- 401 / 500 as above

---

## 3) Remove Product from Wishlist

- Method: DELETE
- Path: `/:productId`
- Description: Remove a product from the customer's wishlist (idempotent).
- Headers:
  - `Authorization: Bearer {accessToken}`

Request body: none

Success (200):

```json
{
  "success": true,
  "message": "Product removed from wishlist",
  "data": {
    /* updated wishlist */
  }
}
```

Errors:

- 404 WISHLIST_NOT_FOUND — wishlist missing (rare)
- 404 PRODUCT_NOT_IN_WISHLIST — product not present
- 401 / 500 as above

---

## 4) Move Product From Wishlist to Cart

- Method: POST
- Path: `/:productId/move-to-cart`
- Description: Move a wishlist product to the customer's cart. Creates cart if missing; increases quantity if already present.
- Headers:
  - `Authorization: Bearer {accessToken}`

Request body: none

Success (200):

```json
{
  "success": true,
  "message": "Moved to cart"
}
```

Errors:

- 404 PRODUCT_NOT_FOUND
- 400 PRODUCT_UNAVAILABLE
- 400 OUT_OF_STOCK
- 404 WISHLIST_NOT_FOUND
- 404 PRODUCT_NOT_IN_WISHLIST
- 500 MOVE_TO_CART_ERROR

---

## Notes & Test Cases

- Test as authenticated CUSTOMER only.
- Add product that is ACTIVE and verify in returned wishlist.
- Try adding same product twice → expect `ALREADY_IN_WISHLIST`.
- Move-to-cart: verify product removed from wishlist and appears in cart (`/api/cart`).
- Removing non-existent product should return `PRODUCT_NOT_IN_WISHLIST` (404).
