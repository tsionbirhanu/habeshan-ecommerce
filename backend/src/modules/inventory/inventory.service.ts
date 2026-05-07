import { PrismaClient, InventoryAction, UserRole } from '@prisma/client';
import { AuthPayload } from '../../types/auth.types';
import { NotFoundError, ForbiddenError, ConflictError } from '../../utils/errors';

const prisma = new PrismaClient();

interface InventoryFilters {
  lowStockOnly?: string;
  categoryId?: string;
  search?: string;
  page?: number;
  limit?: number;
}

interface ManualAdjustmentData {
  quantity: number;
  reorderLevel?: number;
  notes?: string;
  action: 'ADJUSTMENT';
}

export const getInventory = async (filters: any, user: AuthPayload) => {
  const {
    lowStockOnly,
    categoryId,
    search,
    page = 1,
    limit = 20,
  } = filters as InventoryFilters;

  const skip = (Number(page) - 1) * Number(limit);
  const where: any = {};

  // Vendor can only see their products
  if (user.role === UserRole.VENDOR) {
    where.product = {
      vendorId: user.userId,
    };
  }

  if (lowStockOnly === 'true') {
    where.OR = [
      {
        product: {
          stockQuantity: {
            lte: prisma.inventory.fields.reorderLevel,
          },
        },
      },
      {
        quantity: {
          lte: prisma.inventory.fields.reorderLevel,
        },
      },
    ];
  }

  if (categoryId) {
    where.product = {
      ...where.product,
      categoryId,
    };
  }

  if (search) {
    where.product = {
      ...where.product,
      OR: [
        { name: { contains: search, mode: 'insensitive' } },
        { nameEn: { contains: search, mode: 'insensitive' } },
        { nameDe: { contains: search, mode: 'insensitive' } },
        { sku: { contains: search, mode: 'insensitive' } },
      ],
    };
  }

  const [inventories, total] = await Promise.all([
    prisma.inventory.findMany({
      where,
      skip,
      take: Number(limit),
      include: {
        product: {
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
          },
        },
      },
      orderBy: [
        { quantity: 'asc' }, // Lowest stock first
        { product: { name: 'asc' } },
      ],
    }),
    prisma.inventory.count({ where }),
  ]);

  const formattedInventories = inventories.map(inv => {
    const lowStock = inv.quantity <= inv.reorderLevel;
    const availableStock = inv.quantity - inv.reservedQuantity;

    return {
      id: inv.id,
      product: {
        id: inv.product.id,
        name: inv.product.name,
        nameEn: inv.product.nameEn,
        nameDe: inv.product.nameDe,
        sku: inv.product.sku,
        price: inv.product.price,
        costPrice: inv.product.costPrice,
        soldCount: inv.product.soldCount,
        category: inv.product.category,
        vendor: inv.product.vendor,
      },
      stockQuantity: inv.quantity,
      reservedQuantity: inv.reservedQuantity,
      availableStock,
      reorderLevel: inv.reorderLevel,
      lowStock,
      lastUpdated: inv.lastUpdated,
    };
  });

  return {
    inventories: formattedInventories,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      pages: Math.ceil(total / Number(limit)),
    },
  };
};

