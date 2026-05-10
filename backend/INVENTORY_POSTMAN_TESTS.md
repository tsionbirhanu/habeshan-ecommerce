# Inventory Module - Postman Tests

## Base URL

```http
http://localhost:3001/api/inventory
```

## Authentication

- **List / Product Inventory:** Bearer Token - ADMIN or VENDOR
- **Alerts / Summary / History:** Bearer Token - ADMIN only
- **Update Inventory:** Bearer Token - ADMIN only
- **Header:** `Authorization: Bearer {accessToken}`

## Inventory Model Snapshot

- `quantity` = total stock on hand
- `reservedQuantity` = stock already reserved for pending orders
- `availableStock` = `quantity - reservedQuantity`
- `reorderLevel` = low-stock threshold
- `lastUpdated` = auto-updated timestamp

---

## Quick Endpoint Summary

| Method | Endpoint      | Description                                    | Auth          |
| ------ | ------------- | ---------------------------------------------- | ------------- |
| GET    | `/`           | Get inventory list with filters and pagination | ADMIN, VENDOR |
| GET    | `/alerts`     | Get low-stock products                         | ADMIN         |
| GET    | `/summary`    | Get inventory summary dashboard stats          | ADMIN         |
| GET    | `/history`    | Get inventory history                          | ADMIN         |
| GET    | `/:productId` | Get inventory for one product                  | ADMIN, VENDOR |
| PUT    | `/:productId` | Manually adjust inventory                      | ADMIN         |

---

## 1) Get Inventory List

### Request

```http
GET /api/inventory?page=1&limit=20&lowStockOnly=true&categoryId=550e8400-e29b-41d4-a716-446655440000&search=milk
Authorization: Bearer {token}
```

### Query Params

- `page` - integer, minimum 1, default 1
- `limit` - integer, minimum 1, maximum 100, default 20
- `lowStockOnly` - `true` or `false`
- `categoryId` - optional UUID
- `search` - optional string, max 100 characters

### What it does

- Admin sees all inventory records.
- Vendor sees only inventory for products owned by their vendor account.
- Returns product details, stock levels, reserved units, and paging data.

### Success Response

```json
{
  "success": true,
  "data": {
    "inventories": [
      {
        "id": "inv-uuid",
        "product": {
          "id": "prod-uuid",
          "name": "Milk 1L",
          "nameEn": "Milk 1L",
          "nameDe": "Milch 1L",
          "sku": "MILK-001",
          "price": 2.49,
          "costPrice": 1.2,
          "soldCount": 42,
          "category": {
            "id": "cat-uuid",
            "name": "Dairy"
          },
          "vendor": {
            "id": "vendor-uuid",
            "businessName": "Fresh Farm"
          }
        },
        "stockQuantity": 120,
        "reservedQuantity": 8,
        "availableStock": 112,
        "reorderLevel": 10,
        "lowStock": false,
        "lastUpdated": "2026-05-09T10:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 1,
      "pages": 1
    }
  }
}
```

### Common Errors

- `401` - Missing or invalid token
- `403` - Vendor trying to access another vendor's inventory
- `400` - Invalid query values

---

## 2) Get Low Stock Alerts

### Request

```http
GET /api/inventory/alerts
Authorization: Bearer {adminToken}
```

### What it does

- Returns all products whose stock quantity is at or below their reorder level.
- Sorted from the lowest stock upward.

### Success Response

```json
{
  "success": true,
  "data": [
    {
      "id": "inv-uuid",
      "product": {
        "id": "prod-uuid",
        "name": "Tomato Sauce",
        "nameEn": "Tomato Sauce",
        "nameDe": "Tomatensauce",
        "sku": "SAUCE-100",
        "category": {
          "id": "cat-uuid",
          "name": "Sauces"
        },
        "vendor": {
          "id": "vendor-uuid",
          "businessName": "Local Foods"
        }
      },
      "currentStock": 4,
      "reorderLevel": 10,
      "shortage": 6,
      "lastUpdated": "2026-05-09T09:30:00.000Z"
    }
  ]
}
```

### Common Errors

- `401` - Missing token
- `403` - Admin role required

---

## 3) Get Inventory Summary

### Request

```http
GET /api/inventory/summary
Authorization: Bearer {adminToken}
```

### What it does

- Returns dashboard metrics for total inventory, low stock, out of stock, and top movers.

### Success Response

```json
{
  "success": true,
  "data": {
    "totalProducts": 245,
    "totalStockQuantity": 18430,
    "totalStockValue": 58240,
    "lowStockCount": 18,
    "outOfStockCount": 4,
    "fastMovingProducts": [
      {
        "id": "prod-uuid",
        "name": "Olive Oil",
        "nameEn": "Olive Oil",
        "nameDe": "Olivenoel",
        "sku": "OIL-200",
        "soldCount": 312,
        "stockQuantity": 54,
        "price": 7.99,
        "costPrice": 4.1,
        "stockValue": 221.4
      }
    ],
    "slowMovingProducts": [
      {
        "id": "prod-uuid-2",
        "name": "Special Spice Mix",
        "nameEn": "Special Spice Mix",
        "nameDe": "Gewuerzmischung",
        "sku": "SPICE-901",
        "soldCount": 3,
        "stockQuantity": 80,
        "price": 3.49,
        "costPrice": 1.1,
        "stockValue": 88
      }
    ]
  }
}
```

