import { PrismaClient, ProductStatus } from '@prisma/client';
import { NotFoundError, ConflictError } from '../../utils/errors';

const prisma = new PrismaClient();

interface CartTotals {
  subtotal: number;
  taxBreakdown: {
    food: number;
    general: number;
  };
  totalTax: number;
  shippingCost: number;
  discount: number;
  total: number;
}

interface CartItemDetails {
  id: string;
  productId: string;
  quantity: number;
  priceAtAdd: number;
  addedAt: Date;
  product: {
    id: string;
    name: string;
    nameEn: string;
    nameDe: string;
    nameAm?: string;
    sku: string;
    price: number;
    vatRate: number;
    stockQuantity: number;
    status: ProductStatus;
    category: {
      id: string;
      name: string;
      nameEn: string;
      nameDe: string;
    };
    images: string[];
    thumbnailUrl?: string;
  };
  currentPrice: number;
  totalPrice: number;
  warnings: string[];
}

interface CartResponse {
  id: string;
  customerId: string;
  items: CartItemDetails[];
  totals: CartTotals;
  warnings: string[];
  createdAt: Date;
  updatedAt: Date;
}

export const getCart = async (customerId: string): Promise<CartResponse> => {
  let cart = await prisma.cart.findUnique({
    where: { customerId },
    include: {
      items: {
        include: {
          product: {
            include: {
              category: true,
            },
          },
        },
        orderBy: { addedAt: 'desc' },
      },
    },
  });

  // Create cart if it doesn't exist
  if (!cart) {
    cart = await prisma.cart.create({
      data: { customerId },
      include: {
        items: {
          include: {
            product: {
              include: {
                category: true,
              },
            },
          },
        },
      },
    });
  }

  const itemsWithDetails = await Promise.all(
    cart.items.map(async (item: any) => {
      const warnings: string[] = [];
      
      // Check if product is still active
      if (item.product.status !== ProductStatus.ACTIVE) {
        warnings.push('Product is no longer available');
      }

      // Check if price has changed
      if (Number(item.product.price) !== Number(item.priceAtAdd)) {
        warnings.push('Price changed since added to cart');
      }

      // Check stock availability
      const availableStock = item.product.stockQuantity;
      if (availableStock < item.quantity) {
        warnings.push(`Only ${availableStock} left in stock`);
      }

      return {
        id: item.id,
        productId: item.productId,
        quantity: item.quantity,
        priceAtAdd: Number(item.priceAtAdd),
        addedAt: item.addedAt,
        product: {
          id: item.product.id,
          name: item.product.name,
          nameEn: item.product.nameEn,
          nameDe: item.product.nameDe,
          nameAm: item.product.nameAm || undefined,
          sku: item.product.sku,
          price: Number(item.product.price),
          vatRate: Number(item.product.vatRate),
          stockQuantity: item.product.stockQuantity,
          status: item.product.status,
          category: {
            id: item.product.category.id,
            name: item.product.category.name,
            nameEn: item.product.category.nameEn,
            nameDe: item.product.category.nameDe,
          },
          images: item.product.images,
          thumbnailUrl: item.product.thumbnailUrl || undefined,
        },
        currentPrice: Number(item.product.price),
        totalPrice: Number(item.product.price) * item.quantity,
        warnings,
      };
    })
  );

  const totals = calculateTotals(itemsWithDetails);
  const allWarnings = itemsWithDetails.flatMap((item: any) => item.warnings);

  return {
    id: cart.id,
    customerId: cart.customerId,
    items: itemsWithDetails,
    totals,
    warnings: allWarnings,
    createdAt: cart.createdAt,
    updatedAt: cart.updatedAt,
  };
};

