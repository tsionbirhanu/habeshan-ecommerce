import { Router } from 'express';
import * as productController from './product.controller';
import * as categoryController from './category.controller';
import { getProductReviews } from '../reviews/review.controller';
import { authenticateToken, requireRole } from '../../middleware/auth.middleware';
import { validateBody, validateQuery } from '../../middleware/validation.middleware';
import {
  uploadProductImages as uploadImagesMiddleware,
  uploadCategoryImage,
} from '../../config/multer';
import { UserRole } from '@prisma/client';
import {
  createProductSchema,
  updateProductSchema,
  createCategorySchema,
  updateCategorySchema,
  searchProductsSchema,
  getAllProductsSchema,
  getCategoryWithProductsSchema,
} from './product.validation';

const router = Router();

// ============ PRODUCT ROUTES ============

/**
 * @swagger
 * /api/products:
 *   post:
 *     summary: Create product
 *     tags: [Products]
 *     description: Create a new product (Admin or Vendor only)
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               nameEn:
 *                 type: string
 *               nameDe:
 *                 type: string
 *               description:
 *                 type: string
 *               price:
 *                 type: number
 *                 format: double
 *               stock:
 *                 type: integer
 *               categoryId:
 *                 type: string
 *                 format: uuid
 *               sku:
 *                 type: string
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *             required:
 *               - name
 *               - description
 *               - price
 *               - stock
 *               - categoryId
 *     responses:
 *       201:
 *         description: Product created successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin or Vendor role required
 *   get:
 *     summary: Get all products
 *     tags: [Products]
 *     description: Retrieve paginated list of products (public)
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *       - in: query
 *         name: minPrice
 *         schema:
 *           type: number
 *       - in: query
 *         name: maxPrice
 *         schema:
 *           type: number
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [name, price, rating, createdAt]
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *     responses:
 *       200:
 *         description: Products retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Product'
 *                 pagination:
 *                   type: object
 */
router.post(
  '/products',
  authenticateToken,
  requireRole(UserRole.ADMIN, UserRole.VENDOR),
  validateBody(createProductSchema),
  productController.createProduct
);

router.get('/products', validateQuery(getAllProductsSchema), productController.getAllProducts);

/**
 * @swagger
 * /api/products/search:
 *   get:
 *     summary: Search products
 *     tags: [Products]
 *     description: Search products by keyword with filters
 *     parameters:
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *       - in: query
 *         name: minPrice
 *         schema:
 *           type: number
 *       - in: query
 *         name: maxPrice
 *         schema:
 *           type: number
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: Search results retrieved successfully
 */
router.get(
  '/products/search',
  validateQuery(searchProductsSchema),
  productController.searchProducts
);

/**
 * @swagger
 * /api/products/featured:
 *   get:
 *     summary: Get featured products
 *     tags: [Products]
 *     description: Retrieve featured/promoted products
 *     responses:
 *       200:
 *         description: Featured products retrieved successfully
 */
router.get('/products/featured', productController.getFeaturedProducts);

/**
 * @swagger
 * /api/products/new-arrivals:
 *   get:
 *     summary: Get new arrivals
 *     tags: [Products]
 *     description: Retrieve newly added products
 *     responses:
 *       200:
 *         description: New arrivals retrieved successfully
 */
router.get('/products/new-arrivals', productController.getNewArrivals);

/**
 * @swagger
 * /api/products/{id}:
 *   get:
 *     summary: Get product details
 *     tags: [Products]
 *     description: Get detailed information about a specific product
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Product details retrieved successfully
 *       404:
 *         description: Product not found
 *   put:
 *     summary: Update product
 *     tags: [Products]
 *     description: Update product details (Admin or Vendor only)
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Product updated successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Product not found
 *   delete:
 *     summary: Delete product
 *     tags: [Products]
 *     description: Delete a product (Admin only)
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Product deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin role required
 *       404:
 *         description: Product not found
 */
