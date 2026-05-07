import { CouponService } from '../../src/modules/coupons/coupon.service';
import { prisma } from '../../src/database/prisma';
import { createTestCoupon } from '../factories';
import { CouponType } from '@prisma/client';

describe('CouponService', () => {
  beforeEach(async () => {
    // Clear coupons before each test
    await prisma.coupon.deleteMany();
  });

  describe('createCoupon', () => {
    it('should create a coupon successfully', async () => {
      const couponData = {
        code: 'WELCOME10',
        type: CouponType.PERCENTAGE,
        value: 10,
        maxUses: 100,
        isActive: true,
      };

      const coupon = await CouponService.createCoupon(couponData);

      expect(coupon).toMatchObject({
        code: 'WELCOME10',
        type: CouponType.PERCENTAGE,
        value: 10,
      });
      expect(coupon.currentUses).toBe(0);
    });

    it('should throw error for duplicate coupon code', async () => {
      const couponData = {
        code: 'DUPLICATE',
        type: CouponType.PERCENTAGE,
        value: 15,
      };

      await CouponService.createCoupon(couponData);

      await expect(CouponService.createCoupon(couponData)).rejects.toThrow('already exists');
    });

    it('should reject percentage value > 100', async () => {
      const couponData = {
        code: 'INVALID',
        type: CouponType.PERCENTAGE,
        value: 150, // Invalid: > 100%
      };

      // This should be caught by validation, not service
      // But service should handle gracefully
      await expect(CouponService.createCoupon(couponData)).rejects.toBeDefined();
    });
  });

  describe('validateCoupon', () => {
    it('should validate a valid coupon', async () => {
      await createTestCoupon({
        code: 'VALID',
        type: CouponType.PERCENTAGE,
        value: 10,
        isActive: true,
      });

      const result = await CouponService.validateCoupon('VALID', 100);

      expect(result.valid).toBe(true);
      expect(result.discountAmount).toBe(10); // 10% of 100
    });

    it('should reject inactive coupon', async () => {
      await createTestCoupon({
        code: 'INACTIVE',
        isActive: false,
      });

      const result = await CouponService.validateCoupon('INACTIVE', 100);

      expect(result.valid).toBe(false);
      expect(result.message).toContain('no longer active');
    });

    it('should reject expired coupon', async () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      await prisma.coupon.create({
        data: {
          code: 'EXPIRED',
          type: CouponType.PERCENTAGE,
          value: 10,
          isActive: true,
          expiresAt: yesterday,
        },
      });

      const result = await CouponService.validateCoupon('EXPIRED', 100);

      expect(result.valid).toBe(false);
      expect(result.message).toContain('expired');
    });

    it('should reject coupon with exceeded usage limit', async () => {
      await createTestCoupon({
        code: 'LIMITED',
        maxUses: 1,
      });

      // Simulate usage
      await prisma.coupon.update({
        where: { code: 'LIMITED' },
        data: { currentUses: 1 },
      });

      const result = await CouponService.validateCoupon('LIMITED', 100);

      expect(result.valid).toBe(false);
      expect(result.message).toContain('usage limit');
    });

    it('should reject coupon below minimum order value', async () => {
      await createTestCoupon({
        code: 'MINORDER',
        type: CouponType.PERCENTAGE,
        value: 20,
      });

      const result = await CouponService.validateCoupon('MINORDER', 10); // Below 25 minimum

      expect(result.valid).toBe(false);
      expect(result.message).toContain('Minimum order value');
    });

    it('should return invalid for non-existent coupon', async () => {
      const result = await CouponService.validateCoupon('NONEXISTENT', 100);

      expect(result.valid).toBe(false);
      expect(result.message).toContain('invalid');
    });
  });

  describe('calculateDiscount', () => {
    it('should calculate percentage discount correctly', () => {
      const discount = CouponService.calculateDiscount(CouponType.PERCENTAGE, 10, 100);
      expect(discount).toBe(10); // 10% of 100
    });

    it('should calculate fixed amount discount correctly', () => {
      const discount = CouponService.calculateDiscount(CouponType.FIXED_AMOUNT, 15, 100);
      expect(discount).toBe(15);
    });

    it('should cap fixed amount discount at order total', () => {
      const discount = CouponService.calculateDiscount(CouponType.FIXED_AMOUNT, 50, 30);
      expect(discount).toBe(30); // Capped at order total
    });

    it('should return shipping cost for free shipping coupon', () => {
      const discount = CouponService.calculateDiscount(CouponType.FREE_SHIPPING, 0, 100);
      expect(discount).toBe(4.99); // Standard shipping cost
    });
  });

  describe('updateCoupon', () => {
    it('should update coupon status', async () => {
      const coupon = await createTestCoupon({ code: 'UPDATE' });

      const updated = await CouponService.updateCoupon(coupon.id, { isActive: false });

      expect(updated.isActive).toBe(false);
    });

    it('should increase max uses', async () => {
      const coupon = await createTestCoupon({ code: 'INCREASE', maxUses: 50 });

      const updated = await CouponService.updateCoupon(coupon.id, { maxUses: 100 });

      expect(updated.maxUses).toBe(100);
    });

    it('should reject decreasing max uses below current usage', async () => {
      const coupon = await createTestCoupon({ code: 'DECREASE', maxUses: 100 });

      // Simulate usage
      await prisma.coupon.update({
        where: { id: coupon.id },
        data: { currentUses: 50 },
      });

      await expect(CouponService.updateCoupon(coupon.id, { maxUses: 30 })).rejects.toThrow(
        'current usage'
      );
    });
  });

  describe('deleteCoupon', () => {
    it('should soft delete coupon', async () => {
      const coupon = await createTestCoupon({ code: 'DELETE' });

      await CouponService.deleteCoupon(coupon.id);

      const deleted = await prisma.coupon.findUnique({ where: { id: coupon.id } });
      expect(deleted?.isActive).toBe(false);
    });
  });

  describe('incrementCouponUsage', () => {
    it('should increment coupon usage', async () => {
      await createTestCoupon({ code: 'INCREMENT' });

      await CouponService.incrementCouponUsage('INCREMENT');

      const updated = await prisma.coupon.findUnique({ where: { code: 'INCREMENT' } });
      expect(updated?.currentUses).toBe(1);
    });
  });
});
