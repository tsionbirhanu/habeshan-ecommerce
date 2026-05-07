import {
  PrismaClient,
  OrderStatus,
  PaymentStatus,
  UserRole,
  ShipmentMethod,
  PaymentMethod,
} from '@prisma/client';
import { AuthPayload } from '../../types/auth.types';
import { NotFoundError, ForbiddenError, ConflictError } from '../../utils/errors';
import * as cartService from '../cart/cart.service';
import * as inventoryService from '../inventory/inventory.service';
import { CouponService } from '../coupons/coupon.service';

const prisma = new PrismaClient();

interface CreateOrderData {
  deliveryAddressId: string;
  billingAddressId?: string;
  shippingMethod: ShipmentMethod;
  couponCode?: string;
}

// Order status transition rules
const validStatusTransitions: Record<OrderStatus, OrderStatus[]> = {
  [OrderStatus.PENDING_PAYMENT]: [OrderStatus.CONFIRMED, OrderStatus.CANCELLED],
  [OrderStatus.CONFIRMED]: [OrderStatus.PROCESSING, OrderStatus.CANCELLED],
  [OrderStatus.PROCESSING]: [OrderStatus.SHIPPED],
  [OrderStatus.SHIPPED]: [OrderStatus.IN_TRANSIT],
  [OrderStatus.IN_TRANSIT]: [OrderStatus.DELIVERED],
  [OrderStatus.DELIVERED]: [OrderStatus.COMPLETED, OrderStatus.RETURNED],
  [OrderStatus.RETURNED]: [OrderStatus.REFUNDED],
  [OrderStatus.CANCELLED]: [OrderStatus.REFUNDED],
  [OrderStatus.REFUNDED]: [], // Terminal state
  [OrderStatus.COMPLETED]: [], // Terminal state
};

export const createOrder = async (customerId: string, data: CreateOrderData) => {
  // Validate coupon before transaction if provided
  let couponDiscount = 0;
  let couponValidation = null;

  if (data.couponCode) {
    // Get cart to calculate subtotal for coupon validation
    const tempCart = await cartService.getCart(customerId);
    if (tempCart.items.length === 0) {
      throw new ConflictError('Cannot create order with empty cart');
    }

    // Calculate temp subtotal to validate coupon
    let tempSubtotal = 0;
    for (const item of tempCart.items) {
      tempSubtotal += item.currentPrice * item.quantity;
    }

    // Validate coupon with subtotal (before taxes and shipping)
    couponValidation = await CouponService.validateCoupon(data.couponCode, tempSubtotal);

    if (!couponValidation.valid) {
      throw new ConflictError(couponValidation.message);
    }

    couponDiscount = couponValidation.discountAmount;
  }

  return await prisma.$transaction(async (tx) => {
    // Validate cart exists and is not empty
    const cart = await cartService.getCart(customerId);
    if (cart.items.length === 0) {
      throw new ConflictError('Cannot create order with empty cart');
    }

    // Validate addresses belong to customer
    const deliveryAddress = await tx.address.findFirst({
      where: {
        id: data.deliveryAddressId,
        userId: customerId,
      },
    });

    if (!deliveryAddress) {
      throw new NotFoundError('Delivery address not found');
    }

    let billingAddress = deliveryAddress;
    if (data.billingAddressId && data.billingAddressId !== data.deliveryAddressId) {
      const billingAddressResult = await tx.address.findFirst({
        where: {
          id: data.billingAddressId,
          userId: customerId,
        },
      });

      if (!billingAddressResult) {
        throw new NotFoundError('Billing address not found');
      }
      billingAddress = billingAddressResult;
    }

    // Validate all items are in stock
    for (const item of cart.items) {
      if (item.product.stockQuantity < item.quantity) {
        throw new ConflictError(
          `Insufficient stock for ${item.product.name}. Available: ${item.product.stockQuantity}, Requested: ${item.quantity}`
        );
      }
    }

    // Calculate totals with pre-calculated coupon discount
    const totals = calculateOrderTotalsWithCoupon(cart.items, couponDiscount);

    // Create order
    const order = await tx.order.create({
      data: {
        customerId,
        subtotal: totals.subtotal,
        taxAmount: totals.totalTax,
        shippingCost: totals.shippingCost,
        discountAmount: totals.discount,
        totalAmount: totals.total,
        status: OrderStatus.PENDING_PAYMENT,
        paymentStatus: PaymentStatus.PENDING,
        deliveryAddress: deliveryAddress as any,
        billingAddress: billingAddress as any,
        shippingMethod: data.shippingMethod,
        couponCode: data.couponCode,
      },
      include: {
        customer: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    // Create order items (snapshot of products/prices)
    for (const item of cart.items) {
      await tx.orderItem.create({
        data: {
          orderId: order.id,
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: item.currentPrice,
          totalPrice: item.totalPrice,
        },
      });
    }

    // Reserve inventory for all items
    for (const item of cart.items) {
      await inventoryService.reserveStock(item.productId, item.quantity, order.id);
    }

    // Update coupon usage if valid
    if (data.couponCode && totals.discount > 0) {
      await tx.coupon.update({
        where: { code: data.couponCode.toUpperCase() },
        data: {
          currentUses: {
            increment: 1,
          },
        },
      });
    }

    // Create payment record
    await tx.payment.create({
      data: {
        orderId: order.id,
        amount: totals.total,
        status: PaymentStatus.PENDING,
        method: PaymentMethod.STRIPE,
      },
    });

    // Clear cart
    await cartService.clearCart(customerId);

    // Create audit log
    await tx.auditLog.create({
      data: {
        userId: customerId,
        action: 'CREATE_ORDER',
        entity: 'ORDER',
        entityId: order.id,
      },
    });

    // Return order with items
    const createdOrder = await tx.order.findUnique({
      where: { id: order.id },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                nameEn: true,
                nameDe: true,
                sku: true,
                images: true,
              },
            },
          },
        },
        customer: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
        payment: true,
      },
    });

    return {
      orderId: createdOrder!.id,
      status: createdOrder!.status,
      totalAmount: Number(createdOrder!.totalAmount),
      paymentRequired: true,
      order: createdOrder,
    };
  });
};

