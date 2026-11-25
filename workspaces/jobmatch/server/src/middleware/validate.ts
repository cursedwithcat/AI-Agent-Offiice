import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { AppError } from './errorHandler.js';

export function validateBody(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const issues = error.errors.map(err => ({
          path: err.path.join('.'),
          message: err.message
        }));
        return next(new AppError('Validation failed', 400, issues));
      }
      next(error);
    }
  };
}

export function validateQuery(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      req.query = schema.parse(req.query);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const issues = error.errors.map(err => ({
          path: err.path.join('.'),
          message: err.message
        }));
        return next(new AppError('Query validation failed', 400, issues));
      }
      next(error);
    }
  };
}
