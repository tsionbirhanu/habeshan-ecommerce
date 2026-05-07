import { prisma } from '../../database/prisma';

export class DashboardService {
  /**
   * Get basic aggregated KPIs: Revenue, Orders, Customers, Products
   */
  static async getDashboardStats() {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    // This Week (starting Monday as an approximation, or just last 7 days)
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // 1. Revenue
    const [todayRev, weekRev, monthRev, yearRev] = await Promise.all([
      prisma.order.aggregate({
        where: {
          createdAt: { gte: startOfToday },
          status: { notIn: ['CANCELLED', 'RETURNED', 'REFUNDED'] },
        },
        _sum: { totalAmount: true },
      }),
      prisma.order.aggregate({
        where: {
          createdAt: { gte: startOfWeek },
          status: { notIn: ['CANCELLED', 'RETURNED', 'REFUNDED'] },
        },
        _sum: { totalAmount: true },
      }),
      prisma.order.aggregate({
        where: {
          createdAt: { gte: startOfMonth },
          status: { notIn: ['CANCELLED', 'RETURNED', 'REFUNDED'] },
        },
        _sum: { totalAmount: true },
      }),
      prisma.order.aggregate({
        where: {
          createdAt: { gte: startOfYear },
          status: { notIn: ['CANCELLED', 'RETURNED', 'REFUNDED'] },
        },
        _sum: { totalAmount: true },
      }),
    ]);

    // 2. Orders
    const [totalOrders, pendingOrders, processingOrders, todayOrders] = await Promise.all([
      prisma.order.count(),
      prisma.order.count({ where: { status: 'PENDING_PAYMENT' } }),
      prisma.order.count({ where: { status: 'PROCESSING' } }),
      prisma.order.count({ where: { createdAt: { gte: startOfToday } } }),
    ]);

    // 3. Customers
    const [totalCustomers, newCustomers, activeCustomers] = await Promise.all([
      prisma.user.count({ where: { role: 'CUSTOMER' } }),
      prisma.user.count({ where: { role: 'CUSTOMER', createdAt: { gte: thirtyDaysAgo } } }),
      prisma.user.count({ where: { role: 'CUSTOMER', isActive: true } }),
    ]);

    // 4. Products
    const [totalProducts, activeProducts, outOfStockProducts] = await Promise.all([
      prisma.product.count(),
      prisma.product.count({ where: { status: 'ACTIVE' } }),
      prisma.product.count({ where: { stockQuantity: { lte: 0 } } }),
    ]);

    // For low stock: stockQuantity <= reorderLevel and stock > 0
    const lowStockCountQuery = await prisma.$queryRaw<[{ count: number }]>`
      SELECT CAST(COUNT(*) AS INTEGER) as count FROM "Product" WHERE "stockQuantity" > 0 AND "stockQuantity" <= "reorderLevel"
    `;

    return {
      revenue: {
        today: todayRev._sum.totalAmount || 0,
        thisWeek: weekRev._sum.totalAmount || 0,
        thisMonth: monthRev._sum.totalAmount || 0,
        thisYear: yearRev._sum.totalAmount || 0,
      },
      orders: {
        total: totalOrders,
        pending: pendingOrders,
        processing: processingOrders,
        today: todayOrders,
      },
      customers: {
        total: totalCustomers,
        new: newCustomers,
        active: activeCustomers,
      },
      products: {
        total: totalProducts,
        active: activeProducts,
        outOfStock: outOfStockProducts,
        lowStock: lowStockCountQuery[0]?.count || 0,
      },
    };
  }

  /**
   * Get chart data for sales over a period (7d | 30d | 12m)
   */
  static async getSalesChart(period: '7d' | '30d' | '12m') {
    // Generate dates based on period
    const now = new Date();
    const startDate = new Date();
    let dateFormat = 'YYYY-MM-DD';

    if (period === '7d') {
      startDate.setDate(now.getDate() - 7);
    } else if (period === '30d') {
      startDate.setDate(now.getDate() - 30);
    } else if (period === '12m') {
      startDate.setMonth(now.getMonth() - 12);
      dateFormat = 'YYYY-MM'; // group by month
    }

    // Using raw SQL to group by date handling postgres to_char
    const result = await prisma.$queryRaw<
      Array<{ date: string; revenue: number; orderCount: number }>
    >`
      SELECT 
        to_char("createdAt", ${dateFormat}) as date,
        SUM("totalAmount") as revenue,
        CAST(COUNT(id) AS INTEGER) as "orderCount"
      FROM "Order"
      WHERE "createdAt" >= ${startDate} AND status NOT IN ('CANCELLED', 'RETURNED', 'REFUNDED')
      GROUP BY date
      ORDER BY date ASC
    `;

    return result.map((r) => ({
      date: r.date,
      revenue: r.revenue || 0,
      orderCount: r.orderCount || 0,
    }));
  }

