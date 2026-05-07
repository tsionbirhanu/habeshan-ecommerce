# Payment Module API - Postman Endpoints

## Base URL
```
{{base_url}}/payments
```

**Set `base_url` = `http://localhost:3001/api`**

---

## 🔐 AUTHENTICATION & ROLES

| Endpoint | Customer | Admin | Public |
|----------|----------|-------|--------|
| GET /methods | - | - | ✅ |
| POST /stripe/create-intent | ✅ | - | - |
| POST /paypal/create | ✅ | - | - |
| POST /paypal/capture | ✅ | - | - |
| POST /klarna/session | ✅ | - | - |
| POST /klarna/confirm | ✅ | - | - |
| GET /:orderId | ✅ (own) | ✅ (any) | - |
| POST /:orderId/refund | - | ✅ | - |
| GET /:orderId/invoice | ✅ (own) | ✅ (any) | - |
| GET /:orderId/invoice/download | ✅ (own) | ✅ (any) | - |
| POST /:orderId/invoice/send | - | ✅ | - |
| GET /:orderId/receipt | ✅ (own) | ✅ (any) | - |
| POST /stripe/webhook | - | - | ✅ (Stripe only) |
| POST /paypal/webhook | - | - | ✅ (PayPal only) |
| POST /klarna/webhook | - | - | ✅ (Klarna only) |

**Headers for authenticated routes:**
```
Authorization: Bearer {{access_token}}
Content-Type: application/json
```

---

## 💳 PAYMENT METHODS

| Method | ID | Description | Environment Variables |
|--------|-----|-------------|----------------------|
| **Stripe** | `stripe` | Card Payment (Visa, Mastercard, etc.) | `STRIPE_SECRET_KEY`, `STRIPE_PUBLISHABLE_KEY`, `STRIPE_WEBHOOK_SECRET` |
| **PayPal** | `paypal` | PayPal Checkout | `PAYPAL_CLIENT_ID`, `PAYPAL_CLIENT_SECRET`, `PAYPAL_WEBHOOK_ID` |
| **Klarna** | `klarna` | Buy now, pay later | `KLARNA_API_KEY`, `KLARNA_API_SECRET` |

---

## 📦 PAYMENT STATUS

| Status | Description |
|--------|-------------|
| `PENDING` | Awaiting payment confirmation |
| `PROCESSING` | Payment in progress |
| `COMPLETED` | Payment successfully received |
| `FAILED` | Payment failed |
| `REFUNDED` | Full refund processed |
| `PARTIALLY_REFUNDED` | Partial refund processed |

---

## 📦 PAYMENT ENDPOINTS

### 1. GET /payments/methods - Get Available Payment Methods

**Auth Required:** None (Public)

**Description:** Returns list of enabled payment methods based on environment configuration.

**Request:**
```http
GET {{base_url}}/payments/methods
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "methods": [
      {
        "id": "stripe",
        "name": "Card Payment (Stripe)",
        "description": "Pay with Visa, Mastercard, or other cards",
        "icon": "credit-card",
        "enabled": true
      },
      {
        "id": "paypal",
        "name": "PayPal",
        "description": "Fast, safe, and secure payment with PayPal",
        "icon": "paypal",
        "enabled": false
      },
      {
        "id": "klarna",
        "name": "Klarna",
        "description": "Buy now, pay later with Klarna",
        "icon": "klarna",
        "enabled": false
      }
    ]
  }
}
```

---

### 2. POST /payments/stripe/create-intent - Create Stripe PaymentIntent

**Auth Required:** Bearer Token (CUSTOMER only)

**Description:** Creates a Stripe PaymentIntent for an order. Returns `clientSecret` for Stripe.js frontend integration. Order must be in `PENDING_PAYMENT` status.

**Prerequisites:**
- Order created via `POST /orders`
- Order status: `PENDING_PAYMENT`

**Request:**
```http
POST {{base_url}}/payments/stripe/create-intent
Authorization: Bearer {{customer_token}}
Content-Type: application/json

{
  "orderId": "550e8400-e29b-41d4-a716-446655440000"
}
```

