import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { applicationService } from '../services/applicationService.js';
import { ApplicationStage } from '../../../shared/types.js';

export const applySchema = z.object({
  jobId: z.number().int().positive('Valid Job ID is required'),
  coverNote: z.string().optional(),
  resumeUrl: z.string().optional()
});

export const updateStageSchema = z.object({
  stage: z.enum([
    'APPLIED',
    'UNDER_REVIEW',
    'SHORTLISTED',
    'OFFERED',
    'HIRED',
    'REJECTED',
    'WITHDRAWN'
  ] as const),
  internalNotes: z.string().optional()
});

export class ApplicationController {
  apply(req: Request, res: Response, next: NextFunction): void {
    try {
      const result = applicationService.apply(req.user!.id, req.body, req.ip);
      res.status(201).json({
        success: true,
        ...result
      });
    } catch (error) {
      next(error);
    }
  }

  getMyApplications(req: Request, res: Response, next: NextFunction): void {
    try {
      const applications = applicationService.getMyApplications(req.user!.id);
      res.status(200).json({
        success: true,
        applications
      });
    } catch (error) {
      next(error);
    }
  }

  getJobApplicants(req: Request, res: Response, next: NextFunction): void {
    try {
      const jobId = parseInt(req.params.jobId, 10);
      const applicants = applicationService.getJobApplicants(req.user!.id, jobId);
      res.status(200).json({
        success: true,
        applicants
      });
    } catch (error) {
      next(error);
    }
  }

  getApplicationById(req: Request, res: Response, next: NextFunction): void {
    try {
      const id = parseInt(req.params.id, 10);
      const application = applicationService.getApplicationById(
        req.user!.id,
        req.user!.role,
        id
      );
      res.status(200).json({
        success: true,
        application
      });
    } catch (error) {
      next(error);
    }
  }

  updateStage(req: Request, res: Response, next: NextFunction): void {
    try {
      const id = parseInt(req.params.id, 10);
      const { stage, internalNotes } = req.body;
      const result = applicationService.updateStage(
        req.user!.id,
        req.user!.role,
        id,
        stage as ApplicationStage,
        internalNotes,
        req.ip
      );
      res.status(200).json({
        success: true,
        ...result
      });
    } catch (error) {
      next(error);
    }
  }
}

export const applicationController = new ApplicationController();
