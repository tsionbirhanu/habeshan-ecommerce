import { Request, Response, NextFunction } from 'express';
import * as productService from './product.service';

export const createProduct = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const product = await productService.createProduct(req.body, req.user!.userId);
    
    res.status(201).json({
      success: true,
      data: product,
      message: 'Product created successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const getAllProducts = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await productService.getAllProducts(req.query, req.user?.role);
    
    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const getProductById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const product = await productService.getProductById(id, req.user?.role);
    
    res.json({
      success: true,
      data: product,
    });
  } catch (error) {
    next(error);
  }
};

export const updateProduct = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const product = await productService.updateProduct(id, req.body, req.user!);
    
    res.json({
      success: true,
      data: product,
      message: 'Product updated successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const deleteProduct = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    await productService.deleteProduct(id);
    
    res.json({
      success: true,
      message: 'Product discontinued',
    });
  } catch (error) {
    next(error);
  }
};

export const uploadProductImages = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const images = (req as any).files as any[];
    
    const product = await productService.uploadProductImages(id, images, req.user!);
    
    res.json({
      success: true,
      data: product,
      message: 'Images uploaded successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const searchProducts = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await productService.searchProducts(req.query);
    
    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const getRelatedProducts = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const products = await productService.getRelatedProducts(id);
    
    res.json({
      success: true,
      data: products,
    });
  } catch (error) {
    next(error);
  }
};

export const getFeaturedProducts = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const products = await productService.getFeaturedProducts();
    
    res.json({
      success: true,
      data: products,
    });
  } catch (error) {
    next(error);
  }
};

export const getNewArrivals = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const products = await productService.getNewArrivals();
    
    res.json({
      success: true,
      data: products,
    });
  } catch (error) {
    next(error);
  }
};