**Request Body:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| orderId | UUID | Yes | Order ID to create payment for |

**Response (200):**
```json
{
  "success": true,
  "data": {
    "clientSecret": "pi_3O..._secret_...",
    "paymentIntentId": "pi_3O...",
    "publishableKey": "pk_test_...",
    "amount": 3188,
    "amountFormatted": "31.88",
    "orderId": "550e8400-e29b-41d4-a716-446655440000"
  },
  "message": "PaymentIntent created successfully"
}
```

**Frontend Stripe.js Integration:**
```javascript
const stripe = Stripe(publishableKey);
const result = await stripe.confirmCardPayment(clientSecret, {
  payment_method: {
    card: cardElement,
    billing_details: {
      name: 'John Doe',
      email: 'john@example.com'
    }
  }
});
```

**Error - Order Not Found (404):**
```json
{
  "success": false,
  "error": "Order not found",
  "code": "NOT_FOUND"
}
```

**Error - Not Your Order (403):**
```json
{
  "success": false,
  "error": "This order does not belong to you",
  "code": "FORBIDDEN"
}
```

**Error - Wrong Order Status (409):**
```json
{
  "success": false,
  "error": "Order must be in PENDING_PAYMENT status. Current status: CONFIRMED",
  "code": "CONFLICT"
}
```

---

### 3. POST /payments/paypal/create - Create PayPal Order

**Auth Required:** Bearer Token (CUSTOMER only)

**Description:** Creates a PayPal order for frontend PayPal SDK integration. Returns `paypalOrderId` and `approvalUrl` to redirect customer to PayPal.

**Prerequisites:**
- Order created via `POST /orders`
- Order status: `PENDING_PAYMENT`

**Request:**
```http
POST {{base_url}}/payments/paypal/create
Authorization: Bearer {{customer_token}}
Content-Type: application/json

{
  "orderId": "550e8400-e29b-41d4-a716-446655440000"
}
```

**Request Body:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| orderId | UUID | Yes | Order ID to create PayPal order for |

**Response (200):**
```json
{
  "success": true,
  "data": {
    "paypalOrderId": "5O190127TN364715T",
    "approvalUrl": "https://www.paypal.com/checkoutnow?token=5O190127TN364715T",
    "orderId": "550e8400-e29b-41d4-a716-446655440000"
  },
  "message": "PayPal order created successfully"
}
```

**Frontend Flow:**
1. Redirect customer to `approvalUrl`
2. Customer approves payment on PayPal
3. PayPal redirects to `returnUrl` with `token` parameter
4. Call `POST /payments/paypal/capture` to complete payment

---

### 4. POST /payments/paypal/capture - Capture PayPal Payment

**Auth Required:** Bearer Token (CUSTOMER only)

**Description:** Captures authorized PayPal payment after customer approval. Completes the order and deducts inventory.

**Prerequisites:**
- Customer approved payment on PayPal
- Have `paypalOrderId` from previous step

**Request:**
```http
POST {{base_url}}/payments/paypal/capture
Authorization: Bearer {{customer_token}}
Content-Type: application/json

{
  "paypalOrderId": "5O190127TN364715T",
  "orderId": "550e8400-e29b-41d4-a716-446655440000"
}
```

**Request Body:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| paypalOrderId | string | Yes | PayPal Order ID from approval |
| orderId | UUID | Yes | Internal order ID |

**Response (200):**
```json
{
  "success": true,
  "data": {
    "captureId": "8F2778877K6312831",
    "status": "COMPLETED",
    "orderId": "550e8400-e29b-41d4-a716-446655440000"
  },
  "message": "Payment captured successfully"
}
```

---

### 5. POST /payments/klarna/session - Create Klarna Session

**Auth Required:** Bearer Token (CUSTOMER only)

**Description:** Creates a Klarna checkout session for "Buy now, pay later". Returns `clientToken` for Klarna.js widget integration.

**Prerequisites:**
- Order created via `POST /orders`
- Order status: `PENDING_PAYMENT`

