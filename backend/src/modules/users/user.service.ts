import prisma from '../../database/prisma';
import { hashPassword, comparePassword } from '../../utils/hash.utils';
import { InvalidCredentialsError, UserNotFoundError, ForbiddenError } from '../../utils/errors';
import logger from '../../utils/logger';

// Simple in-memory rate limiter for password changes: 5 per hour per user
const passwordChangeLimiter = new Map<string, { count: number; windowStart: number }>();
const PASSWORD_CHANGE_LIMIT = 5;
const PASSWORD_CHANGE_WINDOW_MS = 60 * 60 * 1000; // 1 hour

export const getUserProfile = async (userId: string) => {
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
      addresses: true,
    },
  });

  if (!user) {
    throw new UserNotFoundError();
  }

  return user;
};

export const updateUserProfile = async (
  userId: string,
  data: { firstName?: string; lastName?: string; phone?: string }
) => {
  const user = await prisma.user.update({
    where: { id: userId },
    data,
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      phone: true,
      role: true,
      createdAt: true,
    },
  });

  logger.info(`Profile updated: ${user.email}`);
  return user;
};

export const changeUserPassword = async (
  userId: string,
  currentPassword: string,
  newPassword: string
) => {
  // rate limiting
  const now = Date.now();
  const entry = passwordChangeLimiter.get(userId);
  if (entry) {
    if (now - entry.windowStart <= PASSWORD_CHANGE_WINDOW_MS) {
      if (entry.count >= PASSWORD_CHANGE_LIMIT) {
        throw new ForbiddenError('Too many password change attempts. Try again later.');
      }
      entry.count += 1;
    } else {
      // reset window
      passwordChangeLimiter.set(userId, { count: 1, windowStart: now });
    }
  } else {
    passwordChangeLimiter.set(userId, { count: 1, windowStart: now });
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });

  if (!user) {
    throw new UserNotFoundError();
  }

  const isValid = await comparePassword(currentPassword, user.password);

  if (!isValid) {
    throw new InvalidCredentialsError('Current password is incorrect');
  }

  const hashedPassword = await hashPassword(newPassword);

  await prisma.user.update({
    where: { id: userId },
    data: { password: hashedPassword },
  });

  logger.info(`Password changed: ${user.email}`);
  return true;
};

export const deleteUserAccount = async (userId: string) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });

  if (!user) {
    throw new UserNotFoundError();
  }

  await prisma.user.update({
    where: { id: userId },
    data: {
      email: `deleted_${userId}@deleted.com`,
      firstName: 'Deleted',
      lastName: 'Account',
      isActive: false,
      deletedAt: new Date(),
    },
  });

  logger.info(`Account deleted: ${user.email}`);
  return true;
};

export const downloadPersonalData = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      phone: true,
      role: true,
      createdAt: true,
      updatedAt: true,
      addresses: true,
      orders: {
        select: { id: true, items: true, totalAmount: true, status: true, createdAt: true },
      },
      reviews: true,
    },
  });

  if (!user) {
    throw new UserNotFoundError();
  }

  logger.info(`Personal data downloaded: ${user.email}`);
  return user;
};

export const getUserAddresses = async (userId: string) => {
  return prisma.address.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  });
};

export const createAddress = async (
  userId: string,
  data: {
    street: string;
    city: string;
    postalCode: string;
    country: string;
    label?: string;
    isDefault: boolean;
  }
) => {
  if (data.isDefault) {
    await prisma.address.updateMany({
      where: { userId },
      data: { isDefault: false },
    });
  }

  const address = await prisma.address.create({
    data: { userId, ...data },
  });

  logger.info(`Address created for user: ${userId}`);
  return address;
};

export const updateAddress = async (
  addressId: string,
  userId: string,
  data: {
    street?: string;
    city?: string;
    postalCode?: string;
    country?: string;
    label?: string;
    isDefault?: boolean;
  }
) => {
  const address = await prisma.address.findUnique({ where: { id: addressId } });

  if (!address || address.userId !== userId) {
    throw new ForbiddenError('Cannot update this address');
  }

  if (data.isDefault) {
    await prisma.address.updateMany({
      where: { userId, id: { not: addressId } },
      data: { isDefault: false },
    });
  }

  const updated = await prisma.address.update({
    where: { id: addressId },
    data,
  });

  logger.info(`Address updated: ${addressId}`);
  return updated;
};

export const deleteAddress = async (addressId: string, userId: string) => {
  const address = await prisma.address.findUnique({ where: { id: addressId } });

  if (!address || address.userId !== userId) {
    throw new ForbiddenError('Cannot delete this address');
  }

  const addressCount = await prisma.address.count({ where: { userId } });

  if (addressCount === 1) {
    const activeOrders = await prisma.order.count({
      where: {
        customerId: userId,
        status: { in: ['PENDING_PAYMENT', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'IN_TRANSIT'] },
      },
    });

    if (activeOrders > 0) {
      throw new ForbiddenError('Cannot delete last address with active orders');
    }
  }

  await prisma.address.delete({ where: { id: addressId } });

  logger.info(`Address deleted: ${addressId}`);
  return true;
};

export const setDefaultAddress = async (addressId: string, userId: string) => {
  const address = await prisma.address.findUnique({ where: { id: addressId } });

  if (!address || address.userId !== userId) {
    throw new ForbiddenError('Cannot set this address as default');
  }

  await prisma.address.updateMany({
    where: { userId },
    data: { isDefault: false },
  });

  const updated = await prisma.address.update({
    where: { id: addressId },
    data: { isDefault: true },
  });

  logger.info(`Default address set: ${addressId}`);
  return updated;
};
