import { Request, Response, NextFunction } from 'express';
import * as categoryService from './category.service';

export const createCategory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const category = await categoryService.createCategory(req.body);
    
    res.status(201).json({
      success: true,
      data: category,
      message: 'Category created successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const getAllCategories = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const categories = await categoryService.getAllCategories();
    
    res.json({
      success: true,
      data: categories,
    });
  } catch (error) {
    next(error);
  }
};

export const getCategoryWithProducts = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { slug } = req.params;
    const result = await categoryService.getCategoryWithProducts(slug, req.query);
    
    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const updateCategory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const category = await categoryService.updateCategory(id, req.body);
    
    res.json({
      success: true,
      data: category,
      message: 'Category updated successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const deleteCategory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    await categoryService.deleteCategory(id);
    
    res.json({
      success: true,
      message: 'Category deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const uploadCategoryImage = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    
    if (!req.file) {
      res.status(400).json({
        success: false,
        error: 'No image file provided',
      });
      return;
    }

    const category = await categoryService.uploadCategoryImage(id, req.file);
    
    res.json({
      success: true,
      data: category,
      message: 'Category image uploaded successfully',
    });
  } catch (error) {
    next(error);
  }
};