**Request:**
```http
POST {{base_url}}/payments/klarna/session
Authorization: Bearer {{customer_token}}
Content-Type: application/json

{
  "orderId": "550e8400-e29b-41d4-a716-446655440000"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "sessionId": "session-uuid",
    "clientToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "redirectUrl": "https://pay.klarna.com/...",
    "orderId": "550e8400-e29b-41d4-a716-446655440000"
  }
}
```

**Frontend Klarna Integration:**
```javascript
Klarna.Payments.init({ client_token: clientToken });
Klarna.Payments.load({
  container: '#klarna-container'
}, function(res) {
  console.log(res);
});
```

---

### 6. POST /payments/klarna/confirm - Confirm Klarna Order

**Auth Required:** Bearer Token (CUSTOMER only)

**Description:** Confirms Klarna payment after customer authorization. Completes the order and deducts inventory.

**Request:**
```http
POST {{base_url}}/payments/klarna/confirm
Authorization: Bearer {{customer_token}}
Content-Type: application/json

{
  "sessionId": "session-uuid",
  "orderId": "550e8400-e29b-41d4-a716-446655440000"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "klarnaOrderId": "klarna-order-uuid",
    "orderId": "550e8400-e29b-41d4-a716-446655440000"
  }
}
```

---

### 7. GET /payments/:orderId - Get Payment Status

**Auth Required:** Bearer Token (CUSTOMER - own orders only, ADMIN - any order)

**Description:** Retrieves detailed payment information for an order including transaction ID, provider response, and refund history.

**Request:**
```http
GET {{base_url}}/payments/550e8400-e29b-41d4-a716-446655440000
Authorization: Bearer {{access_token}}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "orderId": "550e8400-e29b-41d4-a716-446655440000",
    "method": "STRIPE",
    "status": "COMPLETED",
    "amount": 31.88,
    "amountFormatted": "31.88",
    "transactionId": "pi_3O...",
    "refundedAmount": 0,
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:35:00.000Z",
    "providerResponse": {
      "clientSecret": "pi_3O..._secret_...",
      "paymentIntentId": "pi_3O...",
      "createdAt": "2024-01-15T10:30:00.000Z",
      "status": "succeeded",
      "amountReceived": 3188,
      "succeededAt": "2024-01-15T10:35:00.000Z"
    }
  }
}
```

---

### 8. POST /payments/:orderId/refund - Refund Payment (Admin)

**Auth Required:** Bearer Token (ADMIN only)

**Description:** Processes a full or partial refund for a completed payment. Order must be `DELIVERED`, `COMPLETED`, or `RETURNED`. Updates inventory if fully refunded.

**Refund Requirements:**
- Payment status: `COMPLETED` or `PARTIALLY_REFUNDED`
- Order status: `DELIVERED`, `COMPLETED`, or `RETURNED`
- Must have `transactionId` (PaymentIntent ID)

**Request:**
```http
POST {{base_url}}/payments/550e8400-e29b-41d4-a716-446655440000/refund
Authorization: Bearer {{admin_token}}
Content-Type: application/json

{
  "amount": 15.00,
  "reason": "requested_by_customer"
}
```

**Request Body:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| amount | number | No | Amount to refund (omit for full refund) |
| reason | enum | No | `duplicate`, `fraudulent`, `requested_by_customer`, `other` |

**Response (200) - Partial Refund:**
```json
{
  "success": true,
  "data": {
    "refundId": "re_3O...",
    "amount": 15.00,
    "amountFormatted": "15.00",
    "status": "succeeded",
    "paymentStatus": "PARTIALLY_REFUNDED",
    "totalRefunded": 15.00,
    "totalRefundedFormatted": "15.00"
  },
  "message": "Payment refunded successfully"
}
```

**Response (200) - Full Refund:**
```json
{
  "success": true,
  "data": {
    "refundId": "re_3O...",
    "amount": 31.88,
    "amountFormatted": "31.88",
    "status": "succeeded",
    "paymentStatus": "REFUNDED",
    "totalRefunded": 31.88,
    "totalRefundedFormatted": "31.88"
  },
  "message": "Payment refunded successfully"
}
```

**Error - Payment Not Refundable (409):**
```json
{
  "success": false,
  "error": "Payment cannot be refunded. Current status: PENDING",
  "code": "CONFLICT"
}
```

