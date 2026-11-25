import { Request, Response, NextFunction } from 'express';
import { universityService } from '../services/universityService.js';
import { EmployabilityStatus } from '../../../shared/types.js';

export class UniversityController {
  getStudents(req: Request, res: Response, next: NextFunction): void {
    try {
      const cohortYear = req.query.cohort ? parseInt(req.query.cohort as string, 10) : undefined;
      const status = req.query.status as EmployabilityStatus | undefined;
      const faculty = req.query.faculty as string | undefined;
      const search = (req.query.search as string) || (req.query.keyword as string) || undefined;
      const page = parseInt(req.query.page as string, 10) || 1;
      const limit = parseInt(req.query.limit as string, 10) || 25;
      const offset = (page - 1) * limit;

      const result = universityService.getStudents(req.user!.id, {
        cohortYear,
        status,
        faculty,
        search,
        limit,
        offset
      });

      res.status(200).json({
        success: true,
        ...result
      });
    } catch (error) {
      next(error);
    }
  }

  getAnalytics(req: Request, res: Response, next: NextFunction): void {
    try {
      const cohortYear = req.query.cohort ? parseInt(req.query.cohort as string, 10) : undefined;
      const analytics = universityService.getAnalytics(req.user!.id, cohortYear);
      res.status(200).json({
        success: true,
        ...analytics
      });
    } catch (error) {
      next(error);
    }
  }

  exportMHESI(req: Request, res: Response, next: NextFunction): void {
    try {
      const cohortYear = req.body.cohort ? parseInt(req.body.cohort, 10) : undefined;
      const result = universityService.exportMHESI(req.user!.id, cohortYear, req.ip);
      res.status(200).json({
        success: true,
        ...result
      });
    } catch (error) {
      next(error);
    }
  }
}

export const universityController = new UniversityController();