### Common Errors

- `401` - Missing token
- `403` - Admin role required

---

## 4) Get Inventory History

### Request

```http
GET /api/inventory/history?productId=550e8400-e29b-41d4-a716-446655440000&action=ADJUSTMENT&dateFrom=2026-05-01T00:00:00.000Z&dateTo=2026-05-09T23:59:59.999Z&page=1&limit=50
Authorization: Bearer {adminToken}
```

### Query Params

- `productId` - optional UUID
- `action` - optional inventory action enum value
- `dateFrom` - optional ISO datetime
- `dateTo` - optional ISO datetime
- `page` - integer, minimum 1, default 1
- `limit` - integer, minimum 1, maximum 100, default 50

### Supported Actions

- `PURCHASE`
- `RESERVATION`
- `RELEASE`
- `DEDUCTION`
- `ADJUSTMENT`
- `RETURN`

### What it does

- Returns a paginated audit trail of stock changes.
- Useful for debugging stock updates, refunds, and manual corrections.

### Success Response

```json
{
  "success": true,
  "data": {
    "history": [
      {
        "id": "hist-uuid",
        "product": {
          "name": "Milk 1L",
          "nameEn": "Milk 1L",
          "nameDe": "Milch 1L",
          "sku": "MILK-001"
        },
        "action": "ADJUSTMENT",
        "quantityChange": 20,
        "previousQuantity": 100,
        "newQuantity": 120,
        "orderId": null,
        "performedBy": "admin-user-uuid",
        "notes": "Manual adjustment by admin",
        "createdAt": "2026-05-09T10:05:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 50,
      "total": 1,
      "pages": 1
    }
  }
}
```

### Common Errors

- `401` - Missing token
- `403` - Admin role required
- `400` - Invalid action or datetime filter

---

## 5) Get One Product Inventory

### Request

```http
GET /api/inventory/550e8400-e29b-41d4-a716-446655440000
Authorization: Bearer {token}
```

### Path Param

- `productId` - UUID of the product

### What it does

- Returns the current inventory record for one product.
- Includes the latest 20 inventory history entries.
- Vendor users can only view their own product inventory.

### Success Response

```json
{
  "success": true,
  "data": {
    "id": "inv-uuid",
    "product": {
      "id": "prod-uuid",
      "name": "Milk 1L",
      "sku": "MILK-001"
    },
    "stockQuantity": 120,
    "reservedQuantity": 8,
    "availableStock": 112,
    "reorderLevel": 10,
    "lowStock": false,
    "lastUpdated": "2026-05-09T10:00:00.000Z",
    "history": [
      {
        "id": "hist-uuid",
        "action": "RESERVATION",
        "quantityChange": 2,
        "previousQuantity": 120,
        "newQuantity": 120,
        "orderId": "order-uuid",
        "performedBy": "SYSTEM",
        "notes": "Stock reserved for order order-uuid",
        "createdAt": "2026-05-09T09:50:00.000Z"
      }
    ]
  }
}
```

### Common Errors

- `401` - Missing token
- `403` - Vendor tried to access another vendor's product
- `404` - Inventory not found for this product

---

## 6) Update Inventory Manually

### Request

```http
PUT /api/inventory/550e8400-e29b-41d4-a716-446655440000
Authorization: Bearer {adminToken}
Content-Type: application/json

{
  "quantity": 150,
  "reorderLevel": 12,
  "notes": "Stock count corrected after warehouse audit",
  "action": "ADJUSTMENT"
}
```

### Request Body Rules

- `quantity` - integer, minimum 0
- `reorderLevel` - optional integer, minimum 0
- `notes` - optional string, maximum 500 characters
- `action` - must be exactly `ADJUSTMENT`

### What it does

- Replaces the inventory quantity with the provided value.
- Updates the product's `stockQuantity` at the same time.
- Writes an inventory history row for audit tracking.
- Creates a low-stock audit log if the new quantity is at or below the reorder level.

### Success Response

```json
{
  "success": true,
  "data": {
    "id": "inv-uuid",
    "product": {
      "id": "prod-uuid",
      "name": "Milk 1L",
      "sku": "MILK-001"
    },
    "stockQuantity": 150,
    "reservedQuantity": 8,
    "availableStock": 142,
    "reorderLevel": 12,
    "lowStock": false,
    "lastUpdated": "2026-05-09T10:10:00.000Z"
  },
  "message": "Inventory updated successfully"
}
```

### Common Errors

- `401` - Missing token
- `403` - Admin role required
- `404` - Inventory not found for this product
- `409` - Quantity cannot be negative

---

## Inventory Flow Behind the Endpoints

- `GET /` and `GET /:productId` read the live inventory record.
- `PUT /:productId` is the only public inventory write endpoint.
- Order creation reserves stock automatically.
- Payment success deducts stock.
- Order cancellation releases reservations.
- Refunds and returns can restore stock.

---

## Testing Checklist

1. Test list endpoint as admin and as vendor.
2. Verify vendor only sees own product inventory.
3. Test `lowStockOnly=true` with a product below reorder level.
4. Test history filters by action and date range.
5. Test manual update with `quantity: 0`.
6. Test `reorderLevel` update and verify `lastUpdated` changes.
7. Confirm admin-only routes reject vendor tokens.
