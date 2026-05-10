# Settings Management & Analytics System Documentation

## Overview

This document covers the new Settings Management System and Analytics/Reporting features added to the Habesha Mini Market backend.

---

## PART 1: Settings Management System

### Database Structure

**Settings Model** (new in Prisma):

```prisma
model Settings {
  id        String   @id @default(uuid())
  key       String   @unique
  value     Json
  updatedAt DateTime @updatedAt

  @@index([key])
}
```

### Settings Categories

Settings are organized by categories, each stored as a JSON document:

#### 1. **store** - Basic Store Information

```json
{
  "name": "Habesha Mini Market",
  "email": "admin@habesha-minimarket.com",
  "phone": "+49 123 456789",
  "address": "Berlin, Germany",
  "currency": "EUR",
  "timezone": "Europe/Berlin"
}
```

#### 2. **shipping** - Shipping Configuration

```json
{
  "freeShippingThreshold": 50,
  "defaultShippingMethod": "DHL"
}
```

#### 3. **tax** - VAT/Tax Rates

```json
{
  "foodVatRate": 7,
  "generalVatRate": 19
}
```

#### 4. **payment** - Payment Methods

```json
{
  "enabledMethods": ["STRIPE", "PAYPAL", "KLARNA", "BANK_TRANSFER", "CASH_ON_DELIVERY"]
}
```

#### 5. **notifications** - Alert Configuration

```json
{
  "adminEmail": "admin@habesha-minimarket.com",
  "lowStockAlert": true
}
```

#### 6. **seo** - SEO Configuration

```json
{
  "defaultMetaTitle": "Habesha Mini Market - Ethiopian Products",
  "defaultMetaDescription": "Shop authentic Ethiopian products online",
  "googleAnalyticsId": "UA-XXXXXXXXX-X"
}
```

#### 7. **social** - Social Media Links

```json
{
  "whatsappNumber": "+49123456789",
  "telegramHandle": "@habesha_market",
  "instagramUrl": "https://instagram.com/habesha_market",
  "facebookUrl": "https://facebook.com/habesha_market"
}
```

### Admin Settings Endpoints

#### GET /api/admin/settings

Retrieve all system settings.

**Authentication:** Required (ADMIN role)

**Response:**

```json
{
  "success": true,
  "data": {
    "store": { ... },
    "shipping": { ... },
    "tax": { ... },
    "payment": { ... },
    "notifications": { ... },
    "seo": { ... },
    "social": { ... }
  },
  "message": "Settings retrieved successfully"
}
```

**cURL Example:**

```bash
curl -X GET http://localhost:3001/api/admin/settings \
  -H "Authorization: Bearer <admin_token>" \
  -H "Content-Type: application/json"
```

---

#### PUT /api/admin/settings

Update system settings (partial update by category).

**Authentication:** Required (ADMIN role)

**Request Body (partial update example):**

```json
{
  "store": {
    "name": "Habesha Market Updated",
    "currency": "EUR"
  },
  "seo": {
    "googleAnalyticsId": "G-XXXXXXXXXX"
  }
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "store": { "name": "Habesha Market Updated", "currency": "EUR" },
    "seo": { "googleAnalyticsId": "G-XXXXXXXXXX" }
  },
  "message": "Settings updated successfully"
}
```

**cURL Example:**

```bash
curl -X PUT http://localhost:3001/api/admin/settings \
  -H "Authorization: Bearer <admin_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "store": { "name": "Updated Store Name" },
    "seo": { "defaultMetaTitle": "New Title" }
  }'
```

---

### Public Settings Endpoints

#### GET /api/store/info

Get public store information (name, email, phone, social handles).

**Authentication:** Not required (Public)

**Response:**

```json
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
    "social": {
      "whatsappNumber": "+49123456789",
      "telegramHandle": "@habesha_market",
      "instagramUrl": "https://instagram.com/habesha_market",
      "facebookUrl": "https://facebook.com/habesha_market"
    }
  },
  "message": "Store information retrieved"
}
```

**cURL Example:**

```bash
curl -X GET http://localhost:3001/api/store/info
```

---

#### GET /api/sitemap.xml

Generate XML sitemap for SEO with all ACTIVE products and categories.

**Authentication:** Not required (Public)

**Response (XML):**

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://habesha-minimarket.com</loc>
    <lastmod>2026-05-08T14:31:58.000Z</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://habesha-minimarket.com/categories/spices</loc>
    <lastmod>2026-05-08T10:20:00.000Z</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://habesha-minimarket.com/products/berbere-spice</loc>
    <lastmod>2026-05-07T15:45:00.000Z</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>
