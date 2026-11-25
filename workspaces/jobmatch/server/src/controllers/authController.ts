import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { authService } from '../services/authService.js';

export const registerSchema = z.object({
  email: z.string().email('Invalid email address format'),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
  role: z.enum(['SEEKER', 'COMPANY', 'UNIVERSITY']),
  profileData: z.object({
    fullName: z.string().optional(),
    phone: z.string().optional(),
    universityName: z.string().optional(),
    faculty: z.string().optional(),
    major: z.string().optional(),
    studentId: z.string().optional(),
    graduationYear: z.number().int().optional(),
    gpa: z.number().min(0).max(4.0).optional(),
    bio: z.string().optional(),
    skills: z.union([z.array(z.string()), z.string()]).optional(),
    resumeUrl: z.string().optional(),
    companyName: z.string().optional(),
    taxId: z.string().optional(),
    industry: z.string().optional(),
    companySize: z.string().optional(),
    website: z.string().optional(),
    logoUrl: z.string().optional(),
    description: z.string().optional(),
    address: z.string().optional(),
    campus: z.string().optional(),
    contactPerson: z.string().optional(),
    contactEmail: z.string().optional()
  }).default({})
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address format'),
  password: z.string().min(1, 'Password is required')
});

export class AuthController {
  async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await authService.register(req.body, req.ip);
      res.status(201).json({
        success: true,
        ...result
      });
    } catch (error) {
      next(error);
    }
  }

  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, password } = req.body;
      const result = await authService.login(email, password, req.ip);
      res.status(200).json({
        success: true,
        ...result
      });
    } catch (error) {
      next(error);
    }
  }

  getMe(req: Request, res: Response, next: NextFunction): void {
    try {
      const result = authService.getMe(req.user!.id);
      res.status(200).json({
        success: true,
        ...result
      });
    } catch (error) {
      next(error);
    }
  }
}

export const authController = new AuthController();
