import request from 'supertest';
import app from '../../src/app';
import { prisma } from '../../src/database/prisma';
import { createTestUser, createTestCoupon } from '../factories';
import { generateTestToken } from '../setup';
import { CouponType } from '@prisma/client';

describe('Coupons Integration Tests', () => {
  let adminUser: any;
  let adminToken: string;
  let customerUser: any;
  let customerToken: string;

  beforeAll(async () => {
    // Create admin user
    adminUser = await createTestUser({ role: 'ADMIN' });
    adminToken = generateTestToken(adminUser.id, 'ADMIN');

    // Create customer user
    customerUser = await createTestUser({ role: 'CUSTOMER' });
    customerToken = generateTestToken(customerUser.id, 'CUSTOMER');
  });

  beforeEach(async () => {
    await prisma.coupon.deleteMany();
  });

  describe('POST /api/coupons (Admin)', () => {
    it('should create a coupon with valid data', async () => {
      const response = await request(app)
        .post('/api/coupons')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          code: 'NEWCOUPON',
          type: CouponType.PERCENTAGE,
          value: 15,
          maxUses: 100,
          minOrderValue: 30,
          isActive: true,
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.code).toBe('NEWCOUPON');
    });

    it('should reject invalid percentage > 100', async () => {
      const response = await request(app)
        .post('/api/coupons')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          code: 'INVALID',
          type: CouponType.PERCENTAGE,
          value: 150, // Invalid
        });

      expect(response.status).toBe(400);
    });

    it('should reject duplicate coupon code', async () => {
      const couponData = {
        code: 'DUPLICATE',
        type: CouponType.FIXED_AMOUNT,
        value: 10,
      };

      // First creation
      await request(app)
        .post('/api/coupons')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(couponData);

      // Duplicate creation
      const response = await request(app)
        .post('/api/coupons')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(couponData);

      expect(response.status).toBe(409);
    });

    it('should reject request without admin role', async () => {
      const response = await request(app)
        .post('/api/coupons')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          code: 'UNAUTHORIZED',
          type: CouponType.PERCENTAGE,
          value: 10,
        });

      expect(response.status).toBe(403);
    });
  });

  describe('GET /api/coupons (Admin)', () => {
    beforeEach(async () => {
      await createTestCoupon({ code: 'ACTIVE1', isActive: true });
      await createTestCoupon({ code: 'ACTIVE2', isActive: true });
      await createTestCoupon({ code: 'INACTIVE', isActive: false });
    });

    it('should list all coupons with pagination', async () => {
      const response = await request(app)
        .get('/api/coupons')
        .set('Authorization', `Bearer ${adminToken}`)
        .query({ page: 1, limit: 10 });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
      expect(response.body.pagination.total).toBeGreaterThanOrEqual(3);
    });

    it('should filter by active status', async () => {
      const response = await request(app)
        .get('/api/coupons')
        .set('Authorization', `Bearer ${adminToken}`)
        .query({ isActive: 'true' });

      expect(response.status).toBe(200);
      expect(response.body.data.every((c: any) => c.isActive === true)).toBe(true);
    });

    it('should filter by type', async () => {
      await createTestCoupon({ code: 'FIXED', type: CouponType.FIXED_AMOUNT });

      const response = await request(app)
        .get('/api/coupons')
        .set('Authorization', `Bearer ${adminToken}`)
        .query({ type: CouponType.FIXED_AMOUNT });

      expect(response.status).toBe(200);
      expect(response.body.data.some((c: any) => c.type === CouponType.FIXED_AMOUNT)).toBe(true);
    });
  });

  describe('GET /api/coupons/code/:code (Admin)', () => {
    it('should return coupon details', async () => {
      const coupon = await createTestCoupon({ code: 'LOOKUP' });

      const response = await request(app)
        .get(`/api/coupons/code/${coupon.code}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data.code).toBe('LOOKUP');
      expect(response.body.data.remainingUses).toBeDefined();
    });

    it('should return 404 for non-existent coupon', async () => {
      const response = await request(app)
        .get('/api/coupons/code/NONEXISTENT')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(404);
    });
  });

  describe('PUT /api/coupons/:id (Admin)', () => {
    it('should update coupon status', async () => {
      const coupon = await createTestCoupon({ code: 'UPDATE' });

      const response = await request(app)
        .put(`/api/coupons/${coupon.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ isActive: false });

      expect(response.status).toBe(200);
      expect(response.body.data.isActive).toBe(false);
    });

    it('should increase max uses', async () => {
      const coupon = await createTestCoupon({ code: 'MAXUSES', maxUses: 50 });

      const response = await request(app)
        .put(`/api/coupons/${coupon.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ maxUses: 200 });

      expect(response.status).toBe(200);
      expect(response.body.data.maxUses).toBe(200);
    });
  });

  describe('DELETE /api/coupons/:id (Admin)', () => {
    it('should deactivate coupon', async () => {
      const coupon = await createTestCoupon({ code: 'DELETE' });

      const response = await request(app)
        .delete(`/api/coupons/${coupon.id}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);

      const deleted = await prisma.coupon.findUnique({ where: { id: coupon.id } });
      expect(deleted?.isActive).toBe(false);
    });
  });

  describe('POST /api/coupons/validate (Customer)', () => {
    beforeEach(async () => {
      await createTestCoupon({
        code: 'VALIDATE',
        type: CouponType.PERCENTAGE,
        value: 10,
        isActive: true,
      });
    });

    it('should validate a valid coupon', async () => {
      const response = await request(app)
        .post('/api/coupons/validate')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          code: 'VALIDATE',
          orderTotal: 100,
        });

      expect(response.status).toBe(200);
      expect(response.body.data.valid).toBe(true);
      expect(response.body.data.discountAmount).toBe(10);
    });

    it('should reject invalid coupon', async () => {
      const response = await request(app)
        .post('/api/coupons/validate')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          code: 'INVALID',
          orderTotal: 100,
        });

      expect(response.status).toBe(200);
      expect(response.body.data.valid).toBe(false);
    });

    it('should calculate different discount types', async () => {
      await createTestCoupon({
        code: 'FIXED',
        type: CouponType.FIXED_AMOUNT,
        value: 20,
      });

      const response = await request(app)
        .post('/api/coupons/validate')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          code: 'FIXED',
          orderTotal: 100,
        });

      expect(response.status).toBe(200);
      expect(response.body.data.valid).toBe(true);
      expect(response.body.data.discountAmount).toBe(20);
    });
  });
});
