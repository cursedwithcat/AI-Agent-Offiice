import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { adminService } from '../services/adminService.js';
import { UserRole, UserStatus, KYBStatus, JobStatus } from '../../../shared/types.js';

export const updateKybSchema = z.object({
  kybStatus: z.enum(['PENDING', 'VERIFIED', 'REJECTED'] as const)
});

export const updateUserStatusSchema = z.object({
  status: z.enum(['ACTIVE', 'PENDING_VERIFICATION', 'SUSPENDED'] as const)
});

export const moderateJobSchema = z.object({
  status: z.enum(['DRAFT', 'PUBLISHED', 'CLOSED', 'SUSPENDED'] as const),
  note: z.string().optional()
});

export class AdminController {
  listUsers(req: Request, res: Response, next: NextFunction): void {
    try {
      const role = req.query.role as UserRole | undefined;
      const status = req.query.status as UserStatus | undefined;
      const users = adminService.getUsers(role, status);
      res.status(200).json({
        success: true,
        users
      });
    } catch (error) {
      next(error);
    }
  }

  updateCompanyKyb(req: Request, res: Response, next: NextFunction): void {
    try {
      const id = parseInt(req.params.id, 10);
      const { kybStatus } = req.body;
      const result = adminService.updateCompanyKYB(req.user!.id, id, kybStatus as KYBStatus, req.ip);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  updateUserStatus(req: Request, res: Response, next: NextFunction): void {
    try {
      const id = parseInt(req.params.id, 10);
      const { status } = req.body;
      const result = adminService.updateUserStatus(req.user!.id, id, status as UserStatus, req.ip);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  listJobs(req: Request, res: Response, next: NextFunction): void {
    try {
      const status = req.query.status as JobStatus | undefined;
      const jobs = adminService.getAllJobs(status);
      res.status(200).json({
        success: true,
        jobs
      });
    } catch (error) {
      next(error);
    }
  }

  moderateJob(req: Request, res: Response, next: NextFunction): void {
    try {
      const id = parseInt(req.params.id, 10);
      const { status, note } = req.body;
      const result = adminService.moderateJob(req.user!.id, id, status as JobStatus, note, req.ip);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  listAuditLogs(req: Request, res: Response, next: NextFunction): void {
    try {
      const actorRole = req.query.role as string | undefined;
      const action = req.query.action as string | undefined;
      const limit = parseInt(req.query.limit as string, 10) || 50;
      const offset = parseInt(req.query.offset as string, 10) || 0;

      const result = adminService.getAuditLogs({
        actorRole,
        action,
        limit,
        offset
      });

      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  getStats(req: Request, res: Response, next: NextFunction): void {
    try {
      const stats = adminService.getPlatformStats();
      res.status(200).json({
        success: true,
        stats
      });
    } catch (error) {
      next(error);
    }
  }
}

export const adminController = new AdminController();