export const getOrderById = async (orderId: string, user: AuthPayload) => {
  const whereClause: any = { id: orderId };

  // Customers can only see their own orders
  if (user.role === UserRole.CUSTOMER) {
    whereClause.customerId = user.userId;
  }

  const order = await prisma.order.findFirst({
    where: whereClause,
    include: {
      items: {
        include: {
          product: {
            select: {
              id: true,
              name: true,
              nameEn: true,
              nameDe: true,
              nameAm: true,
              sku: true,
              images: true,
              thumbnailUrl: true,
            },
          },
        },
      },
      customer: {
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          phone: true,
        },
      },
      payment: true,
      shipment: true,
      invoice: true,
    },
  });

  if (!order) {
    throw new NotFoundError('Order not found');
  }

  return order;
};

export const getMyOrders = async (customerId: string, filters: any) => {
  const { page = 1, limit = 20, status } = filters;

  const skip = (Number(page) - 1) * Number(limit);
  const where: any = { customerId };

  if (status) {
    where.status = status;
  }

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where,
      skip,
      take: Number(limit),
      include: {
        items: {
          select: {
            id: true,
            quantity: true,
            unitPrice: true,
            totalPrice: true,
            product: {
              select: {
                id: true,
                name: true,
                nameEn: true,
                nameDe: true,
                sku: true,
                images: true,
              },
            },
          },
        },
        payment: {
          select: {
            id: true,
            status: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.order.count({ where }),
  ]);

  return {
    orders: orders.map((order) => ({
      id: order.id,
      status: order.status,
      paymentStatus: order.paymentStatus,
      subtotal: Number(order.subtotal),
      totalAmount: Number(order.totalAmount),
      items: order.items,
      payment: order.payment,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
    })),
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      pages: Math.ceil(total / Number(limit)),
    },
  };
};

