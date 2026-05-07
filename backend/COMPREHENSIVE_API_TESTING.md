# Comprehensive API Testing Guide - Habeshan E-Commerce

This document provides complete API endpoint documentation with request bodies, responses, and descriptions for all endpoints in the Habeshan E-Commerce application.

**Base URL:** `http://localhost:3000/api`

**Authentication:** Most endpoints require JWT token. Include in header: `Authorization: Bearer <token>`

---

## Table of Contents

1. [Authentication Module](#authentication-module)
2. [Users Module](#users-module)
3. [Products Module](#products-module)
4. [Categories Module](#categories-module)
5. [Cart Module](#cart-module)
6. [Orders Module](#orders-module)
7. [Payments Module](#payments-module)
8. [Coupons Module](#coupons-module)
9. [Reviews Module](#reviews-module)
10. [Wishlist Module](#wishlist-module)
11. [Admin Module](#admin-module)
12. [Inventory Module](#inventory-module)
13. [Notifications Module](#notifications-module)
14. [Shipping Module](#shipping-module)
15. [Health Check](#health-check)

---

## Email Verification Flow

### Important: Email Verification Required

**Both Vendors and Customers must verify their email before they can:**

- Successfully login
- Use any protected endpoints

### Email Verification Process

1. **User registers** (Customer or Vendor)
2. **Verification email sent** to the registered email address with verification link
3. **Verification link** contains a token valid for 24 hours
4. **User clicks** the verification link in their email
5. **Email verified** - User can now login

### Verification Email Template

**Subject:** ✉️ Verify Your Email - Habeshan Mini Market

**Contains:**

- Personalized greeting with user's first name
- "Verify Email Address" button with verification link
- Direct link text (if button doesn't work)
- 24-hour expiration warning
- Safe to ignore message

### Technical Details

- **Token Generated:** `generateEmailVerificationToken()` - JWT token specific to email verification
- **Token Expiry:** 24 hours from registration
- **Token Storage:** Stored in `emailVerificationToken` and `emailTokenExpiresAt` fields
- **Email Service:** Sent asynchronously (non-blocking)
- **Retry:** If email fails to send, it's logged but doesn't block registration

### What to Do If You Don't Receive Email

**Possible Issues:**

1. **SMTP not configured** - Check environment variables for email settings
2. **Email in spam folder** - Check spam/promotions
3. **Token expired** - Re-register or request new verification email
4. **Email address typo** - Verify the registered email address

**Check Logs:**

```
Email transporter error: [error details]
Failed to send verification email to user@example.com: [error]
```

**Current Status:** Email sending is configured but may need SMTP settings validation

---

## Authentication Module

### Base URL: `/api/auth`

#### 1. Register as Vendor

**Endpoint:** `POST /api/auth/register-vendor`

**Description:** Create a new vendor account. Requires email verification and admin approval before account activation.

**Access:** Public (No authentication required)

**Request Body:**

```json
{
  "email": "vendor@example.com",
  "password": "SecurePass123!",
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+491234567890"
}
```

**Validation Rules:**

- Email: Valid email format, converted to lowercase, must be unique
- Password: Min 8 chars, at least 1 uppercase letter, 1 number, 1 special character
- firstName, lastName: Min 1 character required
- phone: Required

**Response (201 Created):**

```json
{
  "success": true,
  "message": "Registration submitted. Awaiting admin approval."
}
```

**Process Flow:**

1. Vendor registration submitted
2. Email verification link sent to email (24 hours expiry)
3. Vendor must click verification link to verify email
4. Admin reviews and approves/rejects vendor application
5. Only after approval can vendor login

**Error Response (409 - Conflict):**

```json
{
  "success": false,
  "error": "Email already registered",
  "code": "USER_ALREADY_EXISTS"
}
```

**Error Response (400 - Validation):**

```json
{
  "success": false,
  "error": "Password must contain at least one uppercase letter",
  "code": "INVALID_INPUT"
}
```

---

#### 2. Register as Customer

**Endpoint:** `POST /api/auth/register-customer`

**Description:** Create a new customer account. Requires email verification before account activation.

**Access:** Public (No authentication required)

**Request Body:**

```json
{
  "email": "customer@example.com",
  "password": "SecurePass123!",
  "firstName": "Jane",
  "lastName": "Smith",
  "phone": "+491234567890"
}
```

**Validation Rules:**

- Email: Valid email format, must be unique
- Password: Min 8 chars, at least 1 uppercase letter, 1 number, 1 special character
- firstName, lastName: Required, min 1 character
- phone: Optional

**Response (201 Created):**

```json
{
  "success": true,
  "message": "Account created successfully.",
  "data": {
    "user": {
      "id": "550e8400-e29b-41d4-a716-446655440001",
      "email": "customer@example.com",
      "firstName": "Jane",
      "lastName": "Smith",
      "role": "CUSTOMER"
    }
  }
}
```

**Process Flow:**

1. Customer account created (initially inactive)
2. Email verification link sent to email (24 hours expiry)
3. Customer must click verification link to verify email
4. Account becomes active after email verification
5. Customer can now login

**Error Response (409 - Conflict):**

```json
{
  "success": false,
  "error": "Email already registered",
  "code": "USER_ALREADY_EXISTS"
}
```

**Error Response (400 - Validation):**

```json
{
  "success": false,
  "error": "Password must contain at least one special character",
  "code": "INVALID_INPUT"
}
```

---

#### 3. Login

**Endpoint:** `POST /api/auth/login`

**Description:** Authenticate user and receive JWT tokens. Account must be verified and active.

**Access:** Public

**Request Body:**

```json
{
  "email": "customer@example.com",
  "password": "SecurePass123!"
}
```

**Response (200 OK):**

```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "550e8400-e29b-41d4-a716-446655440001",
      "email": "customer@example.com",
      "firstName": "Jane",
      "lastName": "Smith",
      "role": "CUSTOMER"
    },
    "tokens": {
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "expiresIn": "1d"
    }
  }
}
```

**Possible Errors:**

**Error Response (401 - Invalid Credentials):**

```json
{
  "success": false,
  "error": "Invalid email or password",
  "code": "INVALID_CREDENTIALS"
}
```

**Error Response (403 - Email Not Verified):**

```json
{
  "success": false,
  "error": "Please verify your email address first",
  "code": "FORBIDDEN"
}
```

**Error Response (403 - Account Disabled):**

```json
{
  "success": false,
  "error": "Account pending approval or disabled",
  "code": "FORBIDDEN"
}
```

**Note:**

- Customers must verify email before login
- Vendors must verify email AND wait for admin approval before login

---

#### 4. Refresh Token

**Endpoint:** `POST /api/auth/refresh-token`

**Description:** Get a new access token using refresh token.

**Access:** Public

**Request Body:**

```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response (200 OK):**

```json
{
  "success": true,
  "message": "Token refreshed successfully",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

---

#### 5. Forgot Password

**Endpoint:** `POST /api/auth/forgot-password`

**Description:** Request password reset link via email.

**Access:** Public

**Request Body:**

```json
{
  "email": "customer@example.com"
}
```

**Response (200 OK):**

```json
{
  "success": true,
  "message": "Password reset link sent to your email. Valid for 1 hour.",
  "data": {
    "email": "customer@example.com"
  }
}
```

---

#### 6. Reset Password

**Endpoint:** `POST /api/auth/reset-password`

**Description:** Reset password using reset token from email.

**Access:** Public

**Request Body:**

```json
{
  "token": "reset_token_from_email",
  "newPassword": "NewSecurePass456!",
  "confirmPassword": "NewSecurePass456!"
}
```

**Validation Rules:**

- token: Required
- newPassword: Min 8 chars, 1 uppercase, 1 number, 1 special character
- confirmPassword: Must match newPassword

**Response (200 OK):**

```json
{
  "success": true,
  "message": "Password reset successfully"
}
```

---

#### 7. Logout

**Endpoint:** `POST /api/auth/logout`

**Description:** Logout current user.

**Access:** Protected (Requires JWT token)

**Request Body:** None (Empty body)

**Response (200 OK):**

```json
{
  "success": true,
  "message": "Logout successful"
}
```

---

#### 8. Get Current User

**Endpoint:** `GET /api/auth/me`

**Description:** Get details of the currently authenticated user.

**Access:** Protected (Requires JWT token)

**Request Body:** None

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "userId": "550e8400-e29b-41d4-a716-446655440001",
    "email": "customer@example.com",
    "firstName": "Jane",
    "lastName": "Smith",
    "role": "CUSTOMER",
    "phone": "+491234567890",
    "isActive": true,
    "createdAt": "2026-05-01T10:00:00Z"
  }
}
```

---

## Users Module

### Base URL: `/api/users`

#### 1. Get User Profile

**Endpoint:** `GET /api/users/profile`

**Description:** Retrieve currently authenticated user's profile.

**Access:** Protected (Requires JWT token)

**Request Body:** None

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "userId": "550e8400-e29b-41d4-a716-446655440001",
    "email": "customer@example.com",
    "firstName": "Jane",
    "lastName": "Smith",
    "phone": "+491234567890",
    "role": "CUSTOMER",
    "isActive": true,
    "createdAt": "2026-05-01T10:00:00Z",
    "updatedAt": "2026-05-01T10:00:00Z"
     "addresses": []
  }
}
```

---

#### 2. Update User Profile

**Endpoint:** `PUT /api/users/profile`

**Description:** Update user's profile information.

**Access:** Protected (Requires JWT token)

**Request Body:**

```json
{
  "firstName": "Jane",
  "lastName": "Smith",
  "phone": "+491234567890"
}
```

**Validation Rules:**

- firstName: Min 1 character (optional)
- lastName: Min 1 character (optional)
- phone: Optional

**Response (200 OK):**

```json
{
  "success": true,
  "message": "Profile updated successfully",
  "data": {
    "userId": "550e8400-e29b-41d4-a716-446655440001",
    "email": "customer@example.com",
    "firstName": "Jane",
    "lastName": "Smith",
    "phone": "+491234567890",
    "updatedAt": "2026-05-05T10:00:00Z"
  }
}
```

---

#### 3. Change Password

**Endpoint:** `POST /api/users/change-password`

**Description:** Change user's password.

**Access:** Protected (Requires JWT token)

**Request Body:**

```json
{
  "currentPassword": "SecurePass123!",
  "newPassword": "NewSecurePass456!",
  "confirmPassword": "NewSecurePass456!"
}
```

**Validation Rules:**

- currentPassword: Required, must match existing password
- newPassword: Min 8 chars, 1 uppercase, 1 number, 1 special character
- confirmPassword: Must match newPassword

**Response (200 OK):**

```json
{
  "success": true,
  "message": "Password changed successfully"
}
```

**Error Response (400):**

```json
{
  "success": false,
  "error": "Current password is incorrect",
  "code": "INVALID_PASSWORD"
}
```

---

#### 4. Delete Account

**Endpoint:** `DELETE /api/users/account`

**Description:** Delete user's account (Customer only). Soft delete - anonymizes personal data.

**Access:** Protected (Customer role only)

**Request Body:** None

**Response (200 OK):**

```json
{
  "success": true,
  "message": "Account deleted successfully. Your personal data has been anonymized."
}
```

---

#### 5. Download Personal Data

**Endpoint:** `GET /api/users/personal-data`

**Description:** Download all personal data in JSON format (GDPR compliance).

**Access:** Protected

**Request Body:** None

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "profile": { ... },
    "addresses": [ ... ],
    "orders": [ ... ],
    "reviews": [ ... ],
    "wishlist": [ ... ]
  }
}
```

---

#### 6. Get Addresses

**Endpoint:** `GET /api/users/addresses`

**Description:** Get all saved addresses for the user.

**Access:** Protected

**Request Body:** None

**Query Parameters:** None

**Response (200 OK):**

```json
{
  "success": true,
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440002",
      "street": "123 Main Street",
      "city": "Berlin",
      "postalCode": "10115",
      "country": "Germany",
      "label": "Home",
      "isDefault": true,
      "createdAt": "2026-05-01T10:00:00Z"
    },
    {
      "id": "550e8400-e29b-41d4-a716-446655440003",
      "street": "456 Work Avenue",
      "city": "Munich",
      "postalCode": "80335",
      "country": "Germany",
      "label": "Work",
      "isDefault": false,
      "createdAt": "2026-05-02T10:00:00Z"
    }
  ]
}
```

---

#### 7. Create Address

**Endpoint:** `POST /api/users/addresses`

**Description:** Create a new address for the user.

**Access:** Protected

**Request Body:**

```json
{
  "street": "123 Main Street",
  "city": "Berlin",
  "postalCode": "10115",
  "country": "Germany",
  "label": "Home",
  "isDefault": false
}
```

**Validation Rules:**

- street: Required, min 1 character
- city: Required, min 1 character
- postalCode: Required, min 1 character
- country: Optional, defaults to "Germany"
- label: Optional
- isDefault: Optional, defaults to false

**Response (201 Created):**

```json
{
  "success": true,
  "message": "Address created successfully",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440004",
    "street": "123 Main Street",
    "city": "Berlin",
    "postalCode": "10115",
    "country": "Germany",
    "label": "Home",
    "isDefault": false,
    "createdAt": "2026-05-05T10:00:00Z"
  }
}
```

---

#### 8. Update Address

**Endpoint:** `PUT /api/users/addresses/{id}`

**Description:** Update an existing address.

**Access:** Protected

**URL Parameters:**

- id: Address UUID

**Request Body:**

```json
{
  "street": "456 New Street",
  "city": "Munich",
  "postalCode": "80335",
  "country": "Germany",
  "label": "Office",
  "isDefault": true
}
```

**Response (200 OK):**

```json
{
  "success": true,
  "message": "Address updated successfully",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440004",
    "street": "456 New Street",
    "city": "Munich",
    "postalCode": "80335",
    "country": "Germany",
    "label": "Office",
    "isDefault": true,
    "updatedAt": "2026-05-05T10:00:00Z"
  }
}
```

---

#### 9. Delete Address

**Endpoint:** `DELETE /api/users/addresses/{id}`

**Description:** Delete an address.

**Access:** Protected

**URL Parameters:**

- id: Address UUID

**Request Body:** None

**Response (200 OK):**

```json
{
  "success": true,
  "message": "Address deleted successfully"
}
```

---

#### 10. Set Default Address

**Endpoint:** `POST /api/users/addresses/{id}/default`

**Description:** Set an address as the default delivery address.

**Access:** Protected

**URL Parameters:**

- id: Address UUID

**Request Body:** None

**Response (200 OK):**

```json
{
  "success": true,
  "message": "Default address set successfully",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440004",
    "isDefault": true
  }
}
```

---

## Products Module

### Base URL: `/api`

#### 1. Create Product

**Endpoint:** `POST /api/products`

**Description:** Create a new product (Admin/Vendor only).

**Access:** Protected (Admin or Vendor role)

**Request Body:**

```json
{
  "name": "Samsung Galaxy S24",
  "nameEn": "Samsung Galaxy S24",
  "nameDe": "Samsung Galaxy S24",
  "nameAm": "ሳምሱንግ ጋላክሲ S24",
  "description": "Latest flagship smartphone with 6.2 inch display",
  "descriptionEn": "Latest flagship smartphone with 6.2 inch display",
  "descriptionDe": "Neuestes Flaggschiff-Smartphone mit 6,2-Zoll-Display",
  "descriptionAm": "የቅርብ ጊዜ ጋላክሲ ስሪት",
  "categoryId": "550e8400-e29b-41d4-a716-446655440100",
  "price": 899.99,
  "originalPrice": 999.99,
  "costPrice": 500.0,
  "vatRate": 0.19,
  "sku": "SGM-GAL-S24-001",
  "weight": 0.167,
  "tags": ["smartphone", "android", "flagship"],
  "metaTitle": "Samsung Galaxy S24 - Latest Smartphone",
  "metaDescription": "Buy Samsung Galaxy S24 at best price",
  "status": "ACTIVE",
  "stockQuantity": 50,
  "reorderLevel": 5,
  "images": ["https://example.com/image1.jpg"],
  "thumbnailUrl": "https://example.com/thumbnail.jpg"
}
```

**Validation Rules:**

- name, nameEn, nameDe: Required, max 255 chars
- categoryId: Valid UUID required
- price: Positive number, min 0.01
- sku: Required
- stockQuantity: Integer >= 0
- originalPrice > price (for offers)

**Response (201 Created):**

```json
{
  "success": true,
  "message": "Product created successfully",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440200",
    "name": "Samsung Galaxy S24",
    "price": 899.99,
    "originalPrice": 999.99,
    "sku": "SGM-GAL-S24-001",
    "categoryId": "550e8400-e29b-41d4-a716-446655440100",
    "stockQuantity": 50,
    "status": "ACTIVE",
    "createdAt": "2026-05-05T10:00:00Z"
  }
}
```

---

#### 2. Get All Products

**Endpoint:** `GET /api/products`

**Description:** Retrieve paginated list of all products (Public).

**Access:** Public

**Query Parameters:**

```
?page=1&limit=20&sortBy=createdAt&order=DESC&categoryId=550e8400...&minPrice=0&maxPrice=10000&status=ACTIVE
```

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "products": [
      {
        "id": "550e8400-e29b-41d4-a716-446655440200",
        "name": "Samsung Galaxy S24",
        "price": 899.99,
        "originalPrice": 999.99,
        "description": "Latest flagship smartphone",
        "thumbnailUrl": "https://example.com/thumbnail.jpg",
        "rating": 4.5,
        "reviewCount": 125,
        "stockQuantity": 50,
        "sku": "SGM-GAL-S24-001",
        "categoryId": "550e8400-e29b-41d4-a716-446655440100",
        "createdAt": "2026-05-05T10:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 150,
      "totalPages": 8
    }
  }
}
```

---

#### 3. Search Products

**Endpoint:** `GET /api/products/search`

**Description:** Search products by query string.

**Access:** Public

**Query Parameters:**

```
?q=samsung&limit=10&page=1&categoryId=550e8400...&minPrice=0&maxPrice=10000
```

**Validation:**

- q: Required, min 1 char, max 100 chars

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "products": [
      {
        "id": "550e8400-e29b-41d4-a716-446655440200",
        "name": "Samsung Galaxy S24",
        "price": 899.99,
        "description": "Latest flagship smartphone",
        "thumbnailUrl": "https://example.com/thumbnail.jpg",
        "rating": 4.5,
        "reviewCount": 125
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 45,
      "totalPages": 5
    }
  }
}
```

---

#### 4. Get Featured Products

**Endpoint:** `GET /api/products/featured`

**Description:** Get featured products for homepage display.

**Access:** Public

**Query Parameters:** None

**Response (200 OK):**

```json
{
  "success": true,
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440200",
      "name": "Samsung Galaxy S24",
      "price": 899.99,
      "originalPrice": 999.99,
      "description": "Latest flagship smartphone",
      "thumbnailUrl": "https://example.com/thumbnail.jpg",
      "rating": 4.5,
      "reviewCount": 125
    }
  ]
}
```

---

#### 5. Get New Arrivals

**Endpoint:** `GET /api/products/new-arrivals`

**Description:** Get recently added products.

**Access:** Public

**Query Parameters:**

```
?limit=10&days=30
```

**Response (200 OK):**

```json
{
  "success": true,
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440200",
      "name": "Samsung Galaxy S24",
      "price": 899.99,
      "createdAt": "2026-05-03T10:00:00Z",
      "thumbnailUrl": "https://example.com/thumbnail.jpg"
    }
  ]
}
```

---

#### 6. Get Product by ID or Slug

**Endpoint:** `GET /api/products/{id}`

**Description:** Get detailed product information by ID or slug.

**Access:** Public

**URL Parameters:**

- id: Product UUID or slug

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440200",
    "name": "Samsung Galaxy S24",
    "nameEn": "Samsung Galaxy S24",
    "nameDe": "Samsung Galaxy S24",
    "price": 899.99,
    "originalPrice": 999.99,
    "costPrice": 500.0,
    "description": "Latest flagship smartphone with 6.2 inch display",
    "descriptionEn": "Latest flagship smartphone with 6.2 inch display",
    "descriptionDe": "Neuestes Flaggschiff-Smartphone mit 6,2-Zoll-Display",
    "sku": "SGM-GAL-S24-001",
    "weight": 0.167,
    "tags": ["smartphone", "android", "flagship"],
    "stockQuantity": 50,
    "vatRate": 0.19,
    "categoryId": "550e8400-e29b-41d4-a716-446655440100",
    "category": {
      "id": "550e8400-e29b-41d4-a716-446655440100",
      "name": "Electronics"
    },
    "images": ["https://example.com/image1.jpg", "https://example.com/image2.jpg"],
    "thumbnailUrl": "https://example.com/thumbnail.jpg",
    "rating": 4.5,
    "reviewCount": 125,
    "status": "ACTIVE",
    "createdAt": "2026-05-05T10:00:00Z",
    "updatedAt": "2026-05-05T10:00:00Z"
  }
}
```

---

#### 7. Get Related Products

**Endpoint:** `GET /api/products/{id}/related`

**Description:** Get products from the same category.

**Access:** Public

**URL Parameters:**

- id: Product UUID

**Query Parameters:**

```
?limit=5
```

**Response (200 OK):**

```json
{
  "success": true,
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440201",
      "name": "Samsung Galaxy S23",
      "price": 699.99,
      "thumbnailUrl": "https://example.com/thumbnail.jpg",
      "rating": 4.3,
      "reviewCount": 98
    }
  ]
}
```

---

#### 8. Update Product

**Endpoint:** `PUT /api/products/{id}`

**Description:** Update product details (Admin/Vendor).

**Access:** Protected (Admin or Vendor)

**URL Parameters:**

- id: Product UUID

**Request Body:**

```json
{
  "name": "Samsung Galaxy S24 Ultra",
  "price": 1099.99,
  "originalPrice": 1199.99,
  "description": "Premium flagship smartphone",
  "stockQuantity": 45,
  "status": "ACTIVE"
}
```

**Response (200 OK):**

```json
{
  "success": true,
  "message": "Product updated successfully",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440200",
    "name": "Samsung Galaxy S24 Ultra",
    "price": 1099.99,
    "updatedAt": "2026-05-05T10:30:00Z"
  }
}
```

---

#### 9. Delete Product

**Endpoint:** `DELETE /api/products/{id}`

**Description:** Delete a product (Admin only).

**Access:** Protected (Admin only)

**URL Parameters:**

- id: Product UUID

**Request Body:** None

**Response (200 OK):**

```json
{
  "success": true,
  "message": "Product deleted successfully"
}
```

---

#### 10. Upload Product Images

**Endpoint:** `POST /api/products/{id}/images`

**Description:** Upload images for a product (multipart/form-data).

**Access:** Protected (Admin or Vendor)

**URL Parameters:**

- id: Product UUID

**Request Body (multipart/form-data):**

```
files: [image1.jpg, image2.jpg, image3.jpg]
```

**Response (200 OK):**

```json
{
  "success": true,
  "message": "Images uploaded successfully",
  "data": {
    "images": [
      "https://cdn.example.com/products/550e8400-e29b-41d4-a716-446655440200/img1-123456.jpg",
      "https://cdn.example.com/products/550e8400-e29b-41d4-a716-446655440200/img2-123457.jpg"
    ]
  }
}
```

---

## Categories Module

### Base URL: `/api`

#### 1. Create Category

**Endpoint:** `POST /api/categories`

**Description:** Create a new product category (Admin only).

**Access:** Protected (Admin only)

**Request Body:**

```json
{
  "name": "Electronics",
  "nameEn": "Electronics",
  "nameDe": "Elektronik",
  "nameAm": "ኤሌክትሮኒክስ",
  "slug": "electronics",
  "description": "Electronic devices and gadgets",
  "imageUrl": "https://example.com/electronics-category.jpg",
  "isActive": true
}
```

**Validation Rules:**

- name, nameEn, nameDe, nameAm: Required, max 255 chars
- slug: Optional, generated from name if not provided
- description: Optional, max 1000 chars
- imageUrl: Optional, must be valid URL

**Response (201 Created):**

```json
{
  "success": true,
  "message": "Category created successfully",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440100",
    "name": "Electronics",
    "slug": "electronics",
    "description": "Electronic devices and gadgets",
    "imageUrl": "https://example.com/electronics-category.jpg",
    "isActive": true,
    "createdAt": "2026-05-05T10:00:00Z"
  }
}
```

---

#### 2. Get All Categories

**Endpoint:** `GET /api/categories`

**Description:** Retrieve all product categories (Public).

**Access:** Public

**Query Parameters:**

```
?isActive=true
```

**Response (200 OK):**

```json
{
  "success": true,
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440100",
      "name": "Electronics",
      "slug": "electronics",
      "description": "Electronic devices and gadgets",
      "imageUrl": "https://example.com/electronics-category.jpg",
      "isActive": true,
      "productCount": 156
    },
    {
      "id": "550e8400-e29b-41d4-a716-446655440101",
      "name": "Clothing",
      "slug": "clothing",
      "description": "Fashion and apparel",
      "imageUrl": "https://example.com/clothing-category.jpg",
      "isActive": true,
      "productCount": 342
    }
  ]
}
```

---

#### 3. Get Category with Products

**Endpoint:** `GET /api/categories/{slug}`

**Description:** Get category details with paginated products.

**Access:** Public

**URL Parameters:**

- slug: Category slug

**Query Parameters:**

```
?page=1&limit=20&sortBy=name&order=ASC
```

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "category": {
      "id": "550e8400-e29b-41d4-a716-446655440100",
      "name": "Electronics",
      "slug": "electronics",
      "description": "Electronic devices and gadgets",
      "imageUrl": "https://example.com/electronics-category.jpg",
      "isActive": true
    },
    "products": [
      {
        "id": "550e8400-e29b-41d4-a716-446655440200",
        "name": "Samsung Galaxy S24",
        "price": 899.99,
        "rating": 4.5,
        "thumbnailUrl": "https://example.com/thumbnail.jpg"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 156,
      "totalPages": 8
    }
  }
}
```

---

#### 4. Update Category

**Endpoint:** `PUT /api/categories/{id}`

**Description:** Update category details (Admin only).

**Access:** Protected (Admin only)

**URL Parameters:**

- id: Category UUID

**Request Body:**

```json
{
  "name": "Electronics & Gadgets",
  "nameEn": "Electronics & Gadgets",
  "description": "Updated description",
  "isActive": true
}
```

**Response (200 OK):**

```json
{
  "success": true,
  "message": "Category updated successfully",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440100",
    "name": "Electronics & Gadgets",
    "slug": "electronics-gadgets",
    "updatedAt": "2026-05-05T10:30:00Z"
  }
}
```

---

#### 5. Delete Category

**Endpoint:** `DELETE /api/categories/{id}`

**Description:** Delete a category (Admin only).

**Access:** Protected (Admin only)

**URL Parameters:**

- id: Category UUID

**Request Body:** None

**Response (200 OK):**

```json
{
  "success": true,
  "message": "Category deleted successfully"
}
```

---

## Cart Module

### Base URL: `/api/cart`

#### 1. Get Cart

**Endpoint:** `GET /api/cart`

**Description:** Retrieve current user's shopping cart.

**Access:** Protected (Customer only)

**Request Body:** None

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "cartId": "550e8400-e29b-41d4-a716-446655440300",
    "customerId": "550e8400-e29b-41d4-a716-446655440001",
    "items": [
      {
        "id": "550e8400-e29b-41d4-a716-446655440301",
        "productId": "550e8400-e29b-41d4-a716-446655440200",
        "product": {
          "name": "Samsung Galaxy S24",
          "price": 899.99,
          "sku": "SGM-GAL-S24-001"
        },
        "quantity": 1,
        "unitPrice": 899.99,
        "totalPrice": 899.99
      }
    ],
    "subtotal": 899.99,
    "tax": 171.0,
    "shippingCost": 10.0,
    "discountAmount": 0.0,
    "couponApplied": null,
    "total": 1080.99,
    "updatedAt": "2026-05-05T10:00:00Z"
  }
}
```

