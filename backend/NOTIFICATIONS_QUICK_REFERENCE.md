# Notifications Module - Quick Reference

## Base URL

```
http://localhost:3001/api/notifications
```

## Authentication

- **Required:** Yes (Bearer Token)
- **Roles:** All (CUSTOMER, VENDOR, ADMIN)
- **Token Header:** `Authorization: Bearer {accessToken}`

---

## Quick Endpoint Summary

| Method | Endpoint                | Description                       | Auth | Query/Body                    |
| ------ | ----------------------- | --------------------------------- | ---- | ----------------------------- |
| GET    | `/`                     | Get notifications with pagination | ✅   | `page`, `limit`, `unreadOnly` |
| GET    | `/stats`                | Get notification counts           | ✅   | None                          |
| PUT    | `/:notificationId/read` | Mark single as read               | ✅   | None                          |
| PUT    | `/read-all`             | Mark all as read                  | ✅   | None                          |
| DELETE | `/:notificationId`      | Delete single                     | ✅   | None                          |
| DELETE | `/delete-all`           | Delete all                        | ✅   | None                          |

---

## Common Use Cases

### 1. Get Unread Notifications

```bash
GET /api/notifications?page=1&limit=20&unreadOnly=true
Authorization: Bearer {token}
```

### 2. Mark Single as Read

```bash
PUT /api/notifications/{notificationId}/read
Authorization: Bearer {token}
```

### 3. Mark All as Read

```bash
PUT /api/notifications/read-all
Authorization: Bearer {token}
```

### 4. Get Statistics

```bash
GET /api/notifications/stats
Authorization: Bearer {token}
```

---

## Notification Types

- **ORDER_PLACED** - Order confirmation
- **PAYMENT_RECEIVED** - Payment successful
- **ORDER_SHIPPED** - Shipment created
- **ORDER_DELIVERED** - Order delivered
- **REVIEW_APPROVED** - Review approved by admin
- **REVIEW_REJECTED** - Review rejected
- **COUPON_AVAILABLE** - New coupon available
- **STOCK_AVAILABLE** - Product restocked
- **WISH_PRICE_DROP** - Wishlist item price reduced

---

## Response Structure

### Success

```json
{
  "success": true,
  "data": {
    /* endpoint-specific data */
  }
}
```

### Error

```json
{
  "success": false,
  "error": "Error message",
  "code": "ERROR_CODE"
}
```

---

## Common Error Codes

| Code            | HTTP | Description                         |
| --------------- | ---- | ----------------------------------- |
| UNAUTHENTICATED | 401  | No token or invalid token           |
| NOT_FOUND       | 404  | Notification not found              |
| FORBIDDEN       | 403  | Notification doesn't belong to user |
| INVALID_INPUT   | 400  | Missing required parameters         |

---

## Notification Object

```json
{
  "id": "notif-uuid",
  "userId": "user-uuid",
  "type": "ORDER_PLACED",
  "title": "Order Confirmed",
  "message": "Your order has been confirmed",
  "metadata": { "orderId": "ord-uuid" },
  "isRead": false,
  "createdAt": "2026-05-08T10:30:00Z",
  "updatedAt": "2026-05-08T10:30:00Z"
}
```

---

## Pagination Example

```bash
# Page 1, 20 items per page
GET /api/notifications?page=1&limit=20

Response includes:
{
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 50,
    "totalPages": 3,
    "hasNextPage": true,
    "hasPreviousPage": false
  }
}
```

---

## Testing Tips

1. Create notifications through order, payment, and review actions
2. Use `unreadOnly=true` to filter unread notifications
3. Verify `updatedAt` changes when marking as read
4. Test bulk operations: mark-all, delete-all
5. Verify proper pagination with multiple pages
6. Ensure users only see their own notifications
7. Check metadata carries correct context (orderId, etc.)

---

## Related Modules

- **Orders** - Triggers ORDER_PLACED, ORDER_SHIPPED, ORDER_DELIVERED
- **Payments** - Triggers PAYMENT_RECEIVED
- **Reviews** - Triggers REVIEW_APPROVED, REVIEW_REJECTED
- **Coupons** - Triggers COUPON_AVAILABLE
- **Products** - Triggers STOCK_AVAILABLE, WISH_PRICE_DROP
