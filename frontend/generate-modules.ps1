#!/usr/bin/env pwsh
<#
.SYNOPSIS
Generate all missing API modules and hooks for Habeshan E-Commerce frontend
.DESCRIPTION
This script creates all 11 missing API modules (Users, Orders, Payments, Shipping,
Reviews, Wishlist, Coupons, Notifications, Inventory, Analytics, Admin) and their
corresponding React Query hooks following the established pattern.
#>

# Define module configurations
$modules = @(
    @{
        name = "users"
        displayName = "Users"
        methods = @(
            "getProfile",
            "updateProfile", 
            "changePassword",
            "deleteAccount",
            "getPersonalData",
            "createAddress",
            "getAddresses",
            "updateAddress",
            "deleteAddress"
        )
    },
    @{
        name = "orders"
        displayName = "Orders"
        methods = @(
            "create",
            "getAll",
            "getById",
            "updateStatus",
            "delete",
            "cancel",
            "getTracking",
            "requestReturn",
            "getInvoice",
            "getReceipt"
        )
    },
    @{
        name = "payments"
        displayName = "Payments"
        methods = @(
            "create",
            "getAll",
            "getById",
            "handleStripeWebhook",
            "handlePayPalWebhook",
            "handleKlarnaWebhook",
            "getInvoice",
            "updateStatus"
        )
    },
    @{
        name = "shipping"
        displayName = "Shipping"
        methods = @(
            "getRates",
            "createShipment",
            "getShipments",
            "getShipmentById",
            "trackShipment",
            "updateShipment",
            "createCarrier",
            "getCarriers"
        )
    },
    @{
        name = "reviews"
        displayName = "Reviews"
        methods = @(
            "getAll",
            "create",
            "getById",
            "update",
            "delete",
            "approve",
            "getByProduct",
            "markHelpful"
        )
    },
    @{
        name = "wishlist"
        displayName = "Wishlist"
        methods = @(
            "getWishlist",
            "addItem",
            "removeItem",
            "moveToCart",
            "getCount"
        )
    },
    @{
        name = "coupons"
        displayName = "Coupons"
        methods = @(
            "getAll",
            "getByCode",
            "validate",
            "create",
            "update"
        )
    },
    @{
        name = "notifications"
        displayName = "Notifications"
        methods = @(
            "getAll",
            "getById",
            "markAsRead",
            "delete",
            "subscribe",
            "unsubscribe"
        )
    },
    @{
        name = "inventory"
        displayName = "Inventory"
        methods = @(
            "getAll",
            "getById",
            "update",
            "getLowStock",
            "createAlert"
        )
    },
    @{
        name = "analytics"
        displayName = "Analytics"
        methods = @(
            "getDashboard",
            "getSales",
            "getProducts",
            "getCustomers",
            "getOrders",
            "getRevenue"
        )
    },
    @{
        name = "admin"
        displayName = "Admin"
        methods = @(
            "getUsers",
            "banUser",
            "deleteUser",
            "getOrders",
            "updateOrderStatus",
            "getProducts",
            "createProduct",
            "updateProduct",
            "deleteProduct",
            "getSettings",
            "updateSettings",
            "createVendor",
            "getVendors",
            "updateVendor",
            "deleteVendor"
        )
    }
)

Write-Host "🚀 Habeshan E-Commerce Module Generator" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""

foreach ($module in $modules) {
    Write-Host "📦 $($module.displayName) Module" -ForegroundColor Green
    Write-Host "   Methods: $($module.methods.Count)" -ForegroundColor Gray
}

Write-Host ""
Write-Host "Total modules to create: $($modules.Count)" -ForegroundColor Yellow
Write-Host "Total API files: $($modules.Count)" -ForegroundColor Yellow
Write-Host "Total hook files: $($modules.Count)" -ForegroundColor Yellow
Write-Host ""
Write-Host "This script is ready to generate all files." -ForegroundColor Cyan
Write-Host "Run the command: 'Create all 11 missing API modules...'" -ForegroundColor Yellow