</urlset>
```

**cURL Example:**

```bash
curl -X GET http://localhost:3001/api/sitemap.xml
```

---

#### GET /api/robots.txt

Return robots.txt for SEO crawlers.

**Authentication:** Not required (Public)

**Response (Text):**

```
User-agent: *
Allow: /
Disallow: /admin
Disallow: /api/admin
Disallow: /api/auth/
Disallow: /api/users/
Disallow: /api/cart
Disallow: /api/orders
Disallow: /*.json$
Crawl-delay: 1

User-agent: Googlebot
Allow: /
Crawl-delay: 0.1

Sitemap: https://habesha-minimarket.com/api/sitemap.xml
```

**cURL Example:**

```bash
curl -X GET http://localhost:3001/api/robots.txt
```

---

## PART 2: Analytics & Reporting System

### Database Foundation

Reports are built on existing models:

- **Orders** - Order data with amounts and dates
- **OrderItems** - Per-product order data
- **Payments** - Payment method and status tracking
- **Products** - Inventory, pricing, and sales data
- **Users** - Customer data and spending history
- **Addresses** - Geographic distribution

### Admin Analytics Endpoints

#### GET /api/analytics/sales

Sales report with revenue, order count, and average order value by time period.

**Query Parameters:**

- `groupBy`: `day` | `week` | `month` (default: `day`)
- `dateFrom`: ISO 8601 datetime (default: 30 days ago)
- `dateTo`: ISO 8601 datetime (default: now)

**Response:**

```json
{
  "success": true,
  "data": {
    "summary": {
      "totalRevenue": 45230.5,
      "totalOrders": 128,
      "averageOrderValue": 353.36
    },
    "data": [
      {
        "period": "2026-05-08",
        "revenue": 2450.0,
        "orderCount": 7,
        "aov": 350.0
      },
      {
        "period": "2026-05-07",
        "revenue": 3120.75,
        "orderCount": 9,
        "aov": 346.75
      }
    ],
    "period": {
      "from": "2026-04-08T00:00:00.000Z",
      "to": "2026-05-08T23:59:59.999Z"
    }
  },
  "message": "Sales report generated"
}
```

**cURL Example:**

```bash
curl -X GET 'http://localhost:3001/api/analytics/sales?groupBy=day&dateFrom=2026-04-08T00:00:00Z&dateTo=2026-05-08T23:59:59Z' \
  -H "Authorization: Bearer <admin_token>"
```

---

#### GET /api/analytics/products

Product report with revenue, units sold, views, and conversion rates. Includes slow movers detection.

**Query Parameters:**

- `dateFrom`: ISO 8601 datetime (default: 90 days ago)
- `dateTo`: ISO 8601 datetime (default: now)
- `categoryId`: UUID (optional - filter by category)
- `sortBy`: `revenue` | `units` | `views` | `conversion` (default: `revenue`)
- `limit`: Number (default: 100)

**Response:**

```json
{
  "success": true,
  "data": {
    "period": { "from": "2026-02-08", "to": "2026-05-08" },
    "data": [
      {
        "productId": "prod-123",
        "name": "Berbere Spice Premium",
        "sku": "BERB-001",
        "price": "12.99",
        "currentStock": 45,
        "totalSold": 234,
        "revenue": 3042.66,
        "unitsSold": 234,
        "views": 567,
        "conversion": 41.27,
        "isSlowMover": false
      },
      {
        "productId": "prod-456",
        "name": "Ethiopian Coffee",
        "sku": "COFF-002",
        "price": "8.99",
        "currentStock": 120,
        "totalSold": 2,
        "revenue": 17.98,
        "unitsSold": 2,
        "views": 45,
        "conversion": 4.44,
        "isSlowMover": true
      }
    ]
  },
  "message": "Product report generated"
}
```

**cURL Example:**

```bash
curl -X GET 'http://localhost:3001/api/analytics/products?sortBy=revenue&limit=50' \
  -H "Authorization: Bearer <admin_token>"
```

---

#### GET /api/analytics/customers

Customer report with new vs returning, top spenders, and geographic distribution.

**Response:**

```json
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
        "customerId": "user-123",
        "customerName": "Ahmed Hassan",
        "totalSpent": 4520.75,
        "orderCount": 23
      },
      {
        "customerId": "user-456",
        "customerName": "Fatima Abdi",
        "totalSpent": 3245.5,
        "orderCount": 18
      }
    ],
    "geoDistribution": [
      {
        "city": "Berlin",
        "customerCount": 189,
        "totalSpent": 23450.75
      },
      {
        "city": "Munich",
        "customerCount": 145,
        "totalSpent": 18900.25
      }
    ]
  },
  "message": "Customer report generated"
}
```

**cURL Example:**

```bash
curl -X GET http://localhost:3001/api/analytics/customers \
  -H "Authorization: Bearer <admin_token>"
```

---

#### GET /api/analytics/inventory

Inventory report with total value, movement analysis, and outliers.

**Response:**

```json
{
  "success": true,
  "data": {
    "summary": {
      "totalInventoryValue": 125430.5,
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
      },
      {
        "categoryName": "Grains",
        "totalValue": 38900.0,
        "productCount": 28,
        "avgStockValue": 1389.29
      }
    ],
    "outOfStockProducts": [
      {
        "id": "prod-789",
        "name": "Teff Flour",
        "sku": "TEFF-001"
      }
    ],
    "slowMovers": [
      {
        "id": "prod-456",
        "name": "Ethiopian Coffee",
        "sku": "COFF-002",
        "soldCount": 2,
        "stockQuantity": 120
      }
    ],
    "fastMovers": [
      {
        "id": "prod-123",
        "name": "Berbere Spice",
        "sku": "BERB-001",
        "soldCount": 234,
        "stockQuantity": 45
      }
    ]
  },
  "message": "Inventory report generated"
}
```

**cURL Example:**

```bash
curl -X GET http://localhost:3001/api/analytics/inventory \
  -H "Authorization: Bearer <admin_token>"
```

---

#### GET /api/analytics/payments

Payment report with method breakdown, success rates, and refunds.

**Query Parameters:**

- `dateFrom`: ISO 8601 datetime (default: 30 days ago)
- `dateTo`: ISO 8601 datetime (default: now)

**Response:**

```json
{
  "success": true,
  "data": {
    "period": { "from": "2026-04-08", "to": "2026-05-08" },
    "summary": {
      "totalTransactions": 524,
      "successRate": 96.39,
      "totalRefunded": 1250.5,
      "totalProcessed": 123450.75,
      "averageTransaction": 235.41
    },
    "byMethod": [
      {
        "method": "STRIPE",
        "totalTransactions": 287,
        "successCount": 280,
        "failureCount": 7,
        "totalAmount": 67890.5,
        "avgTransaction": 236.51
      },
      {
        "method": "PAYPAL",
        "totalTransactions": 156,
        "successCount": 150,
        "failureCount": 6,
        "totalAmount": 38900.25,
        "avgTransaction": 249.36
      },
      {
        "method": "KLARNA",
        "totalTransactions": 81,
        "successCount": 78,
        "failureCount": 3,
        "totalAmount": 16660.0,
        "avgTransaction": 205.68
      }
    ]
  },
  "message": "Payment report generated"
}
```

**cURL Example:**

```bash
curl -X GET 'http://localhost:3001/api/analytics/payments?dateFrom=2026-04-08T00:00:00Z' \
  -H "Authorization: Bearer <admin_token>"
```

---

#### GET /api/analytics/export

Export any report in CSV or JSON format.

**Query Parameters:**

- `type`: `sales` | `products` | `customers` | `inventory` | `payments` (required)
- `format`: `csv` | `json` (default: `json`)
- `dateFrom`: ISO 8601 datetime (optional)
- `dateTo`: ISO 8601 datetime (optional)

**Response (JSON):**

```json
{
  "success": true,
  "data": {
    /* full report data */
  },
  "message": "sales report exported"
}
```

**Response (CSV):**

```csv
Period,Revenue,Order Count,Average Order Value
2026-05-08,2450.00,7,350.00
2026-05-07,3120.75,9,346.75
```

**cURL Example (JSON):**

```bash
curl -X GET 'http://localhost:3001/api/analytics/export?type=sales&format=json' \
  -H "Authorization: Bearer <admin_token>"
