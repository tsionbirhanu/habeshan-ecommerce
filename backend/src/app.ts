import express, { Application, Request, Response } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import { env } from './config/environment';
import { requestLogger } from './middleware/requestLogger.middleware';
import { errorHandler } from './middleware/error.middleware';
import swaggerSpec from './config/swagger';

const app: Application = express();

// Request logger (first to log all requests)
app.use(requestLogger);

// Security headers
app.use(helmet());

// CORS middleware
app.use(
  cors({
    origin: env.ALLOWED_ORIGINS,
    credentials: true,
  })
);

// CRITICAL: Stripe webhook route with raw body (must be BEFORE express.json())
import {
  stripeWebhookHandler,
  paypalWebhookHandler,
  klarnaWebhookHandler,
} from './modules/payments/payment.routes';
app.post(
  '/api/payments/stripe/webhook',
  express.raw({ type: 'application/json' }),
  stripeWebhookHandler
);
app.post('/api/payments/paypal/webhook', express.json(), paypalWebhookHandler);
app.post('/api/payments/klarna/webhook', express.json(), klarnaWebhookHandler);

// Body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check route
app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Swagger/OpenAPI documentation (development)
if (env.NODE_ENV !== 'production') {
  app.use(
    '/api-docs',
    swaggerUi.serve,
    swaggerUi.setup(swaggerSpec, {
      swaggerOptions: {
        persistAuthorization: true,
      },
    })
  );
}

// Export OpenAPI spec as JSON
app.get('/api-docs.json', (_req: Request, res: Response) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

// API routes
import authRoutes from './modules/auth/auth.routes';
import userRoutes from './modules/users/user.routes';
import adminRoutes from './modules/admin/admin.routes';
import productRoutes from './modules/products/product.routes';
import inventoryRoutes from './modules/inventory/inventory.routes';
import cartRoutes from './modules/cart/cart.routes';
import orderRoutes from './modules/orders/order.routes';
import paymentRoutes from './modules/payments/payment.routes';
import notificationRoutes from './modules/notifications/notification.routes';
import reviewRoutes from './modules/reviews/review.routes';
import wishlistRoutes from './modules/wishlist/wishlist.routes';
import shippingRoutes from './modules/shipping/shipping.routes';
import couponRoutes from './modules/coupons/coupon.routes';

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api', productRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/shipping', shippingRoutes);
app.use('/api/coupons', couponRoutes);

// 404 handler
app.use((_req: Request, res: Response) => {
  res.status(404).json({ success: false, error: 'Route not found', code: 'NOT_FOUND' });
});

// Global error handler (must be last)
app.use(errorHandler);

export default app;
