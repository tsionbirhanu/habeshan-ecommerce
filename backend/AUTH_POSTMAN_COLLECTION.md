# Auth API Postman Collection

## Base URL
```
http://localhost:3001/api/auth
```

---

## 1. Register Customer

**POST** `/register-customer`

### Request Body
```json
{
  "email": "customer@example.com",
  "password": "SecurePass123!",
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+49123456789"
}
```

### Success Response (201)
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid-here",
      "email": "customer@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "CUSTOMER"
    }
  },
  "message": "Account created successfully."
}
```

### Error Response (409 - Email Exists)
```json
{
  "success": false,
  "error": "Email already registered"
}
```

---

## 2. Register Vendor

**POST** `/register-vendor`

### Request Body
```json
{
  "email": "vendor@example.com",
  "password": "SecurePass123!",
  "firstName": "Jane",
  "lastName": "Smith",
  "phone": "+49123456789"
}
```

### Success Response (201)
```json
{
  "success": true,
  "message": "Registration submitted. Awaiting admin approval."
}
```

---

## 3. Verify Email

**GET** `/verify-email?token={token}`

### Query Parameters
| Name | Type | Required | Description |
|------|------|----------|-------------|
| token | string | Yes | Email verification token from the email |

### Request URL Example
```
GET http://localhost:3001/api/auth/verify-email?token=eyJhbGciOiJIUzI1NiIs...
```

### Success Response (200)
```json
{
  "success": true,
  "message": "Email verified successfully"
}
```

### Error Response (400 - Invalid Token)
```json
{
  "success": false,
  "error": "Invalid or expired verification token"
}
```

---

## 4. Resend Verification Email

**POST** `/resend-verification`

### Request Body
```json
{
  "email": "customer@example.com"
}
```

### Success Response (200)
```json
{
  "success": true,
  "message": "Verification email sent"
}
```

### Error Response (403 - Already Verified)
```json
{
  "success": false,
  "error": "Email already verified"
}
```

---

## 5. Login

**POST** `/login`

### Request Body
```json
{
  "email": "customer@example.com",
  "password": "SecurePass123!"
}
```

### Success Response (200)
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid-here",
      "email": "customer@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "CUSTOMER"
    },
    "tokens": {
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "expiresIn": "1d"
    }
  },
  "message": "Login successful"
}
```

### Error Response (401 - Invalid Credentials)
```json
{
  "success": false,
  "error": "Invalid credentials"
}
```

### Error Response (403 - Email Not Verified)
```json
{
  "success": false,
  "error": "Please verify your email address first"
}
```

---

## 6. Refresh Token

**POST** `/refresh-token`

### Request Body
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Success Response (200)
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": "1d"
  },
  "message": "Token refreshed successfully"
}
```

---

## 7. Forgot Password

**POST** `/forgot-password`

### Request Body
```json
{
  "email": "customer@example.com"
}
```

### Success Response (200)
```json
{
  "success": true,
  "message": "If that email exists, a reset link has been sent."
}
```

**Note:** Always returns success to prevent email enumeration.

---

## 8. Reset Password

**POST** `/reset-password`

### Request Body
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "newPassword": "NewSecurePass123!",
  "confirmPassword": "NewSecurePass123!"
}
```

### Success Response (200)
```json
{
  "success": true,
  "message": "Password reset successfully."
}
```

### Error Response (400 - Passwords Don't Match)
```json
{
  "success": false,
  "error": "Passwords do not match"
}
```

---

## 9. Get Current User

**GET** `/me`

### Headers
```
Authorization: Bearer {access_token}
```

### Success Response (200)
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid-here",
      "email": "customer@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "phone": "+49123456789",
      "role": "CUSTOMER",
      "isActive": true,
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T10:30:00.000Z"
    }
  }
}
```

### Error Response (401 - No Token)
```json
{
  "success": false,
  "error": "Access token required"
}
```

---

## 10. Logout

**POST** `/logout`

### Headers
```
Authorization: Bearer {access_token}
```

### Success Response (200)
```json
{
  "success": true,
  "message": "Logged out successfully"
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

## Common Workflows

### Customer Registration Flow
```
1. POST /register-customer → Creates account (email sent)
2. GET /verify-email?token=xxx → Click link from email
3. POST /login → Get tokens
4. GET /me (with Bearer token) → Access protected routes
```

### Vendor Registration Flow
```
1. POST /register-vendor → Creates account (email sent)
2. GET /verify-email?token=xxx → Verify email
3. (Wait for admin approval)
4. POST /login → Get tokens
```

### Password Reset Flow
```
1. POST /forgot-password → Reset email sent
2. Click link from email (contains token)
3. POST /reset-password with token → New password set
4. POST /login with new password
```

### Token Expired Flow
```
1. GET /me returns 401 (token expired)
2. POST /refresh-token with refreshToken → New access token
3. Continue using new access token
```

---

## Postman Environment Variables

Set up these variables in your Postman environment:

| Variable | Initial Value | Description |
|----------|---------------|-------------|
| `base_url` | `http://localhost:3001/api` | API base URL |
| `access_token` | | Auto-filled after login |
| `refresh_token` | | Auto-filled after login |
| `verification_token` | | For testing verification |

### Postman Login Pre-request Script
Add this to your login request to auto-save tokens:
```javascript
pm.test("Login successful", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData.success).to.eql(true);
    
    if (jsonData.data && jsonData.data.tokens) {
        pm.collectionVariables.set("access_token", jsonData.data.tokens.accessToken);
        pm.collectionVariables.set("refresh_token", jsonData.data.tokens.refreshToken);
    }
});
```

---

## Error Response Format

All errors follow this format:
```json
{
  "success": false,
  "error": "Error message here",
  "statusCode": 400
}
```

### Common HTTP Status Codes
| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request (validation error) |
| 401 | Unauthorized (invalid credentials or token) |
| 403 | Forbidden (email not verified, account inactive) |
| 404 | Not Found (user not found) |
| 409 | Conflict (email already exists) |
| 500 | Server Error |
