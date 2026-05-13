import { Request, Response, NextFunction } from 'express';
import { Prisma } from '@prisma/client';
import { AppError } from '../utils/errors';
import logger from '../utils/logger';
import { env } from '../config/environment';

interface ErrorResponse {
  success: false;
  error: string;
  code: string;
  details?: any;
}

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  // Log error
  logger.error({
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
    userId: req.user?.userId,
  });

  // Handle AppError (custom errors)
  if (err instanceof AppError) {
    const response: ErrorResponse = {
      success: false,
      error: err.message,
      code: err.code,
    };

    res.status(err.statusCode).json(response);
    return;
  }

  // Handle Prisma errors
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    // Log Prisma-specific details for debugging
    try {
      logger.error({ prismaCode: (err as any).code, prismaMeta: (err as any).meta });
    } catch (logErr) {
      logger.error('Failed to log Prisma meta', logErr as Error);
    }
    let statusCode = 400;
    let message = 'Database error';
    let code = 'DATABASE_ERROR';

    switch (err.code) {
      case 'P2002':
        // Unique constraint violation
        statusCode = 409;
        message = 'Resource already exists';
        code = 'DUPLICATE_ENTRY';
        break;
      case 'P2025':
        // Record not found
        statusCode = 404;
        message = 'Resource not found';
        code = 'NOT_FOUND';
        break;
      case 'P2003':
        // Foreign key constraint failed
        statusCode = 400;
        message = 'Invalid reference';
        code = 'INVALID_REFERENCE';
        break;
    }

    const response: ErrorResponse = {
      success: false,
      error: message,
      code,
    };

    if (env.NODE_ENV === 'development') {
      response.details = err.meta;
    }

    res.status(statusCode).json(response);
    return;
  }

  // Handle Prisma validation errors
  if (err instanceof Prisma.PrismaClientValidationError) {
    const response: ErrorResponse = {
      success: false,
      error: 'Invalid data provided',
      code: 'VALIDATION_ERROR',
    };

    res.status(400).json(response);
    return;
  }

  // Handle generic errors
  const response: ErrorResponse = {
    success: false,
    error: err.message || 'Internal server error',
    code: 'INTERNAL_ERROR',
  };

  // Always include details for unexpected errors to help debugging
  response.details = {
    type: err.constructor.name,
    stack: err.stack,
  };

  res.status(500).json(response);
};