export const addToCart = async (customerId: string, productId: string, quantity: number): Promise<CartResponse> => {
  if (quantity <= 0) {
    throw new ConflictError('Quantity must be positive');
  }

  return await prisma.$transaction(async (tx) => {
    // Validate product
    const product = await tx.product.findUnique({
      where: { id: productId },
      include: { category: true },
    });

    if (!product) {
      throw new NotFoundError('Product not found');
    }

    if (product.status !== ProductStatus.ACTIVE) {
      throw new ConflictError('Product is not available');
    }

    // Check stock availability
    if (product.stockQuantity < quantity) {
      throw new ConflictError(`Insufficient stock. Available: ${product.stockQuantity}, Requested: ${quantity}`);
    }

    // Get or create cart
    let cart = await tx.cart.findUnique({
      where: { customerId },
    });

    if (!cart) {
      cart = await tx.cart.create({
        data: { customerId },
      });
    }

    // Check if item already exists in cart
    const existingItem = await tx.cartItem.findFirst({
      where: {
        cartId: cart.id,
        productId,
      },
    });

    if (existingItem) {
      const newQuantity = existingItem.quantity + quantity;
      
      // Check if new quantity exceeds stock
      if (product.stockQuantity < newQuantity) {
        throw new ConflictError(`Insufficient stock. Available: ${product.stockQuantity}, Requested: ${newQuantity}`);
      }

      await tx.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: newQuantity },
      });
    } else {
      await tx.cartItem.create({
        data: {
          cartId: cart.id,
          productId,
          quantity,
          priceAtAdd: product.price,
        },
      });
    }

    return await getCart(customerId);
  });
};

export const updateCartItem = async (customerId: string, cartItemId: string, quantity: number): Promise<CartResponse> => {
  if (quantity < 0) {
    throw new ConflictError('Quantity cannot be negative');
  }

  return await prisma.$transaction(async (tx) => {
    // Validate cart item ownership
    const cartItem = await tx.cartItem.findFirst({
      where: {
        id: cartItemId,
        cart: { customerId },
      },
      include: {
        product: true,
      },
    });

    if (!cartItem) {
      throw new NotFoundError('Cart item not found');
    }

    if (quantity === 0) {
      // Remove item if quantity is 0
      await tx.cartItem.delete({
        where: { id: cartItemId },
      });
    } else {
      // Check stock availability
      if (cartItem.product.stockQuantity < quantity) {
        throw new ConflictError(`Insufficient stock. Available: ${cartItem.product.stockQuantity}, Requested: ${quantity}`);
      }

      // Update quantity
      await tx.cartItem.update({
        where: { id: cartItemId },
        data: { quantity },
      });
    }

    return await getCart(customerId);
  });
};

export const removeFromCart = async (customerId: string, cartItemId: string): Promise<CartResponse> => {
  return await prisma.$transaction(async (tx) => {
    // Validate cart item ownership
    const cartItem = await tx.cartItem.findFirst({
      where: {
        id: cartItemId,
        cart: { customerId },
      },
    });

    if (!cartItem) {
      throw new NotFoundError('Cart item not found');
    }

    // Remove item
    await tx.cartItem.delete({
      where: { id: cartItemId },
    });

    return await getCart(customerId);
  });
};

export const clearCart = async (customerId: string): Promise<void> => {
  await prisma.$transaction(async (tx) => {
    const cart = await tx.cart.findUnique({
      where: { customerId },
    });

    if (cart) {
      await tx.cartItem.deleteMany({
        where: { cartId: cart.id },
      });
    }
  });
};

export const validateCart = async (customerId: string) => {
  const cart = await getCart(customerId);
  const issues: Array<{
    productId: string;
    issue: string;
    severity: 'error' | 'warning';
  }> = [];

  for (const item of cart.items) {
    // Check if product is still active
    if (item.product.status !== ProductStatus.ACTIVE) {
      issues.push({
        productId: item.productId,
        issue: 'Product is no longer available',
        severity: 'error',
      });
    }

    // Check stock availability
    if (item.product.stockQuantity < item.quantity) {
      issues.push({
        productId: item.productId,
        issue: `Insufficient stock. Available: ${item.product.stockQuantity}, Requested: ${item.quantity}`,
        severity: 'error',
      });
    }

    // Check for price changes
    if (item.currentPrice !== item.priceAtAdd) {
      issues.push({
        productId: item.productId,
        issue: 'Price has changed since added to cart',
        severity: 'warning',
      });
    }
  }

  return {
    valid: issues.filter(i => i.severity === 'error').length === 0,
    issues,
    cart,
  };
};

