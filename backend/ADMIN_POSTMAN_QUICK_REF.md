# Admin API Quick Reference for Postman

## Base URL

```
http://localhost:3001/api/admin
```

## Authentication

All requests require:

```
Header: Authorization: Bearer {adminAccessToken}
```

Use admin credentials to login:

```json
POST /api/auth/login
{
  "email": "admin@habeshan.de",
  "password": "Admin@123"
}
```

---

## User Management

### 1. Get All Users

```
GET /users?page=1&limit=20&role=CUSTOMER&isActive=true&search=john
```

### 2. Get User Details

```
GET /users/{userId}
```

### 3. Change User Role

```
PUT /users/{userId}/role
Content-Type: application/json

{
  "role": "VENDOR"
}
```

### 4. Toggle User Status

```
PUT /users/{userId}/status
Content-Type: application/json

{
  "isActive": false,
  "reason": "Account violation"
}
```

### 5. Reset User Password

```
POST /users/{userId}/reset-password
```

### 6. Get User Activity Log

```
GET /users/{userId}/activity?limit=50&offset=0
```

---

## Vendor Management

### 1. Get All Vendors

```
GET /vendors?page=1&limit=20&isApproved=false
```

### 2. Approve Vendor

```
POST /vendors/{vendorId}/approve
```

### 3. Reject Vendor

```
POST /vendors/{vendorId}/reject
Content-Type: application/json

{
  "reason": "Incomplete documentation"
}
```

---

## Common Response Formats

### Success (List)

```json
{
  "success": true,
  "data": {
    "data": [...],
    "page": 1,
    "limit": 20,
    "total": 50,
    "pages": 3
  }
}
```

### Success (Single)

```json
{
  "success": true,
  "data": { ... },
  "message": "Action completed"
}
```

### Error

```json
{
  "success": false,
  "error": "Error message",
  "code": "ERROR_CODE"
}
```

---

## Postman Collection Template

Save this as `admin-api.json` and import into Postman:

```json
{
  "info": {
    "name": "Habeshan Admin API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Users",
      "item": [
        {
          "name": "List Users",
          "request": {
            "method": "GET",
            "url": "{{baseUrl}}/api/admin/users?page=1&limit=20",
            "header": [
              {
                "key": "Authorization",
                "value": "Bearer {{adminToken}}"
              }
            ]
          }
        },
        {
          "name": "Get User Details",
          "request": {
            "method": "GET",
            "url": "{{baseUrl}}/api/admin/users/{{userId}}",
            "header": [
              {
                "key": "Authorization",
                "value": "Bearer {{adminToken}}"
              }
            ]
          }
        },
        {
          "name": "Change User Role",
          "request": {
            "method": "PUT",
            "url": "{{baseUrl}}/api/admin/users/{{userId}}/role",
            "header": [
              {
                "key": "Authorization",
                "value": "Bearer {{adminToken}}"
              },
              {
                "key": "Content-Type",
                "value": "application/json"
              }
            ],
            "body": {
              "mode": "raw",
              "raw": "{\"role\": \"VENDOR\"}"
            }
          }
        },
        {
          "name": "Toggle User Status",
          "request": {
            "method": "PUT",
            "url": "{{baseUrl}}/api/admin/users/{{userId}}/status",
            "header": [
              {
                "key": "Authorization",
                "value": "Bearer {{adminToken}}"
              },
              {
                "key": "Content-Type",
                "value": "application/json"
              }
            ],
            "body": {
              "mode": "raw",
              "raw": "{\"isActive\": false, \"reason\": \"Violation\"}"
            }
          }
        },
        {
          "name": "Reset User Password",
          "request": {
            "method": "POST",
            "url": "{{baseUrl}}/api/admin/users/{{userId}}/reset-password",
            "header": [
              {
                "key": "Authorization",
                "value": "Bearer {{adminToken}}"
              }
            ]
          }
        },
        {
          "name": "Get User Activity",
          "request": {
            "method": "GET",
            "url": "{{baseUrl}}/api/admin/users/{{userId}}/activity?limit=50",
            "header": [
              {
                "key": "Authorization",
                "value": "Bearer {{adminToken}}"
              }
            ]
          }
        }
      ]
    },
    {
      "name": "Vendors",
      "item": [
        {
          "name": "List Vendors",
          "request": {
            "method": "GET",
            "url": "{{baseUrl}}/api/admin/vendors?isApproved=false",
            "header": [
              {
                "key": "Authorization",
                "value": "Bearer {{adminToken}}"
              }
            ]
          }
        },
        {
          "name": "Approve Vendor",
          "request": {
            "method": "POST",
            "url": "{{baseUrl}}/api/admin/vendors/{{vendorId}}/approve",
            "header": [
              {
                "key": "Authorization",
                "value": "Bearer {{adminToken}}"
              }
            ]
          }
        },
        {
          "name": "Reject Vendor",
          "request": {
            "method": "POST",
            "url": "{{baseUrl}}/api/admin/vendors/{{vendorId}}/reject",
            "header": [
              {
                "key": "Authorization",
                "value": "Bearer {{adminToken}}"
              },
              {
                "key": "Content-Type",
                "value": "application/json"
              }
            ],
            "body": {
              "mode": "raw",
              "raw": "{\"reason\": \"Documentation incomplete\"}"
            }
          }
        }
      ]
    }
  ],
  "variable": [
    {
      "key": "baseUrl",
      "value": "http://localhost:3001"
    },
    {
      "key": "adminToken",
      "value": ""
    },
    {
      "key": "userId",
      "value": ""
    },
    {
      "key": "vendorId",
      "value": ""
    }
  ]
}
```

---

## Quick Testing Workflow

1. **Login as Admin**:

   ```bash
   POST /api/auth/login
   {
     "email": "admin@habeshan.de",
     "password": "Admin@123"
   }
   ```

   Copy `accessToken` to `{{adminToken}}` variable

2. **Get All Pending Vendors**:

   ```bash
   GET /api/admin/vendors?isApproved=false
   ```

3. **Approve a Vendor**:

   ```bash
   POST /api/admin/vendors/{vendorId}/approve
   ```

   (Copy vendorId from step 2)

4. **Verify Vendor Status Changed**:

   ```bash
   GET /users/{vendorId}?role=VENDOR
   ```

   Check that `isApproved=true` and `user.isActive=true`

5. **View Admin Actions**:
   ```bash
   GET /api/admin/users/{vendorUserId}/activity
   ```

---

## Key Notes

- All UUIDs must be valid UUID format
- Page/limit use defaults: page=1, limit=20
- Search is case-insensitive and partial match
- Cannot modify own admin account
- All actions are logged to AuditLog
