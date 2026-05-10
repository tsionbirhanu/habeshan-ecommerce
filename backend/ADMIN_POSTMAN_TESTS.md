# Admin API Postman Tests

## Base URL

```text
http://localhost:3001/api/admin
```

## Authentication

All admin endpoints require:

```text
Authorization: Bearer {adminAccessToken}
```

## Module Notes

- All routes are protected by `authenticateToken` and `requireRole('ADMIN')`.
- Dashboard endpoints return `{ status: 'success', data: ... }`.
- Most admin management endpoints return `{ success: true, data: ... }`.
- Vendor creation is performed only by admin.

---

## 1. Dashboard Stats

**Method:** `GET`

**Endpoint:** `/dashboard`

**Description:** Returns high-level admin KPIs such as revenue, orders, customers, and products.

### Request

```text
GET /api/admin/dashboard
Authorization: Bearer {adminAccessToken}
```

### Success Response (200)

```json
{
  "status": "success",
  "data": {
    "revenue": {
      "today": 1250,
      "thisWeek": 8420,
      "thisMonth": 36400,
      "thisYear": 412000
    },
    "orders": {
      "total": 980,
      "pending": 14,
      "processing": 22,
      "today": 18
    },
    "customers": {
      "total": 540,
      "new": 38,
      "active": 498
    },
    "products": {
      "total": 210,
      "active": 198,
      "outOfStock": 7,
      "lowStock": 12
    }
  }
}
```

---

## 2. Sales Chart

**Method:** `GET`

**Endpoint:** `/dashboard/charts`

**Description:** Returns sales and order trend data for a period.

### Query Parameters

| Name     | Type   | Required | Description           |
| -------- | ------ | -------- | --------------------- |
| `period` | string | No       | `7d`, `30d`, or `12m` |

### Request

```text
GET /api/admin/dashboard/charts?period=7d
Authorization: Bearer {adminAccessToken}
```

### Success Response (200)

```json
{
  "status": "success",
  "data": [
    {
      "date": "2026-05-01",
      "revenue": 1200,
      "orderCount": 8
    },
    {
      "date": "2026-05-02",
      "revenue": 1800,
      "orderCount": 11
    }
  ]
}
```

---

## 3. Top Products

**Method:** `GET`

**Endpoint:** `/dashboard/top-products`

**Description:** Returns the top-selling products by revenue and sold count.

### Query Parameters

| Name     | Type   | Required | Description                                |
| -------- | ------ | -------- | ------------------------------------------ |
| `limit`  | number | No       | Number of products to return, default `10` |
| `period` | string | No       | `7d`, `30d`, or `12m`                      |

### Request

```text
GET /api/admin/dashboard/top-products?limit=10&period=30d
Authorization: Bearer {adminAccessToken}
```

### Success Response (200)

```json
{
  "status": "success",
  "data": [
    {
      "product": "Coffee Beans",
      "soldCount": 140,
      "revenue": 4200
    },
    {
      "product": "Honey",
      "soldCount": 95,
      "revenue": 1900
    }
  ]
}
```

---

## 4. Recent Orders

**Method:** `GET`

**Endpoint:** `/dashboard/orders`

**Description:** Returns the most recent orders for the admin dashboard.

### Query Parameters

| Name    | Type   | Required | Description                              |
| ------- | ------ | -------- | ---------------------------------------- |
| `limit` | number | No       | Number of orders to return, default `10` |

### Request

```text
GET /api/admin/dashboard/orders?limit=10
Authorization: Bearer {adminAccessToken}
```

### Success Response (200)

```json
{
  "status": "success",
  "data": [
    {
      "id": "order-uuid-1",
      "totalAmount": 250,
      "status": "PROCESSING",
      "createdAt": "2026-05-08T09:10:00.000Z",
      "customer": {
        "id": "user-uuid-1",
        "firstName": "Amina",
        "lastName": "Ali",
        "email": "amina@example.com"
      }
    }
  ]
}
```

---

## 5. Dashboard Alerts

**Method:** `GET`

**Endpoint:** `/dashboard/alerts`

**Description:** Returns operational alerts such as low stock, pending vendors, failed payments, and refunds.

### Request

```text
GET /api/admin/dashboard/alerts
Authorization: Bearer {adminAccessToken}
```

### Success Response (200)

```json
{
  "status": "success",
  "data": {
    "lowStock": [
      {
        "product": "Sugar",
        "currentStock": 4,
        "reorderLevel": 10
      }
    ],
    "pendingReviews": 6,
    "pendingVendors": 3,
    "failedPayments": 1,
    "recentRefunds": 2
  }
}
```

---

## 6. Get All Users

**Method:** `GET`

**Endpoint:** `/users`

**Description:** Returns users with pagination and filters by role, status, and search.

### Query Parameters