export const applyCoupon = async (couponCode: string, orderTotal: number) => {
  const coupon = await prisma.coupon.findUnique({
    where: { code: couponCode.toUpperCase() },
  });

  if (!coupon) {
    return {
      valid: false,
      discount: 0,
      message: 'Invalid coupon code',
    };
  }

  if (!coupon.isActive) {
    return {
      valid: false,
      discount: 0,
      message: 'Coupon is not active',
    };
  }

  if (coupon.expiresAt && coupon.expiresAt < new Date()) {
    return {
      valid: false,
      discount: 0,
      message: 'Coupon has expired',
    };
  }

  if (coupon.maxUses && coupon.currentUses >= coupon.maxUses) {
    return {
      valid: false,
      discount: 0,
      message: 'Coupon usage limit exceeded',
    };
  }

  if (coupon.minOrderValue && orderTotal < Number(coupon.minOrderValue)) {
    return {
      valid: false,
      discount: 0,
      message: `Minimum order value of ${coupon.minOrderValue} required`,
    };
  }

  let discount = 0;
  if (coupon.type === 'PERCENTAGE') {
    discount = orderTotal * (Number(coupon.value) / 100);
  } else if (coupon.type === 'FIXED_AMOUNT') {
    discount = Number(coupon.value);
  }

  // Ensure discount doesn't exceed order total
  discount = Math.min(discount, orderTotal);

  return {
    valid: true,
    discount: Math.round(discount * 100) / 100, // Round to 2 decimal places
    message: 'Coupon applied successfully',
    couponType: coupon.type,
    couponValue: coupon.value,
  };
};

function calculateTotals(items: CartItemDetails[]): CartTotals {
  let subtotal = 0;
  let foodSubtotal = 0;
  let generalSubtotal = 0;
  let totalWeight = 0;

  for (const item of items) {
    const itemTotal = item.currentPrice * item.quantity;
    subtotal += itemTotal;

    // Categorize by VAT rate (7% for food/spices, 19% for general goods)
    if (item.product.vatRate <= 0.1) { // 7% or less
      foodSubtotal += itemTotal;
    } else {
      generalSubtotal += itemTotal;
    }

    // Calculate weight for shipping (assuming weight is stored in product)
    // For now, we'll use a simple estimation
    totalWeight += item.quantity * 0.5; // Assuming 0.5kg per item average
  }

  // Calculate taxes
  const foodTax = foodSubtotal * 0.07;
  const generalTax = generalSubtotal * 0.19;
  const totalTax = foodTax + generalTax;

  // Calculate shipping (free shipping over €50, otherwise €4.99)
  const shippingCost = subtotal >= 50 ? 0 : 4.99;

  // No discount by default (will be applied separately)
  const discount = 0;

  const total = subtotal + totalTax + shippingCost - discount;

  return {
    subtotal: Math.round(subtotal * 100) / 100,
    taxBreakdown: {
      food: Math.round(foodTax * 100) / 100,
      general: Math.round(generalTax * 100) / 100,
    },
    totalTax: Math.round(totalTax * 100) / 100,
    shippingCost: Math.round(shippingCost * 100) / 100,
    discount: Math.round(discount * 100) / 100,
    total: Math.round(total * 100) / 100,
  };
}

export function calculateTotalsWithCoupon(
  items: CartItemDetails[],
  couponCode?: string
): CartTotals {
  const totals = calculateTotals(items);

  if (couponCode) {
    // This would be called from the applyCoupon endpoint
    // For now, we'll just return the base totals
  }

  return totals;
}
