import { z } from 'zod';
import { ProductStatus } from '@prisma/client';

export const createProductSchema = z.object({
  name: z.string().min(1, 'Product name is required').max(255),
  nameEn: z.string().min(1, 'English name is required').max(255),
  nameDe: z.string().min(1, 'German name is required').max(255),
  nameAm: z.string().max(255).optional(),
  description: z.string().max(2000).optional(),
  descriptionEn: z.string().max(2000).optional(),
  descriptionDe: z.string().max(2000).optional(),
  descriptionAm: z.string().max(2000).optional(),
  categoryId: z.string().uuid('Invalid category ID'),
  price: z.number().positive('Price must be positive').min(0.01),
  originalPrice: z.number().positive().optional(),
  costPrice: z.number().positive().optional(),
  vatRate: z.number().min(0).max(1).default(0.19),
  sku: z.string().min(1, 'SKU is required').max(100),
  weight: z.number().positive().optional(),
  tags: z.array(z.string().max(50)).default([]),
  metaTitle: z.string().max(60).optional(),
  metaDescription: z.string().max(160).optional(),
  status: z.nativeEnum(ProductStatus).default(ProductStatus.ACTIVE),
  stockQuantity: z.number().int().min(0).default(0),
  reorderLevel: z.number().int().min(0).default(5),
  vendorId: z.string().uuid().optional(),
  images: z.array(z.string().url()).default([]),
  thumbnailUrl: z.string().url().optional(),
}).refine((data) => {
  if (data.originalPrice && data.originalPrice <= data.price) {
    return false;
  }
  return true;
}, {
  message: 'Original price must be greater than current price for offers',
  path: ['originalPrice'],
});

export const updateProductSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  nameEn: z.string().min(1).max(255).optional(),
  nameDe: z.string().min(1).max(255).optional(),
  nameAm: z.string().max(255).optional(),
  description: z.string().max(2000).optional(),
  descriptionEn: z.string().max(2000).optional(),
  descriptionDe: z.string().max(2000).optional(),
  descriptionAm: z.string().max(2000).optional(),
  categoryId: z.string().uuid().optional(),
  price: z.number().positive().min(0.01).optional(),
  originalPrice: z.number().positive().optional(),
  costPrice: z.number().positive().optional(),
  vatRate: z.number().min(0).max(1).optional(),
  weight: z.number().positive().optional(),
  tags: z.array(z.string().max(50)).optional(),
  metaTitle: z.string().max(60).optional(),
  metaDescription: z.string().max(160).optional(),
  status: z.nativeEnum(ProductStatus).optional(),
  stockQuantity: z.number().int().min(0).optional(),
  reorderLevel: z.number().int().min(0).optional(),
  images: z.array(z.string().url()).optional(),
  thumbnailUrl: z.string().url().optional(),
}).refine((data) => {
  if (data.originalPrice && data.price && data.originalPrice <= data.price) {
    return false;
  }
  return true;
}, {
  message: 'Original price must be greater than current price for offers',
  path: ['originalPrice'],
});

export const createCategorySchema = z.object({
  name: z.string().min(1, 'Category name is required').max(255),
  nameEn: z.string().min(1, 'English name is required').max(255),
  nameDe: z.string().min(1, 'German name is required').max(255),
  nameAm: z.string().min(1, 'Amharic name is required').max(255),
  slug: z.string().max(255).optional(),
  description: z.string().max(1000).optional(),
  imageUrl: z.string().url().optional(),
  isActive: z.boolean().default(true),
});

export const updateCategorySchema = z.object({
  name: z.string().min(1).max(255).optional(),
  nameEn: z.string().min(1).max(255).optional(),
  nameDe: z.string().min(1).max(255).optional(),
  nameAm: z.string().min(1).max(255).optional(),
  slug: z.string().max(255).optional(),
  description: z.string().max(1000).optional(),
  imageUrl: z.string().url().optional(),
  isActive: z.boolean().optional(),
});

export const searchProductsSchema = z.object({
  q: z.string().min(1, 'Search query is required').max(100),
  limit: z.coerce.number().int().min(1).max(50).default(10),
  page: z.coerce.number().int().min(1).default(1),
  categoryId: z.string().uuid().optional(),
  minPrice: z.coerce.number().positive().optional(),
  maxPrice: z.coerce.number().positive().optional(),
});

export const getAllProductsSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  categoryId: z.string().uuid().optional(),
  minPrice: z.coerce.number().positive().optional(),
  maxPrice: z.coerce.number().positive().optional(),
  status: z.nativeEnum(ProductStatus).optional(),
  search: z.string().max(100).optional(),
  inStock: z.enum(['true', 'false']).optional(),
  sortBy: z.enum(['newest', 'price_asc', 'price_desc', 'best_rated', 'best_selling']).default('newest'),
});

export const getCategoryWithProductsSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  sortBy: z.enum(['newest', 'price_asc', 'price_desc', 'best_rated', 'best_selling']).default('newest'),
  minPrice: z.coerce.number().positive().optional(),
  maxPrice: z.coerce.number().positive().optional(),
});
