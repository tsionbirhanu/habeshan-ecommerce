import request from 'supertest';
import app from '../../src/app';
import { prisma } from '../../src/database/prisma';
import { createTestUser, createTestProduct, createTestCategory } from '../factories';
import { generateTestToken } from '../setup';

describe('Products Integration Tests', () => {
  let adminUser: any;
  let adminToken: string;
  let category: any;
  let product: any;

  beforeAll(async () => {
    adminUser = await createTestUser({ role: 'ADMIN' });
    adminToken = generateTestToken(adminUser.id, 'ADMIN');
    category = await createTestCategory('Test Category');
  });

  beforeEach(async () => {
    await prisma.product.deleteMany();
  });

  describe('GET /api/products', () => {
    beforeEach(async () => {
      // Create test products
      for (let i = 0; i < 3; i++) {
        await createTestProduct({
          name: `Product ${i + 1}`,
          price: 29.99 + i * 10,
        });
      }
    });

    it('should list products with pagination', async () => {
      const response = await request(app).get('/api/products').query({ page: 1, limit: 10 });

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThanOrEqual(3);
    });

    it('should filter by category', async () => {
      const response = await request(app).get('/api/products').query({ categoryId: category.id });

      expect(response.status).toBe(200);
    });

    it('should search by name', async () => {
      const response = await request(app).get('/api/products').query({ search: 'Product' });

      expect(response.status).toBe(200);
    });

    it('should sort by price', async () => {
      const response = await request(app)
        .get('/api/products')
        .query({ sortBy: 'price', order: 'asc' });

      expect(response.status).toBe(200);
      if (response.body.data.length > 1) {
        expect(response.body.data[0].price).toBeLessThanOrEqual(response.body.data[1].price);
      }
    });
  });

  describe('POST /api/products (Create)', () => {
    it('should create product as admin', async () => {
      const response = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'New Product',
          nameEn: 'New Product',
          nameDe: 'Neues Produkt',
          categoryId: category.id,
          price: 49.99,
          sku: `SKU-${Date.now()}`,
          stockQuantity: 100,
          description: 'A great new product',
          vatRate: 0.19,
          images: [],
        });

      expect([201, 200]).toContain(response.status);
      expect(response.body.data.name).toBe('New Product');
    });

    it('should reject duplicate SKU', async () => {
      const sku = 'UNIQUE-SKU-123';

      await request(app).post('/api/products').set('Authorization', `Bearer ${adminToken}`).send({
        name: 'Product 1',
        nameEn: 'Product 1',
        nameDe: 'Produkt 1',
        categoryId: category.id,
        price: 29.99,
        sku,
        stockQuantity: 50,
        vatRate: 0.19,
        images: [],
      });

      const response = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Product 2',
          nameEn: 'Product 2',
          nameDe: 'Produkt 2',
          categoryId: category.id,
          price: 39.99,
          sku,
          stockQuantity: 50,
          vatRate: 0.19,
          images: [],
        });

      expect(response.status).toBe(409);
    });

    it('should reject creation without admin role', async () => {
      const customerUser = await createTestUser({ role: 'CUSTOMER' });
      const customerToken = generateTestToken(customerUser.id, 'CUSTOMER');

      const response = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          name: 'Unauthorized Product',
          nameEn: 'Unauthorized Product',
          nameDe: 'Unerlaubtes Produkt',
          categoryId: category.id,
          price: 29.99,
          sku: 'UNAUTH-SKU',
          stockQuantity: 50,
          vatRate: 0.19,
          images: [],
        });

      expect(response.status).toBe(403);
    });

    it('should reject negative price', async () => {
      const response = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Cheap Product',
          nameEn: 'Cheap Product',
          nameDe: 'Günstiges Produkt',
          categoryId: category.id,
          price: -10,
          sku: 'NEGATIVE-PRICE',
          stockQuantity: 50,
          vatRate: 0.19,
          images: [],
        });

      expect(response.status).toBe(400);
    });
  });

  describe('GET /api/products/:id', () => {
    beforeEach(async () => {
      product = await createTestProduct();
    });

    it('should return product details', async () => {
      const response = await request(app).get(`/api/products/${product.id}`);

      expect(response.status).toBe(200);
      expect(response.body.data.id).toBe(product.id);
      expect(response.body.data.name).toBe(product.name);
    });

    it('should return 404 for non-existent product', async () => {
      const response = await request(app).get('/api/products/invalid-id');

      expect(response.status).toBe(404);
    });

    it('should include reviews in product details', async () => {
      const response = await request(app).get(`/api/products/${product.id}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body.data.reviews)).toBe(true);
    });
  });

  describe('PUT /api/products/:id (Update)', () => {
    beforeEach(async () => {
      product = await createTestProduct();
    });

    it('should update product as admin', async () => {
      const response = await request(app)
        .put(`/api/products/${product.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Updated Product',
          price: 59.99,
          stockQuantity: 200,
        });

      expect([200, 204]).toContain(response.status);
    });

    it('should not allow updating SKU', async () => {
      await request(app)
        .put(`/api/products/${product.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          sku: 'NEW-SKU',
        });

      // Either rejected or SKU not changed
      const updated = await prisma.product.findUnique({
        where: { id: product.id },
      });
      expect(updated?.sku).toBe(product.sku);
    });
  });

  describe('DELETE /api/products/:id', () => {
    beforeEach(async () => {
      product = await createTestProduct();
    });

    it('should delete product as admin', async () => {
      const response = await request(app)
        .delete(`/api/products/${product.id}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect([200, 204]).toContain(response.status);
    });

    it('should not allow deletion without admin role', async () => {
      const customerUser = await createTestUser({ role: 'CUSTOMER' });
      const customerToken = generateTestToken(customerUser.id, 'CUSTOMER');

      const response = await request(app)
        .delete(`/api/products/${product.id}`)
        .set('Authorization', `Bearer ${customerToken}`);

      expect(response.status).toBe(403);
    });
  });

  describe('GET /api/categories', () => {
    it('should list product categories', async () => {
      const response = await request(app).get('/api/categories');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });
});
