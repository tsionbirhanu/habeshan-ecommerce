import { Request, Response, NextFunction } from 'express';
import { DashboardService } from './dashboard.service';

export const getDashboardStats = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const stats = await DashboardService.getDashboardStats();
    res.status(200).json({
      status: 'success',
      data: stats,
    });
  } catch (error) {
    next(error);
  }
};

export const getSalesChart = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const period = (req.query.period as '7d' | '30d' | '12m') || '7d';
    const chartData = await DashboardService.getSalesChart(period);

    res.status(200).json({
      status: 'success',
      data: chartData,
    });
  } catch (error) {
    next(error);
  }
};

export const getTopProducts = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const limit = parseInt(req.query.limit as string) || 10;
    const period = req.query.period as '7d' | '30d' | '12m' | undefined;

    const products = await DashboardService.getTopProducts(limit, period);

    res.status(200).json({
      status: 'success',
      data: products,
    });
  } catch (error) {
    next(error);
  }
};

export const getRecentOrders = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const limit = parseInt(req.query.limit as string) || 10;

    const orders = await DashboardService.getRecentOrders(limit);

    res.status(200).json({
      status: 'success',
      data: orders,
    });
  } catch (error) {
    next(error);
  }
};

export const getDashboardAlerts = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const alerts = await DashboardService.getDashboardAlerts();

    res.status(200).json({
      status: 'success',
      data: alerts,
    });
  } catch (error) {
    next(error);
  }
};
