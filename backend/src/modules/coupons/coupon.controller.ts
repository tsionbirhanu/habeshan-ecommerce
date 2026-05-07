import { Request, Response, NextFunction } from 'express';
import { CouponService } from './coupon.service';

/**
 * Create a new coupon (Admin only)
 */
export const createCoupon = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const coupon = await CouponService.createCoupon(req.body);

    res.status(201).json({
      success: true,
      message: 'Coupon created successfully',
      data: coupon,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all coupons with pagination and filtering (Admin only)
 */
export const getAllCoupons = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await CouponService.getAllCoupons(req.query);

    res.json({
      success: true,
      data: result.data,
      pagination: result.pagination,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get coupon by code (Admin only)
 */
export const getCouponByCode = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { code } = req.params;
    const coupon = await CouponService.getCouponByCode(code);

    res.json({
      success: true,
      data: coupon,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update coupon (Admin only)
 * Can update: isActive, expiresAt, maxUses
 */
export const updateCoupon = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const coupon = await CouponService.updateCoupon(id, req.body);

    res.json({
      success: true,
      message: 'Coupon updated successfully',
      data: coupon,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete coupon (Admin only)
 * Soft delete by setting isActive to false
 */
export const deleteCoupon = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const result = await CouponService.deleteCoupon(id);

    res.json({
      success: true,
      message: result.message,
      data: result.coupon,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Validate coupon for customer checkout
 * Protected endpoint but accessible to customers during checkout
 */
export const validateCoupon = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { code, orderTotal } = req.body;
    const validation = await CouponService.validateCoupon(code, orderTotal);

    res.json({
      success: validation.valid,
      data: validation,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get coupon statistics (Admin only)
 */
export const getCouponStats = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const stats = await CouponService.getCouponStats();

    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    next(error);
  }
};
