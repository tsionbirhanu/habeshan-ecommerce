# Auth API Postman Tests

## Base URL

```text
http://localhost:3001/api/auth
```

## Notes

- Public self-registration is only for customers/buyers.
- Vendor accounts are created by an admin through the admin module, not through a public auth registration endpoint.
- Customers must verify their email before login.
- Vendor accounts become active after invitation email setup and password creation.

---

## 1. Register Customer

**Method:** `POST`

**Endpoint:** `/register-customer`

**Description:** Creates a new customer account. The user receives a verification email and must verify their email before login.

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
  "message": "Account created successfully. Please verify your email to start shopping."
}
```

### Error Response (409)

```json
{
  "success": false,
  "error": "Email already registered"
}
```

---

## 2. Verify Email

**Method:** `GET`

**Endpoint:** `/verify-email?token={token}`

**Description:** Verifies a user's email address using the token sent by email.

### Query Parameters

| Name    | Type   | Required | Description              |
| ------- | ------ | -------- | ------------------------ |
| `token` | string | Yes      | Email verification token |

### Example Request

```text
GET http://localhost:3001/api/auth/verify-email?token=eyJhbGciOiJIUzI1NiIs...
```

### Success Response (200)

```json
{
  "success": true,
  "message": "Email verified successfully"
}
```

### Error Response (400)

```json
{
  "success": false,
  "error": "Invalid or expired verification token"
}
```

---

## 3. Resend Verification Email

**Method:** `POST`

**Endpoint:** `/resend-verification`

**Description:** Sends a new email verification link if the account is not yet verified.

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

### Error Response (403)

```json
{
  "success": false,
  "error": "Email already verified"
}
```

---

## 4. Login

**Method:** `POST`

**Endpoint:** `/login`

**Description:** Authenticates a verified and active user and returns access and refresh tokens.

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
      "accessToken": "eyJhbGciOiJIUzI1NiIs...",
      "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
      "expiresIn": "1d"
    }
  },
  "message": "Login successful"
}
```

### Error Response (403)

```json
{
  "success": false,
  "error": "Please verify your email address first"
}
```

### Error Response (401)

```json
{
  "success": false,
  "error": "Invalid credentials"
}
```

---

## 5. Refresh Token

**Method:** `POST`

**Endpoint:** `/refresh-token`

**Description:** Issues a new access token using a valid refresh token.

### Request Body

```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

### Success Response (200)

```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "expiresIn": "1d"
  },
  "message": "Token refreshed successfully"
}
```

### Error Response (401)

```json
{
  "success": false,
  "error": "Invalid refresh token"
}
```

---

## 6. Forgot Password

**Method:** `POST`

**Endpoint:** `/forgot-password`

**Description:** Sends a password reset link if the email exists. Always returns success to avoid email enumeration.

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

---

## 7. Reset Password

**Method:** `POST`

**Endpoint:** `/reset-password`

**Description:** Resets the password using the reset token from the email link.

### Request Body

```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
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

### Error Response (400)

```json
{
  "success": false,
  "error": "Passwords do not match"
}
```

---

## 8. Vendor Setup Password

**Method:** `POST`

**Endpoint:** `/vendor/setup-password`

**Description:** Used by an invited vendor to set their password from the invitation email. The account becomes active automatically after this step.

### Request Body

```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "password": "VendorSecure123!",
  "confirmPassword": "VendorSecure123!"
}
```

### Success Response (200)

```json
{
  "success": true,
  "message": "Password set successfully. Your account is now active. You can now login."
}
```

### Error Response (400)

```json
{
  "success": false,
  "error": "Passwords do not match"
}
```

---

## 9. Logout

**Method:** `POST`

**Endpoint:** `/logout`

**Headers:**

```text
Authorization: Bearer {access_token}
```

**Description:** Logs the current user out. Token blacklisting is marked as a TODO in the code.

### Success Response (200)

```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

## 10. Get Current User

**Method:** `GET`

**Endpoint:** `/me`

**Headers:**

```text
Authorization: Bearer {access_token}
```

**Description:** Returns the authenticated user profile.

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
      "createdAt": "2026-05-08T10:30:00.000Z",
      "updatedAt": "2026-05-08T10:30:00.000Z"
    }
  }
}
```

### Error Response (401)

```json
{
  "success": false,
  "error": "Access token required"
}
```

---

## Postman Environment Variables

Set these variables in your Postman environment:

| Variable             | Example Value               | Purpose                    |
| -------------------- | --------------------------- | -------------------------- |
| `base_url`           | `http://localhost:3001/api` | API base URL               |
| `access_token`       | `eyJhbGciOiJIUzI1NiIs...`   | Saved after login          |
| `refresh_token`      | `eyJhbGciOiJIUzI1NiIs...`   | Saved after login          |
| `verification_token` | `eyJhbGciOiJIUzI1NiIs...`   | Verification flow          |
| `reset_token`        | `eyJhbGciOiJIUzI1NiIs...`   | Reset password flow        |
| `vendor_setup_token` | `eyJhbGciOiJIUzI1NiIs...`   | Vendor password setup flow |

### Suggested Login Test Script

```javascript
pm.test('Login successful', function () {
  const jsonData = pm.response.json();
  pm.expect(jsonData.success).to.eql(true);

  if (jsonData.data && jsonData.data.tokens) {
    pm.collectionVariables.set('access_token', jsonData.data.tokens.accessToken);
    pm.collectionVariables.set('refresh_token', jsonData.data.tokens.refreshToken);
  }
});
```

---

## Common Auth Flows

### Customer Flow

1. `POST /register-customer`
2. `GET /verify-email?token=...`
3. `POST /login`
4. `GET /me`

### Password Reset Flow

1. `POST /forgot-password`
2. Click reset link from email
3. `POST /reset-password`
4. `POST /login` with new password

### Vendor Invitation Flow

1. Admin creates vendor in the admin module
2. Vendor receives invitation email
3. `POST /vendor/setup-password`
4. `POST /login`

---

## Password Rules

Passwords must:

- Be at least 8 characters
- Include at least one uppercase letter
- Include at least one number
- Include at least one special character

### Valid Examples

- `Hello123!`
- `SecurePass456@`
- `MyP@ssw0rd`

### Invalid Examples

- `password`
- `Password1`
- `12345678`

---

## Common HTTP Status Codes

| Code | Meaning                             |
| ---- | ----------------------------------- |
| 200  | Success                             |
| 201  | Created                             |
| 400  | Validation error                    |
| 401  | Unauthorized or invalid credentials |
| 403  | Forbidden                           |
| 404  | Not found                           |
| 409  | Conflict                            |
| 500  | Server error                        |
