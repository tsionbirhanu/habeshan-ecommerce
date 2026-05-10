# Reviews Module - Postman Tests

Base URLs:

- Reviews endpoints: `http://localhost:3001/api/reviews`
- Public product reviews read: `http://localhost:3001/api/products/:productId/reviews` (public)

Authentication: Bearer Token for protected endpoints

- CUSTOMER for creating reviews and marking helpful
- ADMIN for moderation (pending, approve, reject, delete)

---

## 1) Create Review

- Method: POST
- Path: `/api/reviews`
- Description: Submit a new review for a product. Requires verified purchase and no existing review.
- Auth: Bearer Token (CUSTOMER)

Request body:

```json
{
  "productId": "prod-uuid-1",
  "rating": 5,
  "title": "Excellent product",
  "content": "Tastes great, fast delivery"
}
```

Success (201):

```json
{
  "success": true,
  "message": "Review submitted for moderation",
  "data": { "reviewId": "rev-uuid-1", "status": "PENDING" }
}
```

Errors:

- 400 INVALID_INPUT — missing fields
- 400 INVALID_RATING — rating outside 1-5 or not integer
- 400 CONTENT_TOO_LONG — >1000 chars
- 404 PRODUCT_NOT_FOUND
- 400 NO_VERIFIED_PURCHASE — user hasn't purchased product
- 400 REVIEW_ALREADY_EXISTS — user already reviewed
- 500 VERIFICATION_ERROR / other server errors

---

## 2) Get Product Reviews (Public)

- Method: GET
- Path: `/api/products/:productId/reviews`
- Description: Retrieve approved reviews for a product with pagination and sorting.
- Query params: `page` (default 1), `limit` (default 10, max 50), `sort` (`newest|helpful|highest|lowest`)
- Auth: None (public)

Example: `GET /api/products/prod-uuid-1/reviews?page=1&limit=10&sort=newest`

Success (200):

```json
{
  "success": true,
  "data": {
    "reviews": [
      {
        "id": "rev-uuid-1",
        "rating": 5,
        "title": "Great",
        "content": "...",
        "isVerifiedPurchase": true,
        "helpfulCount": 3,
        "customerName": "Anna",
        "createdAt": "2026-05-01T10:00:00Z"
      }
    ],
    "pagination": { "page": 1, "limit": 10, "total": 12, "totalPages": 2 },
    "statistics": {
      "averageRating": 4.5,
      "totalReviews": 12,
      "ratingDistribution": { "1": 0, "2": 1, "3": 2, "4": 4, "5": 5 }
    }
  }
}
```

Errors:

- 404 PRODUCT_NOT_FOUND
- 500 RATING_ERROR etc.

---

## 3) Get Pending Reviews (Admin)

- Method: GET
- Path: `/api/reviews/pending`
- Description: Admin-only endpoint to list reviews awaiting moderation.
- Auth: Bearer Token (ADMIN)
- Query params: `page`, `limit`

Success (200):

```json
{
  "success": true,
  "data": {
    "reviews": [
      {
        "id": "rev-uuid-1",
        "productId": "prod-uuid-1",
        "productName": "Injera",
        "customerId": "cust-1",
        "customerName": "Anna",
        "rating": 5,
        "title": "...",
        "content": "...",
        "createdAt": "..."
      }
    ],
    "pagination": { "page": 1, "limit": 20, "total": 5, "totalPages": 1 }
  }
}
```

Errors:

- 403 FORBIDDEN if non-admin

---

## 4) Approve Review (Admin)

- Method: POST
- Path: `/api/reviews/:reviewId/approve`
- Description: Mark review as `APPROVED`, recalc product rating and notify customer.
- Auth: Bearer Token (ADMIN)

Request body: none

Success (200):

```json
{
  "success": true,
  "message": "Review approved",
  "data": { "id": "rev-uuid-1", "status": "APPROVED", "productName": "Injera" }
}
```

Errors:

- 404 REVIEW_NOT_FOUND
- 403 FORBIDDEN if not admin

---

## 5) Reject Review (Admin)

- Method: POST
- Path: `/api/reviews/:reviewId/reject`
- Description: Reject and notify customer. `reason` required.
- Auth: Bearer Token (ADMIN)

Request body:

```json
{ "reason": "Inappropriate language" }
```

Success (200):

```json
{
  "success": true,
  "message": "Review rejected",
  "data": { "id": "rev-uuid-1", "status": "REJECTED" }
}
```

Errors:

- 400 INVALID_INPUT if reason missing
- 404 REVIEW_NOT_FOUND
- 403 FORBIDDEN if not admin

---

## 6) Delete Review (Admin)

- Method: DELETE
- Path: `/api/reviews/:reviewId`
- Description: Permanently delete a review; recalculates product rating.
- Auth: Bearer Token (ADMIN)

Success (200):

```json
{ "success": true, "message": "Review deleted" }
```

Errors:

- 404 REVIEW_NOT_FOUND
- 403 FORBIDDEN

---

## 7) Update Review (Owner)

- Method: PUT
- Path: `/api/reviews/:reviewId`
- Description: Review owner updates rating, title, or content. Changes reset review to `PENDING` for re-approval.
- Auth: Bearer Token (CUSTOMER) - must be review owner

Request body (any fields optional):

```json
{ "rating": 4, "title": "Updated title", "content": "Updated content" }
```

Success (200):

```json
{
  "success": true,
  "message": "Review updated and submitted for re-approval",
  "data": { "id": "rev-uuid-1", "status": "PENDING", "productName": "Injera" }
}
```

Errors:

- 404 REVIEW_NOT_FOUND
- 403 FORBIDDEN if not owner
- 400 INVALID_RATING / CONTENT_TOO_LONG

---

## 8) Mark/Unmark Helpful (Toggle)

- Method: POST
- Path: `/api/reviews/:reviewId/helpful`
- Description: Customers can mark or unmark a review as helpful. Body: `{ helpful: true|false }` (default true).
- Auth: Bearer Token (CUSTOMER)

Request body:

```json
{ "helpful": true }
```

Success cases:

- Marked: `{ "success": true, "message": "Review marked as helpful", "data": { "marked": true } }`
- Unmarked: `{ "success": true, "message": "Review unmarked as helpful", "data": { "marked": false } }`
- Idempotent responses if already in desired state.

Errors:

- 404 REVIEW_NOT_FOUND
- 400 ALREADY_VOTED when attempting to mark twice

---

## Notes & Test Cases

- Test creating review only after simulating a delivered/completed order containing the product (verified purchase check uses `orderItem` query).
- Attempt to create review without purchase → expect `NO_VERIFIED_PURCHASE`.
- Ensure update resets status to `PENDING` and admin moderation endpoints reflect that.
- Test helpful toggle flows: mark, attempt duplicate mark, unmark.
- Verify rating recalculation after approve/delete via `product.averageRating` updates (if used in product object).
