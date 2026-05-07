import { Request, Response, NextFunction } from 'express';
import * as cartService from './cart.service';

export const getCart = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const cart = await cartService.getCart(req.user!.userId);
    
    res.json({
      success: true,
      data: cart,
    });
  } catch (error) {
    next(error);
  }
};

export const addToCart = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { productId, quantity } = req.body;
    const cart = await cartService.addToCart(req.user!.userId, productId, quantity);
    
    res.json({
      success: true,
      data: cart,
      message: 'Product added to cart',
    });
  } catch (error) {
    next(error);
  }
};

export const updateCartItem = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { quantity } = req.body;
    const cart = await cartService.updateCartItem(req.user!.userId, id, quantity);
    
    res.json({
      success: true,
      data: cart,
      message: 'Cart item updated',
    });
  } catch (error) {
    next(error);
  }
};

export const removeFromCart = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const cart = await cartService.removeFromCart(req.user!.userId, id);
    
    res.json({
      success: true,
      data: cart,
      message: 'Item removed from cart',
    });
  } catch (error) {
    next(error);
  }
};

export const clearCart = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await cartService.clearCart(req.user!.userId);
    
    res.json({
      success: true,
      message: 'Cart cleared',
    });
  } catch (error) {
    next(error);
  }
};

export const validateCart = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validation = await cartService.validateCart(req.user!.userId);
    
    res.json({
      success: true,
      data: validation,
    });
  } catch (error) {
    next(error);
  }
};

export const applyCoupon = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { couponCode, orderTotal } = req.body;
    const result = await cartService.applyCoupon(couponCode, orderTotal);
    
    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};
