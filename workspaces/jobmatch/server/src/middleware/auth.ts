import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { ENV } from '../config/env.js';
import { AppError } from './errorHandler.js';
import { queryOne } from '../config/db.js';
import { User, UserRole, UserStatus } from '../../../shared/types.js';

export interface AuthenticatedUser {
  id: number;
  email: string;
  role: UserRole;
  status: UserStatus;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

interface JwtPayload {
  userId: number;
  email: string;
  role: UserRole;
}

export function authenticate(req: Request, res: Response, next: NextFunction): void {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError('Authentication required. Missing Bearer token.', 401);
    }

    const token = authHeader.split(' ')[1];
    let decoded: JwtPayload;

    try {
      decoded = jwt.verify(token, ENV.JWT_SECRET) as JwtPayload;
    } catch (err: any) {
      if (err.name === 'TokenExpiredError') {
        throw new AppError('Session token has expired. Please log in again.', 401);
      }
      throw new AppError('Invalid authentication token.', 401);
    }

    // Verify user still exists in DB and is not suspended
    const user = queryOne<User>('SELECT id, email, role, status FROM users WHERE id = ?', [decoded.userId]);
    if (!user) {
      throw new AppError('User belonging to this token no longer exists.', 401);
    }

    if (user.status === 'SUSPENDED') {
      throw new AppError('Account has been suspended. Please contact administrator.', 403);
    }

    req.user = {
      id: user.id,
      email: user.email,
      role: user.role,
      status: user.status
    };

    next();
  } catch (error) {
    next(error);
  }
}