  /**
   * Get top products by soldCount or revenue
   */
  static async getTopProducts(limit: number = 10, period?: '7d' | '30d' | '12m') {
    // If period is provided, we should join orderItem and order to filter by date.
    // If no period, we can just use the Product table's soldCount and orderItems aggregation.

    if (period) {
      const now = new Date();
      const startDate = new Date();
      if (period === '7d') startDate.setDate(now.getDate() - 7);
      if (period === '30d') startDate.setDate(now.getDate() - 30);
      if (period === '12m') startDate.setMonth(now.getMonth() - 12);

      const result = await prisma.$queryRaw<
        Array<{ id: string; name: string; soldCount: number; revenue: number }>
      >`
        SELECT 
          p.id, p.name, 
          CAST(SUM(oi.quantity) AS INTEGER) as "soldCount",
          SUM(oi."totalPrice") as revenue
        FROM "OrderItem" oi
        JOIN "Product" p ON p.id = oi."productId"
        JOIN "Order" o ON o.id = oi."orderId"
        WHERE o."createdAt" >= ${startDate} AND o.status NOT IN ('CANCELLED', 'RETURNED', 'REFUNDED')
        GROUP BY p.id, p.name
        ORDER BY revenue DESC
        LIMIT ${limit}
      `;

      return result.map((r) => ({
        product: r.name,
        soldCount: r.soldCount || 0,
        revenue: r.revenue || 0,
      }));
    }

    // Fallback: lifetime stats
    const products = await prisma.product.findMany({
      take: limit,
      orderBy: { soldCount: 'desc' },
      select: {
        name: true,
        soldCount: true,
        orderItems: {
          select: { totalPrice: true },
        },
      },
    });

    return products.map((p) => {
      const revenue = p.orderItems.reduce((acc, item) => acc + Number(item.totalPrice), 0);
      return {
        product: p.name,
        soldCount: p.soldCount,
        revenue,
      };
    });
  }

  /**
   * Get recent orders with customer and status
   */
  static async getRecentOrders(limit: number = 10) {
    return prisma.order.findMany({
      take: limit,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        totalAmount: true,
        status: true,
        createdAt: true,
        customer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });
  }

  /**
   * Get actionable alerts
   */
  static async getDashboardAlerts() {
    const last24h = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const [pendingReviewsCount, pendingVendorsCount, failedPaymentsCount, recentRefundsCount] =
      await Promise.all([
        prisma.review.count({ where: { status: 'PENDING' } }),
        prisma.vendor.count({ where: { isApproved: false } }),
        prisma.payment.count({ where: { status: 'FAILED', createdAt: { gte: last24h } } }),
        prisma.order.count({ where: { status: 'REFUNDED', updatedAt: { gte: last24h } } }),
      ]);

    // Low stock items
    const lowStockItems = await prisma.$queryRaw<
      Array<{ id: string; name: string; currentStock: number; reorderLevel: number }>
    >`
      SELECT id, name, "stockQuantity" as "currentStock", "reorderLevel"
      FROM "Product"
      WHERE "stockQuantity" <= "reorderLevel" AND "stockQuantity" > 0 AND status = 'ACTIVE'
      LIMIT 10
    `;

    return {
      lowStock: lowStockItems.map((item) => ({
        product: item.name,
        currentStock: item.currentStock,
        reorderLevel: item.reorderLevel,
      })),
      pendingReviews: pendingReviewsCount,
      pendingVendors: pendingVendorsCount,
      failedPayments: failedPaymentsCount,
      recentRefunds: recentRefundsCount,
    };
  }
}
