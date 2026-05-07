# User Module API - Corrected Postman Endpoints

## Base URL
```
{{base_url}}/users
```

**Set `base_url` = `http://localhost:3001/api`**

**All endpoints require Bearer token authentication**

---

## Profile Endpoints

### 1. GET /profile - Get User Profile

**Headers:**
```
Authorization: Bearer {{access_token}}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "email": "customer@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "phone": "+49123456789",
      "role": "CUSTOMER",
      "isActive": true,
      "createdAt": "2024-01-15T10:30:00.000Z",
      "addresses": [
        {
          "id": "550e8400-e29b-41d4-a716-446655440001",
          "userId": "550e8400-e29b-41d4-a716-446655440000",
          "street": "123 Main Street",
          "city": "Berlin",
          "postalCode": "10115",
          "country": "Germany",
          "isDefault": true,
          "label": "Home",
          "createdAt": "2024-01-15T10:30:00.000Z",
          "updatedAt": "2024-01-15T10:30:00.000Z"
        }
      ]
    }
  }
}
```

**Note:** Response includes user's addresses array. `isEmailVerified` and `updatedAt` are NOT included in profile response.

---

### 2. PUT /profile - Update User Profile

**Headers:**
```
Authorization: Bearer {{access_token}}
```

**Request Body (all fields optional):**
```json
{
  "firstName": "Johnny",
  "lastName": "Doe",
  "phone": "+49987654321"
}
```

**Or partial update:**
```json
{
  "phone": "+49987654321"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "email": "customer@example.com",
      "firstName": "Johnny",
      "lastName": "Doe",
      "phone": "+49987654321",
      "role": "CUSTOMER",
      "createdAt": "2024-01-15T10:30:00.000Z"
    }
  },
  "message": "Profile updated successfully"
}
```

**Note:** Response does NOT include `isActive`, `isEmailVerified`, or `updatedAt` fields.

---

### 3. POST /change-password - Change Password

**Headers:**
```
Authorization: Bearer {{access_token}}
```

**Request Body:**
```json
{
  "currentPassword": "SecurePass123!",
  "newPassword": "NewSecurePass123!",
  "confirmPassword": "NewSecurePass123!"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Password changed successfully"
}
```

