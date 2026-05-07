# User Module API - Postman Endpoints

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
      "isEmailVerified": true,
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T10:30:00.000Z"
    }
  }
}
```

---

### 2. PUT /profile - Update User Profile

**Headers:**
```
Authorization: Bearer {{access_token}}
```

**Request Body:**
```json
{
  "firstName": "Johnny",
  "lastName": "Doe",
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
      "isActive": true,
      "updatedAt": "2024-01-15T11:00:00.000Z"
    }
  },
  "message": "Profile updated successfully"
}
```

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
  "error": "Passwords do not match"
}
```

**Error Response (401 - Wrong Current Password):**
```json
{
  "success": false,
  "error": "Current password is incorrect"
}
```

---

### 4. DELETE /account - Delete Account

**Headers:**
```
Authorization: Bearer {{access_token}}
```

**Note:** Only CUSTOMER role can delete their own account. Order history is retained.

**Response (200):**
```json
{
  "success": true,
  "message": "Account deleted. Your order history is retained."
}
```

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
      "addresses": [...],
      "orders": [...],
      "wishlist": [...]
    }
  },
  "exportedAt": "2024-01-15T12:00:00.000Z"
}
```

**Note:** This endpoint triggers a file download with filename `personal-data-{timestamp}.json`

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
        "street": "123 Main Street",
        "city": "Berlin",
        "postalCode": "10115",
        "country": "Germany",
        "label": "Home",
        "isDefault": true,
        "createdAt": "2024-01-15T10:30:00.000Z"
      },
      {
        "id": "550e8400-e29b-41d4-a716-446655440002",
        "street": "456 Work Ave",
        "city": "Munich",
        "postalCode": "80331",
        "country": "Germany",
        "label": "Office",
        "isDefault": false,
        "createdAt": "2024-01-15T11:00:00.000Z"
      }
    ]
  }
}
```

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

**Response (201):**
```json
{
  "success": true,
  "data": {
    "address": {
      "id": "550e8400-e29b-41d4-a716-446655440003",
      "street": "789 New Street",
      "city": "Hamburg",
      "postalCode": "20095",
      "country": "Germany",
      "label": "Parents House",
      "isDefault": false,
      "createdAt": "2024-01-15T12:00:00.000Z"
    }
  },
  "message": "Address created successfully"
}
```

---

### 8. PUT /addresses/{id} - Update Address

**Headers:**
```
Authorization: Bearer {{access_token}}
```

**Request Body:**
```json
{
  "street": "789 Updated Street",
  "city": "Hamburg",
  "postalCode": "20095",
  "label": "Vacation Home"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "address": {
      "id": "550e8400-e29b-41d4-a716-446655440003",
      "street": "789 Updated Street",
      "city": "Hamburg",
      "postalCode": "20095",
      "country": "Germany",
      "label": "Vacation Home",
      "isDefault": false,
      "updatedAt": "2024-01-15T12:30:00.000Z"
    }
  },
  "message": "Address updated successfully"
}
```

---

### 9. DELETE /addresses/{id} - Delete Address

**Headers:**
```
Authorization: Bearer {{access_token}}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Address deleted successfully"
}
```

---

### 10. POST /addresses/{id}/default - Set Default Address

**Headers:**
```
Authorization: Bearer {{access_token}}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "address": {
      "id": "550e8400-e29b-41d4-a716-446655440003",
      "street": "789 Updated Street",
      "city": "Hamburg",
      "postalCode": "20095",
      "country": "Germany",
      "label": "Vacation Home",
      "isDefault": true,
      "updatedAt": "2024-01-15T12:45:00.000Z"
    }
  },
  "message": "Default address set successfully"
}
```

---

## Validation Rules

### Password Change Requirements
- Must match current password
- New password: minimum 8 chars, 1 uppercase, 1 number, 1 special char
- New password and confirm password must match

### Address Fields
| Field | Required | Type | Default |
|-------|----------|------|---------|
| street | Yes | string | - |
| city | Yes | string | - |
| postalCode | Yes | string | - |
| country | No | string | "Germany" |
| label | No | string | - |
| isDefault | No | boolean | false |

---

## Error Responses

### 401 - Unauthorized (No Token)
```json
{
  "success": false,
  "error": "Access token required"
}
```

### 404 - Address Not Found
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

---

## Postman Environment Setup

| Variable | Initial Value |
|----------|---------------|
| `base_url` | `http://localhost:3001/api` |
| `access_token` | (from login response) |
| `address_id` | (from create address response) |

---

## Common Workflows

### Complete User Setup
```
1. POST /auth/login → Get access_token
2. GET /users/profile → View profile
3. PUT /users/profile → Update profile
4. POST /users/addresses → Add address
5. POST /users/addresses/{id}/default → Set default
```

### Change Password Flow
```
1. POST /auth/login (with old password)
2. POST /users/change-password
3. POST /auth/login (with new password)
```

### Address Management
```
1. GET /users/addresses → List all
2. POST /users/addresses → Create new
3. PUT /users/addresses/{id} → Update
4. POST /users/addresses/{id}/default → Set as default
5. DELETE /users/addresses/{id} → Remove
```
