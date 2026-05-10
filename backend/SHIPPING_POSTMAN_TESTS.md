# Shipping Module - Postman Tests

**Base URL:** `http://localhost:3001/api/shipping`  
**Authentication:** Varies by endpoint (some public, some ADMIN/CUSTOMER)  
**Total Endpoints:** 5  
**Carriers Supported:** DHL, HERMES, DPD

---

## 1. Get Shipping Rates

**Endpoint:** `POST /api/shipping/rates`

**Description:** Calculate available shipping rates for a package based on weight, postal code, and order total. Public endpoint.

**Authentication:** None (Public)

**Headers:**

```
Content-Type: application/json
```

**Request Body:**

```json
{
  "weightKg": 2.5,
  "postalCode": "10115",
  "orderTotal": 75.0
}
```

**Validation Rules:**

- `weightKg`: Required, positive number
- `postalCode`: Required, 5-digit German postal code format
- `orderTotal`: Optional, positive number (used to check free shipping eligibility)

**Response - Success (200):**

```json
{
  "success": true,
  "data": {
    "rates": [
      {
        "method": "STANDARD",
        "cost": 5.99,
        "estimatedDays": 3,
        "carrier": "DHL"
      },
      {
        "method": "EXPRESS",
        "cost": 9.99,
        "estimatedDays": 1,
        "carrier": "DHL"
      },
      {
        "method": "OVERNIGHT",
        "cost": 14.99,
        "estimatedDays": 0,
        "carrier": "DHL"
      }
    ],
    "freeShippingThreshold": 50,
    "qualifiesForFreeShipping": true
  }
}
```

**Response - Under Free Shipping Threshold (200):**

```json
{
  "success": true,
  "data": {
    "rates": [
      {
        "method": "STANDARD",
        "cost": 5.99,
        "estimatedDays": 3,
        "carrier": "DHL"
      }
    ],
    "freeShippingThreshold": 50,
    "qualifiesForFreeShipping": false
  }
}
```

**Response - Invalid Postal Code (400):**

```json
{
  "success": false,
  "error": "Invalid German postal code format",
  "code": "INVALID_POSTAL_CODE"
}
```

**Response - Missing Parameters (400):**

```json
{
  "success": false,
  "error": "weightKg and postalCode are required",
  "code": "INVALID_SHIPPING_PARAMS"
}
```

---

## 2. Create Shipment

**Endpoint:** `POST /api/shipping`

**Description:** Create a shipment for an order and generate tracking number. ADMIN only.

**Authentication:** Bearer Token (ADMIN)

**Headers:**

```
Authorization: Bearer {adminToken}
Content-Type: application/json
```

**Path Parameters:**

- `orderId`: UUID of the order

**Request Body:**

```json
{
  "method": "DHL",
  "orderId": "ord-uuid-123"
}
```

**Shipping Methods:**

- `DHL`: Deutsche Post DHL Group
- `HERMES`: Evri/Hermes
- `DPD`: DPD Express

**Response - Success (201):**

```json
{
  "success": true,
  "data": {
    "shipmentId": "ship-uuid-1",
    "orderId": "ord-uuid-123",
    "trackingNumber": "1234567890123456789",
    "carrier": "DHL",
    "method": "DHL",
    "status": "SHIPPED",
    "labelUrl": "https://cdn.../label-1234567890123456789.pdf",
    "estimatedDelivery": "2026-05-12"
  }
}
```

**Response - Order Not Found (404):**

```json
{
  "success": false,
  "error": "Order not found",
  "code": "ORDER_NOT_FOUND"
}
```

**Response - Order Already Shipped (400):**

```json
{
  "success": false,
  "error": "Order is already shipped",
  "code": "ORDER_ALREADY_SHIPPED"
}
```

**Response - Shipment Exists (400):**

```json
{
  "success": false,
  "error": "Shipment already exists for this order",
  "code": "SHIPMENT_EXISTS"
}
```

**Response - Invalid Method (400):**

```json
{
  "success": false,
  "error": "Invalid shipping method",
  "code": "INVALID_METHOD"
}
```

**Response - Forbidden (403):**

```json
{
  "success": false,
  "error": "Only admins can create shipments",
  "code": "FORBIDDEN"
}
```

---

## 3. Get Tracking Information

**Endpoint:** `GET /api/shipping/track/:trackingNumber`

**Description:** Retrieve real-time tracking information for a shipment. Customer can track own orders, admin can track all.

**Authentication:** Bearer Token (CUSTOMER/ADMIN)

**Headers:**

```
Authorization: Bearer {accessToken}
Content-Type: application/json
```

**Path Parameters:**

- `trackingNumber`: Tracking number from shipment

**Example Request:**

```
GET /api/shipping/track/1234567890123456789
```

**Response - Success (200):**

```json
{
  "success": true,
  "data": {
    "trackingNumber": "1234567890123456789",
    "carrier": "DHL",
    "method": "DHL",
    "status": "IN_TRANSIT",
    "estimatedDelivery": "2026-05-12",
    "events": [
      {
        "status": "SHIPPED",
        "location": "Berlin, DE",
        "timestamp": "2026-05-08T10:00:00Z",
        "description": "Shipment has been picked up and is in transit"
      },
      {
        "status": "IN_TRANSIT",
        "location": "Munich Hub, DE",
        "timestamp": "2026-05-09T08:30:00Z",
        "description": "Package in transit to destination"
      },
      {
        "status": "OUT_FOR_DELIVERY",
        "location": "Munich, DE",
        "timestamp": "2026-05-10T07:00:00Z",
        "description": "Package out for delivery today"
      }
    ]
  }
}
```

**Response - Not Found (404):**

