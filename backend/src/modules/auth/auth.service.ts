import prisma from '../../database/prisma';

import { hashPassword, comparePassword } from '../../utils/hash.utils';
import {
  generateAccessToken,
  generateRefreshToken,
  generateResetToken,
  generateEmailVerificationToken,
  verifyRefreshToken,
  verifyResetToken,
  verifyEmailVerificationToken,
} from '../../utils/jwt.utils';

import {
  UserAlreadyExistsError,
  InvalidCredentialsError,
  UserNotFoundError,
  ForbiddenError,
} from '../../utils/errors';

import logger from '../../utils/logger';
import {
  sendEmailAsync,
  generateWelcomeEmail,
  generatePasswordResetEmail,
  generateEmailVerificationEmail,
} from '../../utils/email.service';

export const createVendor = async (data: {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
}) => {
  const existingUser = await prisma.user.findUnique({ where: { email: data.email } });
  if (existingUser) {
    throw new UserAlreadyExistsError('Email already registered');
  }

  const hashedPassword = await hashPassword(data.password);
  const verificationToken = generateEmailVerificationToken(data.email);
  const tokenExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

  const user = await prisma.user.create({
    data: {
      email: data.email,
      password: hashedPassword,
      firstName: data.firstName,
      lastName: data.lastName,
      phone: data.phone,
      role: 'VENDOR',
      isActive: false, // Inactive until email verified and admin approved
      isEmailVerified: false,
      emailVerificationToken: verificationToken,
      emailTokenExpiresAt: tokenExpiresAt,
    },
  });

  await prisma.vendor.create({
    data: {
      userId: user.id,
      isApproved: false,
    },
  });

  logger.info(`Vendor registration submitted (pending verification): ${user.email}`);

  // Send verification email
  const verificationUrl = `${process.env.APP_URL || 'http://localhost:3001/api'}/auth/verify-email?token=${verificationToken}`;
  const verificationEmail = generateEmailVerificationEmail(
    user.firstName,
    user.email,
    verificationUrl
  );
  sendEmailAsync(verificationEmail).catch((err) => {
    logger.error(`Failed to send verification email to ${user.email}:`, err);
  });

  return user;
};

export const createCustomer = async (data: {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
}) => {
  const existingUser = await prisma.user.findUnique({ where: { email: data.email } });
  if (existingUser) {
    throw new UserAlreadyExistsError('Email already registered');
  }

  const hashedPassword = await hashPassword(data.password);
  const verificationToken = generateEmailVerificationToken(data.email);
  const tokenExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

  // NOTE: Customers register directly - no admin approval needed
  const user = await prisma.user.create({
    data: {
      email: data.email,
      password: hashedPassword,
      firstName: data.firstName,
      lastName: data.lastName,
      phone: data.phone,
      role: 'CUSTOMER',
      isActive: false, // Inactive until email is verified
      isEmailVerified: false,
      emailVerificationToken: verificationToken,
      emailTokenExpiresAt: tokenExpiresAt,
    },
  });

  await prisma.wishlist.create({
    data: {
      customerId: user.id,
    },
  });

  logger.info(`Customer registered (pending email verification): ${user.email}`);

  // Send verification email
  const verificationUrl = `${process.env.APP_URL || 'http://localhost:3001/api'}/auth/verify-email?token=${verificationToken}`;
  const verificationEmail = generateEmailVerificationEmail(
    user.firstName,
    user.email,
    verificationUrl
  );
  sendEmailAsync(verificationEmail).catch((err) => {
    logger.error(`Failed to send verification email to ${user.email}:`, err);
  });

  return user;
};

export const authenticateUser = async (email: string, password: string) => {
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    throw new InvalidCredentialsError();
  }

  if (!user.isEmailVerified) {
    throw new ForbiddenError('Please verify your email address first');
  }

  if (!user.isActive) {
    throw new ForbiddenError('Account pending approval or disabled');
  }

  const isValidPassword = await comparePassword(password, user.password);

  if (!isValidPassword) {
    throw new InvalidCredentialsError();
  }

  const accessToken = generateAccessToken(user.id, user.email, user.role);
  const refreshToken = generateRefreshToken(user.id);

  logger.info(`User logged in: ${user.email}`);

  return {
    user: {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
    },
    tokens: {
      accessToken,
      refreshToken,
      expiresIn: '1d',
    },
  };
};

export const refreshAccessToken = async (token: string) => {
  const { userId } = verifyRefreshToken(token);

  const user = await prisma.user.findUnique({ where: { id: userId } });

  if (!user || !user.isActive) {
    throw new InvalidCredentialsError('Invalid refresh token');
  }

  const accessToken = generateAccessToken(user.id, user.email, user.role);

  return { accessToken, expiresIn: '1d' };
};