export const getAllOrders = async (filters: any) => {
  const { page = 1, limit = 20, status, customerId, dateFrom, dateTo, minAmount, search } = filters;

  const skip = (Number(page) - 1) * Number(limit);
  const where: any = {};

  if (status) where.status = status;
  if (customerId) where.customerId = customerId;
  if (minAmount) where.totalAmount = { gte: minAmount };

  if (dateFrom || dateTo) {
    where.createdAt = {};
    if (dateFrom) where.createdAt.gte = new Date(dateFrom);
    if (dateTo) where.createdAt.lte = new Date(dateTo);
  }

  if (search) {
    where.OR = [
      { customer: { firstName: { contains: search, mode: 'insensitive' } } },
      { customer: { lastName: { contains: search, mode: 'insensitive' } } },
      { customer: { email: { contains: search, mode: 'insensitive' } } },
      { id: { contains: search, mode: 'insensitive' } },
    ];
  }

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where,
      skip,
      take: Number(limit),
      include: {
        customer: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            phone: true,
          },
        },
        items: {
          select: {
            id: true,
            quantity: true,
            unitPrice: true,
            totalPrice: true,
            product: {
              select: {
                id: true,
                name: true,
                nameEn: true,
                nameDe: true,
                sku: true,
              },
            },
          },
        },
        payment: {
          select: {
            id: true,
            status: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.order.count({ where }),
  ]);

  return {
    orders,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      pages: Math.ceil(total / Number(limit)),
    },
  };
};

export const updateOrderStatus = async (
  orderId: string,
  newStatus: OrderStatus,
  _notes?: string,
  user?: AuthPayload
) => {
  return await prisma.$transaction(async (tx) => {
    const order = await tx.order.findUnique({
      where: { id: orderId },
      include: {
        items: true,
      },
    });

    if (!order) {
      throw new NotFoundError('Order not found');
    }

    // Validate status transition
    const validTransitions = validStatusTransitions[order.status];
    if (!validTransitions.includes(newStatus)) {
      throw new ConflictError(`Invalid status transition from ${order.status} to ${newStatus}`);
    }

    // Update order status
    const updatedOrder = await tx.order.update({
      where: { id: orderId },
      data: {
        status: newStatus,
        updatedAt: new Date(),
      },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                sku: true,
              },
            },
          },
        },
        customer: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    // Handle inventory based on status change
    if (newStatus === OrderStatus.CONFIRMED) {
      // Deduct stock for confirmed orders
      for (const item of order.items) {
        await inventoryService.deductStock(item.productId, item.quantity, orderId);
      }
    } else if (newStatus === OrderStatus.CANCELLED) {
      // Release reservations for cancelled orders
      for (const item of order.items) {
        await inventoryService.releaseReservation(item.productId, item.quantity, orderId);
      }
    }

    // Create audit log
    await tx.auditLog.create({
      data: {
        userId: user?.userId || 'SYSTEM',
        action: 'UPDATE_ORDER_STATUS',
        entity: 'ORDER',
        entityId: orderId,
      },
    });

    // TODO: Queue notification to customer
    // This would typically use a message queue or email service

    return updatedOrder;
  });
};

export const cancelOrder = async (orderId: string, user: AuthPayload) => {
  return await prisma.$transaction(async (tx) => {
    const order = await tx.order.findUnique({
      where: { id: orderId },
      include: {
        items: true,
        payment: true,
      },
    });

    if (!order) {
      throw new NotFoundError('Order not found');
    }

    // Check permissions
    if (user.role === UserRole.CUSTOMER && order.customerId !== user.userId) {
      throw new ForbiddenError('You can only cancel your own orders');
    }

    // Customers can only cancel PENDING_PAYMENT or CONFIRMED orders
    if (
      user.role === UserRole.CUSTOMER &&
      order.status !== OrderStatus.PENDING_PAYMENT &&
      order.status !== OrderStatus.CONFIRMED
    ) {
      throw new ConflictError('This order cannot be cancelled at this stage');
    }

    // Update order status
    const updatedOrder = await tx.order.update({
      where: { id: orderId },
      data: {
        status: OrderStatus.CANCELLED,
        updatedAt: new Date(),
      },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                sku: true,
              },
            },
          },
        },
        customer: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    // Release inventory reservations
    for (const item of order.items) {
      await inventoryService.releaseReservation(item.productId, item.quantity, orderId);
    }

    // Initiate refund if payment was made
    if (order.payment && order.payment.status === PaymentStatus.COMPLETED) {
      await tx.payment.update({
        where: { id: order.payment.id },
        data: {
          status: PaymentStatus.REFUNDED,
        },
      });

      // TODO: Process actual refund through payment provider
    }

    // Create audit log
    await tx.auditLog.create({
      data: {
        userId: user.userId,
        action: 'CANCEL_ORDER',
        entity: 'ORDER',
        entityId: orderId,
      },
    });

    // TODO: Queue cancellation email to customer

    return updatedOrder;
  });
};

