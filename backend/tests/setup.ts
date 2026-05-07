import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

/**
 * Setup test database before all tests
 */
export async function setupTestDb() {
  // Ensure database is clean
  await prisma.$executeRawUnsafe('TRUNCATE "User" CASCADE;');
  return prisma;
}

/**
 * Cleanup test database after tests
 */
export async function cleanupTestDb() {
  // Delete all data in reverse order of foreign key dependencies
  await prisma.$executeRawUnsafe('TRUNCATE "Order" CASCADE;');
  await prisma.$executeRawUnsafe('TRUNCATE "Product" CASCADE;');
  await prisma.$executeRawUnsafe('TRUNCATE "User" CASCADE;');
  await prisma.$executeRawUnsafe('TRUNCATE "Coupon" CASCADE;');
  await prisma.$executeRawUnsafe('TRUNCATE "Category" CASCADE;');
  await prisma.$disconnect();
}

/**
 * Generate JWT token for testing
 */
export function generateTestToken(userId: string, role: string = 'CUSTOMER'): string {
  const jwt = require('jsonwebtoken');
  const payload = { userId, role };
  const secret = process.env.JWT_SECRET || 'test-secret';
  return jwt.sign(payload, secret, { expiresIn: '24h' });
}

/**
 * Helper to hash password
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}
