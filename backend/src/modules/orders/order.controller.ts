import { Request, Response, NextFunction } from 'express';
import * as orderService from './order.service';

export const createOrder = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { deliveryAddressId, billingAddressId, shippingMethod, couponCode } = req.body;
    const order = await orderService.createOrder(req.user!.userId, {
      deliveryAddressId,
      billingAddressId,
      shippingMethod,
      couponCode,
    });
    
    res.status(201).json({
      success: true,
      data: order,
      message: 'Order created successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const getOrderById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const order = await orderService.getOrderById(id, req.user!);
    
    res.json({
      success: true,
      data: order,
    });
  } catch (error) {
    next(error);
  }
};

export const getMyOrders = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await orderService.getMyOrders(req.user!.userId, req.query);
    
    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const getAllOrders = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await orderService.getAllOrders(req.query);
    
    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const updateOrderStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;
    const order = await orderService.updateOrderStatus(id, status, notes, req.user!);
    
    res.json({
      success: true,
      data: order,
      message: 'Order status updated successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const cancelOrder = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const order = await orderService.cancelOrder(id, req.user!);
    
    res.json({
      success: true,
      data: order,
      message: 'Order cancelled successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const getOrderTracking = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const tracking = await orderService.getOrderTracking(id, req.user!);
    
    res.json({
      success: true,
      data: tracking,
    });
  } catch (error) {
    next(error);
  }
};

export const addOrderNote = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { note } = req.body;
    const order = await orderService.addOrderNote(id, note, req.user!);
    
    res.json({
      success: true,
      data: order,
      message: 'Note added successfully',
    });
  } catch (error) {
    next(error);
  }
};
