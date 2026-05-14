import prisma from '../../database/prisma';
import { UserNotFoundError, ForbiddenError, UserAlreadyExistsError } from '../../utils/errors';
import { generateResetToken, generateEmailVerificationToken } from '../../utils/jwt.utils';
import logger from '../../utils/logger';
import { UserRole } from '@prisma/client';
import { hashPassword } from '../../utils/hash.utils';
import { sendEmail } from '../../utils/email.service';

// Audit Log Helper
const createAuditLog = async (
  adminId: string,
  action: string,
  entity: string,
  entityId: string,
  changes?: any,
  ipAddress?: string
) => {
  await prisma.auditLog.create({
    data: {
      userId: adminId,
      action,
      entity,
      entityId,
      changes: changes || null,
      ipAddress,
    },
  });
};

// ============ USER MANAGEMENT ============

export const getAllUsers = async (
  page: number,
  limit: number,
  filters: {
    role?: UserRole;
    search?: string;
    isActive?: boolean;
  }
) => {
  const skip = (page - 1) * limit;

  const where: any = {};

  if (filters.role) {
    where.role = filters.role;
  }

  if (filters.isActive !== undefined) {
    where.isActive = filters.isActive;
  }

  if (filters.search) {
    where.OR = [
      { email: { contains: filters.search, mode: 'insensitive' } },
      { firstName: { contains: filters.search, mode: 'insensitive' } },
      { lastName: { contains: filters.search, mode: 'insensitive' } },
    ];
  }

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.user.count({ where }),
  ]);

  return {
    data: users,
    page,
    limit,
    total,
    pages: Math.ceil(total / limit),
  };
};

export const getUserDetails = async (userId: string) => {
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
      deletedAt: true,
      createdAt: true,
      updatedAt: true,
      addresses: true,
      vendor: {
        select: {
          id: true,
          businessName: true,
          description: true,
          isApproved: true,
          approvedAt: true,
        },
      },
    },
  });

  if (!user) {
    throw new UserNotFoundError();
  }

  // Get orders summary
  const [orderCount, orderTotal] = await Promise.all([
    prisma.order.count({ where: { customerId: userId } }),
    prisma.order.aggregate({
      where: { customerId: userId },
      _sum: { totalAmount: true },
    }),
  ]);

  // Get reviews summary
  const reviewCount = await prisma.review.count({ where: { customerId: userId } });

  return {
    ...user,
    ordersSummary: {
      count: orderCount,
      totalSpent: orderTotal._sum?.totalAmount || 0,
    },
    reviewsCount: reviewCount,
  };
};

export const updateUserRole = async (
  userId: string,
  adminId: string,
  newRole: UserRole,
  ipAddress?: string
) => {
  if (userId === adminId) {
    throw new ForbiddenError('Cannot change your own role');
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });

  if (!user) {
    throw new UserNotFoundError();
  }

  const oldRole = user.role;

  const updated = await prisma.user.update({
    where: { id: userId },
    data: { role: newRole },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      role: true,
    },
  });

  // Log action
  await createAuditLog(adminId, 'ROLE_CHANGED', 'User', userId, { oldRole, newRole }, ipAddress);

  logger.info(`Admin ${adminId} changed role for user ${userId}: ${oldRole} → ${newRole}`);

  return updated;
};

export const toggleUserStatus = async (
  userId: string,
  adminId: string,
  isActive: boolean,
  reason?: string,
  ipAddress?: string
) => {
  if (userId === adminId && !isActive) {
    throw new ForbiddenError('Cannot disable your own account');
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });

  if (!user) {
    throw new UserNotFoundError();
  }

  const updated = await prisma.user.update({
    where: { id: userId },
    data: { isActive },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      isActive: true,
    },
  });

  // Log action
  await createAuditLog(
    adminId,
    'STATUS_CHANGED',
    'User',
    userId,
    { previousStatus: user.isActive, newStatus: isActive, reason },
    ipAddress
  );

  logger.info(`Admin ${adminId} ${isActive ? 'enabled' : 'disabled'} user ${userId}`);

  return updated;
};