**Error - Order Not Refundable (409):**
```json
{
  "success": false,
  "error": "Order must be delivered or returned to refund. Current status: CONFIRMED",
  "code": "CONFLICT"
}
```

**Error - Exceeds Refundable Amount (400):**
```json
{
  "success": false,
  "error": "Refund amount exceeds remaining refundable amount. Max: €16.88",
  "code": "VALIDATION_ERROR"
}
```

---

### 9. GET /payments/:orderId/invoice - Get Invoice Data (JSON)

**Auth Required:** Bearer Token (CUSTOMER - own orders only, ADMIN - any order)

**Description:** Retrieves invoice data as JSON. Invoice is auto-generated on successful payment.

**Request:**
```http
GET {{base_url}}/payments/550e8400-e29b-41d4-a716-446655440000/invoice
Authorization: Bearer {{access_token}}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "invoice": {
      "id": "inv-uuid",
      "orderId": "550e8400-e29b-41d4-a716-446655440000",
      "invoiceNumber": "HMM-2024-0001",
      "createdAt": "2024-01-15T10:35:00.000Z",
      "sentAt": null
    },
    "invoiceNumber": "HMM-2024-0001",
    "invoiceDate": "15.01.2024",
    "order": {...},
    "items": [...],
    "customer": {
      "firstName": "John",
      "lastName": "Doe",
      "email": "john@example.com",
      "phone": "+49123456789"
    },
    "payment": {...},
    "subtotal": 25.98,
    "vatBreakdown": [
      { "rate": 7, "amount": 0.91 }
    ],
    "totalTax": 0.91,
    "totalAmount": 31.88,
    "shippingCost": 4.99,
    "discount": 0
  }
}
```

**Invoice Number Format:** `HMM-YYYY-XXXX` (e.g., `HMM-2024-0001`)

---

### 10. GET /payments/:orderId/invoice/download - Download Invoice PDF

**Auth Required:** Bearer Token (CUSTOMER - own orders only, ADMIN - any order)

**Description:** Downloads invoice as PDF file with German legal format (Rechnung). Includes VAT breakdown, company details, and payment information.

**Request:**
```http
GET {{base_url}}/payments/550e8400-e29b-41d4-a716-446655440000/invoice/download
Authorization: Bearer {{access_token}}
```

**Response:**
- **Content-Type:** `application/pdf`
- **Content-Disposition:** `attachment; filename="invoice-HMM-2024-0001.pdf"`
- **Body:** Binary PDF data

**Postman Setup:**
1. Send request with "Send and Download" button
2. Or set response to "Save to file" in Postman
3. File will download as `invoice-HMM-2024-0001.pdf`

**PDF Contains:**
- Company name and address (from env)
- Invoice number and date
- Customer delivery address
- Itemized list with VAT breakdown
- Subtotal, shipping, discount, total
- Tax number and bank details
- Payment method and date

---

### 11. POST /payments/:orderId/invoice/send - Send Invoice Email (Admin)

**Auth Required:** Bearer Token (ADMIN only)

**Description:** Sends invoice PDF via email to customer. Updates `sentAt` timestamp.

**Request:**
```http
POST {{base_url}}/payments/550e8400-e29b-41d4-a716-446655440000/invoice/send
Authorization: Bearer {{admin_token}}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Invoice email sent successfully"
}
```

---

### 12. GET /payments/:orderId/receipt - Get Payment Receipt

**Auth Required:** Bearer Token (CUSTOMER - own orders only, ADMIN - any order)

**Description:** Retrieves simplified payment receipt (less detailed than invoice). Good for quick reference.

**Request:**
```http
GET {{base_url}}/payments/550e8400-e29b-41d4-a716-446655440000/receipt
Authorization: Bearer {{access_token}}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "receiptDate": "15.01.2024",
    "receiptNumber": "REC-550E8400",
    "orderNumber": "550e8400-e29b-41d4-a716-446655440000",
    "customer": {
      "firstName": "John",
      "lastName": "Doe",
      "email": "john@example.com"
    },
    "subtotal": 25.98,
    "taxAmount": 0.91,
    "shippingCost": 4.99,
    "discount": 0,
    "totalAmount": 31.88,
    "paymentMethod": "STRIPE",
    "paymentStatus": "COMPLETED",
    "orderStatus": "CONFIRMED"
  }
}
```