---

#### 2. Add to Cart

**Endpoint:** `POST /api/cart/add`

**Description:** Add a product to shopping cart.

**Access:** Protected (Customer only)

**Request Body:**

```json
{
  "productId": "550e8400-e29b-41d4-a716-446655440200",
  "quantity": 1
}
```

**Validation Rules:**

- productId: Valid UUID required
- quantity: Positive integer, max 999

**Response (201 Created):**

```json
{
  "success": true,
  "message": "Product added to cart",
  "data": {
    "cartItemId": "550e8400-e29b-41d4-a716-446655440301",
    "productId": "550e8400-e29b-41d4-a716-446655440200",
    "quantity": 1,
    "unitPrice": 899.99,
    "totalPrice": 899.99,
    "cartTotal": 1080.99
  }
}
```

**Error Response (400):**

```json
{
  "success": false,
  "error": "Product out of stock",
  "code": "OUT_OF_STOCK"
}
```

---

#### 3. Update Cart Item

**Endpoint:** `PUT /api/cart/items/{id}`

**Description:** Update quantity of a cart item.

**Access:** Protected (Customer only)

**URL Parameters:**

- id: Cart item UUID

**Request Body:**

```json
{
  "quantity": 2
}
```

**Validation Rules:**

- quantity: Integer, min 0, max 999

