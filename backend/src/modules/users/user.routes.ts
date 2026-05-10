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

// ============ USER PROFILE ROUTES ============

/**
 * @swagger
 * /api/users/profile:
 *   get:
 *     summary: Get user profile
 *     tags: [Users]
 *     description: Retrieve the authenticated user's profile information
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: User profile retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *       401:
 *         description: Unauthorized
 *   put:
 *     summary: Update user profile
 *     tags: [Users]
 *     description: Update the authenticated user's profile (partial update allowed)
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               phone:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 */
router.get('/profile', authenticateToken, userController.getProfile);

router.put(
  '/profile',
  authenticateToken,
  validateBody(updateProfileSchema),
  userController.updateProfile
);

/**
 * @swagger
 * /api/users/change-password:
 *   post:
 *     summary: Change password
 *     tags: [Users]
 *     description: Change the authenticated user's password
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               oldPassword:
 *                 type: string
 *               newPassword:
 *                 type: string
 *                 minLength: 8
 *               confirmPassword:
 *                 type: string
 *             required:
 *               - oldPassword
 *               - newPassword
 *               - confirmPassword
 *     responses:
 *       200:
 *         description: Password changed successfully
 *       400:
 *         description: Invalid old password or validation error
 *       401:
 *         description: Unauthorized
 */
router.post(
  '/change-password',
  authenticateToken,
  validateBody(changePasswordSchema),
  userController.changePassword
);

/**
 * @swagger
 * /api/users/account:
 *   delete:
 *     summary: Delete account
 *     tags: [Users]
 *     description: Delete the authenticated user's account (Customer only). Account will be soft-deleted.
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Account deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Customer role required
 */
router.delete('/account', authenticateToken, requireRole('CUSTOMER'), userController.deleteAccount);

/**
 * @swagger
 * /api/users/personal-data:
 *   get:
 *     summary: Download personal data
 *     tags: [Users]
 *     description: Download user's personal data in a portable format (GDPR compliance)
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Personal data exported successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/personal-data', authenticateToken, userController.downloadPersonalData);

// ============ ADDRESS ROUTES ============

/**
 * @swagger
 * /api/users/addresses:
 *   get:
 *     summary: Get user addresses
 *     tags: [Users - Addresses]
 *     description: Retrieve all addresses for the authenticated user
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Addresses retrieved successfully
 *       401:
 *         description: Unauthorized
 *   post:
 *     summary: Create address
 *     tags: [Users - Addresses]
 *     description: Create a new address for the authenticated user
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               street:
 *                 type: string
 *               city:
 *                 type: string
 *               state:
 *                 type: string
 *               zipCode:
 *                 type: string
 *               country:
 *                 type: string
 *               isDefault:
 *                 type: boolean
 *             required:
 *               - street
 *               - city
 *               - state
 *               - zipCode
 *               - country
 *     responses:
 *       201:
 *         description: Address created successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 */
router.get('/addresses', authenticateToken, addressController.getAddresses);

router.post(
  '/addresses',
  authenticateToken,
  validateBody(createAddressSchema),
  addressController.createAddress
);

/**
 * @swagger
 * /api/users/addresses/{id}:
 *   put:
 *     summary: Update address
 *     tags: [Users - Addresses]
 *     description: Update an address for the authenticated user
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               street:
 *                 type: string
 *               city:
 *                 type: string
 *               state:
 *                 type: string
 *               zipCode:
 *                 type: string
 *               country:
 *                 type: string
 *     responses:
 *       200:
 *         description: Address updated successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Address not found
 *   delete:
 *     summary: Delete address
 *     tags: [Users - Addresses]
 *     description: Delete an address for the authenticated user
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Address deleted successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Address not found
 */
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

/**
 * @swagger
 * /api/users/addresses/{id}/default:
 *   post:
 *     summary: Set default address
 *     tags: [Users - Addresses]
 *     description: Set an address as the default address for the authenticated user
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Default address set successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Address not found
 */
router.post(
  '/addresses/:id/default',
  authenticateToken,
  validateParams(z.object({ id: z.string().uuid() })),
  addressController.setDefaultAddress
);

export default router;