---

## 🔌 WEBHOOK ENDPOINTS (Server-to-Server)

These endpoints receive notifications from payment providers. **Do not call directly.**

### Stripe Webhook

**Endpoint:** `POST /payments/stripe/webhook`

**Authentication:** Stripe signature verification (no Bearer token)

**Headers:**
```
Stripe-Signature: t=...,v1=...
```

**Events Handled:**
| Event | Action |
|-------|--------|
| `payment_intent.succeeded` | Update payment COMPLETED, order CONFIRMED, deduct stock, send email, generate invoice |
| `payment_intent.payment_failed` | Update payment FAILED, order paymentStatus FAILED, log error |
| `charge.refunded` | Update payment REFUNDED/PARTIALLY_REFUNDED, order REFUNDED, restore stock |

**Response:** Always returns `200` to prevent retries

---

### PayPal Webhook

**Endpoint:** `POST /payments/paypal/webhook`

**Authentication:** PayPal certificate signature verification

**Events Handled:**
| Event | Action |
|-------|--------|
| `PAYMENT.CAPTURE.REFUNDED` | Update payment REFUNDED |

---

### Klarna Webhook

**Endpoint:** `POST /payments/klarna/webhook`

**Authentication:** Klarna signature verification

**Headers:**
```
X-Klarna-Signature: ...
```

**Events Handled:**
| Event | Action |
|-------|--------|
| `order.refunded` | Update payment REFUNDED |

---

## 🔧 POSTMAN WORKFLOWS

### Complete Stripe Payment Flow (Customer)

```
1. POST /auth/login (as Customer)
   → Save customer_token

2. POST /orders (Create Order)
   {
     "deliveryAddressId": "address-uuid",
     "shippingMethod": "STANDARD"
   }
   → Save orderId

3. GET /payments/methods
   → Check Stripe is enabled

4. POST /payments/stripe/create-intent
   {
     "orderId": "order-uuid"
   }
   → Returns clientSecret, publishableKey

5. [FRONTEND] Use Stripe.js to confirm payment
   const result = await stripe.confirmCardPayment(clientSecret, {...})

6. [WEBHOOK] Stripe sends payment_intent.succeeded
   → Backend auto-updates order, sends email, generates invoice

7. GET /payments/{orderId}
   → Verify payment status: COMPLETED

8. GET /payments/{orderId}/receipt
   → Get payment receipt

9. GET /payments/{orderId}/invoice/download
   → Download PDF invoice
```

### Complete PayPal Payment Flow (Customer)

```
1. POST /auth/login (as Customer)
   → Save customer_token

2. POST /orders (Create Order)
   → Save orderId

3. POST /payments/paypal/create
   {
     "orderId": "order-uuid"
   }
   → Returns approvalUrl, paypalOrderId

4. [FRONTEND] Redirect customer to approvalUrl
   window.location.href = approvalUrl

5. Customer approves on PayPal, returns to returnUrl with ?token=...

6. POST /payments/paypal/capture
   {
     "paypalOrderId": "5O190127TN364715T",
     "orderId": "order-uuid"
   }
   → Payment captured, order confirmed

7. GET /payments/{orderId}/invoice/download
   → Download invoice
```

### Admin Refund Workflow

```
1. POST /auth/login (as Admin)
   → Save admin_token

2. GET /orders
   → Find order to refund (must be DELIVERED/COMPLETED)

3. GET /payments/{orderId}
   → Check payment status: COMPLETED

4. POST /payments/{orderId}/refund
   {
     "amount": 15.00,  // Omit for full refund
     "reason": "requested_by_customer"
   }
   → Returns refund confirmation

5. GET /payments/{orderId}
   → Verify paymentStatus: PARTIALLY_REFUNDED or REFUNDED

6. POST /payments/{orderId}/invoice/send
   → Send updated invoice to customer
```

