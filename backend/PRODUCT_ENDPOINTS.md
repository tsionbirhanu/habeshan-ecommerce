# Product & Category Module API - Postman Endpoints

## Base URL
```
{{base_url}}/products
{{base_url}}/categories
```

**Set `base_url` = `http://localhost:3001/api`**

---

## 🎯 HOW TO CREATE ADMIN ACCOUNT

There are **3 ways** to create an admin:

### Method 1: Direct Database Insert (Fastest for Development)

```sql
-- Using Prisma Studio or any DB tool
INSERT INTO "User" (id, email, password, "firstName", "lastName", phone, role, "isActive", "isEmailVerified", "createdAt", "updatedAt")
VALUES (
  gen_random_uuid(),
  'admin@habeshanmarket.com',
  '$2a$10$YourHashedPasswordHere',  -- Use bcrypt hash
  'Admin',
  'User',
  '+49123456789',
  'ADMIN',
  true,
  true,
  NOW(),
  NOW()
);
```

To generate bcrypt hash:
```bash
node -e "const bcrypt = require('bcryptjs'); console.log(bcrypt.hashSync('AdminPass123!', 10));"
```

### Method 2: Using Prisma Studio (GUI)

```bash
npx prisma studio
```

Then:
1. Click on `User` table
2. Click "Add record"
3. Set role to `ADMIN`
4. Save

### Method 3: Create Seed Script

Create `seed-admin.ts`:
```typescript
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash('AdminPass123!', 10);
  
  const admin = await prisma.user.create({
    data: {
      email: 'admin@habeshanmarket.com',
      password: hashedPassword,
      firstName: 'Super',
      lastName: 'Admin',
      phone: '+49123456789',
      role: 'ADMIN',
      isActive: true,
      isEmailVerified: true,
    },
  });
  
  console.log('Admin created:', admin.email);
}

main();
```

Run:
```bash
npx ts-node seed-admin.ts
```

---

## 📸 HOW TO UPLOAD IMAGES IN POSTMAN

### For Product Image Upload (`POST /products/{id}/images`)

**In Postman:**

1. **Method:** POST
2. **URL:** `{{base_url}}/products/{{product_id}}/images`
3. **Headers:**
   - `Authorization: Bearer {{access_token}}`
   - **Remove** `Content-Type` header (Postman will set it automatically with boundary)

4. **Body Tab:**
   - Select **form-data**
   - Key: `images` (type: File)
   - Value: Choose your image file(s)
   - To upload multiple: Add multiple `images` keys with different files

**Example Postman Screenshot Setup:**
```
┌─────────────────────────────────────────────────────────┐
│  POST  {{base_url}}/products/abc-123/images              │
├─────────────────────────────────────────────────────────┤
│  Headers (1)                                            │
│  Authorization: Bearer eyJhbGciOiJIUzI1Ni...          │
├─────────────────────────────────────────────────────────┤
│  Body | form-data                                       │
│  ┌──────────────┬──────────┬──────────────────────────┐  │
│  │ Key          │ Type     │ Value                    │  │
│  ├──────────────┼──────────┼──────────────────────────┤  │
│  │ images       │ File     │ [Select File] teff1.jpg  │  │
│  │ images       │ File     │ [Select File] teff2.jpg  │  │
│  └──────────────┴──────────┴──────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

**Success Response:**
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "Teff Flour White",
    "images": [
      "/uploads/products/teff1-1705312800000.jpg",
      "/uploads/products/teff2-1705312800001.jpg"
    ],
    "thumbnailUrl": "/uploads/products/teff1-1705312800000.jpg",
    "...": "..."
  },
  "message": "Images uploaded successfully"
}
```

**Note:** Images are stored in `/uploads/products/` folder. First image becomes thumbnail automatically.

---

## 🔐 AUTHENTICATION & ROLES

