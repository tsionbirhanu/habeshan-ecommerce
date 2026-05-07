import { Request, Response, NextFunction } from 'express';
import * as inventoryService from './inventory.service';

export const getInventoryList = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await inventoryService.getInventory(req.query, req.user!);
    
    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const getProductInventory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { productId } = req.params;
    const result = await inventoryService.getProductInventory(productId, req.user!);
    
    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const updateInventory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { productId } = req.params;
    const result = await inventoryService.manualAdjustment(productId, req.body, req.user!);
    
    res.json({
      success: true,
      data: result,
      message: 'Inventory updated successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const getLowStockAlerts = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const alerts = await inventoryService.getLowStockProducts();
    
    res.json({
      success: true,
      data: alerts,
    });
  } catch (error) {
    next(error);
  }
};

export const getInventoryHistory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await inventoryService.getInventoryHistory(req.query);
    
    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const getInventorySummary = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const summary = await inventoryService.getInventorySummary();
    
    res.json({
      success: true,
      data: summary,
    });
  } catch (error) {
    next(error);
  }
};