export const getOrderTracking = async (orderId: string, user: AuthPayload) => {
  const whereClause: any = { id: orderId };

  // Customers can only track their own orders
  if (user.role === UserRole.CUSTOMER) {
    whereClause.customerId = user.userId;
  }

  const order = await prisma.order.findFirst({
    where: whereClause,
    include: {
      items: {
        select: {
          id: true,
          quantity: true,
          product: {
            select: {
              id: true,
              name: true,
              sku: true,
              images: true,
            },
          },
        },
      },
      shipment: true,
      customer: {
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
        },
      },
    },
  });

  if (!order) {
    throw new NotFoundError('Order not found');
  }

  // Create timeline based on order status and timestamps
  const timeline: Array<{
    status: string;
    timestamp: Date;
    notes: string;
  }> = [
    {
      status: OrderStatus.PENDING_PAYMENT,
      timestamp: order.createdAt,
      notes: 'Order placed successfully',
    },
  ];

  // Add status changes based on current status
  if (order.status !== OrderStatus.PENDING_PAYMENT) {
    timeline.push({
      status: OrderStatus.CONFIRMED,
      timestamp: order.updatedAt,
      notes: 'Payment confirmed, order processing started',
    });
  }

  // Add shipment tracking if available
  if (order.shipment) {
    timeline.push({
      status: order.shipment.status,
      timestamp: order.shipment.createdAt,
      notes: `Shipment created - Tracking: ${order.shipment.trackingNumber}`,
    });
  }

  return {
    orderId: order.id,
    status: order.status,
    timeline,
    shipment: order.shipment
      ? {
          trackingNumber: order.shipment.trackingNumber,
          carrier: order.shipment.carrier,
          status: order.shipment.status,
          estimatedDelivery: order.shipment.estimatedDelivery,
        }
      : null,
    items: order.items,
    customer: order.customer,
  };
};

export const addOrderNote = async (orderId: string, _note: string, user: AuthPayload) => {
  if (user.role !== UserRole.ADMIN) {
    throw new ForbiddenError('Only admins can add notes to orders');
  }

  const order = await prisma.order.findUnique({
    where: { id: orderId },
  });

  if (!order) {
    throw new NotFoundError('Order not found');
  }

  // Create audit log entry for the note
  await prisma.auditLog.create({
    data: {
      userId: user.userId,
      action: 'ADD_ORDER_NOTE',
      entity: 'ORDER',
      entityId: orderId,
    },
  });

  // Return updated order
  return await getOrderById(orderId, user);
};

/**
 * Calculate order totals with a pre-calculated discount
 */
function calculateOrderTotalsWithCoupon(items: any[], discount: number = 0) {
  let subtotal = 0;
  let foodSubtotal = 0;
  let generalSubtotal = 0;

  for (const item of items) {
    const itemTotal = item.currentPrice * item.quantity;
    subtotal += itemTotal;

    // Categorize by VAT rate
    if (item.product.vatRate <= 0.1) {
      // 7% or less
      foodSubtotal += itemTotal;
    } else {
      generalSubtotal += itemTotal;
    }
  }

  // Calculate taxes
  const foodTax = foodSubtotal * 0.07;
  const generalTax = generalSubtotal * 0.19;
  const totalTax = foodTax + generalTax;

  // Calculate shipping
  const shippingCost = subtotal >= 50 ? 0 : 4.99;

  // Apply pre-calculated coupon discount
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
