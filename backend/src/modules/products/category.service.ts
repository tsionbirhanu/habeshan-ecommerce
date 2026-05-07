import { PrismaClient } from '@prisma/client';
import { slugify } from '../../utils/string.utils';
import { NotFoundError, ConflictError } from '../../utils/errors';

const prisma = new PrismaClient();

interface CreateCategoryData {
  name: string;
  nameEn: string;
  nameDe: string;
  nameAm: string;
  slug?: string;
  description?: string;
  imageUrl?: string;
  isActive?: boolean;
}

interface UpdateCategoryData {
  name?: string;
  nameEn?: string;
  nameDe?: string;
  nameAm?: string;
  slug?: string;
  description?: string;
  imageUrl?: string;
  isActive?: boolean;
}

export const createCategory = async (data: CreateCategoryData) => {
  const slug = data.slug || await generateUniqueSlug(data.name);
  
  const category = await prisma.category.create({
    data: {
      ...data,
      slug,
    },
  });

  return category;
};

export const getAllCategories = async () => {
  const categories = await prisma.category.findMany({
    where: { isActive: true },
    include: {
      _count: {
        select: {
          products: {
            where: { status: 'ACTIVE' },
          },
        },
      },
    },
    orderBy: { name: 'asc' },
  });

  return categories.map(category => ({
    ...category,
    productCount: category._count.products,
    _count: undefined,
  }));
};

export const getCategoryWithProducts = async (slug: string, query: any) => {
  const { page = 1, limit = 20, sortBy = 'newest', minPrice, maxPrice } = query;
  
  const category = await prisma.category.findFirst({
    where: { slug, isActive: true },
  });

  if (!category) {
    throw new NotFoundError('Category not found');
  }

  const skip = (Number(page) - 1) * Number(limit);
  const where: any = {
    categoryId: category.id,
    status: 'ACTIVE',
  };

  if (minPrice || maxPrice) {
    where.price = {};
    if (minPrice) where.price.gte = Number(minPrice);
    if (maxPrice) where.price.lte = Number(maxPrice);
  }

  const orderBy = getSortOrder(sortBy);

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      skip,
      take: Number(limit),
      orderBy,
      include: {
        category: true,
        vendor: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
        inventory: true,
        reviews: {
          where: { status: 'APPROVED' },
          select: { rating: true },
        },
      },
    }),
    prisma.product.count({ where }),
  ]);

  const formattedProducts = products.map(product => ({
    ...formatProductResponse(product),
    averageRating: calculateAverageRating(product.reviews || []),
    inStock: product.inventory ? product.inventory.quantity > 0 : false,
  }));

  return {
    category,
    products: formattedProducts,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      pages: Math.ceil(total / Number(limit)),
    },
  };
};

export const updateCategory = async (id: string, data: UpdateCategoryData) => {
  const existingCategory = await prisma.category.findUnique({ where: { id } });
  
  if (!existingCategory) {
    throw new NotFoundError('Category not found');
  }

  const updateData: any = { ...data };
  if (data.name && data.name !== existingCategory.name) {
    updateData.slug = await generateUniqueSlug(data.name, existingCategory.id);
  }

  const updatedCategory = await prisma.category.update({
    where: { id },
    data: updateData,
  });

  return updatedCategory;
};

export const deleteCategory = async (id: string) => {
  const category = await prisma.category.findUnique({
    where: { id },
    include: {
      _count: {
        select: {
          products: {
            where: { status: 'ACTIVE' },
          },
        },
      },
    },
  });

  if (!category) {
    throw new NotFoundError('Category not found');
  }

  if (category._count.products > 0) {
    throw new ConflictError('Cannot delete category with active products');
  }

  await prisma.category.update({
    where: { id },
    data: { isActive: false },
  });
};

async function generateUniqueSlug(name: string, excludeId?: string): Promise<string> {
  let slug = slugify(name);
  let counter = 1;
  let originalSlug = slug;

  while (true) {
    const existing = await prisma.category.findFirst({
      where: {
        slug,
        ...(excludeId && { id: { not: excludeId } }),
      },
    });

    if (!existing) break;

    slug = `${originalSlug}-${counter}`;
    counter++;
  }

  return slug;
}

function getSortOrder(sortBy: string) {
  switch (sortBy) {
    case 'price_asc':
      return { price: 'asc' as const };
    case 'price_desc':
      return { price: 'desc' as const };
    case 'best_rated':
      return { reviews: { _count: 'desc' as const } };
    case 'best_selling':
      return { soldCount: 'desc' as const };
    case 'newest':
    default:
      return { createdAt: 'desc' as const };
  }
}

function formatProductResponse(product: any) {
  const { originalPrice, price } = product;
  const isOnOffer = originalPrice && originalPrice > price;
  const discountPercent = isOnOffer 
    ? Math.round(((Number(originalPrice) - Number(price)) / Number(originalPrice)) * 100)
    : 0;

  return {
    ...product,
    isOnOffer,
    discountPercent,
  };
}

function calculateAverageRating(reviews: any[]) {
  if (!reviews || reviews.length === 0) return 0;
  const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
  return Math.round((sum / reviews.length) * 10) / 10;
}

export const uploadCategoryImage = async (id: string, imageFile: Express.Multer.File) => {
  const category = await prisma.category.findUnique({
    where: { id },
  });

  if (!category) {
    throw new NotFoundError('Category not found');
  }

  const imageUrl = `/uploads/products/${imageFile.filename}`;

  const updatedCategory = await prisma.category.update({
    where: { id },
    data: {
      imageUrl,
    },
  });

  return updatedCategory;
}
