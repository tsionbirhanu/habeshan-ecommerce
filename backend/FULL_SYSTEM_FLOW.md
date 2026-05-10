# Full System Flow - Customer, Vendor, and Admin

## Overview

This system uses a role-based flow built on JWT authentication and route-level authorization.

- **Customer** can browse products, manage cart and wishlist, place orders, pay, track shipments, and review products.
- **Vendor** can create and manage products, view their own inventory, and update order statuses where allowed.
- **Admin** controls users, vendors, products, inventory, shipping, analytics, and system settings.

---

## Shared Foundation

### Authentication Flow

1. User logs in through `/api/auth/login`.
2. The API returns a JWT access token.
3. `authenticateToken` validates the token on protected routes.
4. `requireRole(...)` blocks unauthorized roles.

### Important Role Rules

- `CUSTOMER` is the default shopping role.
- `VENDOR` is created by admin, not public signup.
- `ADMIN` manages the platform.
- Inventory write access is admin-only.
- Vendors can only see inventory for their own products.

---

## Customer Flow Example

### 1) Register and sign in

1. Customer signs up with `/api/auth/register-customer`.
2. Customer verifies email.
3. Customer logs in with `/api/auth/login`.

### 2) Browse and save products

1. Customer browses public product routes such as `/api/products` and `/api/categories`.
2. Customer can search products, view details, and inspect reviews.
3. Customer may save products to wishlist.

### 3) Build the cart

1. Customer adds products to cart.
2. Cart calculates taxes, shipping, and coupon discounts.
3. Cart reflects current product pricing and stock warnings.

### 4) Place the order

1. Customer submits `/api/orders` with delivery address and shipping method.
2. Order service checks cart contents, address ownership, and stock availability.
3. Inventory service reserves stock for each order item.
4. Payment record is created in `PENDING` state.
5. Cart is cleared after the order is created.

### 5) Pay for the order

1. Customer completes payment through the payment provider.
2. Payment success updates the order and deducts stock from inventory.
3. Notifications are created for payment and order updates.

### 6) Track delivery

1. Customer checks `/api/orders/:id/tracking`.
2. Shipping data shows shipment status and tracking events.
3. Customer can also view notification updates for shipment changes.

### 7) After delivery

1. Customer receives the package.
2. Order moves to `DELIVERED` and then `COMPLETED` depending on business rules.
3. Customer submits a review if the purchase is verified.
4. Helpful votes and notifications continue to work after the order is completed.

### Customer Example Journey

1. Register customer account.
2. Verify email and log in.
3. Add milk, bread, and oil to cart.
4. Apply coupon if valid.
5. Place order with a German delivery address.
6. Pay successfully.
7. Track shipment.
8. Leave a review after delivery.

---

## Vendor Flow Example

### 1) Vendor onboarding

1. Admin creates the vendor through `/api/admin/vendors`.
2. Vendor receives setup instructions.
3. Vendor sets password through `/api/auth/vendor/setup-password`.
4. Vendor logs in with `/api/auth/login`.

### 2) Product management

1. Vendor creates products through `/api/products`.
2. Vendor updates product details, images, and pricing.
3. Vendor can only work on allowed vendor-owned items.

### 3) Inventory visibility

1. Vendor opens `/api/inventory` to see only own inventory.
2. Vendor opens `/api/inventory/:productId` to inspect one product.
3. Vendor can monitor reserved stock and low-stock conditions.

### 4) Order coordination

1. Vendor may update order status where the route allows `ADMIN` or `VENDOR`.
2. Vendor monitors demand to avoid stockouts.
3. Vendor uses inventory data to restock products before they sell out.

### Vendor Example Journey

1. Admin creates vendor account.
2. Vendor sets password and signs in.
3. Vendor creates a product listing.
4. Vendor checks inventory for that product.
5. Vendor sees low stock and prepares replenishment.
6. Vendor updates allowed order statuses during fulfillment.

---

## Admin Flow Example

### 1) Platform control

1. Admin logs in with `/api/auth/login`.
2. Admin opens dashboard endpoints under `/api/admin/dashboard`.
3. Admin reviews sales, alerts, and top products.

### 2) User and vendor management

1. Admin lists users and vendors.
2. Admin creates vendors.
3. Admin updates roles, enables/disables accounts, and resets passwords.

### 3) Product and inventory control

1. Admin creates or updates products.
2. Admin checks `/api/inventory/summary` for stock metrics.
3. Admin checks `/api/inventory/alerts` for low-stock products.
4. Admin manually adjusts stock using `PUT /api/inventory/:productId`.
5. The system writes an inventory history record and audit log.

### 4) Order and shipment management

1. Admin views all orders.
2. Admin updates order status.
3. Admin creates shipments.
4. Admin downloads shipping labels.
5. Admin tracks deliveries and handles exceptions.

### 5) Business reporting

1. Admin opens analytics reports.
2. Admin reviews sales, customer, product, payment, and export reports.
3. Admin uses reports to make stock and fulfillment decisions.

### Admin Example Journey

1. Log in as admin.
2. Create a new vendor account.
3. Review dashboard alerts.
4. Adjust low-stock inventory after a warehouse count.
5. Create shipment for a confirmed order.
6. Export reporting data for finance.

---

## Cross-Module Inventory and Order Lifecycle

### 1) Stock reservation

- When a customer places an order, the order service calls inventory reservation logic.
- Reserved quantity increases so the same stock cannot be sold twice.

### 2) Payment confirmation

- After payment succeeds, inventory stock is deducted.
- Product `stockQuantity` is updated at the same time.

### 3) Cancellation or rollback

- If an order is cancelled, reservation is released.
- If a refund or return happens, stock can be restored.

### 4) Manual correction

- Admin can directly correct stock when warehouse counts differ from the database.
- The system records the change in inventory history.

### 5) Alerts

- Low stock creates an audit trail and can trigger notifications or dashboard alerts.

---

## End-to-End Example of the Full System

1. Customer registers and logs in.
2. Customer browses products and adds items to cart.
3. Customer places order.
4. Inventory reserves stock.
5. Customer pays.
6. Inventory deducts stock.
7. Admin creates shipment.
8. Customer tracks shipment and receives notifications.
9. Customer leaves a review after delivery.
10. Admin watches analytics and low-stock alerts.
11. Vendor restocks products and updates catalog data.

---

## Practical Role Summary

| Role     | Main Actions                                                            | Main Routes                                                                                                                 |
| -------- | ----------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| Customer | Browse, cart, order, pay, track, review                                 | `/api/auth`, `/api/products`, `/api/cart`, `/api/orders`, `/api/payments`, `/api/shipping`, `/api/reviews`, `/api/wishlist` |
| Vendor   | Create products, inspect inventory, manage allowed order updates        | `/api/auth`, `/api/products`, `/api/inventory`, `/api/orders`                                                               |
| Admin    | Manage users, vendors, inventory, orders, shipping, analytics, settings | `/api/admin`, `/api/inventory`, `/api/orders`, `/api/shipping`, `/api/analytics`                                            |
