import { Router } from 'express';
import { authenticateToken, requireRole } from '../../middleware/auth.middleware';
import { validateBody, validateParams } from '../../middleware/validation.middleware';
import * as userController from './user.controller';
import * as addressController from './address.controller';
import {
  updateProfileSchema,
  changePasswordSchema,
  createAddressSchema,
  updateAddressSchema,
} from './user.validation';
import { z } from 'zod';

const router = Router();

// User profile routes
router.get('/profile', authenticateToken, userController.getProfile);

router.put('/profile', authenticateToken, validateBody(updateProfileSchema), userController.updateProfile);

router.post(
  '/change-password',
  authenticateToken,
  validateBody(changePasswordSchema),
  userController.changePassword
);

router.delete('/account', authenticateToken, requireRole('CUSTOMER'), userController.deleteAccount);

router.get('/personal-data', authenticateToken, userController.downloadPersonalData);

// Address routes
router.get('/addresses', authenticateToken, addressController.getAddresses);

router.post(
  '/addresses',
  authenticateToken,
  validateBody(createAddressSchema),
  addressController.createAddress
);

router.put(
  '/addresses/:id',
  authenticateToken,
  validateParams(z.object({ id: z.string().uuid() })),
  validateBody(updateAddressSchema),
  addressController.updateAddress
);

router.delete(
  '/addresses/:id',
  authenticateToken,
  validateParams(z.object({ id: z.string().uuid() })),
  addressController.deleteAddress
);

router.post(
  '/addresses/:id/default',
  authenticateToken,
  validateParams(z.object({ id: z.string().uuid() })),
  addressController.setDefaultAddress
);

export default router;
