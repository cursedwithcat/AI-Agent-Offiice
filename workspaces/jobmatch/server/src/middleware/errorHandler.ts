import { Request, Response, NextFunction } from 'express';

export class AppError extends Error {
  statusCode: number;
  details?: any;

  constructor(message: string, statusCode: number = 400, details?: any) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.details = details;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export function errorHandler(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const statusCode = err.statusCode || (err.status ? Number(err.status) : 500);
  const isDev = process.env.NODE_ENV === 'development';

  // Defensive Masking: Never leak database driver errors or raw stack traces in production
  let publicMessage = err.message || 'Internal Server Error';
  if (statusCode >= 500 && !isDev) {
    publicMessage = 'An internal server error occurred. Please contact system administrator.';
  }

  if (process.env.NODE_ENV !== 'test' && statusCode >= 500) {
    console.error(`[SECURITY ERROR LOG] ${req.method} ${req.originalUrl}:`, err);
  }

  res.status(statusCode).json({
    success: false,
    error: publicMessage,
    details: err.details || (isDev ? err.stack : undefined)
  });
}