```

**cURL Example (CSV Download):**

```bash
curl -X GET 'http://localhost:3001/api/analytics/export?type=products&format=csv' \
  -H "Authorization: Bearer <admin_token>" \
  -o products-report.csv
```

---

## Implementation Details

### File Structure

```
src/modules/
├── admin/
│   ├── settings.controller.ts      (new)
│   ├── settings.service.ts         (new)
│   ├── settings.validation.ts      (new)
│   └── admin.routes.ts             (updated)
├── analytics/
│   ├── analytics.controller.ts     (new)
│   ├── analytics.service.ts        (new)
│   ├── analytics.validation.ts     (new)
│   └── analytics.routes.ts         (new)
└── public/
    └── public.routes.ts            (new)

src/
├── app.ts                          (updated)
└── config/

prisma/
├── schema.prisma                   (updated - added Settings model)
└── migrations/
    └── 20260508143158_update_schema_with_settings/
```

### Key Features

#### Settings Service

- **Lazy Initialization**: Settings are created on-first-access with sensible defaults
- **Category Organization**: Each category is stored as a separate JSON document for flexibility
- **Partial Updates**: You can update specific categories without affecting others
- **Default Values**: Comprehensive default settings provided

#### Analytics Service

- **Raw SQL Aggregations**: Uses Prisma's raw SQL for efficient complex queries
- **Date-based Grouping**: Sales reports can be grouped by day, week, or month
- **CSV Export**: Automatic CSV generation with proper headers and formatting
- **JSON Export**: Full JSON data export for integration
- **Slow Mover Detection**: Automatically identifies products with low sales and high stock
- **Geographic Analysis**: Customer distribution by city
- **Payment Analysis**: Success rates and method breakdowns

#### SEO Features

- **XML Sitemap**: Auto-generated from active products and categories
- **robots.txt**: Prevents crawling of admin and protected routes
- **Meta Fields**: Storage for custom meta titles and descriptions
- **Google Analytics Ready**: Built-in support for GA tracking IDs

---

## Database Migration

**Migration Name:** `20260508143158_update_schema_with_settings`

**New Table:**

```sql
CREATE TABLE "Settings" (
  "id" TEXT NOT NULL,
  "key" TEXT NOT NULL,
  "value" JSONB NOT NULL,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Settings_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "Settings_key_key" UNIQUE ("key")
);