export const getProductInventory = async (productId: string, user: AuthPayload) => {
  const inventory = await prisma.inventory.findFirst({
    where: { productId },
    include: {
      product: {
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
        },
      },
    },
  });

  if (!inventory) {
    throw new NotFoundError('Inventory not found for this product');
  }

  // Check permissions
  if (user.role === UserRole.VENDOR && inventory.product.vendorId !== user.userId) {
    throw new ForbiddenError('You can only view inventory for your own products');
  }

  const history = await prisma.inventoryHistory.findMany({
    where: { productId },
    include: {
      product: {
        select: {
          name: true,
          sku: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
    take: 20,
  });

  const lowStock = inventory.quantity <= inventory.reorderLevel;
  const availableStock = inventory.quantity - inventory.reservedQuantity;

  return {
    id: inventory.id,
    product: inventory.product,
    stockQuantity: inventory.quantity,
    reservedQuantity: inventory.reservedQuantity,
    availableStock,
    reorderLevel: inventory.reorderLevel,
    lowStock,
    lastUpdated: inventory.lastUpdated,
    history: history.map(h => ({
      id: h.id,
      action: h.action,
      quantityChange: h.quantityChange,
      previousQuantity: h.previousQuantity,
      newQuantity: h.newQuantity,
      orderId: h.orderId,
      performedBy: h.performedBy,
      notes: h.notes,
      createdAt: h.createdAt,
    })),
  };
};

export const manualAdjustment = async (
  productId: string,
  data: ManualAdjustmentData,
  user: AuthPayload
) => {
  if (user.role !== UserRole.ADMIN) {
    throw new ForbiddenError('Only admins can manually adjust inventory');
  }

  return await prisma.$transaction(async (tx) => {
    const inventory = await tx.inventory.findFirst({
      where: { productId },
      include: {
        product: {
          select: {
            name: true,
            vendorId: true,
          },
        },
      },
    });

    if (!inventory) {
      throw new NotFoundError('Inventory not found for this product');
    }

    const previousQuantity = inventory.quantity;
    const quantityChange = data.quantity - previousQuantity;

    if (data.quantity < 0) {
      throw new ConflictError('Stock quantity cannot be negative');
    }

    // Update inventory
    const updatedInventory = await tx.inventory.update({
      where: { id: inventory.id },
      data: {
        quantity: data.quantity,
        reorderLevel: data.reorderLevel || inventory.reorderLevel,
        lastUpdated: new Date(),
      },
      include: {
        product: {
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
          },
        },
      },
    });

    // Create history record
    await tx.inventoryHistory.create({
      data: {
        productId,
        action: InventoryAction.ADJUSTMENT,
        quantityChange,
        previousQuantity,
        newQuantity: data.quantity,
        performedBy: user.userId,
        notes: data.notes || 'Manual adjustment by admin',
      },
    });

    // Check for low stock alert
    if (data.quantity <= (data.reorderLevel || inventory.reorderLevel)) {
      await createLowStockNotification(tx, productId, user.userId);
    }

    // Update product stock quantity
    await tx.product.update({
      where: { id: productId },
      data: { stockQuantity: data.quantity },
    });

    const lowStock = data.quantity <= (data.reorderLevel || inventory.reorderLevel);
    const availableStock = data.quantity - updatedInventory.reservedQuantity;

    return {
      id: updatedInventory.id,
      product: updatedInventory.product,
      stockQuantity: updatedInventory.quantity,
      reservedQuantity: updatedInventory.reservedQuantity,
      availableStock,
      reorderLevel: updatedInventory.reorderLevel,
      lowStock,
      lastUpdated: updatedInventory.lastUpdated,
    };
  });
};

export const reserveStock = async (productId: string, quantity: number, orderId: string) => {
  return await prisma.$transaction(async (tx) => {
    const inventory = await tx.inventory.findFirst({
      where: { productId },
    });

    if (!inventory) {
      throw new NotFoundError('Inventory not found for this product');
    }

    const availableStock = inventory.quantity - inventory.reservedQuantity;
    if (availableStock < quantity) {
      throw new ConflictError(`Insufficient stock. Available: ${availableStock}, Requested: ${quantity}`);
    }

    const previousReserved = inventory.reservedQuantity;
    const newReservedQuantity = previousReserved + quantity;

    await tx.inventory.update({
      where: { id: inventory.id },
      data: {
        reservedQuantity: newReservedQuantity,
        lastUpdated: new Date(),
      },
    });

    await tx.inventoryHistory.create({
      data: {
        productId,
        action: InventoryAction.RESERVATION,
        quantityChange: quantity,
        previousQuantity: inventory.quantity,
        newQuantity: inventory.quantity,
        orderId,
        performedBy: 'SYSTEM',
        notes: `Stock reserved for order ${orderId}`,
      },
    });

    return {
      success: true,
      reservedQuantity: quantity,
      availableStock: inventory.quantity - newReservedQuantity,
    };
  });
};

export const releaseReservation = async (productId: string, quantity: number, orderId: string) => {
  return await prisma.$transaction(async (tx) => {
    const inventory = await tx.inventory.findFirst({
      where: { productId },
    });

    if (!inventory) {
      throw new NotFoundError('Inventory not found for this product');
    }

    if (inventory.reservedQuantity < quantity) {
      throw new ConflictError('Cannot release more reserved stock than currently reserved');
    }

    const newReservedQuantity = inventory.reservedQuantity - quantity;

    await tx.inventory.update({
      where: { id: inventory.id },
      data: {
        reservedQuantity: newReservedQuantity,
        lastUpdated: new Date(),
      },
    });

    await tx.inventoryHistory.create({
      data: {
        productId,
        action: InventoryAction.RELEASE,
        quantityChange: -quantity,
        previousQuantity: inventory.quantity,
        newQuantity: inventory.quantity,
        orderId,
        performedBy: 'SYSTEM',
        notes: `Stock reservation released for order ${orderId}`,
      },
    });

    return {
      success: true,
      releasedQuantity: quantity,
      reservedQuantity: newReservedQuantity,
    };
  });
};

export const deductStock = async (productId: string, quantity: number, orderId: string) => {
  return await prisma.$transaction(async (tx) => {
    const inventory = await tx.inventory.findFirst({
      where: { productId },
    });

    if (!inventory) {
      throw new NotFoundError('Inventory not found for this product');
    }

    if (inventory.reservedQuantity < quantity) {
      throw new ConflictError('Cannot deduct more than reserved stock');
    }

    const previousQuantity = inventory.quantity;
    const newQuantity = previousQuantity - quantity;
    const newReservedQuantity = inventory.reservedQuantity - quantity;

    if (newQuantity < 0) {
      throw new ConflictError('Stock quantity cannot go negative');
    }

    await tx.inventory.update({
      where: { id: inventory.id },
      data: {
        quantity: newQuantity,
        reservedQuantity: newReservedQuantity,
        lastUpdated: new Date(),
      },
    });

    await tx.inventoryHistory.create({
      data: {
        productId,
        action: InventoryAction.DEDUCTION,
        quantityChange: -quantity,
        previousQuantity,
        newQuantity,
        orderId,
        performedBy: 'SYSTEM',
        notes: `Stock deducted for order ${orderId}`,
      },
    });

    // Update product stock quantity
    await tx.product.update({
      where: { id: productId },
      data: { stockQuantity: newQuantity },
    });

    return {
      success: true,
      deductedQuantity: quantity,
      remainingStock: newQuantity,
    };
  });
};

export const restoreStock = async (productId: string, quantity: number, orderId: string) => {
  return await prisma.$transaction(async (tx) => {
    const inventory = await tx.inventory.findFirst({
      where: { productId },
    });

    if (!inventory) {
      throw new NotFoundError('Inventory not found for this product');
    }

    const previousQuantity = inventory.quantity;
    const newQuantity = previousQuantity + quantity;

    await tx.inventory.update({
      where: { id: inventory.id },
      data: {
        quantity: newQuantity,
        lastUpdated: new Date(),
      },
    });

    await tx.inventoryHistory.create({
      data: {
        productId,
        action: InventoryAction.RETURN,
        quantityChange: quantity,
        previousQuantity,
        newQuantity,
        orderId,
        performedBy: 'SYSTEM',
        notes: `Stock restored for order ${orderId}`,
      },
    });

    // Update product stock quantity
    await tx.product.update({
      where: { id: productId },
      data: { stockQuantity: newQuantity },
    });

    return {
      success: true,
      restoredQuantity: quantity,
      newStockQuantity: newQuantity,
    };
  });
};

export const getLowStockProducts = async () => {
  const inventories = await prisma.inventory.findMany({
    where: {
      quantity: {
        lte: prisma.inventory.fields.reorderLevel,
      },
    },
    include: {
      product: {
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
        },
      },
    },
    orderBy: {
      quantity: 'asc',
    },
  });

  return inventories.map(inv => ({
    id: inv.id,
    product: {
      id: inv.product.id,
      name: inv.product.name,
      nameEn: inv.product.nameEn,
      nameDe: inv.product.nameDe,
      sku: inv.product.sku,
      category: inv.product.category,
      vendor: inv.product.vendor,
    },
    currentStock: inv.quantity,
    reorderLevel: inv.reorderLevel,
    shortage: inv.reorderLevel - inv.quantity,
    lastUpdated: inv.lastUpdated,
  }));
};

