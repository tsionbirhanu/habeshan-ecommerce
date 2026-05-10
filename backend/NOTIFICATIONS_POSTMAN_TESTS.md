# Notifications Module - Postman Tests

**Base URL:** `http://localhost:3001/api/notifications`  
**Authentication:** Required (Bearer Token - All roles)  
**Total Endpoints:** 6

---

## 1. Get All Notifications

**Endpoint:** `GET /api/notifications`

**Description:** Retrieve authenticated user's notifications with pagination and filtering.

**Authentication:** Bearer Token (All roles)

**Headers:**

```
Authorization: Bearer {accessToken}
Content-Type: application/json
```

**Query Parameters:**

- `page` (optional, default 1): Page number for pagination
- `limit` (optional, default 20, max 100): Items per page
- `unreadOnly` (optional, default false): Filter to unread notifications only

**Example Request:**

```
GET /api/notifications?page=1&limit=20&unreadOnly=false
```

**Request Body:** None

**Response - Success (200):**

```json
{
  "success": true,
  "data": {
    "notifications": [
      {
        "id": "notif-uuid-1",
        "userId": "user-uuid-1",
        "type": "ORDER_PLACED",
        "title": "Order Confirmed",
        "message": "Your order #ORD-001 has been confirmed",
        "metadata": {
          "orderId": "ord-uuid-1",
          "orderNumber": "ORD-001"
        },
        "isRead": false,
        "createdAt": "2026-05-08T10:30:00Z",
        "updatedAt": "2026-05-08T10:30:00Z"
      },
      {
        "id": "notif-uuid-2",
        "userId": "user-uuid-1",
        "type": "PAYMENT_RECEIVED",
        "title": "Payment Confirmed",
        "message": "Payment of €49.99 received successfully",
        "metadata": {
          "orderId": "ord-uuid-1",
          "amount": 49.99
        },
        "isRead": true,
        "createdAt": "2026-05-07T14:00:00Z",
        "updatedAt": "2026-05-07T14:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 12,
      "totalPages": 1,
      "hasNextPage": false,
      "hasPreviousPage": false
    }
  }
}
```

**Response - Unread Only (200):**

```
GET /api/notifications?page=1&limit=20&unreadOnly=true
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

## 2. Get Notification Statistics

**Endpoint:** `GET /api/notifications/stats`

**Description:** Get count of total, unread, and read notifications for the authenticated user.

**Authentication:** Bearer Token (All roles)

**Headers:**

```
Authorization: Bearer {accessToken}
Content-Type: application/json
```

**Query Parameters:** None

**Request Body:** None

**Response - Success (200):**

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

**Response - Error (401):**

```json
{
  "success": false,
  "error": "User not authenticated",
  "code": "UNAUTHENTICATED"
}
```

---

## 3. Mark Single Notification as Read

**Endpoint:** `PUT /api/notifications/:notificationId/read`

**Description:** Mark a single notification as read (by notification owner only).

**Authentication:** Bearer Token (All roles)

**Path Parameters:**

- `notificationId`: UUID of the notification

**Headers:**

```
Authorization: Bearer {accessToken}
Content-Type: application/json
```

**Request Body:** None

**Example Request:**

```
PUT /api/notifications/notif-uuid-1/read
```

**Response - Success (200):**

```json
{
  "success": true,
  "data": {
    "id": "notif-uuid-1",
    "userId": "user-uuid-1",
    "type": "ORDER_PLACED",
    "title": "Order Confirmed",
    "message": "Your order #ORD-001 has been confirmed",
    "isRead": true,
    "createdAt": "2026-05-08T10:30:00Z",
    "updatedAt": "2026-05-08T10:35:00Z"
  }
}
```

**Response - Not Found (404):**

```json
{
  "success": false,
  "error": "Notification not found",
  "code": "NOT_FOUND"
}
```

**Response - Forbidden (403):**

```json
{
  "success": false,
  "error": "Unauthorized: Notification does not belong to this user",
  "code": "FORBIDDEN"
}
```

---

## 4. Mark All Notifications as Read

**Endpoint:** `PUT /api/notifications/read-all`

**Description:** Mark all unread notifications as read for the authenticated user.

**Authentication:** Bearer Token (All roles)

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
    "updatedCount": 3,
    "message": "3 notification(s) marked as read"
  }
}
```

**Response - No Unread (200):**

```json
{
  "success": true,
  "data": {
    "updatedCount": 0,
    "message": "0 notification(s) marked as read"
  }
}
```

---

## 5. Delete Single Notification

**Endpoint:** `DELETE /api/notifications/:notificationId`

**Description:** Delete a single notification (by owner only).

**Authentication:** Bearer Token (All roles)

**Path Parameters:**

- `notificationId`: UUID of the notification

**Headers:**

```
Authorization: Bearer {accessToken}
Content-Type: application/json
```

**Request Body:** None

**Example Request:**

```
DELETE /api/notifications/notif-uuid-1
```

**Response - Success (200):**

```json
{
  "success": true,
  "data": {
    "message": "Notification deleted successfully"
  }
}
```

**Response - Not Found (404):**

```json
{
  "success": false,
  "error": "Notification not found",
  "code": "NOT_FOUND"
}
```

**Response - Forbidden (403):**

```json
{
  "success": false,
  "error": "Unauthorized: Notification does not belong to this user",
  "code": "FORBIDDEN"
}
```

---

## 6. Delete All Notifications

**Endpoint:** `DELETE /api/notifications/delete-all`

**Description:** Delete all notifications for the authenticated user.

**Authentication:** Bearer Token (All roles)

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
    "deletedCount": 15,
    "message": "15 notification(s) deleted successfully"
  }
}
```

**Response - No Notifications (200):**

```json
{
  "success": true,
  "data": {
    "deletedCount": 0,
    "message": "0 notification(s) deleted successfully"
  }
}
```

---

## Notification Types

| Type             | Description              | Triggered When                 |
| ---------------- | ------------------------ | ------------------------------ |
| ORDER_PLACED     | Order confirmation       | Customer creates order         |
| PAYMENT_RECEIVED | Payment successful       | Payment processed successfully |
| ORDER_SHIPPED    | Shipment created         | Admin creates shipment         |
| ORDER_DELIVERED  | Order delivered          | Tracking shows delivery        |
| REVIEW_APPROVED  | Review approved          | Admin approves customer review |
| REVIEW_REJECTED  | Review rejected          | Admin rejects customer review  |
| COUPON_AVAILABLE | New coupon               | Admin creates active coupon    |
| STOCK_AVAILABLE  | Product restocked        | Product stock increases        |
| WISH_PRICE_DROP  | Wishlist item price down | Product price decreases        |

---

## Testing Checklist

- [ ] Get all notifications with pagination
- [ ] Filter notifications by unreadOnly
- [ ] Get notification stats (total/unread/read)
- [ ] Mark single notification as read
- [ ] Verify unread count decreases
- [ ] Mark all unread as read in one call
- [ ] Delete single notification
- [ ] Verify deleted notification no longer appears
- [ ] Delete all notifications at once
- [ ] Verify stats reset to 0
- [ ] Test unauthorized access (wrong user's notification)
- [ ] Test with invalid notification ID
- [ ] Test pagination with multiple pages
- [ ] Test empty results handling
