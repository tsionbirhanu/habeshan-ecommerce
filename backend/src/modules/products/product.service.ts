import { PrismaClient, ProductStatus, UserRole, InventoryAction } from '@prisma/client';
import { AuthPayload } from '../../types/auth.types';
import { slugify } from '../../utils/string.utils';
import { NotFoundError, ForbiddenError } from '../../utils/errors';

const prisma = new PrismaClient();

interface CreateProductData {
  name: string;
  nameEn: string;
  nameDe: string;
  nameAm?: string;
  description?: string;
  descriptionEn?: string;
  descriptionDe?: string;
  descriptionAm?: string;
  categoryId: string;
  price: number;
  originalPrice?: number;
  costPrice?: number;
  vatRate: number;
  sku: string;
  weight?: number;
  tags?: string[];
  metaTitle?: string;
  metaDescription?: string;
  status?: ProductStatus;
  stockQuantity: number;
  reorderLevel?: number;
  vendorId?: string;
  images?: string[];
  thumbnailUrl?: string;
}

interface UpdateProductData {
  name?: string;
  nameEn?: string;
  nameDe?: string;
  nameAm?: string;
  description?: string;
  descriptionEn?: string;
  descriptionDe?: string;
  descriptionAm?: string;
  categoryId?: string;
  price?: number;
  originalPrice?: number;
  costPrice?: number;
  vatRate?: number;
  weight?: number;
  tags?: string[];
  metaTitle?: string;
  metaDescription?: string;
  status?: ProductStatus;
  stockQuantity?: number;
  reorderLevel?: number;
  images?: string[];
  thumbnailUrl?: string;
}

export const createProduct = async (data: CreateProductData, userId: string) => {
  const slug = await generateUniqueSlug(data.name);
  
  return await prisma.$transaction(async (tx) => {
    const product = await tx.product.create({
      data: {
        ...data,
        slug,
        createdBy: userId,
      },
      include: {
        category: true,
        vendor: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
        },
        inventory: true,
      },
    });

    await tx.inventory.create({
      data: {
        productId: product.id,
        quantity: data.stockQuantity,
        reorderLevel: data.reorderLevel || 5,
      },
    });

    await tx.inventoryHistory.create({
      data: {
        productId: product.id,
        action: InventoryAction.PURCHASE,
        quantityChange: data.stockQuantity,
        previousQuantity: 0,
        newQuantity: data.stockQuantity,
        performedBy: userId,
        notes: 'Initial stock on product creation',
      },
    });

    return formatProductResponse(product);
  });
};

export const getAllProducts = async (query: any, userRole?: UserRole) => {
  const {
    page = 1,
    limit = 20,
    categoryId,
    minPrice,
    maxPrice,
    status,
    search,
    inStock,
    sortBy = 'newest',
  } = query;

  const skip = (Number(page) - 1) * Number(limit);
  const where: any = {};

  if (userRole !== 'ADMIN' && userRole !== 'VENDOR') {
    where.status = ProductStatus.ACTIVE;
  } else if (status) {
    where.status = status;
  }

  if (categoryId) where.categoryId = categoryId;
  if (minPrice || maxPrice) {
    where.price = {};
    if (minPrice) where.price.gte = Number(minPrice);
    if (maxPrice) where.price.lte = Number(maxPrice);
  }
  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { nameEn: { contains: search, mode: 'insensitive' } },
      { nameDe: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
      { tags: { hasSome: [search] } },
    ];
  }
  if (inStock === 'true') {
    where.stockQuantity = { gt: 0 };
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
    products: formattedProducts,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      pages: Math.ceil(total / Number(limit)),
    },
  };
};