| Role | Create Product | Update Product | Delete Product | Create Category |
|------|---------------|----------------|----------------|-----------------|
| ADMIN | ✅ Yes | ✅ Any product | ✅ Yes | ✅ Yes |
| VENDOR | ✅ Yes (assigned to them) | ✅ Own products only | ❌ No | ❌ No |
| CUSTOMER | ❌ No | ❌ No | ❌ No | ❌ No |

**Vendor Limitations:**
- Can only update their OWN products
- Cannot update: `price`, `vatRate`, `categoryId`
- Can update: name, description, stock, images, etc.

---

## 📦 PRODUCT ENDPOINTS

### 1. POST /products - Create Product (Admin/Vendor)

**Auth Required:** Bearer Token (ADMIN or VENDOR)

**Headers:**
```
Authorization: Bearer {{access_token}}
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "Teff Flour White",
  "nameEn": "Teff Flour White",
  "nameDe": "Teffmehl Weiß",
  "nameAm": "ጤፍ ስኳር",
  "description": "Premium white teff flour for injera",
  "descriptionEn": "Premium white teff flour for injera",
  "descriptionDe": "Premium Weißes Teffmehl für Injera",
  "descriptionAm": "ፕሪሚየም ነጭ ጤፍ ለእንጀራ",
  "categoryId": "550e8400-e29b-41d4-a716-446655440000",
  "price": 12.99,
  "originalPrice": 15.99,
  "costPrice": 8.50,
  "vatRate": 0.19,
  "sku": "TEFF-W-001",
  "weight": 1000,
  "tags": ["teff", "flour", "injera", "ethiopian"],
  "metaTitle": "Buy White Teff Flour Online",
  "metaDescription": "Premium Ethiopian white teff flour for authentic injera",
  "status": "ACTIVE",
  "stockQuantity": 50,
  "reorderLevel": 10,
  "vendorId": "550e8400-e29b-41d4-a716-446655440001",
  "images": ["https://example.com/image1.jpg"],
  "thumbnailUrl": "https://example.com/image1.jpg"
}
```

**Minimum Required:**
```json
{
  "name": "Teff Flour",
  "nameEn": "Teff Flour",
  "nameDe": "Teffmehl",
  "categoryId": "category-uuid-here",
  "price": 12.99,
  "sku": "TEFF-001",
  "stockQuantity": 50
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440002",
    "name": "Teff Flour White",
    "nameEn": "Teff Flour White",
    "nameDe": "Teffmehl Weiß",
    "nameAm": "ጤፍ ስኳር",
    "description": "Premium white teff flour for injera",
    "descriptionEn": "Premium white teff flour for injera",
    "descriptionDe": "Premium Weißes Teffmehl für Injera",
    "descriptionAm": "ፕሪሚየም ነጭ ጤፍ ለእንጀራ",
    "slug": "teff-flour-white",
    "categoryId": "550e8400-e29b-41d4-a716-446655440000",
    "category": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "name": "Flour",
      "nameEn": "Flour",
      "nameDe": "Mehl",
      "nameAm": "ዱቄት",
      "slug": "flour",
      "isActive": true
    },
    "vendorId": "550e8400-e29b-41d4-a716-446655440001",
    "vendor": {
      "id": "550e8400-e29b-41d4-a716-446655440001",
      "user": {
        "id": "550e8400-e29b-41d4-a716-446655440003",
        "firstName": "Abebe",
        "lastName": "Kebede",
        "email": "abebe@example.com"
      }
    },
    "price": 12.99,
    "originalPrice": 15.99,
    "costPrice": 8.50,
    "vatRate": 0.19,
    "sku": "TEFF-W-001",
    "weight": 1000,
    "tags": ["teff", "flour", "injera", "ethiopian"],
    "metaTitle": "Buy White Teff Flour Online",
    "metaDescription": "Premium Ethiopian white teff flour for authentic injera",
    "status": "ACTIVE",
    "stockQuantity": 50,
    "reorderLevel": 10,
    "soldCount": 0,
    "averageRating": 0,
    "totalReviews": 0,
    "images": ["https://example.com/image1.jpg"],
    "thumbnailUrl": "https://example.com/image1.jpg",
    "isOnOffer": true,
    "discountPercent": 19,
    "inventory": {
      "id": "550e8400-e29b-41d4-a716-446655440004",
      "productId": "550e8400-e29b-41d4-a716-446655440002",
      "quantity": 50,
      "reorderLevel": 10,
      "lastRestocked": null
    },
    "createdBy": "550e8400-e29b-41d4-a716-446655440003",
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  },
  "message": "Product created successfully"
}
```