**Response (200 OK):**

```json
{
  "success": true,
  "message": "Cart item updated",
  "data": {
    "cartItemId": "550e8400-e29b-41d4-a716-446655440301",
    "quantity": 2,
    "unitPrice": 899.99,
    "totalPrice": 1799.98,
    "cartTotal": 1980.98
  }
}
```

---

#### 4. Remove from Cart

**Endpoint:** `DELETE /api/cart/items/{id}`

**Description:** Remove a product from cart.

**Access:** Protected (Customer only)

**URL Parameters:**

- id: Cart item UUID

**Request Body:** None

**Response (200 OK):**

```json
{
  "success": true,
  "message": "Item removed from cart",
  "data": {
    "cartTotal": 1080.99
  }
}
```

---

#### 5. Clear Cart

**Endpoint:** `DELETE /api/cart`

**Description:** Remove all items from cart.

**Access:** Protected (Customer only)

**Request Body:** None

**Response (200 OK):**

```json
{
  "success": true,
  "message": "Cart cleared successfully"
}
```

---

#### 6. Validate Cart

**Endpoint:** `POST /api/cart/validate`

**Description:** Validate cart contents (check stock, prices, availability).

**Access:** Protected (Customer only)

**Request Body:** None (Empty)

**Response (200 OK):**

```json
{
  "success": true,
  "message": "Cart is valid",
  "data": {
    "isValid": true,
    "issues": []
  }
}
```

**Response with Issues (200 OK):**

```json
{
  "success": true,
  "message": "Cart has issues",
  "data": {
    "isValid": false,
    "issues": [
      {
        "itemId": "550e8400-e29b-41d4-a716-446655440301",
        "productId": "550e8400-e29b-41d4-a716-446655440200",
        "issue": "INSUFFICIENT_STOCK",
        "detail": "Only 5 items available, requested 10",
        "suggestedQuantity": 5
      }
    ]
  }
}
```

---

#### 7. Apply Coupon

**Endpoint:** `POST /api/cart/coupon`

**Description:** Apply a discount coupon to cart.

**Access:** Protected (Customer only)

**Request Body:**

```json
{
  "couponCode": "SAVE20",
  "orderTotal": 1080.99
}
```

**Validation Rules:**

- couponCode: Required, min 1, max 20 chars
- orderTotal: Required, positive number

**Response (200 OK):**

```json
{
  "success": true,
  "message": "Coupon applied successfully",
  "data": {
    "couponCode": "SAVE20",
    "discountType": "PERCENTAGE",
    "discountValue": 20,
    "discountAmount": 216.2,
    "newTotal": 864.79
  }
}
```

**Error Response (400):**

```json
{
  "success": false,
  "error": "Coupon code is invalid or expired",
  "code": "INVALID_COUPON"
}
```

---

## Orders Module

### Base URL: `/api/orders`

#### 1. Create Order

**Endpoint:** `POST /api/orders`

**Description:** Create a new order from cart (Customer only).

**Access:** Protected (Customer only)

**Request Body:**