```json
{
  "success": false,
  "error": "Tracking not found",
  "code": "NOT_FOUND"
}
```

**Response - Unauthorized (403):**

```json
{
  "success": false,
  "error": "Unauthorized to view this shipment",
  "code": "FORBIDDEN"
}
```

---

## 4. Download Shipping Label

**Endpoint:** `GET /api/shipping/:shipmentId/label`

**Description:** Download the shipping label PDF for a shipment. ADMIN only.

**Authentication:** Bearer Token (ADMIN)

**Headers:**

```
Authorization: Bearer {adminToken}
```

**Path Parameters:**

- `shipmentId`: UUID of the shipment

**Example Request:**

```
GET /api/shipping/ship-uuid-1/label
```

**Response - Success (200):**

- Returns PDF file with headers:

```
Content-Type: application/pdf
Content-Disposition: attachment; filename="label-1234567890123456789.pdf"
```

**Response - No Tracking (400):**

```json
{
  "success": false,
  "error": "No tracking number for this shipment",
  "code": "NO_TRACKING"
}
```

**Response - Forbidden (403):**

```json
{
  "success": false,
  "error": "Only admins can download labels",
  "code": "FORBIDDEN"
}
```

**Response - Not Found (404):**

```json
{
  "success": false,
  "error": "Shipment not found",
  "code": "NOT_FOUND"
}
```

---

## 5. Get Order Shipment

**Endpoint:** `GET /api/shipping/:orderId`

**Description:** Retrieve shipment details for an order, including tracking events. Customer can view own orders, admin can view all.

**Authentication:** Bearer Token (CUSTOMER/ADMIN)

**Headers:**

```
Authorization: Bearer {accessToken}
Content-Type: application/json
```

**Path Parameters:**

- `orderId`: UUID of the order

**Example Request:**

```
GET /api/shipping/ord-uuid-123
```

**Response - Success (200):**

```json
{
  "success": true,
  "data": {
    "shipmentId": "ship-uuid-1",
    "orderId": "ord-uuid-123",
    "trackingNumber": "1234567890123456789",
    "carrier": "DHL",
    "method": "DHL",
    "status": "IN_TRANSIT",
    "labelUrl": "https://cdn.../label-1234567890123456789.pdf",
    "estimatedDelivery": "2026-05-12",
    "actualDelivery": null,
    "trackingEvents": [
      {
        "id": "event-1",
        "shipmentId": "ship-uuid-1",
        "status": "SHIPPED",
        "location": "Berlin, DE",
        "description": "Shipment has been picked up and is in transit",
        "occurredAt": "2026-05-08T10:00:00Z"
      },
      {
        "id": "event-2",
        "shipmentId": "ship-uuid-1",
        "status": "IN_TRANSIT",
        "location": "Munich Hub, DE",
        "description": "Package in transit to destination",
        "occurredAt": "2026-05-09T08:30:00Z"
      }
    ],
    "createdAt": "2026-05-08T10:00:00Z",
    "updatedAt": "2026-05-09T08:30:00Z"
  }
}
```

**Response - No Shipment Yet (200):**

```json
{
  "success": true,
  "data": null,
  "message": "No shipment created for this order yet"
}
```

**Response - Order Not Found (404):**

```json
{
  "success": false,
  "error": "Order not found",
  "code": "ORDER_NOT_FOUND"
}
```

**Response - Unauthorized (403):**

```json
{
  "success": false,
  "error": "Unauthorized to view this order",
  "code": "FORBIDDEN"
}
```

---

## Shipping Zones

Germany is divided into 5 shipping zones:

| Zone | Name               | Postal Code Prefixes |
| ---- | ------------------ | -------------------- |
| 1    | Berlin/Brandenburg | 10-16                |
| 2    | North              | 17-25                |
| 3    | West               | 40-59                |
| 4    | South              | 70-99                |
| 5    | East               | 01-09, 26-39         |

---

## Shipment Statuses

| Status           | Description                       |
| ---------------- | --------------------------------- |
| PENDING          | Shipment created, awaiting pickup |
| SHIPPED          | Package picked up and in transit  |
| IN_TRANSIT       | Package traveling to destination  |
| OUT_FOR_DELIVERY | Package out for delivery today    |
| DELIVERED        | Package delivered                 |
| FAILED           | Delivery attempt failed           |
| RETURNED         | Package returned to sender        |

---

## Testing Checklist

- [ ] Calculate shipping rates for valid postal code
- [ ] Verify free shipping applies for orders €50+
- [ ] Test different weight categories
- [ ] Create shipment with DHL method (ADMIN)
- [ ] Try creating shipment twice (verify error)
- [ ] Verify tracking number generated
- [ ] Get tracking with valid tracking number (CUSTOMER)
- [ ] Get tracking as admin (all orders accessible)
- [ ] Verify customer cannot see other customer's tracking
- [ ] Download label as admin (returns PDF)
- [ ] Try downloading label as customer (expect 403)
- [ ] Get order shipment details (before shipment created)
- [ ] Get order shipment details (after shipment created)
- [ ] Verify tracking events populated correctly
- [ ] Test all 5 shipping zones
- [ ] Test invalid postal code format
- [ ] Test all 3 carriers (DHL, HERMES, DPD)

---

## Key Features

✅ **5 German Shipping Zones** with zone-based rate calculation  
✅ **3 Carriers** (DHL, HERMES, DPD) with real-time tracking integration  
✅ **3 Service Levels** (Standard, Express, Overnight)  
✅ **Free Shipping** for orders €50+ (configurable)  
✅ **PDF Label Generation** for easy printing  
✅ **Real-time Tracking** with event history  
✅ **Weight-based Pricing** with overweight surcharges  
✅ **Authorization Control** - Customers see own orders only