**Auto-calculated Fields:**
- `slug`: Auto-generated from name (e.g., "teff-flour-white")
- `isOnOffer`: true if originalPrice > price
- `discountPercent`: Calculated from price difference

---

### 2. GET /products - Get All Products (Public)

**Auth:** Optional (Public endpoint, but Admin/Vendor see more)

**Query Parameters:**
| Param | Type | Description | Example |
|-------|------|-------------|---------|
| page | number | Page number | 1 |
| limit | number | Items per page (max 100) | 20 |
| categoryId | UUID | Filter by category | abc-123 |
| minPrice | number | Minimum price | 10 |
| maxPrice | number | Maximum price | 100 |
| status | enum | ACTIVE, DRAFT, DISCONTINUED | ACTIVE |
| search | string | Search in name, description | teff |
| inStock | string | 'true' for in stock only | true |
| sortBy | enum | newest, price_asc, price_desc, best_rated, best_selling | newest |

**Example Request:**
```
GET {{base_url}}/products?page=1&limit=20&categoryId=abc-123&minPrice=10&maxPrice=50&sortBy=price_asc
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "products": [
      {
        "id": "550e8400-e29b-41d4-a716-446655440002",
        "name": "Teff Flour White",
        "nameEn": "Teff Flour White",
        "slug": "teff-flour-white",
        "price": 12.99,
        "originalPrice": 15.99,
        "thumbnailUrl": "https://example.com/teff-white.jpg",
        "category": {
          "id": "550e8400-e29b-41d4-a716-446655440000",
          "name": "Flour"
        },
        "vendor": {
          "id": "550e8400-e29b-41d4-a716-446655440001",
          "user": {
            "firstName": "Abebe",
            "lastName": "Kebede"
          }
        },
        "averageRating": 4.5,
        "inStock": true,
        "isOnOffer": true,
        "discountPercent": 19,
        "status": "ACTIVE"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 150,
      "pages": 8
    }
  }
}
```

**Note:** Public users only see `ACTIVE` products. Admins/Vendors can see all by adding `status` param.

---

### 3. GET /products/search - Search Products (Public)

**Query Parameters:**
| Param | Required | Type | Description |
|-------|----------|------|-------------|
| q | Yes | string | Search query (max 100 chars) |
| limit | No | number | Results per page (default: 10, max: 50) |
| page | No | number | Page number (default: 1) |
| categoryId | No | UUID | Filter by category |
| minPrice | No | number | Minimum price |
| maxPrice | No | number | Maximum price |

**Example:**
```
GET {{base_url}}/products/search?q=teff&limit=10&page=1
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "products": [...],
    "suggestions": [
      { "id": "...", "name": "Teff Flour White", "nameEn": "Teff Flour White", "nameDe": "Teffmehl Weiß" },
      { "id": "...", "name": "Teff Flour Brown", "nameEn": "Teff Flour Brown", "nameDe": "Teffmehl Braun" }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 25,
      "pages": 3
    }
  }
}
```

---

### 4. GET /products/featured - Get Featured Products (Public)

