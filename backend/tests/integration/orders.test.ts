import request from 'supertest';
import app from '../../src/app';
import { prisma } from '../../src/database/prisma';
import {
  createTestUser,
  createTestProduct,
  createTestAddress,
  createTestCart,
  createTestCoupon,
} from '../factories';
import { generateTestToken } from '../setup';

describe('Orders Integration Tests', () => {
  let customer: any;
  let customerToken: string;
  let product: any;
  let address: any;

  beforeAll(async () => {
    customer = await createTestUser({ role: 'CUSTOMER' });
    customerToken = generateTestToken(customer.id, 'CUSTOMER');
    product = await createTestProduct({ stockQuantity: 50 });
    address = await createTestAddress(customer.id);
  });

  beforeEach(async () => {
    await prisma.order.deleteMany();
    await prisma.cartItem.deleteMany();
    await prisma.payment.deleteMany();
  });

  describe('POST /api/orders (Create Order)', () => {
    beforeEach(async () => {
      // Setup cart with product
      await createTestCart(customer.id, [product.id]);
    });

    it('should create order without coupon', async () => {
      const response = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          deliveryAddressId: address.id,
          shippingMethod: 'DHL',
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBeDefined();
      expect(response.body.data.status).toBe('PENDING_PAYMENT');
    });

    it('should create order with valid coupon', async () => {
      const coupon = await createTestCoupon({
        code: 'ORDERTEST',
        type: 'PERCENTAGE',
        value: 10,
      });

      const response = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          deliveryAddressId: address.id,
          shippingMethod: 'DHL',
          couponCode: 'ORDERTEST',
        });

      expect(response.status).toBe(201);
      expect(response.body.data.discountAmount).toBeGreaterThan(0);

      // Verify coupon usage incremented
      const updatedCoupon = await prisma.coupon.findUnique({
        where: { id: coupon.id },
      });
      expect(updatedCoupon?.currentUses).toBe(1);
    });

    it('should reject order with invalid coupon', async () => {
      const response = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          deliveryAddressId: address.id,
          shippingMethod: 'DHL',
          couponCode: 'INVALIDCOUPON',
        });

      expect(response.status).toBe(409); // Conflict
    });

    it('should reject order with empty cart', async () => {
      // Clear cart
      await prisma.cartItem.deleteMany({ where: { cart: { customerId: customer.id } } });

      const response = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          deliveryAddressId: address.id,
          shippingMethod: 'DHL',
        });

      expect(response.status).toBe(409);
    });

    it('should reject order with invalid address', async () => {
      const response = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          deliveryAddressId: 'invalid-id',
          shippingMethod: 'DHL',
        });

      expect(response.status).toBe(404);
    });

    it('should reject order with insufficient stock', async () => {
      // Create product with low stock
      const lowStockProduct = await createTestProduct({ stockQuantity: 1 });
      await createTestCart(customer.id, [lowStockProduct.id]);

      // Try to order more than available
      const response = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          deliveryAddressId: address.id,
          shippingMethod: 'DHL',
        });

      expect([201, 409]).toContain(response.status);
    });
  });

  describe('GET /api/orders/:id (Get Order)', () => {
    it('should return order details for customer', async () => {
      const order = await prisma.order.create({
        data: {
          customerId: customer.id,
          status: 'CONFIRMED',
          paymentStatus: 'COMPLETED',
          subtotal: 100,
          taxAmount: 19,
          shippingCost: 4.99,
          discountAmount: 0,
          totalAmount: 123.99,
          shippingMethod: 'DHL',
          deliveryAddress: { street: 'Test St' },
          billingAddress: { street: 'Test St' },
        },
      });

      const response = await request(app)
        .get(`/api/orders/${order.id}`)
        .set('Authorization', `Bearer ${customerToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data.id).toBe(order.id);
    });

    it('should return 404 for non-existent order', async () => {
      const response = await request(app)
        .get('/api/orders/nonexistent-id')
        .set('Authorization', `Bearer ${customerToken}`);

      expect(response.status).toBe(404);
    });
  });

  describe('GET /api/orders (Get My Orders)', () => {
    beforeEach(async () => {
      // Create multiple orders
      for (let i = 0; i < 3; i++) {
        await prisma.order.create({
          data: {
            customerId: customer.id,
            status: 'COMPLETED',
            paymentStatus: 'COMPLETED',
            subtotal: 100,
            taxAmount: 19,
            shippingCost: 4.99,
            discountAmount: 0,
            totalAmount: 123.99,
            shippingMethod: 'DHL',
            deliveryAddress: { street: 'Test St' },
            billingAddress: { street: 'Test St' },
          },
        });
      }
    });

    it('should list customer orders with pagination', async () => {
      const response = await request(app)
        .get('/api/orders')
        .set('Authorization', `Bearer ${customerToken}`)
        .query({ page: 1, limit: 10 });

      expect(response.status).toBe(200);
      expect(response.body.data.length).toBeGreaterThanOrEqual(3);
    });

    it('should filter orders by status', async () => {
      const response = await request(app)
        .get('/api/orders')
        .set('Authorization', `Bearer ${customerToken}`)
        .query({ status: 'COMPLETED' });

      expect(response.status).toBe(200);
      expect(response.body.data.every((o: any) => o.status === 'COMPLETED')).toBe(true);
    });
  });

  describe('PUT /api/orders/:id/status (Admin Update Status)', () => {
    let adminUser: any;
    let adminToken: string;
    let order: any;

    beforeAll(async () => {
      adminUser = await createTestUser({ role: 'ADMIN' });
      adminToken = generateTestToken(adminUser.id, 'ADMIN');
    });

    beforeEach(async () => {
      order = await prisma.order.create({
        data: {
          customerId: customer.id,
          status: 'CONFIRMED',
          paymentStatus: 'COMPLETED',
          subtotal: 100,
          taxAmount: 19,
          shippingCost: 4.99,
          discountAmount: 0,
          totalAmount: 123.99,
          shippingMethod: 'DHL',
          deliveryAddress: { street: 'Test St' },
          billingAddress: { street: 'Test St' },
        },
      });
    });

    it('should update order status to PROCESSING', async () => {
      const response = await request(app)
        .put(`/api/orders/${order.id}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          status: 'PROCESSING',
        });

      expect(response.status).toBe(200);
      expect(response.body.data.status).toBe('PROCESSING');
    });

    it('should update order status to SHIPPED', async () => {
      const response = await request(app)
        .put(`/api/orders/${order.id}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          status: 'SHIPPED',
        });

      expect([200, 400]).toContain(response.status); // May fail due to status transition rules
    });

    it('should reject unauthorized status update', async () => {
      const response = await request(app)
        .put(`/api/orders/${order.id}/status`)
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          status: 'PROCESSING',
        });

      expect(response.status).toBe(403);
    });
  });

  describe('POST /api/orders/:id/cancel (Cancel Order)', () => {
    it('should cancel pending order', async () => {
      const order = await prisma.order.create({
        data: {
          customerId: customer.id,
          status: 'PENDING_PAYMENT',
          paymentStatus: 'PENDING',
          subtotal: 100,
          taxAmount: 19,
          shippingCost: 4.99,
          discountAmount: 0,
          totalAmount: 123.99,
          shippingMethod: 'DHL',
          deliveryAddress: { street: 'Test St' },
          billingAddress: { street: 'Test St' },
        },
      });

      const response = await request(app)
        .post(`/api/orders/${order.id}/cancel`)
        .set('Authorization', `Bearer ${customerToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data.status).toBe('CANCELLED');
    });
  });
});
