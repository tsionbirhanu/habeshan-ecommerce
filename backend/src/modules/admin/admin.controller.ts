import { Request, Response, NextFunction } from 'express';
import { AuthPayload } from '../../types/auth.types';
import * as adminService from './admin.service';
import { UsersFilterDTO, VendorsFilterDTO, ActivityLogDTO } from './admin.validation';

interface AdminRequest extends Request {
  user?: AuthPayload | null;
}

// ============ USER MANAGEMENT ============

export const getAllUsers = async (req: AdminRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) throw new Error('User not authenticated');

    const query = req.query as unknown as UsersFilterDTO;
    const page = query.page || 1;
    const limit = query.limit || 20;

    const result = await adminService.getAllUsers(page, limit, {
      role: query.role,
      search: query.search,
      isActive: query.isActive,
    });

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const getUserDetails = async (req: AdminRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) throw new Error('User not authenticated');

    const { userId } = req.params;
    const user = await adminService.getUserDetails(userId);

    res.json({
      success: true,
      data: { user },
    });
  } catch (error) {
    next(error);
  }
};

export const updateUserRole = async (req: AdminRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) throw new Error('User not authenticated');

    const { userId } = req.params;
    const { role } = req.body;

    const user = await adminService.updateUserRole(userId, req.user.userId, role, req.ip);

    res.json({
      success: true,
      data: { user },
      message: 'User role updated',
    });
  } catch (error) {
    next(error);
  }
};

export const toggleUserStatus = async (req: AdminRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) throw new Error('User not authenticated');

    const { userId } = req.params;
    const { isActive, reason } = req.body;

    const user = await adminService.toggleUserStatus(
      userId,
      req.user.userId,
      isActive,
      reason,
      req.ip
    );

    res.json({
      success: true,
      data: { user },
      message: `User account ${isActive ? 'enabled' : 'disabled'}`,
    });
  } catch (error) {
    next(error);
  }
};

export const resetUserPassword = async (req: AdminRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) throw new Error('User not authenticated');

    const { userId } = req.params;
    const result = await adminService.resetUserPassword(userId, req.user.userId, req.ip);

    res.json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    next(error);
  }
};

export const getUserActivityLog = async (req: AdminRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) throw new Error('User not authenticated');

    const { userId } = req.params;
    const query = req.query as unknown as ActivityLogDTO;

    const result = await adminService.getUserActivityLog(userId, query.limit, query.offset);

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

// ============ VENDOR MANAGEMENT ============

export const getAllVendors = async (req: AdminRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) throw new Error('User not authenticated');

    const query = req.query as unknown as VendorsFilterDTO;
    const page = query.page || 1;
    const limit = query.limit || 20;

    const result = await adminService.getAllVendors(page, limit, {
      isApproved: query.isApproved,
    });

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const createVendor = async (req: AdminRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) throw new Error('User not authenticated');

    const result = await adminService.createVendor(req.body, req.user.userId, req.ip);

    res.status(201).json({
      success: true,
      data: result,
      message: 'Vendor account created. Verification email sent to vendor.',
    });
  } catch (error) {
    next(error);
  }
};