export const requestPasswordReset = async (email: string) => {
  const user = await prisma.user.findUnique({ where: { email } });

  if (user) {
    // Generate reset token
    const resetToken = generateResetToken(user.id, user.email);

    // Build reset URL (frontend should handle this route)
    const resetUrl = `${process.env.APP_URL || 'http://localhost:3001/api'}/auth/reset-password?token=${resetToken}`;

    logger.info(`Password reset requested: ${user.email}`);

    // Send password reset email asynchronously
    const resetEmail = generatePasswordResetEmail(user.firstName, user.email, resetUrl);
    sendEmailAsync(resetEmail).catch((err) => {
      logger.error(`Failed to send password reset email to ${user.email}:`, err);
    });
  }

  // Always return success to prevent email enumeration
  return true;
};

export const resetUserPassword = async (token: string, newPassword: string) => {
  const { userId, email } = verifyResetToken(token);

  const user = await prisma.user.findUnique({ where: { id: userId, email } });

  if (!user) {
    throw new UserNotFoundError();
  }

  const hashedPassword = await hashPassword(newPassword);

  await prisma.user.update({
    where: { id: userId },
    data: { password: hashedPassword },
  });

  logger.info(`Password reset completed: ${user.email}`);

  return true;
};

// ============ VENDOR PASSWORD SETUP ============
export const setVendorPassword = async (token: string, password: string) => {
  const { email } = verifyEmailVerificationToken(token);

  const user = await prisma.user.findUnique({
    where: {
      email,
      emailVerificationToken: token,
      emailTokenExpiresAt: { gte: new Date() },
    },
  });

  if (!user) {
    throw new InvalidCredentialsError('Invalid or expired invitation token');
  }

  if (user.role !== 'VENDOR') {
    throw new ForbiddenError('This endpoint is only for vendors');
  }

  const hashedPassword = await hashPassword(password);

  // Update password, mark email as verified, and activate account
  await prisma.user.update({
    where: { id: user.id },
    data: {
      password: hashedPassword,
      isEmailVerified: true,
      isActive: true, // Auto-activate vendor
      emailVerificationToken: null,
      emailTokenExpiresAt: null,
    },
  });

  logger.info(`Vendor ${user.email} set password and activated account`);

  // Send welcome email
  const welcomeEmail = generateWelcomeEmail(user.firstName, user.email);
  sendEmailAsync(welcomeEmail).catch((err) => {
    logger.error(`Failed to send welcome email to ${user.email}:`, err);
  });

  return true;
};

export const getUserById = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      phone: true,
      role: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!user) {
    throw new UserNotFoundError();
  }

  return user;
};

export const verifyEmail = async (token: string) => {
  const { email } = verifyEmailVerificationToken(token);

  const user = await prisma.user.findUnique({
    where: {
      email,
      emailVerificationToken: token,
      emailTokenExpiresAt: { gte: new Date() },
    },
  });

  if (!user) {
    throw new InvalidCredentialsError('Invalid or expired verification token');
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      isEmailVerified: true,
      isActive: user.role === 'CUSTOMER' ? true : user.isActive, // Auto-activate customers
      emailVerificationToken: null,
      emailTokenExpiresAt: null,
    },
  });

  logger.info(`Email verified: ${user.email}`);

  // Send welcome email after verification
  const welcomeEmail = generateWelcomeEmail(user.firstName, user.email);
  sendEmailAsync(welcomeEmail).catch((err) => {
    logger.error(`Failed to send welcome email to ${user.email}:`, err);
  });

  return true;
};

export const resendVerificationEmail = async (email: string) => {
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    throw new UserNotFoundError('User not found');
  }

  if (user.isEmailVerified) {
    throw new ForbiddenError('Email already verified');
  }

  const verificationToken = generateEmailVerificationToken(email);
  const tokenExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

  await prisma.user.update({
    where: { id: user.id },
    data: {
      emailVerificationToken: verificationToken,
      emailTokenExpiresAt: tokenExpiresAt,
    },
  });

  logger.info(`Verification email resent: ${user.email}`);

  // Send new verification email
  const verificationUrl = `${process.env.APP_URL || 'http://localhost:3001/api'}/auth/verify-email?token=${verificationToken}`;
  const verificationEmail = generateEmailVerificationEmail(
    user.firstName,
    user.email,
    verificationUrl
  );
  sendEmailAsync(verificationEmail).catch((err) => {
    logger.error(`Failed to send verification email to ${user.email}:`, err);
  });

  return true;
};
