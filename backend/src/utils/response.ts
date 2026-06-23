import type { Response } from 'express';

export function sendSuccess<T>(res: Response, data: T, status = 200): void {
  res.status(status).json({
    success: true,
    data,
    meta: { requestId: res.locals.requestId },
  });
}

export function sendError(
  res: Response,
  code: string,
  message: string,
  status: number,
): void {
  res.status(status).json({
    success: false,
    error: { code, message },
    meta: { requestId: res.locals.requestId },
  });
}
