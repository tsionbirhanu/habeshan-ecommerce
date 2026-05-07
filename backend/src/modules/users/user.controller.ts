import { Request, Response, NextFunction } from 'express';
import { AuthPayload } from '../../types/auth.types';
import * as userService from './user.service';

interface AuthRequest extends Request {
  user?: AuthPayload | null;
}

export const getProfile = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) throw new Error('User not authenticated');

    const profile = await userService.getUserProfile(req.user.userId);

    res.json({
      success: true,
      data: { user: profile },
    });
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) throw new Error('User not authenticated');

    const updated = await userService.updateUserProfile(req.user.userId, req.body);

    res.json({
      success: true,
      data: { user: updated },
      message: 'Profile updated successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const changePassword = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) throw new Error('User not authenticated');

    const { currentPassword, newPassword } = req.body;
    await userService.changeUserPassword(req.user.userId, currentPassword, newPassword);

    res.json({
      success: true,
      message: 'Password changed successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const deleteAccount = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) throw new Error('User not authenticated');

    await userService.deleteUserAccount(req.user.userId);

    res.json({
      success: true,
      message: 'Account deleted. Your order history is retained.',
    });
  } catch (error) {
    next(error);
  }
};

export const downloadPersonalData = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) throw new Error('User not authenticated');

    const data = await userService.downloadPersonalData(req.user.userId);

    res.setHeader('Content-Disposition', `attachment; filename="personal-data-${Date.now()}.json"`);
    res.setHeader('Content-Type', 'application/json');

    res.json({
      success: true,
      data,
      exportedAt: new Date().toISOString(),
    });
  } catch (error) {
    next(error);
  }
};