**Error Response (400 - Passwords Don't Match):**
```json
{
  "success": false,
  "error": "Passwords do not match",
  "path": "confirmPassword"
}
```

**Error Response (401 - Wrong Current Password):**
```json
{
  "success": false,
  "error": "Current password is incorrect"
}
```

**Error Response (403 - Rate Limit):**
```json
{
  "success": false,
  "error": "Too many password change attempts. Try again later."
}
```

**Rate Limit:** 5 password changes per hour per user.

---

### 4. DELETE /account - Delete Account

**Headers:**
```
Authorization: Bearer {{access_token}}
```

**Note:** Only CUSTOMER role can delete their own account. Vendors and Admins cannot self-delete.

**Response (200):**
```json
{
  "success": true,
  "message": "Account deleted. Your order history is retained."
}
```

**What happens:**
- Email changed to `deleted_{userId}@deleted.com`
- First/Last name changed to "Deleted Account"
- `isActive` set to false
- `deletedAt` timestamp added
- Order history is retained for legal/compliance

---

### 5. GET /personal-data - Download Personal Data (GDPR)

**Headers:**
```
Authorization: Bearer {{access_token}}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "email": "customer@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "phone": "+49123456789",
      "role": "CUSTOMER",
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T10:30:00.000Z",
      "addresses": [
        {
          "id": "550e8400-e29b-41d4-a716-446655440001",
          "userId": "550e8400-e29b-41d4-a716-446655440000",
          "street": "123 Main Street",
          "city": "Berlin",
          "postalCode": "10115",
          "country": "Germany",
          "isDefault": true,
          "label": "Home",
          "createdAt": "2024-01-15T10:30:00.000Z",
          "updatedAt": "2024-01-15T10:30:00.000Z"
        }
      ],
      "orders": [
        {
          "id": "order-uuid",
          "items": [...],
          "totalAmount": 99.99,
          "status": "COMPLETED",
          "createdAt": "2024-01-10T10:00:00.000Z"
        }
      ],
      "reviews": [
        {
          "id": "review-uuid",
          "productId": "product-uuid",
          "rating": 5,
          "comment": "Great product!",
          "createdAt": "2024-01-12T10:00:00.000Z"
        }
      ]
    }
  },
  "exportedAt": "2024-01-15T12:00:00.000Z"
}
```

**Note:** This endpoint also triggers file download with header `Content-Disposition: attachment; filename="personal-data-{timestamp}.json"`

---

## Address Endpoints

### 6. GET /addresses - Get All Addresses

**Headers:**
```
Authorization: Bearer {{access_token}}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "addresses": [
      {
        "id": "550e8400-e29b-41d4-a716-446655440001",
        "userId": "550e8400-e29b-41d4-a716-446655440000",
        "street": "123 Main Street",
        "city": "Berlin",
        "postalCode": "10115",
        "country": "Germany",
        "isDefault": true,
        "label": "Home",
        "createdAt": "2024-01-15T10:30:00.000Z",
        "updatedAt": "2024-01-15T10:30:00.000Z"
      },
      {
        "id": "550e8400-e29b-41d4-a716-446655440002",
        "userId": "550e8400-e29b-41d4-a716-446655440000",
        "street": "456 Work Ave",
        "city": "Munich",
        "postalCode": "80331",
        "country": "Germany",
        "isDefault": false,
        "label": "Office",
        "createdAt": "2024-01-15T11:00:00.000Z",
        "updatedAt": "2024-01-15T11:00:00.000Z"
      }
    ]
  }
}
```

**Note:** Addresses are sorted by `createdAt` descending (newest first). Includes `userId` and `updatedAt` fields.

---

### 7. POST /addresses - Create Address

**Headers:**
```
Authorization: Bearer {{access_token}}
```

**Request Body:**
```json
{
  "street": "789 New Street",
  "city": "Hamburg",
  "postalCode": "20095",
  "country": "Germany",
  "label": "Parents House",
  "isDefault": false
}
```

**Minimum required:**
```json
{
  "street": "789 New Street",
  "city": "Hamburg",
  "postalCode": "20095"
}
```

**Field Details:**
| Field | Required | Default | Notes |
|-------|----------|---------|-------|
| street | Yes | - | - |
| city | Yes | - | - |
| postalCode | Yes | - | - |
| country | No | "Germany" | Auto-set if not provided |
| label | No | null | Home, Office, etc. |
| isDefault | No | false | If true, other addresses become non-default |

**Response (201):**
```json
{
  "success": true,
  "data": {
    "address": {
      "id": "550e8400-e29b-41d4-a716-446655440003",
      "userId": "550e8400-e29b-41d4-a716-446655440000",
      "street": "789 New Street",
      "city": "Hamburg",
      "postalCode": "20095",
      "country": "Germany",
      "isDefault": false,
      "label": "Parents House",
      "createdAt": "2024-01-15T12:00:00.000Z",
      "updatedAt": "2024-01-15T12:00:00.000Z"
    }
  },
  "message": "Address created successfully"
}
```

**Note:** If `isDefault: true`, all other user addresses automatically become `isDefault: false`.

---

### 8. PUT /addresses/{id} - Update Address

**Headers:**
```
Authorization: Bearer {{access_token}}
```

**URL Parameter:** `id` (UUID of address)

**Request Body (all fields optional):**
```json
{
  "street": "789 Updated Street",
  "city": "Hamburg",
  "postalCode": "20095",
  "label": "Vacation Home",
  "isDefault": true
}
```

**Or partial update:**
```json
{
  "label": "New Label"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "address": {
      "id": "550e8400-e29b-41d4-a716-446655440003",
      "userId": "550e8400-e29b-41d4-a716-446655440000",
      "street": "789 Updated Street",
      "city": "Hamburg",
      "postalCode": "20095",
      "country": "Germany",
      "label": "Vacation Home",
      "isDefault": true,
      "createdAt": "2024-01-15T12:00:00.000Z",
      "updatedAt": "2024-01-15T12:30:00.000Z"
    }
  },
  "message": "Address updated successfully"
}
```

**Error Response (403 - Not Your Address):**
```json
{
  "success": false,
  "error": "Cannot update this address"
}
```

**Note:** Setting `isDefault: true` will set all other addresses to `isDefault: false`.

---

### 9. DELETE /addresses/{id} - Delete Address

**Headers:**
```
Authorization: Bearer {{access_token}}
```

**URL Parameter:** `id` (UUID of address)

**Response (200):**
```json
{
  "success": true,
  "message": "Address deleted successfully"
}
```

**Error Response (403 - Last Address with Active Orders):**
```json
{
  "success": false,
  "error": "Cannot delete last address with active orders"
}
```

**Validation Rules:**
- Cannot delete address that doesn't belong to you
- If it's your last address and you have active orders (PENDING_PAYMENT, CONFIRMED, PROCESSING, SHIPPED, IN_TRANSIT), deletion is blocked
- If you have multiple addresses, you can delete freely

---

### 10. POST /addresses/{id}/default - Set Default Address

**Headers:**
```
Authorization: Bearer {{access_token}}
```

**URL Parameter:** `id` (UUID of address)

**Request Body:** None

**Response (200):**
```json
{
  "success": true,
  "data": {
    "address": {
      "id": "550e8400-e29b-41d4-a716-446655440003",
      "userId": "550e8400-e29b-41d4-a716-446655440000",
      "street": "789 Updated Street",
      "city": "Hamburg",
      "postalCode": "20095",
      "country": "Germany",
      "label": "Vacation Home",
      "isDefault": true,
      "createdAt": "2024-01-15T12:00:00.000Z",
      "updatedAt": "2024-01-15T12:45:00.000Z"
    }
  },
  "message": "Default address set successfully"
}
```

**Note:** This automatically sets all other user addresses to `isDefault: false`.

**Error Response (403 - Not Your Address):**
```json
{
  "success": false,
  "error": "Cannot set this address as default"
}
```

---

## Password Validation Rules

All passwords must:
- Be at least 8 characters
- Contain at least one uppercase letter (A-Z)
- Contain at least one number (0-9)
- Contain at least one special character (!@#$%^&* etc.)

### Example Valid Passwords
- `Hello123!`
- `SecurePass456@`
- `MyP@ssw0rd`

### Example Invalid Passwords
- `password` (no uppercase, no number, no special char)
- `Password1` (no special character)
- `12345678` (no letters)

---

## Common Error Responses

### 401 - Unauthorized (No Token or Invalid Token)
```json
{
  "success": false,
  "error": "Access token required"
}
```

### 403 - Forbidden (Not Owner or Wrong Role)
```json
{
  "success": false,
  "error": "Cannot update this address"
}
```

### 404 - Not Found
```json
{
  "success": false,
  "error": "User not found"
}
```

or

```json
{
  "success": false,
  "error": "Address not found"
}
```

### 400 - Validation Error
```json
{
  "success": false,
  "error": "Street is required"
}
```

or

```json
{
  "success": false,
  "error": "Password must be at least 8 characters"
}
```

or

```json
{
  "success": false,
  "error": "Invalid uuid"
}
```

---

## Postman Environment Setup

| Variable | Initial Value | Description |
|----------|---------------|-------------|
| `base_url` | `http://localhost:3001/api` | API base URL |
| `access_token` | | From /auth/login response |
| `address_id` | | From POST /addresses response |

---

## Common Workflows

### Complete User Setup Flow
```
1. POST /auth/login
   → Save access_token to environment

2. GET /users/profile
   → View current profile with addresses

3. PUT /users/profile
   → Update firstName, lastName, phone

4. POST /users/addresses
   → Create new address
   → Save address_id to environment

5. POST /users/addresses/{{address_id}}/default
   → Set as default address

6. GET /users/addresses
   → Verify default is set correctly
```

### Change Password Flow
```
1. POST /auth/login (with current password)
   → Get access_token

2. POST /users/change-password
   {
     "currentPassword": "oldpass",
     "newPassword": "NewPass123!",
     "confirmPassword": "NewPass123!"
   }

3. POST /auth/logout

4. POST /auth/login (with new password)
   → Get new access_token
```

### Address Management Flow
```
1. GET /users/addresses
   → List all addresses

2. POST /users/addresses
   → Create new address
   → Note the id from response

3. PUT /users/addresses/{{address_id}}
   → Update address details

4. POST /users/addresses/{{address_id}}/default
   → Set as default

5. DELETE /users/addresses/{{old_address_id}}
   → Remove old address
```

### GDPR Data Export Flow
```
1. GET /users/personal-data
   → Downloads all personal data
   → Includes: profile, addresses, orders, reviews
   → File: personal-data-{timestamp}.json
```
