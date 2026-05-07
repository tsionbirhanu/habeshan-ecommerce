import {
  PrismaClient,
  UserRole,
  ProductStatus,
  OrderStatus,
  CouponType,
  PaymentStatus,
  PaymentMethod,
} from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

interface CreateTestUserOptions {
  role?: UserRole;
  email?: string;
  firstName?: string;
  lastName?: string;
}

interface CreateTestProductOptions {
  name?: string;
  categoryId?: string;
  vendorId?: string;
  price?: number;
  stockQuantity?: number;
  status?: ProductStatus;
}

interface CreateTestOrderOptions {
  status?: OrderStatus;
  couponCode?: string;
  deliveryAddressId?: string;
}

interface CreateTestCouponOptions {
  code?: string;
  type?: CouponType;
  value?: number;
  isActive?: boolean;
  maxUses?: number;
}

/**
 * Factory: Create test user with default values
 */
export async function createTestUser(options: CreateTestUserOptions = {}) {
  const {
    role = 'CUSTOMER',
    email = `user-${Date.now()}@test.com`,
    firstName = 'Test',
    lastName = 'User',
  } = options;

  const hashedPassword = await bcrypt.hash('TestPassword123!', 10);

  return prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      firstName,
      lastName,
      role,
      isActive: true,
    },
  });
}

/**
 * Factory: Create test category
 */
export async function createTestCategory(name: string = `Category-${Date.now()}`) {
  return prisma.category.create({
    data: {
      name,
      nameEn: name,
      nameDe: `${name} (DE)`,
      nameAm: `${name} (AM)`,
      slug: name.toLowerCase().replace(/\s+/g, '-'),
      isActive: true,
    },
  });
}

/**
 * Factory: Create test product
 */
export async function createTestProduct(options: CreateTestProductOptions = {}) {
  let categoryId = options.categoryId;

  // Create category if not provided
  if (!categoryId) {
    const category = await createTestCategory();
    categoryId = category.id;
  }

  const {
    name = `Product-${Date.now()}`,
    price = 29.99,
    stockQuantity = 100,
    status = ProductStatus.ACTIVE,
  } = options;

  return prisma.product.create({
    data: {
      name,
      nameEn: name,
      nameDe: `${name} (DE)`,
      slug: `${name.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`,
      categoryId,
      vendorId: options.vendorId,
      price,
      sku: `SKU-${Date.now()}`,
      status,
      stockQuantity,
      reorderLevel: 5,
      vatRate: 0.19,
      createdBy: 'test-user',
      images: [],
    },
  });
}

/**
 * Factory: Create test address for user
 */
export async function createTestAddress(userId: string, isDefault: boolean = true) {
  return prisma.address.create({
    data: {
      userId,
      street: '123 Test Street',
      city: 'Berlin',
      postalCode: '10115',
      country: 'Germany',
      isDefault,
      label: isDefault ? 'Home' : 'Work',
    },
  });
}

/**
 * Factory: Create test cart and add items
 */
export async function createTestCart(userId: string, productIds: string[] = []) {
  let cart = await prisma.cart.findUnique({ where: { customerId: userId } });

  if (!cart) {
    cart = await prisma.cart.create({
      data: { customerId: userId },
    });
  }

  // Add products to cart
  for (const productId of productIds) {
    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (product) {
      await prisma.cartItem.create({
        data: {
          cartId: cart.id,
          productId,
          quantity: 1,
          priceAtAdd: product.price,
        },
      });
    }
  }

  return cart;
}

/**
 * Factory: Create test order
 */
export async function createTestOrder(customerId: string, options: CreateTestOrderOptions = {}) {
  // Create address if not provided
  let deliveryAddressId = options.deliveryAddressId;
  if (!deliveryAddressId) {
    const address = await createTestAddress(customerId);
    deliveryAddressId = address.id;
  }

  const { status = OrderStatus.PENDING_PAYMENT, couponCode } = options;

  return prisma.order.create({
    data: {
      customerId,
      status,
      paymentStatus: 'PENDING',
      subtotal: 100.0,
      taxAmount: 19.0,
      shippingCost: 4.99,
      discountAmount: 0,
      totalAmount: 123.99,
      shippingMethod: 'DHL',
      couponCode,
      deliveryAddress: {
        street: '123 Test Street',
        city: 'Berlin',
        postalCode: '10115',
        country: 'Germany',
      },
      billingAddress: {
        street: '123 Test Street',
        city: 'Berlin',
        postalCode: '10115',
        country: 'Germany',
      },
    },
    include: { customer: true },
  });
}

/**
 * Factory: Create test coupon
 */
export async function createTestCoupon(options: CreateTestCouponOptions = {}) {
  const {
    code = `TESTCOUPON${Date.now().toString().slice(-6)}`,
    type = CouponType.PERCENTAGE,
    value = 10,
    isActive = true,
    maxUses = 100,
  } = options;

  return prisma.coupon.create({
    data: {
      code: code.toUpperCase(),
      type,
      value,
      isActive,
      maxUses,
      minOrderValue: 25.0,
      currentUses: 0,
    },
  });
}

/**
 * Factory: Create test payment
 */
export async function createTestPayment(
  orderId: string,
  status: PaymentStatus = PaymentStatus.PENDING
) {
  return prisma.payment.create({
    data: {
      orderId,
      amount: 123.99,
      method: PaymentMethod.STRIPE,
      status,
      transactionId: `txn_${Date.now()}`,
    },
  });
}

/**
 * Factory: Create test review
 */
export async function createTestReview(productId: string, customerId: string, rating: number = 5) {
  // Get or create an order for verification
  const order = await prisma.order.findFirst({
    where: { customerId },
  });

  if (!order) {
    const newOrder = await createTestOrder(customerId);
    return prisma.review.create({
      data: {
        productId,
        customerId,
        orderId: newOrder.id,
        rating,
        title: 'Great product!',
        content: 'This is a test review',
        isVerifiedPurchase: true,
        status: 'APPROVED',
      },
    });
  }

  return prisma.review.create({
    data: {
      productId,
      customerId,
      orderId: order.id,
      rating,
      title: 'Great product!',
      content: 'This is a test review',
      isVerifiedPurchase: true,
      status: 'APPROVED',
    },
  });
}

export default {
  createTestUser,
  createTestCategory,
  createTestProduct,
  createTestAddress,
  createTestCart,
  createTestOrder,
  createTestCoupon,
  createTestPayment,
  createTestReview,
};