| Name       | Type    | Required | Description                               |
| ---------- | ------- | -------- | ----------------------------------------- |
| `page`     | number  | No       | Page number, default `1`                  |
| `limit`    | number  | No       | Page size, default `20`                   |
| `role`     | string  | No       | `ADMIN`, `VENDOR`, `CUSTOMER`, `DELIVERY` |
| `isActive` | boolean | No       | Filter by active status                   |
| `search`   | string  | No       | Search by email, firstName, or lastName   |

### Request

```text
GET /api/admin/users?page=1&limit=20&role=CUSTOMER&isActive=true&search=john
Authorization: Bearer {adminAccessToken}
```

### Success Response (200)

```json
{
  "success": true,
  "data": {
    "data": [
      {
        "id": "user-uuid-1",
        "email": "john@example.com",
        "firstName": "John",
        "lastName": "Doe",
        "role": "CUSTOMER",
        "isActive": true,
        "createdAt": "2026-05-08T09:10:00.000Z",
        "updatedAt": "2026-05-08T09:10:00.000Z"
      }
    ],
    "page": 1,
    "limit": 20,
    "total": 1,
    "pages": 1
  }
}
```

---

## 7. Get User Details

**Method:** `GET`

**Endpoint:** `/users/:userId`

**Description:** Returns a full user profile with addresses, vendor info, orders summary, and review count.

### Request

```text
GET /api/admin/users/{userId}
Authorization: Bearer {adminAccessToken}
```

### Success Response (200)

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user-uuid-1",
      "email": "john@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "phone": "+49123456789",
      "role": "CUSTOMER",
      "isActive": true,
      "deletedAt": null,
      "createdAt": "2026-05-08T09:10:00.000Z",
      "updatedAt": "2026-05-08T09:10:00.000Z",
      "addresses": [],
      "vendor": null,
      "ordersSummary": {
        "count": 4,
        "totalSpent": 240
      },
      "reviewsCount": 2
    }
  }
}
```

### Error Response (404)

```json
{
  "success": false,
  "error": "User not found"
}
```

---

## 8. Update User Role

**Method:** `PUT`

**Endpoint:** `/users/:userId/role`

**Description:** Changes a user's role. Admin cannot change their own role.

### Request Body

```json
{
  "role": "VENDOR"
}
```

### Success Response (200)

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user-uuid-1",
      "email": "john@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "VENDOR"
    }
  },
  "message": "User role updated"
}
```

### Error Response (403)

```json
{
  "success": false,
  "error": "Cannot change your own role"
}
```

---

## 9. Toggle User Status

**Method:** `PUT`

**Endpoint:** `/users/:userId/status`

**Description:** Enables or disables a user account.

### Request Body

```json
{
  "isActive": false,
  "reason": "Terms violation"
}
```

### Success Response (200)

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user-uuid-1",
      "email": "john@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "isActive": false
    }
  },
  "message": "User account disabled"
}
```

### Error Response (403)

```json
{
  "success": false,
  "error": "Cannot disable your own account"
}
```

---

## 10. Reset User Password

**Method:** `POST`

**Endpoint:** `/users/:userId/reset-password`

**Description:** Triggers a password reset flow for the selected user.

### Request

```text
POST /api/admin/users/{userId}/reset-password
Authorization: Bearer {adminAccessToken}
```

### Success Response (200)

```json
{
  "success": true,
  "message": "Password reset email sent"
}
```

### Internal Service Note

The service currently generates a reset token and returns it internally, but the controller only exposes the message in the API response.

---

## 11. Get User Activity Log

**Method:** `GET`

**Endpoint:** `/users/:userId/activity`

**Description:** Returns audit log entries for a user.

### Query Parameters

| Name     | Type   | Required | Description                         |
| -------- | ------ | -------- | ----------------------------------- |
| `limit`  | number | No       | Number of log entries, default `50` |
| `offset` | number | No       | Starting offset, default `0`        |

### Request

```text
GET /api/admin/users/{userId}/activity?limit=50&offset=0
Authorization: Bearer {adminAccessToken}
```

### Success Response (200)

```json
{
  "success": true,
  "data": {
    "data": [
      {
        "id": "log-uuid-1",
        "action": "ROLE_CHANGED",
        "entity": "User",
        "entityId": "user-uuid-1",
        "changes": {
          "oldRole": "CUSTOMER",
          "newRole": "VENDOR"
        },
        "createdAt": "2026-05-08T09:10:00.000Z",
        "user": {
          "email": "admin@habeshan.de",
          "firstName": "Admin",
          "lastName": "User"
        }
      }
    ],
    "limit": 50,
    "offset": 0,
    "total": 1
  }
}
```

---

## 12. Create Vendor

**Method:** `POST`

**Endpoint:** `/vendors`

**Description:** Creates a vendor account from the admin side and sends an invitation email.

### Request Body

```json
{
  "firstName": "Sara",
  "lastName": "Abebe",
  "email": "vendor@example.com",
  "phone": "+49123456789"
}
```

### Success Response (201)

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user-uuid-2",
      "email": "vendor@example.com",
      "firstName": "Sara",
      "lastName": "Abebe",
      "phone": "+49123456789",
      "role": "VENDOR"
    },
    "vendor": {
      "id": "vendor-uuid-1",
      "isApproved": true
    }
  },
  "message": "Vendor account created. Verification email sent to vendor."
}
```