**Returns:** Top 8 best-selling products

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "...",
      "name": "Berbere Spice",
      "price": 8.99,
      "soldCount": 500,
      "averageRating": 4.8,
      "thumbnailUrl": "...",
      "isOnOffer": false,
      "discountPercent": 0
    }
  ]
}
```

---

### 5. GET /products/new-arrivals - Get New Arrivals (Public)

**Returns:** 8 most recently added products

**Response (200):** Same structure as featured products

---

### 6. GET /products/{id} - Get Product by ID or Slug (Public)

**Parameter:** `id` can be UUID or slug

**Examples:**
```
GET {{base_url}}/products/550e8400-e29b-41d4-a716-446655440002
GET {{base_url}}/products/teff-flour-white
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440002",
    "name": "Teff Flour White",
    "nameEn": "Teff Flour White",
    "nameDe": "Teffmehl Weiß",
    "nameAm": "ጤፍ ስኳር",
    "description": "Premium white teff flour for injera",
    "category": { ... },
    "vendor": { ... },
    "price": 12.99,
    "images": ["..."],
    "averageRating": 4.5,
    "reviews": [
      {
        "id": "...",
        "rating": 5,
        "comment": "Great quality!",
        "customer": {
          "firstName": "John",
          "lastName": "Doe"
        },
        "createdAt": "2024-01-10T10:00:00.000Z"
      }
    ],
    "inStock": true,
    "relatedProducts": [
      { "id": "...", "name": "Teff Flour Brown", "price": 12.99 }
    ],
    "isOnOffer": true,
    "discountPercent": 19
  }
}
```

**Note:** This endpoint auto-increments `soldCount` on each view (for popularity tracking).

---

### 7. GET /products/{id}/related - Get Related Products (Public)

**Returns:** Up to 6 products from the same category

**Response (200):**
```json
{
  "success": true,
  "data": [
    { "id": "...", "name": "Teff Flour Brown", "price": 12.99, "thumbnailUrl": "..." }
  ]
}
```

---

### 8. PUT /products/{id} - Update Product (Admin/Vendor)

**Auth Required:** Bearer Token (ADMIN or VENDOR)

**Headers:**
```
Authorization: Bearer {{access_token}}
Content-Type: application/json
```

**Request Body (all fields optional):**
```json
{
  "name": "Teff Flour Premium White",
  "description": "Updated description",
  "price": 14.99,
  "stockQuantity": 100,
  "tags": ["teff", "premium", "organic"],
  "status": "ACTIVE"
}
```

**Vendor Restrictions:**
```json
// VENDOR CANNOT update these fields:
{
  "price": 14.99,        // ❌ Forbidden
  "vatRate": 0.19,       // ❌ Forbidden
  "categoryId": "..."  // ❌ Forbidden
}
```

**Response (200):**
```json
{
  "success": true,
  "data": { ...updated product... },
  "message": "Product updated successfully"
}
```

**Error (403 - Vendor trying to update restricted field):**
```json
{
  "success": false,
  "error": "Vendors cannot update price"
}
```

**Error (403 - Vendor updating another vendor's product):**
```json
{
  "success": false,
  "error": "You can only update your own products"
}
```

---

### 9. DELETE /products/{id} - Delete Product (Admin Only)

**Auth Required:** Bearer Token (ADMIN only)

**Note:** Product is NOT actually deleted - it's marked as `DISCONTINUED`

**Response (200):**
```json
{
  "success": true,
  "message": "Product discontinued"
}
```

---

### 10. POST /products/{id}/images - Upload Product Images (Admin/Vendor)

**Auth Required:** Bearer Token (ADMIN or VENDOR)

**Content-Type:** `multipart/form-data` (Postman sets this automatically)

**Request:**
- **Key:** `images`
- **Type:** File
- **Value:** Select image file(s)

**Can upload multiple files** by adding multiple `images` keys.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440002",
    "images": [
      "/uploads/products/image1-1705312800000.jpg",
      "/uploads/products/image2-1705312800001.jpg",
      "/uploads/products/image3-1705312800002.jpg"
    ],
    "thumbnailUrl": "/uploads/products/image1-1705312800000.jpg"
  },
  "message": "Images uploaded successfully"
}
```

