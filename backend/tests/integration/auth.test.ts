import request from 'supertest';
import app from '../../src/app';
import { prisma } from '../../src/database/prisma';
import { createTestUser } from '../factories';
import { generateTestToken } from '../setup';

describe('Auth Integration Tests', () => {
  beforeEach(async () => {
    await prisma.user.deleteMany();
  });

  describe('POST /api/auth/register-customer', () => {
    it('should register a new customer', async () => {
      const response = await request(app).post('/api/auth/register-customer').send({
        email: 'newcustomer@test.com',
        password: 'SecurePass123!',
        firstName: 'John',
        lastName: 'Doe',
      });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.email).toBe('newcustomer@test.com');
      expect(response.body.data.role).toBe('CUSTOMER');
      expect(response.body.data.password).toBeUndefined();
    });

    it('should reject duplicate email', async () => {
      const email = 'duplicate@test.com';

      await request(app).post('/api/auth/register-customer').send({
        email,
        password: 'SecurePass123!',
        firstName: 'John',
        lastName: 'Doe',
      });

      const response = await request(app).post('/api/auth/register-customer').send({
        email,
        password: 'SecurePass123!',
        firstName: 'Jane',
        lastName: 'Smith',
      });

      expect(response.status).toBe(409);
    });

    it('should reject weak password', async () => {
      const response = await request(app).post('/api/auth/register-customer').send({
        email: 'test@test.com',
        password: 'weak', // Too short
        firstName: 'John',
        lastName: 'Doe',
      });

      expect(response.status).toBe(400);
    });

    it('should reject invalid email', async () => {
      const response = await request(app).post('/api/auth/register-customer').send({
        email: 'notanemail',
        password: 'SecurePass123!',
        firstName: 'John',
        lastName: 'Doe',
      });

      expect(response.status).toBe(400);
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      await createTestUser({
        email: 'testuser@test.com',
      });
    });

    it('should login with correct credentials', async () => {
      const response = await request(app).post('/api/auth/login').send({
        email: 'testuser@test.com',
        password: 'TestPassword123!',
      });

      expect(response.status).toBe(200);
      expect(response.body.data.accessToken).toBeDefined();
      expect(response.body.data.refreshToken).toBeDefined();
    });

    it('should reject incorrect password', async () => {
      const response = await request(app).post('/api/auth/login').send({
        email: 'testuser@test.com',
        password: 'WrongPassword123!',
      });

      expect(response.status).toBe(401);
    });

    it('should reject non-existent user', async () => {
      const response = await request(app).post('/api/auth/login').send({
        email: 'nonexistent@test.com',
        password: 'AnyPassword123!',
      });

      expect(response.status).toBe(401);
    });
  });

  describe('POST /api/auth/refresh-token', () => {
    it('should refresh token with valid refresh token', async () => {
      const user = await createTestUser();
      const refreshToken = generateTestToken(user.id, user.role);

      const response = await request(app).post('/api/auth/refresh-token').send({
        refreshToken,
      });

      expect([200, 201]).toContain(response.status);
    });

    it('should reject invalid refresh token', async () => {
      const response = await request(app).post('/api/auth/refresh-token').send({
        refreshToken: 'invalid.token.here',
      });

      expect(response.status).toBe(401);
    });
  });

  describe('GET /api/auth/me', () => {
    it('should return current user when authenticated', async () => {
      const user = await createTestUser();
      const token = generateTestToken(user.id, user.role);

      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.data.id).toBe(user.id);
      expect(response.body.data.email).toBe(user.email);
    });

    it('should reject request without token', async () => {
      const response = await request(app).get('/api/auth/me');

      expect(response.status).toBe(401);
    });

    it('should reject request with invalid token', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer invalid.token.here');

      expect(response.status).toBe(401);
    });
  });

  describe('POST /api/auth/logout', () => {
    it('should logout successfully', async () => {
      const user = await createTestUser();
      const token = generateTestToken(user.id, user.role);

      const response = await request(app)
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${token}`);

      expect([200, 204]).toContain(response.status);
    });

    it('should reject logout without token', async () => {
      const response = await request(app).post('/api/auth/logout');

      expect(response.status).toBe(401);
    });
  });
});