```json
{
  "deliveryAddressId": "550e8400-e29b-41d4-a716-446655440002",
  "billingAddressId": "550e8400-e29b-41d4-a716-446655440002",
  "shippingMethod": "DHL",
  "couponCode": "SAVE20"
}
```

**Validation Rules:**

- deliveryAddressId: Valid UUID required
- billingAddressId: Valid UUID (optional, defaults to delivery address)
- shippingMethod: One of [DHL, HERMES, DPD]
- couponCode: Optional, valid coupon code

**Response (201 Created):**

```json
{
  "success": true,
  "message": "Order created successfully",
  "data": {
    "orderId": "550e8400-e29b-41d4-a716-446655440400",
    "orderNumber": "ORD-2026-05-00001",
    "customerId": "550e8400-e29b-41d4-a716-446655440001",
    "status": "PENDING",
    "items": [
      {
        "productId": "550e8400-e29b-41d4-a716-446655440200",
        "productName": "Samsung Galaxy S24",
        "quantity": 1,
        "unitPrice": 899.99,
        "totalPrice": 899.99
      }
    ],
    "subtotal": 899.99,
    "tax": 171.0,
    "shippingCost": 10.0,
    "discountAmount": 216.2,
    "total": 864.79,
    "shippingMethod": "DHL",
    "deliveryAddress": {
      "street": "123 Main Street",
      "city": "Berlin",
      "postalCode": "10115",
      "country": "Germany"
    },
    "paymentStatus": "PENDING",
    "createdAt": "2026-05-05T10:00:00Z",
    "estimatedDelivery": "2026-05-10T23:59:59Z"
  }
}
```

**Error Response (400):**

```json
{
  "success": false,
  "error": "Cart is empty",
  "code": "EMPTY_CART"
}
```

---

#### 2. Get All Orders (Admin)

**Endpoint:** `GET /api/orders`

**Description:** Get all orders in the system (Admin only).

**Access:** Protected (Admin only)

**Query Parameters:**

```
?page=1&limit=20&status=PENDING&customerId=550e8400...&dateFrom=2026-05-01&dateTo=2026-05-31&minAmount=100&search=ORD
```

**Validation Rules:**

- page: Integer, min 1, default 1
- limit: Integer, min 1, max 100, default 20
- status: Optional, valid order status
- customerId: Optional, valid UUID
- dateFrom: Optional, ISO datetime
- dateTo: Optional, ISO datetime
- minAmount: Optional, positive number
- search: Optional, string max 100 chars

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "orders": [
      {
        "orderId": "550e8400-e29b-41d4-a716-446655440400",
        "orderNumber": "ORD-2026-05-00001",
        "customerName": "Jane Smith",
        "customerEmail": "customer@example.com",
        "status": "PENDING",
        "itemCount": 1,
        "total": 864.79,
        "createdAt": "2026-05-05T10:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 156,
      "totalPages": 8
    }
  }
}
```

---

#### 3. Get My Orders (Customer)

**Endpoint:** `GET /api/orders/my`

**Description:** Get current customer's orders.

**Access:** Protected (Customer only)

**Query Parameters:**

```
?page=1&limit=10&status=DELIVERED
```

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "orders": [
      {
        "orderId": "550e8400-e29b-41d4-a716-446655440400",
        "orderNumber": "ORD-2026-05-00001",
        "status": "DELIVERED",
        "total": 864.79,
        "itemCount": 1,
        "createdAt": "2026-05-05T10:00:00Z",
        "estimatedDelivery": "2026-05-10T23:59:59Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 5,
      "totalPages": 1
    }
  }
}
```

---

#### 4. Get Order by ID

**Endpoint:** `GET /api/orders/{id}`

**Description:** Get order details (Customer own or Admin).

**Access:** Protected

**URL Parameters:**

- id: Order UUID

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "orderId": "550e8400-e29b-41d4-a716-446655440400",
    "orderNumber": "ORD-2026-05-00001",
    "customerId": "550e8400-e29b-41d4-a716-446655440001",
    "status": "PENDING",
    "items": [
      {
        "id": "550e8400-e29b-41d4-a716-446655440401",
        "productId": "550e8400-e29b-41d4-a716-446655440200",
        "productName": "Samsung Galaxy S24",
        "quantity": 1,
        "unitPrice": 899.99,
        "totalPrice": 899.99
      }
    ],
    "subtotal": 899.99,
    "tax": 171.0,
    "shippingCost": 10.0,
    "discountAmount": 216.2,
    "total": 864.79,
    "shippingMethod": "DHL",
    "deliveryAddress": {
      "street": "123 Main Street",
      "city": "Berlin",
      "postalCode": "10115",
      "country": "Germany"
    },
    "paymentStatus": "PENDING",
    "notes": [],
    "createdAt": "2026-05-05T10:00:00Z",
    "estimatedDelivery": "2026-05-10T23:59:59Z"
  }
}
```

---

#### 5. Update Order Status

**Endpoint:** `PUT /api/orders/{id}/status`

**Description:** Update order status (Admin/Vendor).

**Access:** Protected (Admin or Vendor)

**URL Parameters:**

- id: Order UUID

**Request Body:**

```json
{
  "status": "PROCESSING",
  "notes": "Order is being prepared for shipment"
}
```

**Validation Rules:**

- status: Valid order status (PENDING, PROCESSING, SHIPPED, DELIVERED, CANCELLED, RETURNED)
- notes: Optional, max 500 chars

**Response (200 OK):**

```json
{
  "success": true,
  "message": "Order status updated successfully",
  "data": {
    "orderId": "550e8400-e29b-41d4-a716-446655440400",
    "status": "PROCESSING",
    "updatedAt": "2026-05-05T10:30:00Z"
  }
}
```

---

#### 6. Cancel Order

**Endpoint:** `POST /api/orders/{id}/cancel`

**Description:** Cancel an order (Customer or Admin).

**Access:** Protected

**URL Parameters:**

- id: Order UUID

**Request Body:**

```json
{
  "reason": "Changed my mind"
}
```

**Response (200 OK):**

```json
{
  "success": true,
  "message": "Order cancelled successfully",
  "data": {
    "orderId": "550e8400-e29b-41d4-a716-446655440400",
    "status": "CANCELLED",
    "refundAmount": 864.79,
    "refundInitiated": true
  }
}
```

**Error Response (400):**

```json
{
  "success": false,
  "error": "Order cannot be cancelled in current status",
  "code": "INVALID_STATUS"
}
```

---

#### 7. Get Order Tracking

**Endpoint:** `GET /api/orders/{id}/tracking`

**Description:** Get shipping/tracking information for an order.

**Access:** Protected (Customer own or Admin)

**URL Parameters:**

- id: Order UUID

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "orderId": "550e8400-e29b-41d4-a716-446655440400",
    "orderNumber": "ORD-2026-05-00001",
    "shipmentId": "550e8400-e29b-41d4-a716-446655440500",
    "trackingNumber": "DHL123456789",
    "shippingMethod": "DHL",
    "carrier": "Deutsche Post DHL",
    "status": "SHIPPED",
    "trackingUrl": "https://tracking.dhl.de/DHL123456789",
    "timeline": [
      {
        "status": "PENDING",
        "timestamp": "2026-05-05T10:00:00Z",
        "location": "Berlin, Germany",
        "description": "Order confirmed"
      },
      {
        "status": "PROCESSING",
        "timestamp": "2026-05-05T14:30:00Z",
        "location": "Berlin Distribution Center",
        "description": "Order being prepared"
      },
      {
        "status": "SHIPPED",
        "timestamp": "2026-05-06T08:00:00Z",
        "location": "DHL Hub - Berlin",
        "description": "Package shipped"
      }
    ],
    "estimatedDelivery": "2026-05-10T23:59:59Z"
  }
}
```

---

#### 8. Add Order Note

**Endpoint:** `POST /api/orders/{id}/notes`

**Description:** Add an internal note to an order (Admin only).

**Access:** Protected (Admin only)

**URL Parameters:**

- id: Order UUID

**Request Body:**

```json
{
  "note": "Customer requested expedited shipping"
}
```

**Validation Rules:**

- note: Required, min 1, max 1000 chars

**Response (201 Created):**

```json
{
  "success": true,
  "message": "Note added to order",
  "data": {
    "noteId": "550e8400-e29b-41d4-a716-446655440600",
    "orderId": "550e8400-e29b-41d4-a716-446655440400",
    "note": "Customer requested expedited shipping",
    "createdBy": "admin@example.com",
    "createdAt": "2026-05-05T10:30:00Z"
  }
}
```

---

## Payments Module

### Base URL: `/api/payments`

#### 1. Get Available Payment Methods

**Endpoint:** `GET /api/payments/methods`

**Description:** Get list of available payment methods.

**Access:** Public

**Response (200 OK):**

```json
{
  "success": true,
  "data": [
    {
      "method": "stripe",
      "name": "Stripe",
      "description": "Credit/Debit Cards",
      "isAvailable": true
    },
    {
      "method": "paypal",
      "name": "PayPal",
      "description": "PayPal Account",
      "isAvailable": true
    },
    {
      "method": "klarna",
      "name": "Klarna",
      "description": "Buy Now Pay Later",
      "isAvailable": true
    }
  ]
}
```

---

#### 2. Create Stripe Payment Intent

**Endpoint:** `POST /api/payments/stripe/create-intent`

**Description:** Create a Stripe PaymentIntent for an order.

**Access:** Protected (Customer only)

**Request Body:**

```json
{
  "orderId": "550e8400-e29b-41d4-a716-446655440400"
}
```

**Validation Rules:**

- orderId: Valid UUID required

**Response (201 Created):**

```json
{
  "success": true,
  "message": "Payment intent created",
  "data": {
    "clientSecret": "pi_1234567890_secret_abcdefghijklmnop",
    "paymentIntentId": "pi_1234567890",
    "amount": 86479,
    "currency": "EUR",
    "orderId": "550e8400-e29b-41d4-a716-446655440400",
    "status": "requires_payment_method"
  }
}
```

---

#### 3. Create PayPal Order

**Endpoint:** `POST /api/payments/paypal/create`

**Description:** Create PayPal order for checkout.

**Access:** Protected (Customer only)

**Request Body:**

```json
{
  "orderId": "550e8400-e29b-41d4-a716-446655440400"
}
```

**Response (201 Created):**

```json
{
  "success": true,
  "message": "PayPal order created",
  "data": {
    "paypalOrderId": "8UN23481PC123456J",
    "orderId": "550e8400-e29b-41d4-a716-446655440400",
    "approvalUrl": "https://www.paypal.com/checkoutnow?token=8UN23481PC123456J",
    "status": "CREATED",
    "amount": 864.79,
    "currency": "EUR"
  }
}
```

---

#### 4. Capture PayPal Order

**Endpoint:** `POST /api/payments/paypal/capture`

**Description:** Capture PayPal order after approval.

**Access:** Protected (Customer only)

**Request Body:**

