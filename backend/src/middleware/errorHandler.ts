import type { Request, Response, NextFunction } from 'express';
import { v4 as uuid } from 'uuid';
import { isAppError } from '../utils/AppError.js';
import { sendError } from '../utils/response.js';
import { logger } from '../utils/logger.js';

export function requestId(req: Request, res: Response, next: NextFunction): void {
  const id = (req.headers['x-request-id'] as string) || uuid();
  res.locals.requestId = id;
  res.setHeader('X-Request-Id', id);
  next();
}

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction): void {
  if (isAppError(err)) {
    sendError(res, err.code, err.message, err.statusCode);
    return;
  }

  logger.error('Unhandled error', { requestId: res.locals.requestId });
  sendError(res, 'INTERNAL_ERROR', 'An unexpected error occurred', 500);
}