export const resetUserPassword = async (userId: string, adminId: string, ipAddress?: string) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });

  if (!user) {
    throw new UserNotFoundError();
  }

  const resetToken = generateResetToken(user.id, user.email);

  // Log action
  await createAuditLog(adminId, 'PASSWORD_RESET_REQUESTED', 'User', userId, {}, ipAddress);

  logger.info(`Admin ${adminId} requested password reset for user ${userId}`);

  // TODO: Queue password reset email with resetToken
  // await queueEmail('passwordReset', user.email, { resetToken, userName: user.firstName });

  return {
    message: 'Password reset email sent',
    resetToken, // In production, never return this; send via email only
  };
};

export const getUserActivityLog = async (
  userId: string,
  limit: number = 50,
  offset: number = 0
) => {
  // Verify user exists
  const user = await prisma.user.findUnique({ where: { id: userId } });

  if (!user) {
    throw new UserNotFoundError();
  }

  const [logs, total] = await Promise.all([
    prisma.auditLog.findMany({
      where: {
        OR: [{ userId }, { entityId: userId, entity: 'User' }],
      },
      select: {
        id: true,
        action: true,
        entity: true,
        entityId: true,
        changes: true,
        createdAt: true,
        user: {
          select: { email: true, firstName: true, lastName: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip: offset,
      take: limit,
    }),
    prisma.auditLog.count({
      where: {
        OR: [{ userId }, { entityId: userId, entity: 'User' }],
      },
    }),
  ]);

  return {
    data: logs,
    limit,
    offset,
    total,
  };
};

// ============ VENDOR MANAGEMENT ============

export const getAllVendors = async (
  page: number,
  limit: number,
  filters: {
    isApproved?: boolean;
  }
) => {
  const skip = (page - 1) * limit;

  const where: any = {};

  if (filters.isApproved !== undefined) {
    where.isApproved = filters.isApproved;
  }

  const [vendors, total] = await Promise.all([
    prisma.vendor.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            phone: true,
            isActive: true,
            createdAt: true,
          },
        },
      },
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.vendor.count({ where }),
  ]);

  return {
    data: vendors,
    page,
    limit,
    total,
    pages: Math.ceil(total / limit),
  };
};

export const createVendor = async (
  data: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  },
  adminId: string,
  ipAddress?: string
) => {
  const existingUser = await prisma.user.findUnique({ where: { email: data.email } });
  if (existingUser) {
    throw new UserAlreadyExistsError('Email already registered');
  }

  // Generate temporary password (will be replaced when vendor sets their password)
  const tempPassword = Math.random().toString(36).slice(-12) + 'Temp1!';
  const hashedPassword = await hashPassword(tempPassword);

  // Generate invitation token for vendor to set password
  const invitationToken = generateEmailVerificationToken(data.email);
  const tokenExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days for invitation

  const user = await prisma.user.create({
    data: {
      email: data.email,
      password: hashedPassword,
      firstName: data.firstName,
      lastName: data.lastName,
      phone: data.phone,
      role: 'VENDOR',
      isActive: false, // Will auto-activate when vendor sets password
      isEmailVerified: false,
      emailVerificationToken: invitationToken,
      emailTokenExpiresAt: tokenExpiresAt,
    },
  });

  const vendor = await prisma.vendor.create({
    data: {
      userId: user.id,
      isApproved: true, // Auto-approved when created by admin
    },
  });

  // Log action
  await createAuditLog(adminId, 'VENDOR_CREATED', 'Vendor', vendor.id, {}, ipAddress);

  logger.info(`Admin ${adminId} created vendor account: ${user.email}`);

  // Send invitation email to vendor
  const setPasswordUrl = `${process.env.APP_URL || 'http://localhost:3001'}/vendor/setup-password?token=${invitationToken}`;
  // TODO: Create a proper invitation email template
  const invitationEmail = {
    to: data.email,
    subject: 'Vendor Account Invitation',
    html: `
      <h1>Welcome to Habesha Mini Market!</h1>
      <p>Hi ${data.firstName},</p>
      <p>Your vendor account has been created. Please click the link below to set your password and activate your account:</p>
      <p><a href="${setPasswordUrl}">Set Password</a></p>
      <p>This link expires in 7 days.</p>
    `,
  };
  await sendEmail(invitationEmail);

  return {
    user: {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone,
      role: user.role,
    },
    vendor: {
      id: vendor.id,
      isApproved: vendor.isApproved,
    },
  };
};