```json
{
  "paypalOrderId": "8UN23481PC123456J",
  "orderId": "550e8400-e29b-41d4-a716-446655440400"
}
```

**Response (200 OK):**

```json
{
  "success": true,
  "message": "Payment captured successfully",
  "data": {
    "transactionId": "ABC123DEF456GHI789",
    "orderId": "550e8400-e29b-41d4-a716-446655440400",
    "amount": 864.79,
    "currency": "EUR",
    "status": "COMPLETED",
    "timestamp": "2026-05-05T10:30:00Z"
  }
}
```

---

#### 5. Create Klarna Session

**Endpoint:** `POST /api/payments/klarna/session`

**Description:** Create Klarna checkout session.

**Access:** Protected (Customer only)

**Request Body:**

```json
{
  "orderId": "550e8400-e29b-41d4-a716-446655440400"
}
```

**Response (201 Created):**

```json
{
  "success": true,
  "message": "Klarna session created",
  "data": {
    "sessionId": "klarna_session_abc123def456",
    "orderId": "550e8400-e29b-41d4-a716-446655440400",
    "redirectUrl": "https://checkout.klarna.com/session/abc123def456",
    "amount": 864.79,
    "currency": "EUR"
  }
}
```

---

#### 6. Confirm Klarna Order

**Endpoint:** `POST /api/payments/klarna/confirm`

**Description:** Confirm Klarna order.

**Access:** Protected (Customer only)

**Request Body:**

```json
{
  "sessionId": "klarna_session_abc123def456",
  "orderId": "550e8400-e29b-41d4-a716-446655440400"
}
```

**Response (200 OK):**

```json
{
  "success": true,
  "message": "Klarna payment confirmed",
  "data": {
    "orderId": "550e8400-e29b-41d4-a716-446655440400",
    "klarnaOrderId": "klarna_order_xyz789",
    "status": "CONFIRMED",
    "amount": 864.79
  }
}
```

---

#### 7. Get Payment Status

**Endpoint:** `GET /api/payments/{orderId}`

**Description:** Get payment status for an order.

**Access:** Protected (Customer own or Admin)

**URL Parameters:**

- orderId: Order UUID

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "orderId": "550e8400-e29b-41d4-a716-446655440400",
    "paymentStatus": "COMPLETED",
    "paymentMethod": "stripe",
    "transactionId": "pi_1234567890",
    "amount": 864.79,
    "currency": "EUR",
    "paidAt": "2026-05-05T10:30:00Z",
    "receiptUrl": "https://receipts.stripe.com/..."
  }
}
```

---

#### 8. Refund Payment

**Endpoint:** `POST /api/payments/{orderId}/refund`

**Description:** Refund a payment (Admin only).

**Access:** Protected (Admin only)

**URL Parameters:**

- orderId: Order UUID

**Request Body:**

```json
{
  "amount": 864.79,
  "reason": "requested_by_customer"
}
```

**Validation Rules:**

- amount: Positive number (optional, defaults to full amount)
- reason: One of [duplicate, fraudulent, requested_by_customer, other] (optional)

**Response (200 OK):**

```json
{
  "success": true,
  "message": "Refund processed successfully",
  "data": {
    "refundId": "ref_1234567890",
    "orderId": "550e8400-e29b-41d4-a716-446655440400",
    "amount": 864.79,
    "status": "COMPLETED",
    "processedAt": "2026-05-05T10:35:00Z"
  }
}
```

---

#### 9. Get Invoice (JSON)

**Endpoint:** `GET /api/payments/{orderId}/invoice`

**Description:** Get invoice data in JSON format.

**Access:** Protected (Customer own or Admin)

**URL Parameters:**

- orderId: Order UUID

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "invoiceNumber": "INV-2026-00001",
    "orderId": "550e8400-e29b-41d4-a716-446655440400",
    "orderDate": "2026-05-05T10:00:00Z",
    "dueDate": "2026-06-05T23:59:59Z",
    "customer": {
      "name": "Jane Smith",
      "email": "customer@example.com",
      "address": "123 Main Street, Berlin, 10115, Germany"
    },
    "items": [
      {
        "description": "Samsung Galaxy S24",
        "quantity": 1,
        "unitPrice": 899.99,
        "totalPrice": 899.99,
        "tax": 171.0
      }
    ],
    "subtotal": 899.99,
    "tax": 171.0,
    "shipping": 10.0,
    "discount": 216.2,
    "total": 864.79,
    "paymentMethod": "Stripe",
    "status": "PAID"
  }
}
```

---

#### 10. Download Invoice (PDF)

**Endpoint:** `GET /api/payments/{orderId}/invoice/download`

**Description:** Download invoice as PDF file.

**Access:** Protected (Customer own or Admin)

**URL Parameters:**

- orderId: Order UUID

**Response (200 OK):**

```
Content-Type: application/pdf
Content-Disposition: attachment; filename="INV-2026-00001.pdf"
[PDF Binary Data]
```

---

#### 11. Send Invoice Email

**Endpoint:** `POST /api/payments/{orderId}/invoice/send`

**Description:** Send invoice via email (Admin only).

**Access:** Protected (Admin only)

**URL Parameters:**

- orderId: Order UUID

**Request Body:**

```json
{
  "email": "customer@example.com"
}
```

**Response (200 OK):**

```json
{
  "success": true,
  "message": "Invoice sent to customer email"
}
```

---

#### 12. Get Payment Receipt

**Endpoint:** `GET /api/payments/{orderId}/receipt`

**Description:** Get payment receipt.

**Access:** Protected (Customer own or Admin)

**URL Parameters:**

- orderId: Order UUID

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "receiptNumber": "REC-2026-00001",
    "orderId": "550e8400-e29b-41d4-a716-446655440400",
    "amount": 864.79,
    "currency": "EUR",
    "paymentMethod": "Stripe",
    "transactionId": "pi_1234567890",
    "paidAt": "2026-05-05T10:30:00Z",
    "merchant": {
      "name": "Habeshan E-Commerce",
      "address": "Berlin, Germany",
      "taxId": "DE123456789"
    }
  }
}
```

---

#### 13. Stripe Webhook

**Endpoint:** `POST /api/payments/stripe/webhook`

**Description:** Webhook endpoint for Stripe events (signature verification required).

**Access:** Public (Webhook - no auth, but requires Stripe signature)

**Request Header:**

```
Stripe-Signature: t=timestamp,v1=signature_hash
```

**Request Body (Raw):**

```json
{
  "id": "evt_1234567890",
  "object": "event",
  "type": "charge.succeeded",
  "data": {
    "object": {
      "id": "ch_1234567890",
      "amount": 86479,
      "currency": "eur",
      "metadata": {
        "orderId": "550e8400-e29b-41d4-a716-446655440400"
      }
    }
  }
}
```

**Response (200 OK):**

```json
{
  "received": true
}
```

---

#### 14. PayPal Webhook

**Endpoint:** `POST /api/payments/paypal/webhook`

**Description:** Webhook endpoint for PayPal events.

**Access:** Public (Webhook)

**Request Body:**

```json
{
  "id": "WH-1234567890",
  "event_type": "CHECKOUT.ORDER.COMPLETED",
  "resource": {
    "id": "8UN23481PC123456J",
    "status": "COMPLETED"
  }
}
```

**Response (200 OK):**

```json
{
  "success": true
}
```

---

#### 15. Klarna Webhook

**Endpoint:** `POST /api/payments/klarna/webhook`

**Description:** Webhook endpoint for Klarna events.

**Access:** Public (Webhook)

**Request Body:**

```json
{
  "event_type": "order.confirmed",
  "order_id": "klarna_order_xyz789",
  "data": {
    "status": "CONFIRMED"
  }
}
```

**Response (200 OK):**

```json
{
  "success": true
}
```

---

## Coupons Module

### Base URL: `/api/coupons`

#### 1. Create Coupon

**Endpoint:** `POST /api/coupons`

**Description:** Create a new discount coupon (Admin only).

**Access:** Protected (Admin only)

**Request Body:**

```json
{
  "code": "SAVE20",
  "type": "PERCENTAGE",
  "value": 20,
  "minOrderValue": 50.0,
  "maxUses": 100,
  "expiresAt": "2026-12-31T23:59:59Z",
  "isActive": true
}
```

**Validation Rules:**

- code: 3-20 chars, uppercase letters/numbers/hyphens/underscores, converted to uppercase
- type: One of [PERCENTAGE, FIXED_AMOUNT, FREE_SHIPPING]
- value: Positive number (max 100 for PERCENTAGE)
- minOrderValue: Optional, non-negative
- maxUses: Optional, positive integer
- expiresAt: Optional, must be future date
- isActive: Optional, defaults to true

**Response (201 Created):**

```json
{
  "success": true,
  "message": "Coupon created successfully",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440700",
    "code": "SAVE20",
    "type": "PERCENTAGE",
    "value": 20,
    "minOrderValue": 50.0,
    "maxUses": 100,
    "usedCount": 0,
    "expiresAt": "2026-12-31T23:59:59Z",
    "isActive": true,
    "createdAt": "2026-05-05T10:00:00Z"
  }
}
```

**Error Response (409):**

```json
{
  "success": false,
  "error": "Coupon code already exists",
  "code": "CONFLICT"
}
```

---

#### 2. Get All Coupons

**Endpoint:** `GET /api/coupons`

**Description:** Get list of all coupons (Admin only).

**Access:** Protected (Admin only)

**Query Parameters:**

```
?page=1&limit=10&isActive=true&type=PERCENTAGE&search=SAVE
```

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "coupons": [
      {
        "id": "550e8400-e29b-41d4-a716-446655440700",
        "code": "SAVE20",
        "type": "PERCENTAGE",
        "value": 20,
        "minOrderValue": 50.0,
        "maxUses": 100,
        "usedCount": 25,
        "expiresAt": "2026-12-31T23:59:59Z",
        "isActive": true,
        "createdAt": "2026-05-05T10:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 15,
      "totalPages": 2
    }
  }
}
```

---

#### 3. Get Coupon by Code

**Endpoint:** `GET /api/coupons/code/{code}`

**Description:** Get coupon details by code (Admin only).

**Access:** Protected (Admin only)

**URL Parameters:**

