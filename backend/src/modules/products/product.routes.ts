import { Router } from 'express';
import * as productController from './product.controller';
import * as categoryController from './category.controller';
import { getProductReviews } from '../reviews/review.controller';
import { authenticateToken, requireRole } from '../../middleware/auth.middleware';
import { validateBody, validateQuery } from '../../middleware/validation.middleware';
import { uploadProductImages as uploadImagesMiddleware, uploadCategoryImage } from '../../config/multer';
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

// Product Routes
// POST /api/products - Create product (Admin | Vendor)
router.post(
  '/products',
  authenticateToken,
  requireRole(UserRole.ADMIN, UserRole.VENDOR),
  validateBody(createProductSchema),
  productController.createProduct
);

// GET /api/products - Get all products (Public)
router.get(
  '/products',
  validateQuery(getAllProductsSchema),
  productController.getAllProducts
);

// GET /api/products/search - Search products (Public)
router.get(
  '/products/search',
  validateQuery(searchProductsSchema),
  productController.searchProducts
);

// GET /api/products/featured - Get featured products (Public)
router.get('/products/featured', productController.getFeaturedProducts);

// GET /api/products/new-arrivals - Get new arrivals (Public)
router.get('/products/new-arrivals', productController.getNewArrivals);

// GET /api/products/:id - Get product by ID or slug (Public)
router.get('/products/:id', productController.getProductById);

// GET /api/products/:id/related - Get related products (Public)
router.get('/products/:id/related', productController.getRelatedProducts);

// GET /api/products/:id/reviews - Get product reviews (Public)
router.get('/products/:productId/reviews', getProductReviews);

// PUT /api/products/:id - Update product (Admin | Vendor)
router.put(
  '/products/:id',
  authenticateToken,
  requireRole(UserRole.ADMIN, UserRole.VENDOR),
  validateBody(updateProductSchema),
  productController.updateProduct
);

// DELETE /api/products/:id - Delete product (Admin only)
router.delete(
  '/products/:id',
  authenticateToken,
  requireRole(UserRole.ADMIN),
  productController.deleteProduct
);

// POST /api/products/:id/images - Upload product images (Admin | Vendor)
router.post(
  '/products/:id/images',
  authenticateToken,
  requireRole(UserRole.ADMIN, UserRole.VENDOR),
  uploadImagesMiddleware,
  productController.uploadProductImages
);

// Category Routes
// POST /api/categories - Create category (Admin only)
router.post(
  '/categories',
  authenticateToken,
  requireRole(UserRole.ADMIN),
  validateBody(createCategorySchema),
  categoryController.createCategory
);

// GET /api/categories - Get all categories (Public)
router.get('/categories', categoryController.getAllCategories);

// GET /api/categories/:slug - Get category with products (Public)
router.get(
  '/categories/:slug',
  validateQuery(getCategoryWithProductsSchema),
  categoryController.getCategoryWithProducts
);

// PUT /api/categories/:id - Update category (Admin only)
router.put(
  '/categories/:id',
  authenticateToken,
  requireRole(UserRole.ADMIN),
  validateBody(updateCategorySchema),
  categoryController.updateCategory
);

// DELETE /api/categories/:id - Delete category (Admin only)
router.delete(
  '/categories/:id',
  authenticateToken,
  requireRole(UserRole.ADMIN),
  categoryController.deleteCategory
);

// POST /api/categories/:id/image - Upload category image (Admin only)
router.post(
  '/categories/:id/image',
  authenticateToken,
  requireRole(UserRole.ADMIN),
  uploadCategoryImage,
  categoryController.uploadCategoryImage
);

export default router;
