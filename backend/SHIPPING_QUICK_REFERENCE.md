# Shipping Module - Quick Reference

## Base URL

```
http://localhost:3001/api/shipping
```

## Authentication

- **Rates:** None (Public)
- **Shipment Mgmt:** Bearer Token - ADMIN
- **Tracking/Order:** Bearer Token - CUSTOMER/ADMIN
- **Token Header:** `Authorization: Bearer {accessToken}`

---

## Quick Endpoint Summary

| Method | Endpoint                 | Description              | Auth | Access         |
| ------ | ------------------------ | ------------------------ | ---- | -------------- |
| POST   | `/rates`                 | Calculate shipping rates | ❌   | Public         |
| POST   | `/`                      | Create shipment          | ✅   | ADMIN          |
| GET    | `/track/:trackingNumber` | Track package            | ✅   | CUSTOMER/ADMIN |
| GET    | `/:shipmentId/label`     | Download label PDF       | ✅   | ADMIN          |
| GET    | `/:orderId`              | Get order shipment       | ✅   | CUSTOMER/ADMIN |

---

## Common Use Cases

### 1. Calculate Shipping Rates

```bash
POST /api/shipping/rates
Content-Type: application/json

{
  "weightKg": 2.5,
  "postalCode": "10115",
  "orderTotal": 75.00
}
```

### 2. Create Shipment (Admin)

```bash
POST /api/shipping?orderId={orderId}
Authorization: Bearer {adminToken}
Content-Type: application/json

{
  "method": "DHL"
}
```

### 3. Track Package (Customer/Admin)

```bash
GET /api/shipping/track/{trackingNumber}
Authorization: Bearer {token}
```

### 4. Get Order Shipment

```bash
GET /api/shipping/{orderId}
Authorization: Bearer {token}
```

### 5. Download Label (Admin)

```bash
GET /api/shipping/{shipmentId}/label
Authorization: Bearer {adminToken}
```

---

## Shipping Methods

| Method    | Cost   | Estimated Days | Use Case       |
| --------- | ------ | -------------- | -------------- |
| STANDARD  | €5.99  | 3 days         | Default option |
| EXPRESS   | €9.99  | 1 day          | Fast delivery  |
| OVERNIGHT | €14.99 | Next day       | Premium option |

---

## Carriers

| Carrier | Code   | Notes                   |
| ------- | ------ | ----------------------- |
| DHL     | DHL    | Deutsche Post DHL Group |
| HERMES  | HERMES | Evri/Hermes             |
| DPD     | DPD    | DPD Express             |

---

## German Shipping Zones

| Zone | Region             | Postal Codes       |
| ---- | ------------------ | ------------------ |
| 1    | Berlin/Brandenburg | 10-16xxx           |
| 2    | North              | 17-25xxx           |
| 3    | West               | 40-59xxx           |
| 4    | South              | 70-99xxx           |
| 5    | East               | 01-09xxx, 26-39xxx |

---

## Free Shipping

- **Threshold:** €50.00 (configurable)
- **Applies:** STANDARD shipping only
- **Benefit:** Automatic for qualifying orders

---

## Shipment Statuses

| Status           | Description              |
| ---------------- | ------------------------ |
| PENDING          | Created, awaiting pickup |
| SHIPPED          | Picked up, in transit    |
| IN_TRANSIT       | Traveling to destination |
| OUT_FOR_DELIVERY | Out for delivery today   |
| DELIVERED        | Successfully delivered   |
| FAILED           | Delivery failed          |
| RETURNED         | Returned to sender       |

---

## Rate Calculation Logic

```
Base Rate: €5.99 (STANDARD)
Weight Limit: 2 kg
Overweight Surcharge: €0.50 per kg over limit

Example: 3.5 kg
= €5.99 + (1.5 × €0.50)
= €5.99 + €0.75
= €6.74
```

---

## Request/Response Examples

### Rates - Success

```json
{
  "success": true,
  "data": {
    "rates": [{ "method": "STANDARD", "cost": 5.99, "estimatedDays": 3, "carrier": "DHL" }],
    "freeShippingThreshold": 50,
    "qualifiesForFreeShipping": true
  }
}
```

### Shipment Creation - Success

```json
{
  "success": true,
  "data": {
    "shipmentId": "ship-uuid",
    "trackingNumber": "1234567890123456789",
    "carrier": "DHL",
    "method": "DHL",
    "status": "SHIPPED",
    "labelUrl": "https://cdn.../label.pdf",
    "estimatedDelivery": "2026-05-12"
  }
}
```

### Tracking - Success

```json
{
  "success": true,
  "data": {
    "trackingNumber": "1234567890123456789",
    "carrier": "DHL",
    "status": "IN_TRANSIT",
    "estimatedDelivery": "2026-05-12",
    "events": [
      {
        "status": "SHIPPED",
        "location": "Berlin, DE",
        "timestamp": "2026-05-08T10:00:00Z"
      }
    ]
  }
}
```

---

## Error Codes

| Code                    | HTTP | Description                     |
| ----------------------- | ---- | ------------------------------- |
| INVALID_SHIPPING_PARAMS | 400  | Missing weightKg or postalCode  |
| INVALID_POSTAL_CODE     | 400  | Invalid 5-digit postal code     |
| ORDER_NOT_FOUND         | 404  | Order doesn't exist             |
| ORDER_ALREADY_SHIPPED   | 400  | Order already has shipment      |
| SHIPMENT_EXISTS         | 400  | Shipment already created        |
| INVALID_METHOD          | 400  | Unknown shipping method         |
| FORBIDDEN               | 403  | Admin required or unauthorized  |
| NO_TRACKING             | 400  | Shipment has no tracking number |

---

## Authorization Rules

### Create Shipment

- ✅ ADMIN only

### Track Package

- ✅ CUSTOMER (own orders only)
- ✅ ADMIN (all orders)

### Download Label

- ✅ ADMIN only

### Get Order Shipment

- ✅ CUSTOMER (own orders only)
- ✅ ADMIN (all orders)

---

## Testing Tips

1. **Rates:** Test all 5 zones, various weights
2. **Free Shipping:** Test €49.99 vs €50.00
3. **Shipment:** Verify cannot create twice for same order
4. **Tracking:** Verify real-time updates from carrier APIs
5. **Authorization:** Test customer accessing other's shipment (expect 403)
6. **Label:** Verify PDF file download works
7. **Carriers:** Test all 3 carriers for proper integration
8. **Events:** Check tracking events populate correctly

---

## Integration Points

- **Orders Module** - Get order for shipment creation
- **Customers** - Get delivery address and contact info
- **Carrier APIs** - DHL, HERMES, DPD for real-time tracking
- **PDF Generation** - Create shipping labels
- **Email Service** - Send tracking notifications

---

## Workflow Example

1. **Customer places order** → Order created
2. **Admin creates shipment** → POST /api/shipping with method
3. **Shipment assigned** → Tracking number generated
4. **Label generated** → Admin downloads via label endpoint
5. **Package shipped** → Status updated to SHIPPED
6. **Customer tracks** → Uses tracking endpoint for live updates
7. **Package delivered** → Status updates to DELIVERED