- code: Coupon code

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440700",
    "code": "SAVE20",
    "type": "PERCENTAGE",
    "value": 20,
    "minOrderValue": 50.0,
    "maxUses": 100,
    "usedCount": 25,
    "expiresAt": "2026-12-31T23:59:59Z",
    "isActive": true,
    "createdAt": "2026-05-05T10:00:00Z"
  }
}
```

---

#### 4. Update Coupon

**Endpoint:** `PUT /api/coupons/{id}`

**Description:** Update coupon details (Admin only).

**Access:** Protected (Admin only)

**URL Parameters:**

- id: Coupon UUID

**Request Body:**

```json
{
  "isActive": false,
  "expiresAt": "2026-11-30T23:59:59Z",
  "maxUses": 50
}
```

**Response (200 OK):**

```json
{
  "success": true,
  "message": "Coupon updated successfully",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440700",
    "code": "SAVE20",
    "isActive": false,
    "expiresAt": "2026-11-30T23:59:59Z",
    "maxUses": 50,
    "updatedAt": "2026-05-05T10:30:00Z"
  }
}
```

---

#### 5. Delete Coupon

**Endpoint:** `DELETE /api/coupons/{id}`

**Description:** Delete (soft delete) a coupon (Admin only).

**Access:** Protected (Admin only)

**URL Parameters:**

- id: Coupon UUID

**Request Body:** None

**Response (200 OK):**

```json
{
  "success": true,
  "message": "Coupon deactivated successfully"
}
```

---

#### 6. Get Coupon Statistics

**Endpoint:** `GET /api/coupons/stats/overview`

**Description:** Get aggregate coupon statistics (Admin only).

**Access:** Protected (Admin only)

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "totalCoupons": 15,
    "activeCoupons": 10,
    "expiredCoupons": 3,
    "inactiveCoupons": 2,
    "totalUsage": 425,
    "byType": {
      "PERCENTAGE": 8,
      "FIXED_AMOUNT": 5,
      "FREE_SHIPPING": 2
    }
  }
}
```

---

#### 7. Validate Coupon

**Endpoint:** `POST /api/coupons/validate`

**Description:** Validate coupon and calculate discount (Customer).

**Access:** Protected

**Request Body:**

```json
{
  "code": "SAVE20",
  "orderTotal": 150.0
}
```

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "valid": true,
    "code": "SAVE20",
    "type": "PERCENTAGE",
    "value": 20,
    "discountAmount": 30.0,
    "newTotal": 120.0,
    "message": "Coupon applied successfully"
  }
}
```

**Error Response (400):**

```json
{
  "success": false,
  "error": "Coupon code is invalid or expired",
  "code": "INVALID_COUPON"
}
```

---

## Reviews Module

### Base URL: `/api/reviews`

#### 1. Create Review

**Endpoint:** `POST /api/reviews`

**Description:** Create a product review (Customer - verified purchase only).

**Access:** Protected (Customer only)

**Request Body:**

```json
{
  "productId": "550e8400-e29b-41d4-a716-446655440200",
  "rating": 5,
  "title": "Excellent product!",
  "content": "Amazing quality and fast delivery. Highly recommended!"
}
```

**Validation Rules:**

- productId: Valid UUID required
- rating: Integer 1-5
- title: Min 1 character
- content: Max 1000 characters

**Response (201 Created):**

```json
{
  "success": true,
  "message": "Review submitted for moderation",
  "data": {
    "reviewId": "550e8400-e29b-41d4-a716-446655440800",
    "status": "PENDING"
  }
}
```

**Error Response (400):**

```json
{
  "success": false,
  "error": "You can only review products you have purchased and received",
  "code": "NO_VERIFIED_PURCHASE"
}
```

---

#### 2. Get Product Reviews

**Endpoint:** `GET /api/products/{productId}/reviews`

**Description:** Get all approved reviews for a product (Public).

**Access:** Public

**URL Parameters:**

- productId: Product UUID

**Query Parameters:**

```
?page=1&limit=10&sort=helpful
```

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "productId": "550e8400-e29b-41d4-a716-446655440200",
    "productName": "Samsung Galaxy S24",
    "averageRating": 4.5,
    "totalReviews": 125,
    "reviews": [
      {
        "id": "550e8400-e29b-41d4-a716-446655440800",
        "customerId": "550e8400-e29b-41d4-a716-446655440001",
        "customerName": "Jane S.",
        "rating": 5,
        "title": "Excellent product!",
        "content": "Amazing quality and fast delivery. Highly recommended!",
        "helpfulCount": 23,
        "unhelpfulCount": 2,
        "isVerifiedPurchase": true,
        "createdAt": "2026-05-04T10:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 125,
      "totalPages": 13
    }
  }
}
```

---

#### 3. Get Pending Reviews

**Endpoint:** `GET /api/reviews/pending`

**Description:** Get reviews pending moderation (Admin only).

**Access:** Protected (Admin only)

**Query Parameters:**

```
?page=1&limit=20
```

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "reviews": [
      {
        "id": "550e8400-e29b-41d4-a716-446655440800",
        "productId": "550e8400-e29b-41d4-a716-446655440200",
        "productName": "Samsung Galaxy S24",
        "customerName": "Jane Smith",
        "rating": 5,
        "title": "Excellent product!",
        "content": "Amazing quality and fast delivery. Highly recommended!",
        "status": "PENDING",
        "submittedAt": "2026-05-04T10:00:00Z"
      }
    ]
  }
}
```

---

#### 4. Update Review

**Endpoint:** `PUT /api/reviews/{reviewId}`

**Description:** Update a review (Review owner only).

**Access:** Protected

**URL Parameters:**

- reviewId: Review UUID

**Request Body:**

```json
{
  "rating": 4,
  "title": "Good product",
  "content": "Good product but took longer to arrive than expected"
}
```

**Response (200 OK):**

```json
{
  "success": true,
  "message": "Review updated successfully",
  "data": {
    "reviewId": "550e8400-e29b-41d4-a716-446655440800",
    "status": "PENDING",
    "updatedAt": "2026-05-05T10:00:00Z"
  }
}
```

---

#### 5. Delete Review

**Endpoint:** `DELETE /api/reviews/{reviewId}`

**Description:** Delete a review (Admin only).

**Access:** Protected (Admin only)

**URL Parameters:**

- reviewId: Review UUID

**Request Body:** None

**Response (200 OK):**

```json
{
  "success": true,
  "message": "Review deleted successfully"
}
```

---

#### 6. Approve Review

**Endpoint:** `POST /api/reviews/{reviewId}/approve`

**Description:** Approve a pending review (Admin only).

**Access:** Protected (Admin only)

**URL Parameters:**

- reviewId: Review UUID

**Request Body:** None

**Response (200 OK):**

```json
{
  "success": true,
  "message": "Review approved",
  "data": {
    "reviewId": "550e8400-e29b-41d4-a716-446655440800",
    "status": "APPROVED"
  }
}
```

---

#### 7. Reject Review

**Endpoint:** `POST /api/reviews/{reviewId}/reject`

**Description:** Reject a pending review (Admin only).

**Access:** Protected (Admin only)

**URL Parameters:**

- reviewId: Review UUID

**Request Body:**

```json
{
  "reason": "Contains offensive language"
}
```

**Response (200 OK):**

```json
{
  "success": true,
  "message": "Review rejected",
  "data": {
    "reviewId": "550e8400-e29b-41d4-a716-446655440800",
    "status": "REJECTED",
    "reason": "Contains offensive language"
  }
}
```

---

#### 8. Mark Review Helpful

**Endpoint:** `POST /api/reviews/{reviewId}/helpful`

**Description:** Mark/unmark review as helpful.

**Access:** Protected (Customer)

**URL Parameters:**

- reviewId: Review UUID

**Request Body:**

```json
{
  "helpful": true
}
```

**Response (200 OK):**

```json
{
  "success": true,
  "message": "Review marked as helpful",
  "data": {
    "reviewId": "550e8400-e29b-41d4-a716-446655440800",
    "helpfulCount": 24
  }
}
```

---

## Wishlist Module

### Base URL: `/api/wishlist`

#### 1. Get Wishlist

**Endpoint:** `GET /api/wishlist`

**Description:** Get customer's wishlist.

**Access:** Protected (Customer)

**Query Parameters:**

```
?page=1&limit=20
```

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "wishlistId": "550e8400-e29b-41d4-a716-446655440900",
    "customerId": "550e8400-e29b-41d4-a716-446655440001",
    "items": [
      {
        "id": "550e8400-e29b-41d4-a716-446655440901",
        "productId": "550e8400-e29b-41d4-a716-446655440200",
        "product": {
          "name": "Samsung Galaxy S24",
          "price": 899.99,
          "originalPrice": 999.99,
          "thumbnailUrl": "https://example.com/thumbnail.jpg",
          "rating": 4.5,
          "reviewCount": 125,
          "stockQuantity": 50
        },
        "addedAt": "2026-05-03T10:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 5,
      "totalPages": 1
    }
  }
}
```

---

#### 2. Add to Wishlist

**Endpoint:** `POST /api/wishlist/{productId}`

**Description:** Add a product to wishlist.

**Access:** Protected (Customer)

**URL Parameters:**

- productId: Product UUID

**Request Body:** None

**Response (201 Created):**

```json
{
  "success": true,
  "message": "Product added to wishlist",
  "data": {
    "wishlistItemId": "550e8400-e29b-41d4-a716-446655440901",
    "productId": "550e8400-e29b-41d4-a716-446655440200",
    "addedAt": "2026-05-05T10:00:00Z"
  }
}
```

---

#### 3. Remove from Wishlist

**Endpoint:** `DELETE /api/wishlist/{productId}`

**Description:** Remove a product from wishlist.

**Access:** Protected (Customer)

**URL Parameters:**

- productId: Product UUID

**Request Body:** None

**Response (200 OK):**

```json
{
  "success": true,
  "message": "Product removed from wishlist"
}
```

---

#### 4. Move to Cart

**Endpoint:** `POST /api/wishlist/{productId}/move-to-cart`

**Description:** Move product from wishlist to cart.

**Access:** Protected (Customer)

**URL Parameters:**

- productId: Product UUID

**Request Body:**

```json
{
  "quantity": 1
}
```

**Response (200 OK):**

```json
{
  "success": true,
  "message": "Product moved to cart",
  "data": {
    "cartItemId": "550e8400-e29b-41d4-a716-446655440301",
    "productId": "550e8400-e29b-41d4-a716-446655440200",
    "quantity": 1,
    "cartTotal": 1080.99
  }
}
```

---

## Admin Module

### Base URL: `/api/admin`

#### 1. Get Dashboard Stats

**Endpoint:** `GET /api/admin/dashboard`

**Description:** Get main dashboard statistics (Admin only).

**Access:** Protected (Admin only)

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "totalRevenue": 125000.5,
    "totalOrders": 342,
    "totalCustomers": 1250,
    "totalVendors": 45,
    "todayRevenue": 3250.75,
    "todayOrders": 15,
    "pendingOrders": 23,
    "lowStockProducts": 12,
    "recentOrders": [
      {
        "id": "550e8400-e29b-41d4-a716-446655440400",
        "orderNumber": "ORD-2026-05-00001",
        "customerName": "Jane Smith",
        "total": 864.79,
        "status": "PENDING",
        "createdAt": "2026-05-05T10:00:00Z"
      }
    ]
  }
}
```

---

#### 2. Get Sales Chart Data

**Endpoint:** `GET /api/admin/dashboard/charts`

**Description:** Get sales data for charts.

**Access:** Protected (Admin only)

**Query Parameters:**

```
?period=monthly&year=2026&month=5
```

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "salesByDay": [
      { "date": "2026-05-01", "sales": 1200.5, "orders": 5 },
      { "date": "2026-05-02", "sales": 1450.75, "orders": 7 },
      { "date": "2026-05-03", "sales": 1100.0, "orders": 4 }
    ],
    "topProducts": [{ "name": "Samsung Galaxy S24", "revenue": 25000.0, "units": 28 }],
    "topCategories": [{ "name": "Electronics", "revenue": 85000.0, "percentage": 68 }]
  }
}
```