router.get('/products/:id', productController.getProductById);

router.put(
  '/products/:id',
  authenticateToken,
  requireRole(UserRole.ADMIN, UserRole.VENDOR),
  validateBody(updateProductSchema),
  productController.updateProduct
);

router.delete(
  '/products/:id',
  authenticateToken,
  requireRole(UserRole.ADMIN),
  productController.deleteProduct
);

/**
 * @swagger
 * /api/products/{id}/related:
 *   get:
 *     summary: Get related products
 *     tags: [Products]
 *     description: Get products related to the specified product
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Related products retrieved successfully
 *       404:
 *         description: Product not found
 */
router.get('/products/:id/related', productController.getRelatedProducts);

/**
 * @swagger
 * /api/products/{productId}/reviews:
 *   get:
 *     summary: Get product reviews
 *     tags: [Products, Reviews]
 *     description: Retrieve all reviews for a product
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [rating, createdAt, helpful]
 *     responses:
 *       200:
 *         description: Product reviews retrieved successfully
 */
router.get('/products/:productId/reviews', getProductReviews);

/**
 * @swagger
 * /api/products/{id}/images:
 *   post:
 *     summary: Upload product images
 *     tags: [Products]
 *     description: Upload images for a product (Admin or Vendor only)
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *             required:
 *               - images
 *     responses:
 *       200:
 *         description: Images uploaded successfully
 *       400:
 *         description: Invalid file format
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.post(
  '/products/:id/images',
  authenticateToken,
  requireRole(UserRole.ADMIN, UserRole.VENDOR),
  uploadImagesMiddleware,
  productController.uploadProductImages
);

// ============ CATEGORY ROUTES ============

/**
 * @swagger
 * /api/categories:
 *   post:
 *     summary: Create category
 *     tags: [Categories]
 *     description: Create a new product category (Admin only)
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               slug:
 *                 type: string
 *             required:
 *               - name
 *               - slug
 *     responses:
 *       201:
 *         description: Category created successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin role required
 *   get:
 *     summary: Get all categories
 *     tags: [Categories]
 *     description: Retrieve list of all product categories
 *     responses:
 *       200:
 *         description: Categories retrieved successfully
 */
router.post(
  '/categories',
  authenticateToken,
  requireRole(UserRole.ADMIN),
  validateBody(createCategorySchema),
  categoryController.createCategory
);

router.get('/categories', categoryController.getAllCategories);

/**
 * @swagger
 * /api/categories/{slug}:
 *   get:
 *     summary: Get category with products
 *     tags: [Categories]
 *     description: Get a specific category with its products
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: Category with products retrieved successfully
 *       404:
 *         description: Category not found
 *   put:
 *     summary: Update category
 *     tags: [Categories]
 *     description: Update category details (Admin only)
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Category updated successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *   delete:
 *     summary: Delete category
 *     tags: [Categories]
 *     description: Delete a category (Admin only)
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Category deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.get(
  '/categories/:slug',
  validateQuery(getCategoryWithProductsSchema),
  categoryController.getCategoryWithProducts
);

router.put(
  '/categories/:id',
  authenticateToken,
  requireRole(UserRole.ADMIN),
  validateBody(updateCategorySchema),
  categoryController.updateCategory
);

router.delete(
  '/categories/:id',
  authenticateToken,
  requireRole(UserRole.ADMIN),
  categoryController.deleteCategory
);

/**
 * @swagger
 * /api/categories/{id}/image:
 *   post:
 *     summary: Upload category image
 *     tags: [Categories]
 *     description: Upload image for a category (Admin only)
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *             required:
 *               - image
 *     responses:
 *       200:
 *         description: Image uploaded successfully
 *       400:
 *         description: Invalid file format
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.post(
  '/categories/:id/image',
  authenticateToken,
  requireRole(UserRole.ADMIN),
  uploadCategoryImage,
  categoryController.uploadCategoryImage
);

export default router;
