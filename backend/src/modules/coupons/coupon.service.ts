import { CouponType } from '@prisma/client';
import { prisma } from '../../database/prisma';
import { ConflictError, NotFoundError } from '../../utils/errors';

export class CouponService {
  /**
   * Create a new coupon
   */
  static async createCoupon(data: any) {
    // Validate percentage values
    if (data.type === 'PERCENTAGE' && (data.value < 0 || data.value > 100)) {
      throw new ConflictError('Percentage value must be between 0 and 100');
    }

    // Check if coupon code already exists
    const existingCoupon = await prisma.coupon.findUnique({
      where: { code: data.code },
    });

    if (existingCoupon) {
      throw new ConflictError('Coupon code already exists');
    }

    const coupon = await prisma.coupon.create({
      data: {
        code: data.code,
        type: data.type,
        value: data.value,
        minOrderValue: data.minOrderValue || null,
        maxUses: data.maxUses || null,
        expiresAt: data.expiresAt || null,
        isActive: data.isActive ?? true,
      },
    });

    return {
      ...coupon,
      value: Number(coupon.value),
    };
  }

  /**
   * Get all coupons with pagination and filtering
   */
  static async getAllCoupons(filters: any) {
    const { page = 1, limit = 10, isActive, type, search } = filters;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (isActive !== undefined) {
      where.isActive = isActive;
    }
    if (type) {
      where.type = type;
    }
    if (search) {
      where.code = { contains: search, mode: 'insensitive' };
    }

    const [coupons, total] = await Promise.all([
      prisma.coupon.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.coupon.count({ where }),
    ]);

    // Add usage stats
    const couponWithStats = coupons.map((coupon) => ({
      ...coupon,
      remainingUses: coupon.maxUses ? coupon.maxUses - coupon.currentUses : null,
    }));

    return {
      data: couponWithStats,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get coupon by code (admin view)
   */
  static async getCouponByCode(code: string) {
    const coupon = await prisma.coupon.findUnique({
      where: { code: code.toUpperCase() },
    });

    if (!coupon) {
      throw new NotFoundError('Coupon not found');
    }

    return {
      ...coupon,
      remainingUses: coupon.maxUses ? coupon.maxUses - coupon.currentUses : null,
    };
  }

  /**
   * Update coupon (can only update: isActive, expiresAt, maxUses)
   */
  static async updateCoupon(couponId: string, data: any) {
    const coupon = await prisma.coupon.findUnique({
      where: { id: couponId },
    });

    if (!coupon) {
      throw new NotFoundError('Coupon not found');
    }

    const updateData: any = {};
    if (data.isActive !== undefined) {
      updateData.isActive = data.isActive;
    }
    if (data.expiresAt !== undefined) {
      updateData.expiresAt = data.expiresAt;
    }
    if (data.maxUses !== undefined) {
      // Cannot decrease maxUses below currentUses
      if (data.maxUses < coupon.currentUses) {
        throw new ConflictError('Cannot set max uses below current usage count');
      }
      updateData.maxUses = data.maxUses;
    }

    const updated = await prisma.coupon.update({
      where: { id: couponId },
      data: updateData,
    });

    return {
      ...updated,
      remainingUses: updated.maxUses ? updated.maxUses - updated.currentUses : null,
    };
  }

  /**
   * Soft delete coupon by setting isActive to false
   */
  static async deleteCoupon(couponId: string) {
    const coupon = await prisma.coupon.findUnique({
      where: { id: couponId },
    });

    if (!coupon) {
      throw new NotFoundError('Coupon not found');
    }

    const updated = await prisma.coupon.update({
      where: { id: couponId },
      data: { isActive: false },
    });

    return { message: 'Coupon deactivated successfully', coupon: updated };
  }

  /**
   * Validate coupon for customer checkout
   */
  static async validateCoupon(code: string, orderTotal: number) {
    const coupon = await prisma.coupon.findUnique({
      where: { code: code.toUpperCase() },
    });

    if (!coupon) {
      return {
        valid: false,
        discountAmount: 0,
        message: 'Coupon code is invalid',
        coupon: null,
      };
    }

    // Check if coupon is active
    if (!coupon.isActive) {
      return {
        valid: false,
        discountAmount: 0,
        message: 'Coupon code is no longer active',
        coupon: null,
      };
    }

    // Check if coupon is expired
    if (coupon.expiresAt && new Date() > coupon.expiresAt) {
      return {
        valid: false,
        discountAmount: 0,
        message: 'Coupon code has expired',
        coupon: null,
      };
    }

    // Check usage limit
    if (coupon.maxUses && coupon.currentUses >= coupon.maxUses) {
      return {
        valid: false,
        discountAmount: 0,
        message: 'Coupon code usage limit has been reached',
        coupon: null,
      };
    }

    // Check minimum order value
    if (coupon.minOrderValue && orderTotal < Number(coupon.minOrderValue)) {
      return {
        valid: false,
        discountAmount: 0,
        message: `Minimum order value of ${coupon.minOrderValue} required for this coupon`,
        coupon: null,
      };
    }

    // Calculate discount amount
    const discountAmount = this.calculateDiscount(coupon.type, Number(coupon.value), orderTotal);

    return {
      valid: true,
      discountAmount,
      message: 'Coupon code is valid',
      coupon: {
        id: coupon.id,
        code: coupon.code,
        type: coupon.type,
        value: coupon.value,
      },
    };
  }

  /**
   * Calculate discount amount based on coupon type
   */
  static calculateDiscount(type: CouponType, value: number, orderTotal: number): number {
    switch (type) {
      case CouponType.PERCENTAGE:
        // value is percentage (0-100)
        const percentageDiscount = orderTotal * (value / 100);
        return Math.round(percentageDiscount * 100) / 100;

      case CouponType.FIXED_AMOUNT:
        // value is fixed amount, don't exceed order total
        const fixedDiscount = Math.min(Number(value), orderTotal);
        return Math.round(fixedDiscount * 100) / 100;

      case CouponType.FREE_SHIPPING:
        // For free shipping, discount should be the calculated shipping cost
        // Shipping is calculated as: subtotal >= 50 ? 0 : 4.99
        // We need to pass shipping cost separately or assume standard shipping
        // For now, return a fixed shipping cost discount (would be calculated in order service)
        return 4.99;

      default:
        return 0;
    }
  }

  /**
   * Increment coupon usage (called after order creation)
   */
  static async incrementCouponUsage(code: string) {
    const updated = await prisma.coupon.update({
      where: { code: code.toUpperCase() },
      data: {
        currentUses: {
          increment: 1,
        },
      },
    });

    return updated;
  }

  /**
   * Get coupon usage stats
   */
  static async getCouponStats() {
    const total = await prisma.coupon.count();
    const active = await prisma.coupon.count({ where: { isActive: true } });
    const totalUsage = await prisma.coupon.aggregate({
      _sum: { currentUses: true },
    });

    return {
      total,
      active,
      totalUsage: totalUsage._sum.currentUses || 0,
    };
  }
}