---

## 🐛 COMMON ERRORS

### 400 - Validation Error
```json
{
  "success": false,
  "error": "Invalid request body",
  "code": "VALIDATION_ERROR",
  "details": ["orderId: Invalid order ID format"]
}
```

### 401 - Unauthorized
```json
{
  "success": false,
  "error": "Access token required",
  "code": "UNAUTHORIZED"
}
```

### 403 - Forbidden
```json
{
  "success": false,
  "error": "Customer access required",
  "code": "FORBIDDEN"
}
```

### 404 - Order/Payment Not Found
```json
{
  "success": false,
  "error": "Order not found",
  "code": "NOT_FOUND"
}
```

### 404 - Invoice Not Found
```json
{
  "success": false,
  "error": "Invoice not found for this order",
  "code": "NOT_FOUND"
}
```

### 409 - Payment Already Completed
```json
{
  "success": false,
  "error": "Order must be in PENDING_PAYMENT status. Current status: CONFIRMED",
  "code": "CONFLICT"
}
```

### 409 - Payment Method Not Enabled
```json
{
  "success": false,
  "error": "Stripe is not configured",
  "code": "CONFLICT"
}
```

---

## 📋 VALIDATION RULES

### Create PaymentIntent / PayPal Order / Klarna Session
| Field | Rules |
|-------|-------|
| orderId | Valid UUID, must belong to customer, order status must be PENDING_PAYMENT |

### Capture PayPal Order
| Field | Rules |
|-------|-------|
| paypalOrderId | Non-empty string, must be valid PayPal order |
| orderId | Valid UUID, must match PayPal order metadata |

### Confirm Klarna Order
| Field | Rules |
|-------|-------|
| sessionId | Non-empty string, valid Klarna session |
| orderId | Valid UUID, must match session order |

### Refund Payment
| Field | Rules |
|-------|-------|
| amount | Positive number, must not exceed remaining refundable amount |
| reason | Enum: `duplicate`, `fraudulent`, `requested_by_customer`, `other` |

---

## 💡 IMPORTANT NOTES

1. **Currency:** All amounts are in **EUR (€)**. Stripe amounts are in **cents** (e.g., €31.88 = 3188 cents).

2. **Invoice Auto-Generation:** Invoice is automatically created when payment succeeds via webhook. No manual invoice creation needed.

3. **Webhook Requirements:**
   - Stripe webhook requires raw body (not JSON parsed)
   - Must be registered in `app.ts` before `express.json()` middleware
   - Use tools like ngrok for local webhook testing

4. **Payment Status vs Order Status:**
   - `Payment.status`: Tracks payment lifecycle (PENDING → COMPLETED → REFUNDED)
   - `Order.status`: Tracks order fulfillment (PENDING_PAYMENT → CONFIRMED → SHIPPED → DELIVERED)
   - `Order.paymentStatus`: Mirrors payment status for quick reference

5. **Refund Behavior:**
   - Partial refund: Payment status → `PARTIALLY_REFUNDED`, Order unchanged
   - Full refund: Payment status → `REFUNDED`, Order status → `REFUNDED`
   - Inventory restored only on full refund

6. **Idempotency:** PaymentIntents are idempotent. Creating multiple intents for same order returns same clientSecret.

7. **Environment Variables Required:**
   ```
   # Stripe
   STRIPE_SECRET_KEY=sk_test_...
   STRIPE_PUBLISHABLE_KEY=pk_test_...
   STRIPE_WEBHOOK_SECRET=whsec_...

   # PayPal
   PAYPAL_CLIENT_ID=...
   PAYPAL_CLIENT_SECRET=...
   PAYPAL_WEBHOOK_ID=...

   # Klarna
   KLARNA_API_KEY=...
   KLARNA_API_SECRET=...

   # Invoice
   COMPANY_NAME=Habesha Mini Market
   COMPANY_ADDRESS=...
   COMPANY_TAX_ID=...
   COMPANY_IBAN=...
   COMPANY_BIC=...
   COMPANY_EMAIL=...
   COMPANY_PHONE=...
   ```