**Vendor Restriction:** Can only upload to their own products.

---

## 🗂️ CATEGORY ENDPOINTS

### 11. POST /categories - Create Category (Admin Only)

**Auth Required:** Bearer Token (ADMIN only)

**Headers:**
```
Authorization: Bearer {{access_token}}
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "Flour",
  "nameEn": "Flour",
  "nameDe": "Mehl",
  "nameAm": "ዱቄት",
  "slug": "flour",
  "description": "Various types of Ethiopian flours",
  "imageUrl": "https://example.com/category-flour.jpg",
  "isActive": true
}
```

**Minimum Required:**
```json
{
  "name": "Flour",
  "nameEn": "Flour",
  "nameDe": "Mehl",
  "nameAm": "ዱቄት"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "Flour",
    "nameEn": "Flour",
    "nameDe": "Mehl",
    "nameAm": "ዱቄት",
    "slug": "flour",
    "description": "Various types of Ethiopian flours",
    "imageUrl": "https://example.com/category-flour.jpg",
    "isActive": true,
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  },
  "message": "Category created successfully"
}
```

**Note:** If `slug` is not provided, it's auto-generated from `name`.

---

### 12. GET /categories - Get All Categories (Public)

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "name": "Flour",
      "nameEn": "Flour",
      "nameDe": "Mehl",
      "nameAm": "ዱቄት",
      "slug": "flour",
      "description": "Various types of Ethiopian flours",
      "imageUrl": "https://example.com/category-flour.jpg",
      "isActive": true,
      "productCount": 15
    },
    {
      "id": "550e8400-e29b-41d4-a716-446655440001",
      "name": "Spices & Seasonings",
      "nameEn": "Spices & Seasonings",
      "nameDe": "Gewürze & Würzmittel",
      "nameAm": "ቅመሞች",
      "slug": "spices-seasonings",
      "description": "Authentic Ethiopian spices",
      "imageUrl": null,
      "isActive": true,
      "productCount": 8
    }
  ]
}
```

**Note:** Only returns active categories (`isActive: true`). Includes `productCount` (number of ACTIVE products in category).

---

### 13. GET /categories/{slug} - Get Category with Products (Public)

**Example:**
```
GET {{base_url}}/categories/flour?page=1&limit=20&sortBy=price_asc
```

**Query Parameters:**
| Param | Type | Default | Description |
|-------|------|---------|-------------|
| page | number | 1 | Page number |
| limit | number | 20 | Products per page |
| sortBy | enum | newest | newest, price_asc, price_desc, best_rated, best_selling |
| minPrice | number | - | Filter by min price |
| maxPrice | number | - | Filter by max price |

**Response (200):**
```json
{
  "success": true,
  "data": {
    "category": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "name": "Flour",
      "nameEn": "Flour",
      "nameDe": "Mehl",
      "nameAm": "ዱቄት",
      "slug": "flour",
      "description": "Various types of Ethiopian flours",
      "imageUrl": "https://example.com/category-flour.jpg",
      "isActive": true
    },
    "products": [
      {
        "id": "...",
        "name": "Teff Flour White",
        "price": 12.99,
        "averageRating": 4.5,
        "inStock": true,
        "isOnOffer": true,
        "discountPercent": 19
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 15,
      "pages": 1
    }
  }
}
```

---

### 14. PUT /categories/{id} - Update Category (Admin Only)

**Auth Required:** Bearer Token (ADMIN only)

**Request Body (all fields optional):**
```json
{
  "name": "Flour & Grains",
  "description": "Updated description",
  "imageUrl": "https://example.com/new-image.jpg",
  "isActive": true
}
```

**Response (200):**
```json
{
  "success": true,
  "data": { ...updated category... },
  "message": "Category updated successfully"
}
```

**Note:** If `name` changes, `slug` auto-updates.

---

### 15. DELETE /categories/{id} - Delete Category (Admin Only)

**Auth Required:** Bearer Token (ADMIN only)

**Note:** Category is NOT deleted if it has active products. It's marked as `isActive: false`.

**Response (200):**
```json
{
  "success": true,
  "message": "Category deleted successfully"
}
```

**Error (409 - Has Active Products):**
```json
{
  "success": false,
  "error": "Cannot delete category with active products"
}
```

---

## 🛍️ RECOMMENDED CATEGORY STRUCTURE

Based on your product list:

### Categories to Create:

```json
[
  {
    "name": "Flour",
    "nameEn": "Flour",
    "nameDe": "Mehl",
    "nameAm": "ዱቄት",
    "slug": "flour",
    "description": "Ethiopian teff and other flours for injera and baking"
  },
  {
    "name": "Spices & Seasonings",
    "nameEn": "Spices & Seasonings",
    "nameDe": "Gewürze & Würzmittel",
    "nameAm": "ቅመሞች",
    "slug": "spices-seasonings",
    "description": "Authentic Ethiopian spices including Berbere and Mitmita"
  },
  {
    "name": "Coffee",
    "nameEn": "Coffee",
    "nameDe": "Kaffee",
    "nameAm": "ቡና",
    "slug": "coffee",
    "description": "Premium Ethiopian coffee beans and ground coffee"
  },
  {
    "name": "Beauty & Personal Care",
    "nameEn": "Beauty & Personal Care",
    "nameDe": "Beauty & Körperpflege",
    "nameAm": "የዕቅድ እና የአካል ጤንነት",
    "slug": "beauty-personal-care",
    "description": "Natural hair products, oils, creams, and soaps"
  },
  {
    "name": "Kitchen & Household",
    "nameEn": "Kitchen & Household",
    "nameDe": "Küche & Haushalt",
    "nameAm": "የማዘጋጃ ቤት እና የቤት ዕቃዎች",
    "slug": "kitchen-household",
    "description": "Traditional Ethiopian kitchen items including Jebena coffee pots"
  }
]
```

### Sample Products:

```json
// Flour Category Products
{
  "name": "Teff Flour (White)",
  "nameEn": "Teff Flour (White)",
  "nameDe": "Teffmehl (Weiß)",
  "nameAm": "ጤፍ ስኳር",
  "price": 12.99,
  "sku": "TEFF-W-1KG",
  "categoryId": "flour-category-uuid"
}

