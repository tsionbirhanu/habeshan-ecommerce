import { Request, Response, NextFunction } from 'express';
import logger from '../utils/logger';

export const requestLogger = (req: Request, res: Response, next: NextFunction): void => {
  const startTime = Date.now();

  // Log after response is sent
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    const userId = req.user?.userId || 'anonymous';

    logger.info({
      method: req.method,
      url: req.originalUrl,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      userId,
      ip: req.ip,
    });
  });

  next();
};
