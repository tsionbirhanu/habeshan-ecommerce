# Habesha Mini Market Summary

## Overview

Habesha Mini Market is an eCommerce backend for Ethiopian and Eritrean products, built with Node.js, Express, TypeScript, PostgreSQL, Prisma, JWT auth, bcrypt, Zod validation, Jest, Supertest, and Winston logging.

The repository currently has two top-level folders:

- `backend/` contains the implemented application.
- `frontend/` is currently empty.

## Backend Architecture

The backend follows a modular Express structure with centralized middleware, shared utilities, Prisma-based data access, and feature modules under `src/modules/`.

Main entry points:

- `src/server.ts` starts the HTTP server.
- `src/app.ts` configures middleware, routes, and error handling.

Core runtime features:

- Security headers via Helmet.
- CORS configured from environment variables.
- JSON and URL-encoded body parsing.
- Request logging.
- Centralized error handling.

## Feature Modules

### Authentication

Auth is fully implemented and includes:

- Vendor registration with approval workflow.
- Customer registration with automatic wishlist creation.
- Login for active users.
- Refresh token flow.
- Logout endpoint.
- Forgot-password and reset-password flow.
- `GET /api/auth/me` for current-user lookup.

Auth supports:

- JWT access, refresh, and reset tokens.
- Role-based access control for `ADMIN`, `VENDOR`, `CUSTOMER`, and `DELIVERY`.
- Password hashing with bcrypt.
- Zod validation for auth requests.

### Users

User management endpoints cover:

- Profile retrieval.
- Profile updates.
- Password changes with current-password verification.
- Soft account deletion for customers.
- GDPR-style personal data export.

User deletion behavior:

- Sets `deletedAt` and disables the account.
- Anonymizes the user email and first name.
- Preserves order records for legal and tax retention.

### Addresses

Address management includes:

- Listing all addresses for the authenticated user.
- Creating addresses.
- Updating owned addresses.
- Deleting owned addresses.
- Setting a default address.

Security rules:

- Ownership is validated before update/delete/default actions.
- The last address cannot be removed if active orders exist.
- Only one address is kept as default at a time.

## API Surface

### Auth Routes

- `POST /api/auth/register-customer` - Customer registration (public)
- `POST /api/auth/login` - User login (public)
- `POST /api/auth/refresh-token` - Refresh JWT token
- `POST /api/auth/logout` - User logout
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password with token
- `GET /api/auth/me` - Get current user profile
- `POST /api/auth/vendor/setup-password` - Vendor password setup (from invitation)

⚠️ **NOTE**: Vendor registration is ADMIN-ONLY. See `Admin Routes` for vendor creation.

### User Routes

- `GET /api/users/profile`
- `PUT /api/users/profile`
- `POST /api/users/change-password`
- `DELETE /api/users/account`
- `GET /api/users/personal-data`

### Address Routes

- `GET /api/users/addresses`
- `POST /api/users/addresses`
- `PUT /api/users/addresses/:id`
- `DELETE /api/users/addresses/:id`
- `POST /api/users/addresses/:id/default`

## Validation and Security

Validation is handled with Zod schemas for auth and user operations. Security and data protection include:

- Authentication middleware for bearer tokens.
- Role authorization middleware.
- Ownership checks for user-owned resources.
- Password strength checks.
- No password fields returned in API responses.
- Password-change rate limiting at 5 requests per hour per user (in-memory).

## Data Model

The Prisma schema defines the main business entities:

- `User`
- `Address`
- `Vendor`
- `Category`
- `Product`
- `Order`
- `OrderItem`
- `Payment`
- `Invoice`
- `Inventory`
- `InventoryHistory`
- `Review`
- `Coupon`
- `Wishlist`
- `WishlistItem`
- `Notification`
- `Shipment`
- `TrackingEvent`
- `AuditLog`

Important relationships:

- Users own addresses, orders, reviews, notifications, audit logs, and optionally vendor or wishlist records.
- Orders retain customer and item history.
- Products connect to categories, vendors, inventory, order items, reviews, and wishlist items.

## Middleware and Utilities

Important cross-cutting pieces:

- `auth.middleware.ts` for authentication and role checks.
- `validation.middleware.ts` for Zod-based validation.
- `requestLogger.middleware.ts` for structured request logging.
- `error.middleware.ts` for unified API error responses.
- `logger.ts` for Winston logging.
- `jwt.utils.ts` for token creation and verification.
- `hash.utils.ts` for password hashing and comparison.

## Configuration and Environment

Configuration is loaded from `.env` and validated at startup. Key variables include:

- `DATABASE_URL`
- `JWT_SECRET`
- `JWT_ACCESS_EXPIRY`
- `JWT_REFRESH_EXPIRY`
- `ALLOWED_ORIGINS`
- `LOG_LEVEL`

## Database and Tooling

Database workflow:

- Prisma schema in `prisma/schema.prisma`.
- Migration support in `prisma/migrations/`.
- Seed script in `prisma/seed.ts`.
- Prisma Studio available through the npm script.

Available npm scripts:

- `npm run dev`
- `npm run build`
- `npm start`
- `npm test`
- `npm run lint`
- `npm run format`
- `npm run db:generate`
- `npm run db:migrate`
- `npm run db:seed`
- `npm run db:studio`
- `npm run db:push`

## Tests

The backend includes test files for:

- Authentication behavior.
- Middleware behavior.

The current test coverage appears focused on utility and middleware validation rather than full route integration.

## Documentation Files

Helpful docs in `backend/`:

- `README.md` - backend setup and overview.
- `AUTH_README.md` - auth system details.
- `AUTH_ENDPOINTS_REPORT.md` - auth endpoint summary.
- `DATABASE_SETUP.md` - database setup instructions.
- `MIGRATION_GUIDE.md` - migration guidance.
- `MIDDLEWARE_REPORT.md` - middleware notes.

## Current Gaps / Notes

- The `frontend/` folder is empty, so there is no implemented UI yet.
- Password reset email delivery is still a TODO.
- Logout token blacklisting is still a TODO.
- Password-change rate limiting is currently in-memory and would need Redis or similar for multi-instance production use.

## Bottom Line

The codebase is a backend-first eCommerce platform with strong auth, role-based access, Prisma data modeling, validation, logging, and user/address management. The main missing piece is the frontend application.