{
  "name": "Teff Flour (Brown)",
  "nameEn": "Teff Flour (Brown)",
  "nameDe": "Teffmehl (Braun)",
  "nameAm": "ጤፍ ቀይ",
  "price": 12.99,
  "sku": "TEFF-B-1KG"
}

{
  "name": "Teff Flour (Mixed)",
  "nameEn": "Teff Flour (Mixed)",
  "nameDe": "Teffmehl (Gemischt)",
  "nameAm": "ጤፍ ቅልቅል",
  "price": 13.99,
  "sku": "TEFF-M-1KG"
}

// Spices Category Products
{
  "name": "Berbere",
  "nameEn": "Berbere",
  "nameDe": "Berbere",
  "nameAm": "በርበሬ",
  "price": 8.99,
  "sku": "SPICE-BRB-200G"
}

{
  "name": "Mitmita",
  "nameEn": "Mitmita",
  "nameDe": "Mitmita",
  "nameAm": "ምጥሚጣ",
  "price": 7.99,
  "sku": "SPICE-MTM-200G"
}

// Coffee Category Products
{
  "name": "Ethiopian Coffee Beans",
  "nameEn": "Ethiopian Coffee Beans",
  "nameDe": "Äthiopische Kaffeebohnen",
  "nameAm": "የኢትዮጵያ የቡና እህሎች",
  "price": 15.99,
  "sku": "COFFEE-BEANS-500G"
}