---

#### 3. Get Dashboard Alerts

**Endpoint:** `GET /api/admin/dashboard/alerts`

**Description:** Get system alerts (Admin only).

**Access:** Protected (Admin only)

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "alerts": [
      {
        "id": "alert_001",
        "type": "LOW_STOCK",
        "severity": "warning",
        "message": "12 products have low stock",
        "actionUrl": "/admin/inventory"
      },
      {
        "id": "alert_002",
        "type": "PENDING_ORDERS",
        "severity": "info",
        "message": "23 orders pending processing",
        "actionUrl": "/admin/orders"
      }
    ]
  }
}
```

---

#### 4. Get Top Products

**Endpoint:** `GET /api/admin/dashboard/top-products`

**Description:** Get best-selling products.

**Access:** Protected (Admin only)

**Query Parameters:**

```
?period=monthly&limit=10
```

**Response (200 OK):**

```json
{
  "success": true,
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440200",
      "name": "Samsung Galaxy S24",
      "sales": 28,
      "revenue": 25200.0,
      "rating": 4.5
    }
  ]
}
```

---

#### 5. Get Recent Orders

**Endpoint:** `GET /api/admin/dashboard/orders`

**Description:** Get recent orders for dashboard.

**Access:** Protected (Admin only)

**Query Parameters:**

```
?limit=10&status=PENDING
```

**Response (200 OK):**

```json
{
  "success": true,
  "data": [
    {
      "orderId": "550e8400-e29b-41d4-a716-446655440400",
      "orderNumber": "ORD-2026-05-00001",
      "customerName": "Jane Smith",
      "total": 864.79,
      "status": "PENDING",
      "createdAt": "2026-05-05T10:00:00Z"
    }
  ]
}
```

---

#### 6. Get All Users

**Endpoint:** `GET /api/admin/users`

**Description:** Get list of all users with filters (Admin only).

**Access:** Protected (Admin only)

**Query Parameters:**

```
?page=1&limit=20&role=CUSTOMER&search=jane&isActive=true
```

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "users": [
      {
        "userId": "550e8400-e29b-41d4-a716-446655440001",
        "email": "customer@example.com",
        "firstName": "Jane",
        "lastName": "Smith",
        "role": "CUSTOMER",
        "isActive": true,
        "createdAt": "2026-05-01T10:00:00Z",
        "lastLogin": "2026-05-05T10:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 1250,
      "totalPages": 63
    }
  }
}
```

---

#### 7. Get User Details

**Endpoint:** `GET /api/admin/users/{userId}`

**Description:** Get detailed information about a user (Admin only).

**Access:** Protected (Admin only)

**URL Parameters:**

- userId: User UUID

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "userId": "550e8400-e29b-41d4-a716-446655440001",
    "email": "customer@example.com",
    "firstName": "Jane",
    "lastName": "Smith",
    "phone": "+491234567890",
    "role": "CUSTOMER",
    "isActive": true,
    "createdAt": "2026-05-01T10:00:00Z",
    "lastLogin": "2026-05-05T10:00:00Z",
    "orderCount": 5,
    "totalSpent": 4325.50,
    "addresses": [ ... ],
    "activity": [ ... ]
  }
}
```

---

#### 8. Update User Role

**Endpoint:** `PUT /api/admin/users/{userId}/role`

**Description:** Update user's role (Admin only).

**Access:** Protected (Admin only)

**URL Parameters:**

- userId: User UUID

**Request Body:**

```json
{
  "role": "VENDOR"
}
```

**Validation Rules:**

- role: One of [ADMIN, VENDOR, CUSTOMER, DELIVERY]

**Response (200 OK):**

```json
{
  "success": true,
  "message": "User role updated",
  "data": {
    "userId": "550e8400-e29b-41d4-a716-446655440001",
    "role": "VENDOR"
  }
}
```

---

#### 9. Toggle User Status

**Endpoint:** `PUT /api/admin/users/{userId}/status`

**Description:** Enable/disable user account (Admin only).

**Access:** Protected (Admin only)

**URL Parameters:**

- userId: User UUID

**Request Body:**

```json
{
  "isActive": false,
  "reason": "Suspicious activity detected"
}
```

**Response (200 OK):**

```json
{
  "success": true,
  "message": "User status updated",
  "data": {
    "userId": "550e8400-e29b-41d4-a716-446655440001",
    "isActive": false
  }
}
```

---

#### 10. Reset User Password

**Endpoint:** `POST /api/admin/users/{userId}/reset-password`

**Description:** Send password reset email to user (Admin only).

**Access:** Protected (Admin only)

**URL Parameters:**

- userId: User UUID

**Request Body:** None

**Response (200 OK):**

```json
{
  "success": true,
  "message": "Password reset email sent to user"
}
```

---

#### 11. Get User Activity Log

**Endpoint:** `GET /api/admin/users/{userId}/activity`

**Description:** Get user activity log (Admin only).

**Access:** Protected (Admin only)

**URL Parameters:**

- userId: User UUID

**Query Parameters:**

```
?limit=50&offset=0
```

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "activities": [
      {
        "id": "activity_001",
        "action": "LOGIN",
        "timestamp": "2026-05-05T10:00:00Z",
        "ipAddress": "192.168.1.1"
      },
      {
        "id": "activity_002",
        "action": "ORDER_CREATED",
        "timestamp": "2026-05-05T10:15:00Z",
        "details": { "orderId": "550e8400-e29b-41d4-a716-446655440400" }
      }
    ],
    "total": 125
  }
}
```

---

#### 12. Get All Vendors

**Endpoint:** `GET /api/admin/vendors`

**Description:** Get list of vendors (Admin only).

**Access:** Protected (Admin only)

**Query Parameters:**

```
?page=1&limit=20&isApproved=false
```

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "vendors": [
      {
        "vendorId": "550e8400-e29b-41d4-a716-446655440000",
        "email": "vendor@example.com",
        "businessName": "Doe's Electronics",
        "isApproved": false,
        "submittedAt": "2026-05-03T10:00:00Z",
        "productCount": 0
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 45,
      "totalPages": 3
    }
  }
}
```

---

#### 13. Approve Vendor

**Endpoint:** `POST /api/admin/vendors/{vendorId}/approve`

**Description:** Approve vendor registration (Admin only).

**Access:** Protected (Admin only)

**URL Parameters:**

- vendorId: Vendor UUID

**Request Body:** None

**Response (200 OK):**

```json
{
  "success": true,
  "message": "Vendor approved successfully",
  "data": {
    "vendorId": "550e8400-e29b-41d4-a716-446655440000",
    "isApproved": true,
    "approvedAt": "2026-05-05T10:30:00Z"
  }
}
```

---

#### 14. Reject Vendor

**Endpoint:** `POST /api/admin/vendors/{vendorId}/reject`

**Description:** Reject vendor registration (Admin only).

**Access:** Protected (Admin only)

**URL Parameters:**

- vendorId: Vendor UUID

**Request Body:**

```json
{
  "reason": "Business documents not valid"
}
```

**Validation Rules:**

- reason: Required, min 1 character

**Response (200 OK):**

```json
{
  "success": true,
  "message": "Vendor rejected",
  "data": {
    "vendorId": "550e8400-e29b-41d4-a716-446655440000",
    "rejected": true,
    "reason": "Business documents not valid"
  }
}
```

---

## Inventory Module

### Base URL: `/api/inventory`

#### 1. Get Inventory List

**Endpoint:** `GET /api/inventory`

**Description:** Get inventory list with filters (Admin/Vendor).

**Access:** Protected (Admin or Vendor)

**Query Parameters:**

```
?page=1&limit=20&lowStockOnly=false&categoryId=550e8400...
```

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "550e8400-e29b-41d4-a716-446655440200",
        "productId": "550e8400-e29b-41d4-a716-446655440200",
        "productName": "Samsung Galaxy S24",
        "sku": "SGM-GAL-S24-001",
        "stockQuantity": 50,
        "reorderLevel": 5,
        "reserved": 5,
        "available": 45,
        "status": "IN_STOCK"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 156,
      "totalPages": 8
    }
  }
}
```

---

#### 2. Get Low Stock Alerts

**Endpoint:** `GET /api/inventory/alerts`

**Description:** Get products with low stock (Admin only).

**Access:** Protected (Admin only)

**Query Parameters:**

```
?limit=20
```

**Response (200 OK):**

```json
{
  "success": true,
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440200",
      "productName": "Samsung Galaxy S24",
      "sku": "SGM-GAL-S24-001",
      "currentStock": 3,
      "reorderLevel": 5,
      "deficit": 2,
      "categoryName": "Electronics"
    }
  ]
}
```

---

#### 3. Get Inventory Summary

**Endpoint:** `GET /api/inventory/summary`

**Description:** Get inventory statistics (Admin only).

**Access:** Protected (Admin only)

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "totalProducts": 156,
    "inStock": 145,
    "lowStock": 8,
    "outOfStock": 3,
    "totalStockValue": 125000.5,
    "byCategory": [
      {
        "categoryName": "Electronics",
        "productCount": 45,
        "stockValue": 85000.0
      }
    ]
  }
}
```

---

#### 4. Get Inventory History

**Endpoint:** `GET /api/inventory/history`

**Description:** Get inventory transaction history (Admin only).

**Access:** Protected (Admin only)

**Query Parameters:**

```
?page=1&limit=20&productId=550e8400...&type=ADJUSTMENT
```

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "history": [
      {
        "id": "inv_hist_001",
        "productId": "550e8400-e29b-41d4-a716-446655440200",
        "productName": "Samsung Galaxy S24",
        "type": "SALE",
        "quantity": -1,
        "beforeStock": 51,
        "afterStock": 50,
        "reason": "Order: ORD-2026-05-00001",
        "createdAt": "2026-05-05T10:00:00Z"
      }
    ]
  }
}
```

---

#### 5. Get Product Inventory

**Endpoint:** `GET /api/inventory/{productId}`

**Description:** Get inventory details for a product (Admin/Vendor).

**Access:** Protected (Admin or Vendor)

**URL Parameters:**

