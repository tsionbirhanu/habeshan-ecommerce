import { Request, Response, NextFunction } from 'express';
import * as analyticsService from './analytics.service';
import {
  SalesReportQuery,
  ProductReportQuery,
  PaymentReportQuery,
  ExportReportQuery,
} from './analytics.validation';
import logger from '../../utils/logger';

/**
 * GET /api/analytics/sales
 * Sales report with revenue, order count, AOV by time period
 */
export const getSalesReport = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const query: SalesReportQuery = {
      dateFrom: req.query.dateFrom as string | undefined,
      dateTo: req.query.dateTo as string | undefined,
      groupBy: (req.query.groupBy as any) || 'day',
    };

    const report = await analyticsService.getSalesReport(query);

    res.json({
      success: true,
      data: report,
      message: 'Sales report generated',
    });
  } catch (error) {
    logger.error('Error generating sales report:', error);
    next(error);
  }
};

/**
 * GET /api/analytics/products
 * Product report with per-product metrics and slow/fast movers
 */
export const getProductReport = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const query: ProductReportQuery = {
      dateFrom: req.query.dateFrom as string | undefined,
      dateTo: req.query.dateTo as string | undefined,
      categoryId: req.query.categoryId as string | undefined,
      sortBy: (req.query.sortBy as any) || 'revenue',
      limit: parseInt((req.query.limit as string) || '100'),
    };

    const report = await analyticsService.getProductReport(query);

    res.json({
      success: true,
      data: report,
      message: 'Product report generated',
    });
  } catch (error) {
    logger.error('Error generating product report:', error);
    next(error);
  }
};

/**
 * GET /api/analytics/customers
 * Customer report with new vs returning, top spenders, geo distribution
 */
export const getCustomerReport = async (
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const report = await analyticsService.getCustomerReport({});

    res.json({
      success: true,
      data: report,
      message: 'Customer report generated',
    });
  } catch (error) {
    logger.error('Error generating customer report:', error);
    next(error);
  }
};

/**
 * GET /api/analytics/inventory
 * Inventory report with value, turnover, out-of-stock, slow/fast movers
 */
export const getInventoryReport = async (
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const report = await analyticsService.getInventoryReport({});

    res.json({
      success: true,
      data: report,
      message: 'Inventory report generated',
    });
  } catch (error) {
    logger.error('Error generating inventory report:', error);
    next(error);
  }
};

/**
 * GET /api/analytics/payments
 * Payment report with method breakdown, success/failure rates, refunds
 */
export const getPaymentReport = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const query: PaymentReportQuery = {
      dateFrom: req.query.dateFrom as string | undefined,
      dateTo: req.query.dateTo as string | undefined,
    };

    const report = await analyticsService.getPaymentReport(query);

    res.json({
      success: true,
      data: report,
      message: 'Payment report generated',
    });
  } catch (error) {
    logger.error('Error generating payment report:', error);
    next(error);
  }
};

/**
 * GET /api/analytics/export
 * Export report in CSV or JSON format
 */
export const exportReport = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const query: ExportReportQuery = {
      type: req.query.type as any,
      dateFrom: req.query.dateFrom as string | undefined,
      dateTo: req.query.dateTo as string | undefined,
      format: (req.query.format as any) || 'json',
    };

    if (!query.type) {
      res.status(400).json({
        success: false,
        error: 'Report type is required',
      });
      return;
    }

    if (query.format === 'csv') {
      // Generate CSV
      const csvData = await analyticsService.generateCSVReport(
        query.type,
        query.dateFrom,
        query.dateTo
      );

      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="${query.type}-report-${new Date().toISOString().split('T')[0]}.csv"`
      );
      res.send(csvData);
    } else {
      // Generate JSON
      let report: any;

      if (query.type === 'sales') {
        report = await analyticsService.getSalesReport({
          dateFrom: query.dateFrom,
          dateTo: query.dateTo,
          groupBy: 'day',
        });
      } else if (query.type === 'products') {
        report = await analyticsService.getProductReport({
          dateFrom: query.dateFrom,
          dateTo: query.dateTo,
          sortBy: 'revenue',
          limit: 100,
        });
      } else if (query.type === 'customers') {
        report = await analyticsService.getCustomerReport({});
      } else if (query.type === 'inventory') {
        report = await analyticsService.getInventoryReport({});
      } else if (query.type === 'payments') {
        report = await analyticsService.getPaymentReport({
          dateFrom: query.dateFrom,
          dateTo: query.dateTo,
        });
      }

      res.json({
        success: true,
        data: report,
        message: `${query.type} report exported`,
      });
    }
  } catch (error) {
    logger.error('Error exporting report:', error);
    next(error);
  }
};