// Kitchen Category Products
{
  "name": "Jebena (Coffee Pot)",
  "nameEn": "Jebena (Coffee Pot)",
  "nameDe": "Jebena (Kaffeekanne)",
  "nameAm": "ጀበና",
  "price": 35.99,
  "sku": "KITCHEN-JEBENA-01"
}
```

---

## 📋 VALIDATION RULES

### Product Validation

| Field | Required | Rules |
|-------|----------|-------|
| name | Yes | 1-255 chars |
| nameEn | Yes | 1-255 chars |
| nameDe | Yes | 1-255 chars |
| categoryId | Yes | Valid UUID |
| price | Yes | > 0, min 0.01 |
| sku | Yes | 1-100 chars, unique |
| stockQuantity | Yes | Integer, min 0 |
| originalPrice | No | Must be > price (for offers) |
| vatRate | No | 0-1 (default: 0.19) |
| images | No | Array of URLs |
| tags | No | Array, max 50 chars per tag |

### Category Validation

| Field | Required | Rules |
|-------|----------|-------|
| name | Yes | 1-255 chars |
| nameEn | Yes | 1-255 chars |
| nameDe | Yes | 1-255 chars |
| nameAm | Yes | 1-255 chars |
| slug | No | Auto-generated if empty |

---

## 🔧 POSTMAN WORKFLOWS

### Complete Product Setup Workflow

```
1. POST /auth/login (as Admin)
   → Save access_token

2. POST /categories
   → Create "Flour" category
   → Save category_id

3. POST /products
   {
     "name": "Teff Flour White",
     "nameEn": "Teff Flour White",
     "nameDe": "Teffmehl Weiß",
     "nameAm": "ጤፍ ስኳር",
     "categoryId": "{{category_id}}",
     "price": 12.99,
     "sku": "TEFF-W-001",
     "stockQuantity": 50
   }
   → Save product_id

4. POST /products/{{product_id}}/images
   → Upload image files (form-data)
   → Key: "images", Type: File

5. GET /products/{{product_id}}
   → Verify product with images

6. GET /categories/flour
   → Verify product appears in category
```

### Vendor Product Management Workflow

```
1. POST /auth/login (as Vendor)
   → Save access_token

2. POST /products
   → Create product (auto-assigned to vendor)
   → Save product_id

3. PUT /products/{{product_id}}
   → Update name, description, stock
   → ❌ Cannot update price, vatRate, categoryId

4. POST /products/{{product_id}}/images
   → Upload product images

5. GET /products
   → View all products (vendor sees their own + public)
```

---

## 🐛 COMMON ERRORS

### 400 - Validation Error
```json
{
  "success": false,
  "error": "Product name is required"
}
```

### 401 - Unauthorized
```json
{
  "success": false,
  "error": "Access token required"
}
```

### 403 - Forbidden (Wrong Role)
```json
{
  "success": false,
  "error": "Admin access required"
}
```

### 403 - Vendor Restriction
```json
{
  "success": false,
  "error": "Vendors cannot update price"
}
```

### 404 - Not Found
```json
{
  "success": false,
  "error": "Product not found"
}
```

### 409 - Conflict (Duplicate SKU)
```json
{
  "success": false,
  "error": "SKU already exists"
}
```

### 409 - Category Has Products
```json
{
  "success": false,
  "error": "Cannot delete category with active products"
}
```

---

## 📁 PRODUCT IMAGE STORAGE

- **Upload Path:** `/uploads/products/`
- **Access URL:** `http://localhost:3001/uploads/products/filename.jpg`
- **Supported Formats:** JPG, PNG, WEBP
- **First Image:** Automatically becomes thumbnail
- **Multiple Images:** Add multiple `images` fields in form-data