- productId: Product UUID

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "productId": "550e8400-e29b-41d4-a716-446655440200",
    "productName": "Samsung Galaxy S24",
    "sku": "SGM-GAL-S24-001",
    "totalStock": 50,
    "reserved": 5,
    "available": 45,
    "reorderLevel": 5,
    "lastRestockDate": "2026-05-01T10:00:00Z",
    "lastRestockQuantity": 100
  }
}
```

---

#### 6. Update Inventory

**Endpoint:** `PUT /api/inventory/{productId}`

**Description:** Update inventory quantity (Admin only).

**Access:** Protected (Admin only)

**URL Parameters:**

- productId: Product UUID

**Request Body:**

```json
{
  "stockQuantity": 75,
  "reorderLevel": 10,
  "reason": "Stock adjustment - physical count"
}
```

**Response (200 OK):**

```json
{
  "success": true,
  "message": "Inventory updated successfully",
  "data": {
    "productId": "550e8400-e29b-41d4-a716-446655440200",
    "beforeQuantity": 50,
    "afterQuantity": 75,
    "changeQuantity": 25,
    "newReorderLevel": 10,
    "updatedAt": "2026-05-05T10:30:00Z"
  }
}
```

---

## Notifications Module

### Base URL: `/api/notifications`

#### 1. Get My Notifications

**Endpoint:** `GET /api/notifications`

**Description:** Get user's notifications.

**Access:** Protected

**Query Parameters:**

```
?page=1&limit=20&unreadOnly=false
```

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "notifications": [
      {
        "id": "notif_001",
        "type": "ORDER_CONFIRMED",
        "title": "Order Confirmed",
        "message": "Your order ORD-2026-05-00001 has been confirmed",
        "isRead": false,
        "createdAt": "2026-05-05T10:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 45,
      "totalPages": 3
    }
  }
}
```

---

#### 2. Get Notification Stats

**Endpoint:** `GET /api/notifications/stats`

**Description:** Get notification statistics.

**Access:** Protected

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "total": 45,
    "unread": 5,
    "read": 40
  }
}
```

---

#### 3. Mark as Read

**Endpoint:** `PUT /api/notifications/{notificationId}/read`

**Description:** Mark a notification as read.

**Access:** Protected

**URL Parameters:**

- notificationId: Notification UUID

**Request Body:** None

**Response (200 OK):**

```json
{
  "success": true,
  "message": "Notification marked as read"
}
```

---

#### 4. Mark All as Read

**Endpoint:** `PUT /api/notifications/read-all`

**Description:** Mark all notifications as read.

**Access:** Protected

**Request Body:** None

**Response (200 OK):**

```json
{
  "success": true,
  "message": "All notifications marked as read"
}
```

---

#### 5. Delete Notification

**Endpoint:** `DELETE /api/notifications/{notificationId}`

**Description:** Delete a notification.

**Access:** Protected

**URL Parameters:**

- notificationId: Notification UUID

**Request Body:** None

**Response (200 OK):**

```json
{
  "success": true,
  "message": "Notification deleted"
}
```

---

#### 6. Delete All Notifications

**Endpoint:** `DELETE /api/notifications/delete-all`

**Description:** Delete all notifications.

**Access:** Protected

**Request Body:** None

**Response (200 OK):**

```json
{
  "success": true,
  "message": "All notifications deleted"
}
```

---

## Shipping Module

### Base URL: `/api/shipping`

#### 1. Get Shipping Rates

**Endpoint:** `POST /api/shipping/rates`

**Description:** Calculate shipping rates for a package.

**Access:** Public

**Request Body:**

```json
{
  "weightKg": 0.5,
  "postalCode": "10115",
  "orderTotal": 100.0
}
```

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "rates": [
      {
        "method": "DHL",
        "name": "DHL Standard",
        "cost": 5.99,
        "estimatedDays": 3,
        "description": "Delivery in 2-3 business days"
      },
      {
        "method": "HERMES",
        "name": "Hermes Express",
        "cost": 9.99,
        "estimatedDays": 1,
        "description": "Next business day delivery"
      }
    ]
  }
}
```

---

#### 2. Create Shipment

**Endpoint:** `POST /api/shipping`

**Description:** Create a shipment for an order (Admin only).

**Access:** Protected (Admin only)

**Request Body:**

```json
{
  "orderId": "550e8400-e29b-41d4-a716-446655440400",
  "method": "DHL"
}
```

**Response (201 Created):**

```json
{
  "success": true,
  "message": "Shipment created successfully",
  "data": {
    "shipmentId": "550e8400-e29b-41d4-a716-446655440500",
    "orderId": "550e8400-e29b-41d4-a716-446655440400",
    "trackingNumber": "DHL123456789",
    "method": "DHL",
    "status": "PENDING",
    "createdAt": "2026-05-05T10:00:00Z"
  }
}
```

---

#### 3. Get Tracking

**Endpoint:** `GET /api/shipping/track/{trackingNumber}`

**Description:** Get shipment tracking information.

**Access:** Protected

**URL Parameters:**

- trackingNumber: Tracking number

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "trackingNumber": "DHL123456789",
    "status": "SHIPPED",
    "carrier": "Deutsche Post DHL",
    "estimatedDelivery": "2026-05-10",
    "timeline": [
      {
        "status": "PENDING",
        "timestamp": "2026-05-05T10:00:00Z",
        "location": "Berlin, Germany"
      },
      {
        "status": "PICKED_UP",
        "timestamp": "2026-05-05T14:30:00Z",
        "location": "DHL Center Berlin"
      }
    ]
  }
}
```

---

#### 4. Download Shipping Label

**Endpoint:** `GET /api/shipping/{shipmentId}/label`

**Description:** Download shipping label PDF (Admin only).

**Access:** Protected (Admin only)

**URL Parameters:**

- shipmentId: Shipment UUID

**Response (200 OK):**

```
Content-Type: application/pdf
Content-Disposition: attachment; filename="shipping-label-DHL123456789.pdf"
[PDF Binary Data]
```

---

#### 5. Get Order Shipment

**Endpoint:** `GET /api/shipping/{orderId}`

**Description:** Get shipment details for an order.

**Access:** Protected

**URL Parameters:**

- orderId: Order UUID

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "shipmentId": "550e8400-e29b-41d4-a716-446655440500",
    "orderId": "550e8400-e29b-41d4-a716-446655440400",
    "trackingNumber": "DHL123456789",
    "method": "DHL",
    "status": "SHIPPED",
    "shippedAt": "2026-05-06T08:00:00Z",
    "estimatedDelivery": "2026-05-10T23:59:59Z"
  }
}
```

---

## Health Check

#### Health Status

**Endpoint:** `GET /health`

**Description:** Check API health status.

**Access:** Public

**Response (200 OK):**

```json
{
  "status": "ok",
  "timestamp": "2026-05-05T10:00:00Z"
}
```

---

## API Documentation Endpoints

#### Swagger UI

**Endpoint:** `GET /api-docs`

**Description:** Interactive API documentation (Development only).

**Access:** Public (Development)

**Response:** Swagger UI interface

---

#### OpenAPI Spec JSON

**Endpoint:** `GET /api-docs.json`

**Description:** OpenAPI specification in JSON format.

**Access:** Public

**Response:** OpenAPI 3.0 specification

---

## Common Response Codes

| Code | Meaning                              |
| ---- | ------------------------------------ |
| 200  | Success                              |
| 201  | Created                              |
| 400  | Bad Request (Validation error)       |
| 401  | Unauthorized (Auth required)         |
| 403  | Forbidden (Insufficient permissions) |
| 404  | Not Found                            |
| 409  | Conflict (Resource already exists)   |
| 500  | Server Error                         |

---

## Authentication

### JWT Token Format

All protected endpoints require JWT token in Authorization header:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Token Contents

Access Token includes:

- userId
- email
- role (ADMIN, VENDOR, CUSTOMER, DELIVERY)
- Expiration time (1 hour)

Refresh Token:

- Expiration time (7 days)

---

## Error Handling

### Standard Error Response

```json
{
  "success": false,
  "error": "Error message",
  "code": "ERROR_CODE",
  "details": {
    "field": "error details"
  }
}
```

### Common Error Codes

| Code            | Meaning                    |
| --------------- | -------------------------- |
| INVALID_INPUT   | Validation error           |
| UNAUTHENTICATED | Auth token missing/invalid |
| UNAUTHORIZED    | Insufficient permissions   |
| NOT_FOUND       | Resource not found         |
| CONFLICT        | Resource already exists    |
| OUT_OF_STOCK    | Product not in stock       |
| INVALID_COUPON  | Coupon invalid/expired     |

---

## Pagination

Paginated endpoints follow this format:

**Query Parameters:**

```
?page=1&limit=20
```

**Response:**

```json
{
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5
  }
}
```

---

## Date Format

All dates use ISO 8601 format: `YYYY-MM-DDTHH:mm:ssZ`

Example: `2026-05-05T10:00:00Z`

---

## Rate Limiting

- 100 requests per minute per IP
- 1000 requests per hour per IP

---

## ⚠️ KNOWN ISSUES & FIXES NEEDED

### Issue 1: Email Verification Emails Not Being Sent

**Problem:**

- Registration is successful but verification email is not delivered to user
- Code attempts to send email asynchronously but may be failing silently

**Root Cause:**

- SMTP configuration not properly validated
- Email service `sendEmailAsync()` catches errors but doesn't guarantee delivery
- May be using incorrect SMTP credentials in environment variables

**Required Fix:**
In `src/modules/auth/auth.service.ts`, modify the email sending to be synchronous during registration:

```typescript
// Change from:
sendEmailAsync(verificationEmail).catch((err) => {
  logger.error(`Failed to send verification email to ${user.email}:`, err);
});

// To:
const emailSent = await sendEmail(verificationEmail);
if (!emailSent) {
  throw new AppError(
    'Failed to send verification email. Please try again.',
    500,
    'EMAIL_SEND_FAILED'
  );
}
```

**Environment Variables to Check:**

```env
SMTP_HOST=smtp.gmail.com (or your email provider)
SMTP_PORT=587
SMTP_SECURE=true or false
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
SMTP_FROM=noreply@habeshan.com
```

**For Gmail:**

- Enable "Less secure app access" or use "App Passwords"
- SMTP_PORT: 587 (with SMTP_SECURE=false) or 465 (with SMTP_SECURE=true)

### Issue 2: Vendor Registration Doesn't Require Admin Approval Check

**Current Implementation:**

```typescript
await prisma.vendor.create({
  data: {
    userId: user.id,
    isApproved: false, // Initially false
  },
});
```

**Note:**

- Vendor is marked as `isApproved: false` but this is not automatically enforced during login
- Admin must manually approve vendor before they can fully use account
- Add endpoint to allow customers to see if vendor is approved

### Issue 3: Missing Email Verification Endpoint

**Missing Endpoint:** `GET /api/auth/verify-email?token={token}`

**Should implement:**

- Verify the email token
- Mark user as `isEmailVerified: true`
- Enable user account if all conditions met
- Return success/error response

---

## Version

API Version: 1.0.0
Last Updated: May 5, 2026

---

**End of Comprehensive API Testing Guide**