export const getInventoryHistory = async (filters: any) => {
  const {
    productId,
    action,
    dateFrom,
    dateTo,
    page = 1,
    limit = 50,
  } = filters;

  const skip = (Number(page) - 1) * Number(limit);
  const where: any = {};

  if (productId) where.productId = productId;
  if (action) where.action = action;
  if (dateFrom || dateTo) {
    where.createdAt = {};
    if (dateFrom) where.createdAt.gte = new Date(dateFrom);
    if (dateTo) where.createdAt.lte = new Date(dateTo);
  }

  const [history, total] = await Promise.all([
    prisma.inventoryHistory.findMany({
      where,
      skip,
      take: Number(limit),
      include: {
        product: {
          select: {
            name: true,
            nameEn: true,
            nameDe: true,
            sku: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.inventoryHistory.count({ where }),
  ]);

  return {
    history: history.map(h => ({
      id: h.id,
      product: h.product,
      action: h.action,
      quantityChange: h.quantityChange,
      previousQuantity: h.previousQuantity,
      newQuantity: h.newQuantity,
      orderId: h.orderId,
      performedBy: h.performedBy,
      notes: h.notes,
      createdAt: h.createdAt,
    })),
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      pages: Math.ceil(total / Number(limit)),
    },
  };
};

export const getInventorySummary = async () => {
  const [
    totalProducts,
    totalInventories,
    lowStockCount,
    outOfStockCount,
    fastMoving,
    slowMoving,
  ] = await Promise.all([
    prisma.product.count({
      where: { status: 'ACTIVE' },
    }),
    prisma.inventory.aggregate({
      _sum: {
        quantity: true,
      },
    }),
    prisma.inventory.count({
      where: {
        quantity: {
          lte: prisma.inventory.fields.reorderLevel,
        },
      },
    }),
    prisma.inventory.count({
      where: {
        quantity: 0,
      },
    }),
    prisma.product.findMany({
      where: { status: 'ACTIVE' },
      orderBy: { soldCount: 'desc' },
      take: 5,
      select: {
        id: true,
        name: true,
        nameEn: true,
        nameDe: true,
        sku: true,
        soldCount: true,
        stockQuantity: true,
        price: true,
        costPrice: true,
      },
    }),
    prisma.product.findMany({
      where: { 
        status: 'ACTIVE',
        soldCount: { lt: 10 },
        stockQuantity: { gt: 50 },
      },
      orderBy: { soldCount: 'asc' },
      take: 5,
      select: {
        id: true,
        name: true,
        nameEn: true,
        nameDe: true,
        sku: true,
        soldCount: true,
        stockQuantity: true,
        price: true,
        costPrice: true,
      },
    }),
  ]);

  // Calculate total stock value
  const stockValue = await prisma.product.aggregate({
    where: { status: 'ACTIVE' },
    _sum: {
      costPrice: true,
    },
  });

  const totalStockValue = await prisma.inventory.aggregate({
    _sum: {
      quantity: true,
    },
  });

  return {
    totalProducts,
    totalStockQuantity: totalInventories._sum.quantity || 0,
    totalStockValue: stockValue._sum.costPrice ? 
      Number(stockValue._sum.costPrice) * (totalStockValue._sum.quantity || 0) : 0,
    lowStockCount,
    outOfStockCount,
    fastMovingProducts: fastMoving.map(p => ({
      ...p,
      stockValue: p.costPrice ? Number(p.costPrice) * p.stockQuantity : 0,
    })),
    slowMovingProducts: slowMoving.map(p => ({
      ...p,
      stockValue: p.costPrice ? Number(p.costPrice) * p.stockQuantity : 0,
    })),
  };
}

async function createLowStockNotification(tx: any, productId: string, userId: string) {
  // This would create a notification for admin dashboard
  // For now, we'll just create an audit log entry
  await tx.auditLog.create({
    data: {
      userId,
      action: 'LOW_STOCK_ALERT',
      entity: 'PRODUCT',
      entityId: productId,
      notes: 'Product stock level is below reorder point',
    },
  });
}