export const getProductById = async (idOrSlug: string, userRole?: UserRole) => {
  const where: any = {};
  
  // UUID pattern: 8-4-4-4-12 hex digits
  const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  
  if (uuidPattern.test(idOrSlug)) {
    where.id = idOrSlug;
  } else {
    where.slug = idOrSlug;
  }

  if (userRole !== 'ADMIN' && userRole !== 'VENDOR') {
    where.status = ProductStatus.ACTIVE;
  }

  const product = await prisma.product.findFirst({
    where,
    include: {
      category: true,
      vendor: {
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
      },
      inventory: true,
      reviews: {
        where: { status: 'APPROVED' },
        include: {
          customer: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      },
    },
  });

  if (!product) {
    throw new NotFoundError('Product not found');
  }

  await prisma.product.update({
    where: { id: product.id },
    data: { soldCount: { increment: 1 } },
  });

  const relatedProducts = await getRelatedProducts(product.id);

  return {
    ...formatProductResponse(product),
    averageRating: calculateAverageRating(product.reviews),
    reviews: product.reviews,
    inStock: product.inventory ? product.inventory.quantity > 0 : false,
    relatedProducts,
  };
};

export const updateProduct = async (id: string, data: UpdateProductData, user: AuthPayload) => {
  const existingProduct = await prisma.product.findUnique({
    where: { id },
    include: { vendor: true },
  });

  if (!existingProduct) {
    throw new NotFoundError('Product not found');
  }

  if (user.role === UserRole.VENDOR) {
    if (existingProduct.vendorId !== user.userId) {
      throw new ForbiddenError('You can only update your own products');
    }
    
    const restrictedFields = ['price', 'vatRate', 'categoryId'];
    for (const field of restrictedFields) {
      if (data[field as keyof UpdateProductData] !== undefined) {
        throw new ForbiddenError(`Vendors cannot update ${field}`);
      }
    }
  }

  const updateData: any = { ...data };
  if (data.name && data.name !== existingProduct.name) {
    updateData.slug = await generateUniqueSlug(data.name, existingProduct.id);
  }

  const updatedProduct = await prisma.product.update({
    where: { id },
    data: updateData,
    include: {
      category: true,
      vendor: {
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
      },
      inventory: true,
    },
  });

  await prisma.auditLog.create({
    data: {
      userId: user.userId,
      action: 'UPDATE',
      entity: 'PRODUCT',
      entityId: id,
      changes: data as any,
      ipAddress: user.ipAddress,
    },
  });

  return formatProductResponse(updatedProduct);
};

export const deleteProduct = async (id: string) => {
  const product = await prisma.product.findUnique({ where: { id } });
  
  if (!product) {
    throw new NotFoundError('Product not found');
  }

  await prisma.product.update({
    where: { id },
    data: { status: ProductStatus.DISCONTINUED },
  });
};

export const uploadProductImages = async (id: string, images: any[], user: AuthPayload) => {
  const product = await prisma.product.findUnique({
    where: { id },
    include: { vendor: true },
  });

  if (!product) {
    throw new NotFoundError('Product not found');
  }

  if (user.role === UserRole.VENDOR && product.vendorId !== user.userId) {
    throw new ForbiddenError('You can only upload images to your own products');
  }

  const imageUrls = images.map(file => `/uploads/products/${file.filename}`);
  
  const updatedProduct = await prisma.product.update({
    where: { id },
    data: {
      images: [...(product.images || []), ...imageUrls],
      thumbnailUrl: product.thumbnailUrl || imageUrls[0],
    },
    include: {
      category: true,
      vendor: {
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
      },
      inventory: true,
    },
  });

  return formatProductResponse(updatedProduct);
};

export const searchProducts = async (query: any) => {
  const { q, limit = 10, page = 1, categoryId, minPrice, maxPrice } = query;
  
  if (!q) {
    throw new Error('Search query is required');
  }

  const skip = (Number(page) - 1) * Number(limit);
  const where: any = {
    status: ProductStatus.ACTIVE,
    OR: [
      { name: { contains: q, mode: 'insensitive' } },
      { nameEn: { contains: q, mode: 'insensitive' } },
      { nameDe: { contains: q, mode: 'insensitive' } },
      { description: { contains: q, mode: 'insensitive' } },
      { tags: { hasSome: [q] } },
    ],
  };

  if (categoryId) where.categoryId = categoryId;
  if (minPrice || maxPrice) {
    where.price = {};
    if (minPrice) where.price.gte = Number(minPrice);
    if (maxPrice) where.price.lte = Number(maxPrice);
  }

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      skip,
      take: Number(limit),
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
      },
    }),
    prisma.product.count({ where }),
  ]);

  const suggestions = await prisma.product.findMany({
    where: {
      status: ProductStatus.ACTIVE,
      OR: [
        { name: { contains: q, mode: 'insensitive' } },
        { nameEn: { contains: q, mode: 'insensitive' } },
        { nameDe: { contains: q, mode: 'insensitive' } },
      ],
    },
    select: {
      id: true,
      name: true,
      nameEn: true,
      nameDe: true,
    },
    take: 5,
  });

  return {
    products: products.map(formatProductResponse),
    suggestions,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      pages: Math.ceil(total / Number(limit)),
    },
  };
};

export const getRelatedProducts = async (productId: string) => {
  const product = await prisma.product.findUnique({
    where: { id: productId },
    select: { categoryId: true, id: true },
  });

  if (!product) {
    throw new NotFoundError('Product not found');
  }

  const relatedProducts = await prisma.product.findMany({
    where: {
      categoryId: product.categoryId,
      id: { not: product.id },
      status: ProductStatus.ACTIVE,
    },
    take: 6,
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
    },
  });

  return relatedProducts.map(formatProductResponse);
};

export const getFeaturedProducts = async () => {
  const products = await prisma.product.findMany({
    where: { status: ProductStatus.ACTIVE },
    orderBy: { soldCount: 'desc' },
    take: 8,
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
    },
  });

  return products.map(formatProductResponse);
};

export const getNewArrivals = async () => {
  const products = await prisma.product.findMany({
    where: { status: ProductStatus.ACTIVE },
    orderBy: { createdAt: 'desc' },
    take: 8,
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
    },
  });

  return products.map(formatProductResponse);
};

async function generateUniqueSlug(name: string, excludeId?: string): Promise<string> {
  let slug = slugify(name);
  let counter = 1;
  let originalSlug = slug;

  while (true) {
    const existing = await prisma.product.findFirst({
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
