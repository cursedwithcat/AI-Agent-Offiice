import { Request, Response, NextFunction } from 'express';
import { UserRole } from '../../../shared/types.js';
import { AppError } from './errorHandler.js';

export function requireRole(...allowedRoles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(new AppError('User not authenticated.', 401));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(
        new AppError(
          `Access forbidden: Role '${req.user.role}' is not authorized to access this resource. Required: [${allowedRoles.join(', ')}]`,
          403
        )
      );
    }

    next();
  };
}