### Error Response (409)

```json
{
  "success": false,
  "error": "Email already registered"
}
```

---

## 13. Get All Vendors

**Method:** `GET`

**Endpoint:** `/vendors`

**Description:** Returns vendor accounts with optional approval filtering.

### Query Parameters

| Name         | Type    | Required | Description               |
| ------------ | ------- | -------- | ------------------------- |
| `page`       | number  | No       | Page number, default `1`  |
| `limit`      | number  | No       | Page size, default `20`   |
| `isApproved` | boolean | No       | Filter by approval status |

### Request

```text
GET /api/admin/vendors?page=1&limit=20&isApproved=false
Authorization: Bearer {adminAccessToken}
```

### Success Response (200)

```json
{
  "success": true,
  "data": {
    "data": [
      {
        "id": "vendor-uuid-1",
        "userId": "user-uuid-2",
        "businessName": null,
        "description": null,
        "isApproved": false,
        "approvedAt": null,
        "createdAt": "2026-05-08T09:10:00.000Z",
        "updatedAt": "2026-05-08T09:10:00.000Z",
        "user": {
          "id": "user-uuid-2",
          "email": "vendor@example.com",
          "firstName": "Sara",
          "lastName": "Abebe",
          "phone": "+49123456789",
          "isActive": false,
          "createdAt": "2026-05-08T09:10:00.000Z"
        }
      }
    ],
    "page": 1,
    "limit": 20,
    "total": 1,
    "pages": 1
  }
}
```

---

## 14. Approve Vendor

**Method:** `POST`

**Endpoint:** `/vendors/:vendorId/approve`

**Description:** Marks a vendor as approved and activates the linked user account.

### Request

```text
POST /api/admin/vendors/{vendorId}/approve
Authorization: Bearer {adminAccessToken}
```

### Success Response (200)

```json
{
  "success": true,
  "data": {
    "vendor": {
      "id": "vendor-uuid-1",
      "userId": "user-uuid-2",
      "isApproved": true,
      "approvedAt": "2026-05-08T10:00:00.000Z",
      "user": {
        "id": "user-uuid-2",
        "email": "vendor@example.com",
        "firstName": "Sara",
        "lastName": "Abebe"
      }
    }
  },
  "message": "Vendor approved successfully"
}
```

### Error Response (404)

```json
{
  "success": false,
  "error": "Vendor not found"
}
```

---

## 15. Reject Vendor

**Method:** `POST`

**Endpoint:** `/vendors/:vendorId/reject`

**Description:** Rejects a vendor account and disables the linked user account.

### Request Body

```json
{
  "reason": "Incomplete documentation"
}
```

### Success Response (200)

```json
{
  "success": true,
  "message": "Vendor rejected"
}
```

### Error Response (404)

```json
{
  "success": false,
  "error": "Vendor not found"
}
```

---

## Postman Environment Variables

Set these variables in Postman:

| Variable      | Example Value               | Description        |
| ------------- | --------------------------- | ------------------ |
| `base_url`    | `http://localhost:3001/api` | API root           |
| `admin_token` | `eyJhbGciOiJIUzI1NiIs...`   | Admin access token |
| `user_id`     | `uuid-here`                 | Target user ID     |
| `vendor_id`   | `uuid-here`                 | Target vendor ID   |
| `page`        | `1`                         | Pagination page    |
| `limit`       | `20`                        | Pagination size    |

### Suggested Login Script

Use your auth login request to save the admin token:

```javascript
pm.test('Admin login successful', function () {
  const jsonData = pm.response.json();
  pm.expect(jsonData.success).to.eql(true);

  if (jsonData.data && jsonData.data.tokens) {
    pm.collectionVariables.set('admin_token', jsonData.data.tokens.accessToken);
  }
});
```

---

## Testing Flow

1. Login as admin and save `admin_token`.
2. Call dashboard endpoints.
3. Create a vendor.
4. List vendors.
5. Approve or reject vendor.
6. List users and inspect details.
7. Change user role or toggle status.
8. Trigger password reset for a user.
9. Fetch user activity logs.

---

## Common HTTP Status Codes

| Code | Meaning          |
| ---- | ---------------- |
| 200  | Success          |
| 201  | Created          |
| 400  | Validation error |
| 401  | Unauthorized     |
| 403  | Forbidden        |
| 404  | Not found        |
| 409  | Conflict         |
| 500  | Server error     |
