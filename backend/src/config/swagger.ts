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
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'JWT token from /api/auth/register or /api/auth/login',
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
            images: { type: 'array', items: { type: 'string' } },
            rating: { type: 'number', format: 'double' },
            totalReviews: { type: 'integer' },
            createdAt: { type: 'string', format: 'date-time' },
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
                'DELIVERED',
                'COMPLETED',
                'CANCELLED',
                'RETURNED',
                'REFUNDED',
              ],
            },
            totalAmount: { type: 'number', format: 'double' },
            items: { type: 'array' },
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
