# ADMIN ENDPOINTS - COMPREHENSIVE POSTMAN TESTS

**Date:** May 8, 2026  
**Total Admin Endpoints:** 52  
**Authentication:** All endpoints require ADMIN role + Bearer token

---

## TABLE OF CONTENTS

1. [Authentication & Setup](#authentication--setup)
2. [User Management (6 endpoints)](#user-management-6-endpoints)
3. [Vendor Management (2 endpoints)](#vendor-management-2-endpoints)
4. [Dashboard (5 endpoints)](#dashboard-5-endpoints)
5. [Settings Management (2 endpoints)](#settings-management-2-endpoints)
6. [Analytics & Reports (6 endpoints)](#analytics--reports-6-endpoints)
7. [Product Management (5 endpoints)](#product-management-5-endpoints)
8. [Category Management (4 endpoints)](#category-management-4-endpoints)
9. [Order Management (5 endpoints)](#order-management-5-endpoints)
10. [Coupon Management (5 endpoints)](#coupon-management-5-endpoints)
11. [Payment & Invoice (9 endpoints)](#payment--invoice-9-endpoints)

---

## AUTHENTICATION & SETUP

### Admin Login (First Step)

```
POST /api/auth/login
Content-Type: application/json

Request Body:
{
  "email": "admin@habeshan.de",
  "password": "AdminPass123!"
}

Response (200 OK):
{
  "success": true,
  "data": {
    "user": {
      "id": "user-admin-123",
      "email": "admin@habeshan.de",
      "firstName": "Admin",
      "lastName": "User",
      "role": "ADMIN",
      "isActive": true
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "message": "Login successful"
}

⚠️ SAVE THE accessToken FOR ALL FOLLOWING REQUESTS
Use in Header: Authorization: Bearer <accessToken>
```

---

## USER MANAGEMENT (6 Endpoints)

### 1. GET ALL USERS

```
GET /api/admin/users?page=1&limit=20&role=CUSTOMER&isActive=true
Authorization: Bearer <admin_token>

Query Parameters:
- page: integer (default: 1)
- limit: integer (default: 20)
- role: ADMIN | VENDOR | CUSTOMER | DELIVERY (optional)
- search: string - search by email, firstName, lastName (optional)
- isActive: boolean (optional)

Response (200 OK):
{
  "success": true,
  "data": {
    "data": [
      {
        "id": "user-cust-001",
        "email": "customer1@example.de",
        "firstName": "Ahmed",
        "lastName": "Hassan",
        "role": "CUSTOMER",
        "isActive": true,
        "createdAt": "2026-05-01T10:30:00Z",
        "updatedAt": "2026-05-08T14:45:00Z"
      },
      {
        "id": "user-cust-002",
        "email": "customer2@example.de",
        "firstName": "Fatima",
        "lastName": "Abdi",
        "role": "CUSTOMER",
        "isActive": true,
        "createdAt": "2026-05-02T11:20:00Z",
        "updatedAt": "2026-05-07T15:30:00Z"
      }
    ],
    "page": 1,
    "limit": 20,
    "total": 127,
    "pages": 7
  }
}
```

### 2. GET USER DETAILS

```
GET /api/admin/users/user-cust-001
Authorization: Bearer <admin_token>

Response (200 OK):
{
  "success": true,
  "data": {
    "user": {
      "id": "user-cust-001",
      "email": "customer1@example.de",
      "firstName": "Ahmed",
      "lastName": "Hassan",
      "phone": "+49123456789",
      "role": "CUSTOMER",
      "isActive": true,
      "isEmailVerified": true,
      "createdAt": "2026-05-01T10:30:00Z",
      "updatedAt": "2026-05-08T14:45:00Z"
    }
  }
}
```

### 3. UPDATE USER ROLE

```
PUT /api/admin/users/user-cust-001/role
Authorization: Bearer <admin_token>
Content-Type: application/json

Request Body:
{
  "role": "DELIVERY"
}

Allowed Roles: ADMIN | VENDOR | CUSTOMER | DELIVERY

Response (200 OK):
{
  "success": true,
  "data": {
    "user": {
      "id": "user-cust-001",
      "email": "customer1@example.de",
      "firstName": "Ahmed",
      "lastName": "Hassan",
      "role": "DELIVERY",  // Changed from CUSTOMER
      "isActive": true
    }
  },
  "message": "User role updated"
}
```

### 4. TOGGLE USER STATUS (Enable/Disable Account)

```
PUT /api/admin/users/user-cust-001/status
Authorization: Bearer <admin_token>
Content-Type: application/json

Request Body:
{
  "isActive": false,
  "reason": "Suspicious activity detected"
}

Response (200 OK):
{
  "success": true,
  "data": {
    "user": {
      "id": "user-cust-001",
      "email": "customer1@example.de",
      "firstName": "Ahmed",
      "lastName": "Hassan",
      "isActive": false,  // Disabled
      "role": "CUSTOMER"
    }
  },
  "message": "User account disabled"
}

To enable:
{
  "isActive": true,
  "reason": "Account re-enabled by admin"
}

Response message will be: "User account enabled"
```

### 5. ADMIN RESET USER PASSWORD

```
POST /api/admin/users/user-cust-001/reset-password
Authorization: Bearer <admin_token>
Content-Type: application/json

NO REQUEST BODY NEEDED

Response (200 OK):
{
  "success": true,
  "message": "Password reset email sent to customer1@example.de. User has 24 hours to reset their password."
}

⚠️ USER RECEIVES EMAIL WITH RESET LINK
This is DIFFERENT from customer forgot-password flow
Admin can force password reset for support/security
```

### 6. GET USER ACTIVITY LOG

```
GET /api/admin/users/user-cust-001/activity?limit=50&offset=0
Authorization: Bearer <admin_token>

Query Parameters:
- limit: integer (default: 50)
- offset: integer (default: 0)

Response (200 OK):
{
  "success": true,
  "data": {
    "userId": "user-cust-001",
    "activities": [
      {
        "id": "audit-001",
        "userId": "admin-123",
        "action": "USER_ROLE_CHANGED",
        "entity": "User",
        "entityId": "user-cust-001",
        "changes": {
          "role": {
            "from": "CUSTOMER",
            "to": "DELIVERY"
          }
        },
        "ipAddress": "192.168.1.1",
        "createdAt": "2026-05-08T14:45:00Z"
      },
      {
        "id": "audit-002",
        "userId": "admin-123",
        "action": "USER_STATUS_TOGGLED",
        "entity": "User",
        "entityId": "user-cust-001",
        "changes": {
          "isActive": {
            "from": true,
            "to": false
          }
        },
        "ipAddress": "192.168.1.1",
        "createdAt": "2026-05-08T14:50:00Z"
      }
    ]
  }
}
```

---

## VENDOR MANAGEMENT (2 Endpoints)

### 1. CREATE VENDOR (Admin Only)

```
POST /api/admin/vendors
Authorization: Bearer <admin_token>
Content-Type: application/json

Request Body:
{
  "firstName": "Mohamed",
  "lastName": "Omar",
  "email": "vendor@ethiopian-goods.de",
  "phone": "+49987654321"
}

Response (201 Created):
{
  "success": true,
  "data": {
    "vendor": {
      "id": "vendor-001",
      "userId": "user-vendor-001",
      "businessName": null,
      "description": null,
      "isApproved": true,  // Auto-approved when created by admin
      "approvedAt": "2026-05-08T14:55:00Z",
      "createdAt": "2026-05-08T14:55:00Z"
    },
    "temporaryPassword": "TempPass123!"  // Shown only once
  },
  "message": "Vendor account created. Verification email sent to vendor."
}

⚠️ EMAIL SENT TO VENDOR
Subject: "Your Habeshan Account - Set Password"
Email contains link: https://frontend.com/vendor/setup-password?token=eyJhbGc...
```

### 2. GET ALL VENDORS

```
GET /api/admin/vendors?page=1&limit=20&isApproved=true
Authorization: Bearer <admin_token>

Query Parameters:
- page: integer (default: 1)
- limit: integer (default: 20)
- isApproved: boolean (optional)

Response (200 OK):
{
  "success": true,
  "data": {
    "data": [
      {
        "id": "vendor-001",
        "userId": "user-vendor-001",
        "businessName": null,
        "description": null,
        "isApproved": true,
        "approvedAt": "2026-05-08T14:55:00Z",
        "createdAt": "2026-05-08T14:55:00Z"
      },
      {
        "id": "vendor-002",
        "userId": "user-vendor-002",
        "businessName": "Ethiopian Spices Inc",
        "description": "Premium Ethiopian spices and grains",
        "isApproved": true,
        "approvedAt": "2026-05-05T10:20:00Z",
        "createdAt": "2026-05-05T10:20:00Z"
      }
    ],
    "page": 1,
    "limit": 20,
    "total": 15,
    "pages": 1
  }
}
```

⚠️ NOTE: `/vendors/approve` and `/vendors/reject` endpoints are REDUNDANT

- Vendors are auto-approved when created
- No pending approval state exists
- **RECOMMENDATION: Remove these endpoints**

---

## DASHBOARD (5 Endpoints)

### 1. GET DASHBOARD STATS

```
GET /api/admin/dashboard
Authorization: Bearer <admin_token>

Response (200 OK):
{
  "success": true,
  "data": {
    "overview": {
      "totalRevenue": 45230.50,
      "totalOrders": 128,
      "totalCustomers": 523,
      "totalVendors": 15,
      "averageOrderValue": 353.36,
      "totalProducts": 487
    },
    "recentMetrics": {
      "ordersLast7Days": 23,
      "revenueLast7Days": 8250.75,
      "customersLast7Days": 12,
      "productsAdded": 5
    }
  }
}
```

### 2. GET SALES CHART

```
GET /api/admin/dashboard/charts?dateFrom=2026-04-08&dateTo=2026-05-08&groupBy=day
Authorization: Bearer <admin_token>

Query Parameters:
- dateFrom: ISO datetime
- dateTo: ISO datetime
- groupBy: day | week | month

Response (200 OK):
{
  "success": true,
  "data": {
    "chartData": [
      {
        "date": "2026-05-08",
        "revenue": 2450.00,
        "orders": 7,
        "customers": 5
      },
      {
        "date": "2026-05-07",
        "revenue": 3120.75,
        "orders": 9,
        "customers": 7
      }
    ]
  }
}
```

### 3. GET TOP PRODUCTS

```
GET /api/admin/dashboard/top-products?limit=10
Authorization: Bearer <admin_token>

Response (200 OK):
{
  "success": true,
  "data": {
    "topProducts": [
      {
        "productId": "prod-123",
        "name": "Berbere Spice Premium",
        "sku": "BERB-001",
        "soldCount": 234,
        "revenue": 3042.66,
        "rating": 4.8
      },
      {
        "productId": "prod-124",
        "name": "Ethiopian Coffee Beans",
        "sku": "COFF-001",
        "soldCount": 189,
        "revenue": 2268.00,
        "rating": 4.9
      }
    ]
  }
}
```

### 4. GET RECENT ORDERS

```
GET /api/admin/dashboard/orders?limit=20
Authorization: Bearer <admin_token>

Response (200 OK):
{
  "success": true,
  "data": {
    "recentOrders": [
      {
        "id": "order-001",
        "orderNumber": "HMM-2026-001",
        "customerId": "user-cust-001",
        "customerName": "Ahmed Hassan",
        "totalAmount": 124.50,
        "status": "CONFIRMED",
        "paymentStatus": "COMPLETED",
        "createdAt": "2026-05-08T14:55:00Z"
      },
      {
        "id": "order-002",
        "orderNumber": "HMM-2026-002",
        "customerId": "user-cust-002",
        "customerName": "Fatima Abdi",
        "totalAmount": 89.99,
        "status": "SHIPPED",
        "paymentStatus": "COMPLETED",
        "createdAt": "2026-05-08T13:30:00Z"
      }
    ]
  }
}
```

### 5. GET DASHBOARD ALERTS

```
GET /api/admin/dashboard/alerts
Authorization: Bearer <admin_token>

Response (200 OK):
{
  "success": true,
  "data": {
    "alerts": [
      {
        "id": "alert-001",
        "type": "LOW_STOCK",
        "title": "Low Stock Alert",
        "message": "Product 'Teff Flour' has only 5 items left",
        "severity": "warning",
        "createdAt": "2026-05-08T14:00:00Z"
      },
      {
        "id": "alert-002",
        "type": "PAYMENT_FAILED",
        "title": "Payment Failed",
        "message": "Order HMM-2026-003 payment failed. Customer: John Doe",
        "severity": "danger",
        "createdAt": "2026-05-08T13:45:00Z"
      },
      {
        "id": "alert-003",
        "type": "PENDING_ORDERS",
        "title": "Pending Orders",
        "message": "5 orders awaiting processing",
        "severity": "info",
        "createdAt": "2026-05-08T12:00:00Z"
      }
    ]
  }
}
```

---

## SETTINGS MANAGEMENT (2 Endpoints)

### 1. GET ALL SETTINGS

```
GET /api/admin/settings
Authorization: Bearer <admin_token>

Response (200 OK):
{
  "success": true,
  "data": {
    "store": {
      "name": "Habesha Mini Market",
      "email": "admin@habesha-minimarket.com",
      "phone": "+49 123 456789",
      "address": "Berlin, Germany",
      "currency": "EUR",
      "timezone": "Europe/Berlin"
    },
    "shipping": {
      "freeShippingThreshold": 50,
      "defaultShippingMethod": "DHL"
    },
    "tax": {
      "foodVatRate": 7,
      "generalVatRate": 19
    },
    "payment": {
      "enabledMethods": ["STRIPE", "PAYPAL", "KLARNA"]
    },
    "notifications": {
      "adminEmail": "admin@habesha-minimarket.com",
      "lowStockAlert": true
    },
    "seo": {
      "defaultMetaTitle": "Habesha Mini Market - Ethiopian Products",
      "defaultMetaDescription": "Shop authentic Ethiopian products online",
      "googleAnalyticsId": ""
    },
    "social": {
      "whatsappNumber": "",
      "telegramHandle": "",
      "instagramUrl": "",
      "facebookUrl": ""
    }
  },
  "message": "Settings retrieved successfully"
}
```

### 2. UPDATE SETTINGS (Partial Update)

```
PUT /api/admin/settings
Authorization: Bearer <admin_token>
Content-Type: application/json

Request Body (Example - Update Multiple Categories):
{
  "store": {
    "name": "Habesha Market Updated",
    "email": "support@habesha-market.de"
  },
  "seo": {
    "googleAnalyticsId": "G-XXXXXXXXXX"
  },
  "social": {
    "whatsappNumber": "+49123456789",
    "instagramUrl": "https://instagram.com/habesha_market"
  }
}

Response (200 OK):
{
  "success": true,
  "data": {
    "store": {
      "name": "Habesha Market Updated",
      "email": "support@habesha-market.de"
    },
    "seo": {
      "googleAnalyticsId": "G-XXXXXXXXXX"
    },
    "social": {
      "whatsappNumber": "+49123456789",
      "instagramUrl": "https://instagram.com/habesha_market"
    }
  },
  "message": "Settings updated successfully"
}
```

---

## ANALYTICS & REPORTS (6 Endpoints)

### 1. GET SALES REPORT

```
GET /api/analytics/sales?groupBy=day&dateFrom=2026-04-08T00:00:00Z&dateTo=2026-05-08T23:59:59Z
Authorization: Bearer <admin_token>

Query Parameters:
- groupBy: day | week | month
- dateFrom: ISO datetime
- dateTo: ISO datetime

Response (200 OK):
{
  "success": true,
  "data": {
    "summary": {
      "totalRevenue": 45230.50,
      "totalOrders": 128,
      "averageOrderValue": 353.36
    },
    "data": [
      {
        "period": "2026-05-08",
        "revenue": 2450.00,
        "orderCount": 7,
        "aov": 350.00
      },
      {
        "period": "2026-05-07",
        "revenue": 3120.75,
        "orderCount": 9,
        "aov": 346.75
      }
    ]
  },
  "message": "Sales report generated"
}
```

### 2. GET PRODUCT REPORT

```
GET /api/analytics/products?sortBy=revenue&limit=50
Authorization: Bearer <admin_token>

Query Parameters:
- sortBy: revenue | units | views | conversion
- limit: number (default: 100)
- categoryId: UUID (optional)
- dateFrom: ISO datetime (optional)
- dateTo: ISO datetime (optional)

Response (200 OK):
{
  "success": true,
  "data": {
    "data": [
      {
        "productId": "prod-123",
        "name": "Berbere Spice Premium",
        "sku": "BERB-001",
        "price": 12.99,
        "currentStock": 45,
        "totalSold": 234,
        "revenue": 3042.66,
        "unitsSold": 234,
        "views": 567,
        "conversion": 41.27,
        "isSlowMover": false
      }
    ]
  },
  "message": "Product report generated"
}
```

### 3. GET CUSTOMER REPORT

```
GET /api/analytics/customers
Authorization: Bearer <admin_token>

Response (200 OK):
{
  "success": true,
  "data": {
    "summary": {
      "totalCustomers": 523,
      "newCustomersLast30Days": 87,
      "returningCustomers": 436,
      "conversionRate": 16.64
    },
    "topCustomers": [
      {
        "customerId": "user-cust-001",
        "customerName": "Ahmed Hassan",
        "totalSpent": 4520.75,
        "orderCount": 23
      }
    ],
    "geoDistribution": [
      {
        "city": "Berlin",
        "customerCount": 189,
        "totalSpent": 23450.75
      }
    ]
  },
  "message": "Customer report generated"
}
```

### 4. GET INVENTORY REPORT

```
GET /api/analytics/inventory
Authorization: Bearer <admin_token>

Response (200 OK):
{
  "success": true,
  "data": {
    "summary": {
      "totalInventoryValue": 125430.50,
      "outOfStockCount": 3,
      "slowMoverCount": 12,
      "fastMoverCount": 34
    },
    "byCategory": [
      {
        "categoryName": "Spices",
        "totalValue": 45230.75,
        "productCount": 45,
        "avgStockValue": 1005.13
      }
    ],
    "slowMovers": [ ... ],
    "fastMovers": [ ... ]
  },
  "message": "Inventory report generated"
}
```

### 5. GET PAYMENT REPORT

```
GET /api/analytics/payments?dateFrom=2026-04-08T00:00:00Z
Authorization: Bearer <admin_token>

Response (200 OK):
{
  "success": true,
  "data": {
    "summary": {
      "totalTransactions": 524,
      "successRate": 96.39,
      "totalRefunded": 1250.50,
      "totalProcessed": 123450.75,
      "averageTransaction": 235.41
    },
    "byMethod": [
      {
        "method": "STRIPE",
        "totalTransactions": 287,
        "successCount": 280,
        "failureCount": 7,
        "totalAmount": 67890.50,
        "avgTransaction": 236.51
      }
    ]
  },
  "message": "Payment report generated"
}
```

### 6. EXPORT REPORT

```
GET /api/analytics/export?type=sales&format=csv
Authorization: Bearer <admin_token>

Query Parameters:
- type: sales | products | customers | inventory | payments (required)
- format: csv | json (default: json)
- dateFrom: ISO datetime (optional)
- dateTo: ISO datetime (optional)

Response (CSV Format):
Content-Type: text/csv
Content-Disposition: attachment; filename="sales-report-2026-05-08.csv"

Period,Revenue,Order Count,Average Order Value
2026-05-08,2450.00,7,350.00
2026-05-07,3120.75,9,346.75
...

Response (JSON Format - 200 OK):
{
  "success": true,
  "data": {
    "summary": { ... },
    "data": [ ... ]
  },
  "message": "sales report exported"
}
```

---

## PRODUCT MANAGEMENT (5 Endpoints)

### 1. CREATE PRODUCT (Admin | Vendor)

```
POST /api/products
Authorization: Bearer <admin_token>
Content-Type: application/json

Request Body:
{
  "name": "Premium Berbere Spice",
  "description": "Authentic Ethiopian spice blend",
  "categoryId": "cat-spices-001",
  "price": 12.99,
  "originalPrice": 15.99,
  "costPrice": 5.00,
  "sku": "BERB-001",
  "vatRate": 19,
  "stockQuantity": 100,
  "reorderLevel": 10
}

Response (201 Created):
{
  "success": true,
  "data": {
    "product": {
      "id": "prod-123",
      "name": "Premium Berbere Spice",
      "sku": "BERB-001",
      "categoryId": "cat-spices-001",
      "price": 12.99,
      "status": "ACTIVE",
      "stockQuantity": 100
    }
  },
  "message": "Product created successfully"
}
```

### 2. UPDATE PRODUCT

```
PUT /api/products/prod-123
Authorization: Bearer <admin_token>
Content-Type: application/json

Request Body (Partial Update):
{
  "price": 13.99,
  "stockQuantity": 95,
  "description": "Updated description"
}

Response (200 OK):
{
  "success": true,
  "data": {
    "product": { ... }
  },
  "message": "Product updated successfully"
}
```

### 3. DELETE PRODUCT (Admin Only)

```
DELETE /api/products/prod-123
Authorization: Bearer <admin_token>

Response (200 OK):
{
  "success": true,
  "message": "Product deleted successfully"
}
```

### 4. UPLOAD PRODUCT IMAGES

```
POST /api/products/prod-123/images
Authorization: Bearer <admin_token>
Content-Type: multipart/form-data

Body:
- files: [image1.jpg, image2.jpg, image3.jpg]

Response (200 OK):
{
  "success": true,
  "data": {
    "uploadedImages": [
      "https://cdn.habesha-market.de/products/prod-123/image1.jpg",
      "https://cdn.habesha-market.de/products/prod-123/image2.jpg"
    ]
  }
}
```

### 5. GET ALL PRODUCTS

```
GET /api/products?page=1&limit=20&status=ACTIVE
Authorization: None (Public)

Response (200 OK):
{
  "success": true,
  "data": {
    "data": [ ... ],
    "page": 1,
    "limit": 20,
    "total": 487
  }
}
```

---

## CATEGORY MANAGEMENT (4 Endpoints)

### 1. CREATE CATEGORY (Admin Only)

```
POST /api/categories
Authorization: Bearer <admin_token>
Content-Type: application/json

Request Body:
{
  "name": "Spices",
  "nameEn": "Spices",
  "nameDe": "Gewürze",
  "nameAm": "ሚቅለቅል",
  "slug": "spices",
  "description": "Premium Ethiopian spices"
}

Response (201 Created):
{
  "success": true,
  "data": {
    "category": {
      "id": "cat-spices-001",
      "name": "Spices",
      "slug": "spices",
      "isActive": true
    }
  }
}
```

### 2. UPDATE CATEGORY (Admin Only)

```
PUT /api/categories/cat-spices-001
Authorization: Bearer <admin_token>
Content-Type: application/json

Request Body:
{
  "name": "Premium Spices",
  "description": "Updated description"
}

Response (200 OK):
{
  "success": true,
  "data": { ... }
}
```

### 3. DELETE CATEGORY (Admin Only)

```
DELETE /api/categories/cat-spices-001
Authorization: Bearer <admin_token>

Response (200 OK):
{
  "success": true,
  "message": "Category deleted successfully"
}
```

### 4. UPLOAD CATEGORY IMAGE (Admin Only)

```
POST /api/categories/cat-spices-001/image
Authorization: Bearer <admin_token>
Content-Type: multipart/form-data

Body:
- file: category-image.jpg

Response (200 OK):
{
  "success": true,
  "data": {
    "imageUrl": "https://cdn.habesha-market.de/categories/cat-spices-001.jpg"
  }
}
```

---

## ORDER MANAGEMENT (5 Endpoints)

### 1. GET ALL ORDERS (Admin Only)

```
GET /api/orders?page=1&limit=20&status=CONFIRMED
Authorization: Bearer <admin_token>

Query Parameters:
- page: integer
- limit: integer
- status: PENDING_PAYMENT | CONFIRMED | PROCESSING | SHIPPED | etc.

Response (200 OK):
{
  "success": true,
  "data": {
    "data": [ ... ],
    "page": 1,
    "limit": 20,
    "total": 128
  }
}
```

### 2. GET ORDER DETAILS

```
GET /api/orders/order-001
Authorization: Bearer <admin_token>

Response (200 OK):
{
  "success": true,
  "data": {
    "order": {
      "id": "order-001",
      "orderNumber": "HMM-2026-001",
      "customerId": "user-cust-001",
      "customerName": "Ahmed Hassan",
      "items": [ ... ],
      "totalAmount": 124.50,
      "status": "CONFIRMED",
      "paymentStatus": "COMPLETED"
    }
  }
}
```

### 3. UPDATE ORDER STATUS (Admin | Vendor)

```
PUT /api/orders/order-001/status
Authorization: Bearer <admin_token>
Content-Type: application/json

Request Body:
{
  "status": "SHIPPED"
}

Allowed Statuses: CONFIRMED | PROCESSING | SHIPPED | IN_TRANSIT | DELIVERED | CANCELLED

Response (200 OK):
{
  "success": true,
  "data": {
    "order": { ... }
  },
  "message": "Order status updated"
}
```

### 4. CANCEL ORDER

```
POST /api/orders/order-001/cancel
Authorization: Bearer <admin_token>
Content-Type: application/json

Request Body:
{
  "reason": "Customer requested cancellation"
}

Response (200 OK):
{
  "success": true,
  "message": "Order cancelled successfully"
}
```

### 5. ADD ORDER NOTE (Admin Only)

```
POST /api/orders/order-001/notes
Authorization: Bearer <admin_token>
Content-Type: application/json

Request Body:
{
  "note": "Customer has special delivery instructions - leave at back door"
}

Response (201 Created):
{
  "success": true,
  "data": {
    "note": {
      "id": "note-001",
      "orderId": "order-001",
      "content": "Customer has special delivery instructions...",
      "createdBy": "admin-123",
      "createdAt": "2026-05-08T15:00:00Z"
    }
  }
}
```

---

## COUPON MANAGEMENT (5 Endpoints)

### 1. CREATE COUPON (Admin Only)

```
POST /api/coupons
Authorization: Bearer <admin_token>
Content-Type: application/json

Request Body:
{
  "code": "SAVE10",
  "type": "PERCENTAGE",
  "value": 10,
  "minOrderValue": 50,
  "maxUses": 100,
  "expiresAt": "2026-12-31T23:59:59Z",
  "isActive": true
}

Types: PERCENTAGE | FIXED_AMOUNT | FREE_SHIPPING

Response (201 Created):
{
  "success": true,
  "data": {
    "coupon": {
      "id": "coupon-001",
      "code": "SAVE10",
      "type": "PERCENTAGE",
      "value": 10,
      "isActive": true
    }
  }
}
```

### 2. GET ALL COUPONS (Admin Only)

```
GET /api/coupons?page=1&limit=10&isActive=true&type=PERCENTAGE
Authorization: Bearer <admin_token>

Response (200 OK):
{
  "success": true,
  "data": {
    "data": [ ... ],
    "page": 1,
    "limit": 10,
    "total": 25
  }
}
```

### 3. GET COUPON BY CODE (Admin Only)

```
GET /api/coupons/code/SAVE10
Authorization: Bearer <admin_token>

Response (200 OK):
{
  "success": true,
  "data": {
    "coupon": { ... }
  }
}
```

### 4. UPDATE COUPON (Admin Only)

```
PUT /api/coupons/coupon-001
Authorization: Bearer <admin_token>
Content-Type: application/json

Request Body (Partial Update):
{
  "isActive": false,
  "maxUses": 50
}

Response (200 OK):
{
  "success": true,
  "data": {
    "coupon": { ... }
  }
}
```

### 5. DELETE COUPON (Admin Only)

```
DELETE /api/coupons/coupon-001
Authorization: Bearer <admin_token>

Response (200 OK):
{
  "success": true,
  "message": "Coupon deleted successfully"
}
```

---

## PAYMENT & INVOICE (9 Endpoints)

### 1. GET PAYMENT STATUS

```
GET /api/payments/order-001
Authorization: Bearer <admin_token>

Response (200 OK):
{
  "success": true,
  "data": {
    "payment": {
      "id": "payment-001",
      "orderId": "order-001",
      "amount": 124.50,
      "method": "STRIPE",
      "status": "COMPLETED",
      "transactionId": "pi_1234567890",
      "createdAt": "2026-05-08T15:00:00Z"
    }
  }
}
```

### 2. REFUND PAYMENT (Admin Only)

```
POST /api/payments/order-001/refund
Authorization: Bearer <admin_token>
Content-Type: application/json

Request Body:
{
  "amount": 124.50,
  "reason": "Customer requested refund - product defect"
}

Response (200 OK):
{
  "success": true,
  "data": {
    "refund": {
      "id": "refund-001",
      "orderId": "order-001",
      "amount": 124.50,
      "status": "COMPLETED",
      "transactionId": "re_1234567890"
    }
  },
  "message": "Payment refunded successfully"
}
```

### 3. GET INVOICE DATA (JSON)

```
GET /api/payments/order-001/invoice
Authorization: Bearer <admin_token>

Response (200 OK):
{
  "success": true,
  "data": {
    "invoice": {
      "id": "invoice-001",
      "invoiceNumber": "HMM-2026-0001",
      "invoiceDate": "08.05.2026",
      "order": { ... },
      "items": [ ... ],
      "customer": { ... },
      "subtotal": 104.62,
      "vatBreakdown": [
        { "rate": 7, "amount": 1.45 },
        { "rate": 19, "amount": 18.43 }
      ],
      "totalTax": 19.88,
      "totalAmount": 124.50,
      "shippingCost": 5.99,
      "discount": 5.99
    }
  },
  "message": "Invoice retrieved"
}
```

### 4. DOWNLOAD INVOICE (PDF)

```
GET /api/payments/order-001/invoice/download
Authorization: Bearer <admin_token>

Response (200 OK):
Content-Type: application/pdf
Content-Disposition: attachment; filename="invoice-HMM-2026-0001.pdf"

[Binary PDF data]

⚠️ GERMAN LEGAL FORMAT
- Invoice number + date
- Company info (name, address, tax ID)
- Customer delivery address
- Item table with VAT rates
- VAT breakdown (7% food, 19% general)
- Payment method and total
- Bank details / Payment reference
```

### 5. SEND INVOICE EMAIL (Admin Only)

```
POST /api/payments/order-001/invoice/send
Authorization: Bearer <admin_token>
Content-Type: application/json

NO REQUEST BODY NEEDED

Response (200 OK):
{
  "success": true,
  "message": "Invoice sent to customer1@example.de"
}

⚠️ EMAIL SENT WITH PDF ATTACHMENT
Subject: "Your Invoice - HMM-2026-0001"
Attachment: invoice-HMM-2026-0001.pdf
```

### 6. GET PAYMENT RECEIPT

```
GET /api/payments/order-001/receipt
Authorization: Bearer <admin_token>

Response (200 OK):
{
  "success": true,
  "data": {
    "receipt": {
      "receiptNumber": "RCP-2026-0001",
      "orderNumber": "HMM-2026-001",
      "customerId": "user-cust-001",
      "totalAmount": 124.50,
      "paymentMethod": "STRIPE",
      "paymentStatus": "COMPLETED",
      "transactionId": "pi_1234567890",
      "receivedAt": "2026-05-08T15:05:00Z"
    }
  },
  "message": "Receipt retrieved"
}
```

### 7. CREATE STRIPE PAYMENT (Customer)

```
POST /api/payments/stripe/create-intent
Authorization: Bearer <customer_token>
Content-Type: application/json

Request Body:
{
  "orderId": "order-001"
}

Response (200 OK):
{
  "success": true,
  "data": {
    "clientSecret": "pi_123_secret_456",
    "paymentIntentId": "pi_1234567890",
    "publishableKey": "pk_live_...",
    "amount": 12450,
    "amountFormatted": "124.50"
  }
}
```

### 8. CREATE PAYPAL ORDER (Customer)

```
POST /api/payments/paypal/create
Authorization: Bearer <customer_token>
Content-Type: application/json

Request Body:
{
  "orderId": "order-001"
}

Response (201 Created):
{
  "success": true,
  "data": {
    "paypalOrderId": "3MS123456789",
    "approvalUrl": "https://www.paypal.com/cgi-bin/webscr?..."
  }
}
```

### 9. CREATE KLARNA SESSION (Customer)

```
POST /api/payments/klarna/session
Authorization: Bearer <customer_token>
Content-Type: application/json

Request Body:
{
  "orderId": "order-001"
}

Response (201 Created):
{
  "success": true,
  "data": {
    "sessionId": "klarna-session-123",
    "redirectUrl": "https://klarna.com/checkout/..."
  }
}
```

---

## SUMMARY

**Total Admin Endpoints: 52**

- User Management: 6
- Vendor Management: 2
- Dashboard: 5
- Settings: 2
- Analytics: 6
- Products: 5
- Categories: 4
- Orders: 5
- Coupons: 5
- Payments/Invoices: 9

---

**Authentication:** All require `Authorization: Bearer <admin_token>`  
**Admin Role:** Enforced by middleware on all routes  
**Response Format:** Consistent JSON with `success`, `data`, `message` fields  
**Error Handling:** HTTP status codes + error messages

**Last Updated:** May 8, 2026
