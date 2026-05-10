import { Request, Response, NextFunction } from 'express';
import * as settingsService from './settings.service';
import { UpdateSettingsInput } from './settings.validation';
import logger from '../../utils/logger';

/**
 * GET /api/admin/settings
 * Retrieve all system settings (admin only)
 */
export const getSettings = async (
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const settings = await settingsService.getSettings();

    res.json({
      success: true,
      data: settings,
      message: 'Settings retrieved successfully',
    });
  } catch (error) {
    logger.error('Error fetching settings:', error);
    next(error);
  }
};

/**
 * PUT /api/admin/settings
 * Update system settings (partial update by category)
 */
export const updateSettings = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const updates: UpdateSettingsInput = req.body;

    const updatedSettings = await settingsService.updateSettings(updates);

    // Audit log the update
    logger.info(`Admin updated settings`, {
      userId: (req as any).user?.id,
      categories: Object.keys(updates || {}),
    });

    res.json({
      success: true,
      data: updatedSettings,
      message: 'Settings updated successfully',
    });
  } catch (error) {
    logger.error('Error updating settings:', error);
    next(error);
  }
};

/**
 * GET /api/store/info (public)
 * Get public store information
 */
export const getPublicStoreInfo = async (
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const info = await settingsService.getPublicStoreInfo();

    res.json({
      success: true,
      data: info,
      message: 'Store information retrieved',
    });
  } catch (error) {
    logger.error('Error fetching public store info:', error);
    next(error);
  }
};
