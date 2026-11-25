import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { jobService } from '../services/jobService.js';
import { JobType, WorkplaceType, JobStatus } from '../../../shared/types.js';

export const createJobSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters long'),
  department: z.string().optional(),
  jobType: z.enum(['FULL_TIME', 'INTERNSHIP', 'PART_TIME', 'CONTRACT'] as const),
  workplaceType: z.enum(['ON_SITE', 'HYBRID', 'REMOTE'] as const),
  location: z.string().min(2, 'Location is required'),
  salaryMin: z.number().nonnegative().optional(),
  salaryMax: z.number().nonnegative().optional(),
  salaryCurrency: z.string().default('THB'),
  experienceLevel: z.string().optional(),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  requirements: z.string().optional(),
  skillsRequired: z.union([z.array(z.string()), z.string()]).optional(),
  status: z.enum(['DRAFT', 'PUBLISHED', 'CLOSED', 'SUSPENDED'] as const).default('PUBLISHED')
});

export const updateJobStatusSchema = z.object({
  status: z.enum(['DRAFT', 'PUBLISHED', 'CLOSED', 'SUSPENDED'] as const)
});

export class JobController {
  listJobs(req: Request, res: Response, next: NextFunction): void {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const offset = (page - 1) * limit;

      const result = jobService.getJobs({
        search: (req.query.keyword as string) || (req.query.search as string) || undefined,
        jobType: req.query.type as JobType || undefined,
        workplaceType: req.query.workplace as WorkplaceType || undefined,
        location: req.query.location as string || undefined,
        status: req.query.status as JobStatus || undefined,
        limit,
        offset
      });

      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  getJobById(req: Request, res: Response, next: NextFunction): void {
    try {
      const id = parseInt(req.params.id, 10);
      const job = jobService.getJobById(id);
      res.status(200).json({
        success: true,
        job
      });
    } catch (error) {
      next(error);
    }
  }

  getMyCompanyJobs(req: Request, res: Response, next: NextFunction): void {
    try {
      const jobs = jobService.getCompanyJobs(req.user!.id);
      res.status(200).json({
        success: true,
        jobs
      });
    } catch (error) {
      next(error);
    }
  }

  createJob(req: Request, res: Response, next: NextFunction): void {
    try {
      const job = jobService.createJob(req.user!.id, req.body, req.ip);
      res.status(201).json({
        success: true,
        job
      });
    } catch (error) {
      next(error);
    }
  }

  updateJob(req: Request, res: Response, next: NextFunction): void {
    try {
      const id = parseInt(req.params.id, 10);
      const job = jobService.updateJob(req.user!.id, req.user!.role, id, req.body, req.ip);
      res.status(200).json({
        success: true,
        job
      });
    } catch (error) {
      next(error);
    }
  }

  updateJobStatus(req: Request, res: Response, next: NextFunction): void {
    try {
      const id = parseInt(req.params.id, 10);
      const { status } = req.body;
      const result = jobService.updateJobStatus(req.user!.id, req.user!.role, id, status, req.ip);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }
}

export const jobController = new JobController();
