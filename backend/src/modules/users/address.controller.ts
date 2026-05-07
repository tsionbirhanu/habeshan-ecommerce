import { Request, Response, NextFunction } from 'express';
import { AuthPayload } from '../../types/auth.types';
import * as userService from './user.service';

interface AuthRequest extends Request {
  user?: AuthPayload | null;
}

export const getAddresses = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) throw new Error('User not authenticated');

    const addresses = await userService.getUserAddresses(req.user.userId);

    res.json({
      success: true,
      data: { addresses },
    });
  } catch (error) {
    next(error);
  }
};

export const createAddress = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) throw new Error('User not authenticated');

    const address = await userService.createAddress(req.user.userId, req.body);

    res.status(201).json({
      success: true,
      data: { address },
      message: 'Address created successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const updateAddress = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) throw new Error('User not authenticated');

    const { id } = req.params;
    const address = await userService.updateAddress(id, req.user.userId, req.body);

    res.json({
      success: true,
      data: { address },
      message: 'Address updated successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const deleteAddress = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) throw new Error('User not authenticated');

    const { id } = req.params;
    await userService.deleteAddress(id, req.user.userId);

    res.json({
      success: true,
      message: 'Address deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const setDefaultAddress = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) throw new Error('User not authenticated');

    const { id } = req.params;
    const address = await userService.setDefaultAddress(id, req.user.userId);

    res.json({
      success: true,
      data: { address },
      message: 'Default address set successfully',
    });
  } catch (error) {
    next(error);
  }
};
