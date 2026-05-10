import swaggerJsdoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Habeshan Mini Market API',
      version: '1.0.0',
      description: `
        Comprehensive eCommerce API for Habeshan Mini Market (Ethiopian/Eritrean Products).
        
        **User Roles:**
        - ADMIN: Full system access, user/vendor management, analytics
        - VENDOR: Product management, order fulfillment for own products
        - CUSTOMER: Browse, purchase, reviews, wishlist
        - DELIVERY: Shipment tracking and delivery updates
        
        **Key Features:**
        - Multi-language support (English, German, Amharic)
        - Product categories and advanced search
        - Shopping cart and order management
        - Multiple payment methods (Stripe, PayPal, Klarna, COD)
        - Inventory tracking and reservation
        - Order tracking and shipment management
        - Product reviews and ratings
        - Coupon and discount management
        - User accounts and address management
        - Admin dashboard with KPIs and analytics
      `,
      contact: {
        name: 'Habeshan Mini Market Support',
        email: 'support@habeshamminimarket.com',
      },
      license: {
        name: 'All rights reserved',
      },
    },
    servers: [
      {
        url: 'http://localhost:3001',
        description: 'Development server',
      },
      {
        url: 'https://api.habeshamminimarket.com',
        description: 'Production server',
      },
      {
        url: 'https://api-staging.habeshamminimarket.com',
        description: 'Staging server',
      },
    ],
    tags: [
      {
        name: 'Auth',
        description: 'Authentication and authorization endpoints',
      },
      {
        name: 'Users',
        description: 'User profile and account management',
      },
      {
        name: 'Users - Addresses',
        description: 'User address management',
      },
      {
        name: 'Admin - Dashboard',
        description: 'Admin dashboard statistics',
      },
      {
        name: 'Admin - User Management',
        description: 'User management by admin',
      },
      {
        name: 'Admin - Vendor Management',
        description: 'Vendor account management',
      },
      {
        name: 'Admin - Settings',
        description: 'System settings management',
      },
      {
        name: 'Analytics',
        description: 'Analytics and reporting',
      },
      {
        name: 'Products',
        description: 'Product listing and details',
      },
      {
        name: 'Categories',
        description: 'Product categories',
      },
      {
        name: 'Cart',
        description: 'Shopping cart management',
      },
      {
        name: 'Orders',
        description: 'Order creation and management',
      },
      {
        name: 'Payments',
        description: 'Payment processing and methods',
      },
      {
        name: 'Inventory',
        description: 'Inventory tracking and management',
      },
      {
        name: 'Notifications',
        description: 'User notifications',
      },
      {
        name: 'Reviews',
        description: 'Product reviews and ratings',
      },
      {
        name: 'Coupons',
        description: 'Coupon and discount codes',
      },
      {
        name: 'Wishlist',
        description: 'Customer wishlist management',
      },
      {
        name: 'Shipping',
        description: 'Shipping and tracking',
      },
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description:
            'JWT token from /api/auth/register-customer or /api/auth/login. Include in Authorization header as "Bearer {token}"',
        },
      },
      schemas: {
        Error: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false,
            },
            error: {
              type: 'string',
              example: 'Resource not found',
            },
            code: {
              type: 'string',
              example: 'NOT_FOUND',
            },
          },
        },
        User: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            email: { type: 'string', format: 'email' },
            firstName: { type: 'string' },
            lastName: { type: 'string' },
            phone: { type: 'string' },
            role: { type: 'string', enum: ['ADMIN', 'VENDOR', 'CUSTOMER', 'DELIVERY'] },
            isActive: { type: 'boolean' },
            isEmailVerified: { type: 'boolean' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        Product: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            name: { type: 'string' },
            nameEn: { type: 'string' },
            nameDe: { type: 'string' },
            description: { type: 'string' },
            price: { type: 'number', format: 'double' },
            stock: { type: 'integer' },
            category: { type: 'string' },
            categoryId: { type: 'string', format: 'uuid' },
            sku: { type: 'string' },
            images: { type: 'array', items: { type: 'string' } },
            rating: { type: 'number', format: 'double' },
            totalReviews: { type: 'integer' },
            isActive: { type: 'boolean' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        Order: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            customerId: { type: 'string', format: 'uuid' },
            status: {
              type: 'string',
              enum: [
                'PENDING_PAYMENT',
                'CONFIRMED',
                'PROCESSING',
                'SHIPPED',
                'IN_TRANSIT',
                'DELIVERED',
                'COMPLETED',
                'CANCELLED',
                'RETURNED',
                'REFUNDED',
              ],
            },
            totalAmount: { type: 'number', format: 'double' },
            subtotal: { type: 'number', format: 'double' },
            tax: { type: 'number', format: 'double' },
            shippingCost: { type: 'number', format: 'double' },
            discountAmount: { type: 'number', format: 'double' },
            items: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'string', format: 'uuid' },
                  productId: { type: 'string', format: 'uuid' },
                  quantity: { type: 'integer' },
                  unitPrice: { type: 'number', format: 'double' },
                  totalPrice: { type: 'number', format: 'double' },
                },
              },
            },
            deliveryAddressId: { type: 'string', format: 'uuid' },
            billingAddressId: { type: 'string', format: 'uuid' },
            paymentMethod: { type: 'string', enum: ['STRIPE', 'PAYPAL', 'KLARNA', 'COD'] },
            notes: { type: 'string' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        Address: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            street: { type: 'string' },
            city: { type: 'string' },
            state: { type: 'string' },
            zipCode: { type: 'string' },
            country: { type: 'string' },
            isDefault: { type: 'boolean' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        CartItem: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            productId: { type: 'string', format: 'uuid' },
            quantity: { type: 'integer' },
            unitPrice: { type: 'number', format: 'double' },
            totalPrice: { type: 'number', format: 'double' },
          },
        },
        Notification: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            userId: { type: 'string', format: 'uuid' },
            type: { type: 'string' },
            title: { type: 'string' },
            message: { type: 'string' },
            isRead: { type: 'boolean' },
            data: { type: 'object' },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        Review: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            productId: { type: 'string', format: 'uuid' },
            userId: { type: 'string', format: 'uuid' },
            rating: { type: 'integer', minimum: 1, maximum: 5 },
            title: { type: 'string' },
            comment: { type: 'string' },
            isApproved: { type: 'boolean' },
            helpfulCount: { type: 'integer' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        Coupon: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            code: { type: 'string' },
            type: { type: 'string', enum: ['PERCENTAGE', 'FIXED_AMOUNT', 'FREE_SHIPPING'] },
            value: { type: 'number', format: 'double' },
            minOrderValue: { type: 'number', format: 'double' },
            maxUses: { type: 'integer' },
            usedCount: { type: 'integer' },
            expiresAt: { type: 'string', format: 'date-time' },
            isActive: { type: 'boolean' },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
      },
    },
    security: [],
  },
  apis: [
    './src/modules/auth/auth.routes.ts',
    './src/modules/users/user.routes.ts',
    './src/modules/admin/admin.routes.ts',
    './src/modules/analytics/analytics.routes.ts',
    './src/modules/products/product.routes.ts',
    './src/modules/inventory/inventory.routes.ts',
    './src/modules/cart/cart.routes.ts',
    './src/modules/orders/order.routes.ts',
    './src/modules/payments/payment.routes.ts',
    './src/modules/notifications/notification.routes.ts',
    './src/modules/reviews/review.routes.ts',
    './src/modules/coupons/coupon.routes.ts',
    './src/modules/wishlist/wishlist.routes.ts',
    './src/modules/shipping/shipping.routes.ts',
  ],
};

const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec;