CREATE INDEX "Settings_key_idx" ON "Settings"("key");
```

---

## Security Considerations

1. **Settings Access**: Settings endpoints are protected with `ADMIN` role requirement
2. **SEO Endpoints**: Public routes (sitemap, robots.txt) are not authenticated to allow search engines
3. **Analytics Protection**: All analytics endpoints require admin authentication
4. **CSV Export**: Files are generated on-the-fly, not stored on disk
5. **Sensitive Data**: Payment and customer data are aggregated, not exposed individually

---

## Testing

### Test Settings Endpoints

```bash
# Get settings
curl -X GET http://localhost:3001/api/admin/settings \
  -H "Authorization: Bearer <admin_token>"

# Update settings
curl -X PUT http://localhost:3001/api/admin/settings \
  -H "Authorization: Bearer <admin_token>" \
  -H "Content-Type: application/json" \
  -d '{"store": {"name": "New Name"}}'

# Get public store info
curl -X GET http://localhost:3001/api/store/info

# Get sitemap
curl -X GET http://localhost:3001/api/sitemap.xml
```

### Test Analytics Endpoints

```bash
# Sales report
curl -X GET 'http://localhost:3001/api/analytics/sales?groupBy=day' \
  -H "Authorization: Bearer <admin_token>"

# Products report
curl -X GET 'http://localhost:3001/api/analytics/products' \
  -H "Authorization: Bearer <admin_token>"

# Customers report
curl -X GET 'http://localhost:3001/api/analytics/customers' \
  -H "Authorization: Bearer <admin_token>"

# Inventory report
curl -X GET 'http://localhost:3001/api/analytics/inventory' \
  -H "Authorization: Bearer <admin_token>"

# Payments report
curl -X GET 'http://localhost:3001/api/analytics/payments' \
  -H "Authorization: Bearer <admin_token>"

# Export as CSV
curl -X GET 'http://localhost:3001/api/analytics/export?type=sales&format=csv' \
  -H "Authorization: Bearer <admin_token>" \
  -o sales-report.csv
```

---

## Performance Notes

- **Aggregation Queries**: Raw SQL used for efficient group-by operations
- **Decimal Handling**: Proper type conversion for monetary values
- **Pagination**: Product and customer reports support limiting results
- **Date Filtering**: Efficient database filtering before aggregation
- **CSV Generation**: Streamed output, suitable for large datasets

---

## Future Enhancements

1. **Advanced Filtering**: More granular report filtering options
2. **Scheduled Reports**: Automatic report generation and email delivery
3. **Custom Dashboards**: User-configurable analytics dashboards
4. **Real-time Analytics**: WebSocket updates for live metrics
5. **Report Templates**: Pre-built report templates with custom fields
6. **Comparison Analysis**: Year-over-year and period comparisons
7. **Forecasting**: Trend analysis and sales predictions

---

## Migration Command

To apply all changes:

```bash
npx prisma migrate dev --name update_schema_with_settings
```

To generate Prisma client:

```bash
npx prisma generate
```

To seed default settings (if needed):

```bash
npx prisma db seed
```

---

**Last Updated:** May 8, 2026  
**Status:** ✅ Implemented and Tested
