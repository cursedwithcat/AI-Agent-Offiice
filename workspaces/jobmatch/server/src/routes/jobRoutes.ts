import { Router } from 'express';
import { jobController, createJobSchema, updateJobStatusSchema } from '../controllers/jobController.js';
import { authenticate } from '../middleware/auth.js';
import { requireRole } from '../middleware/rbac.js';
import { validateBody } from '../middleware/validate.js';

const router = Router();

// Public routes
router.get('/', (req, res, next) => {
  jobController.listJobs(req, res, next);
});

// Company protected routes (must be defined BEFORE :id to avoid param capture)
router.get('/company/mine', authenticate, requireRole('COMPANY'), (req, res, next) => {
  jobController.getMyCompanyJobs(req, res, next);
});

router.get('/:id', (req, res, next) => {
  jobController.getJobById(req, res, next);
});

router.post('/', authenticate, requireRole('COMPANY'), validateBody(createJobSchema), (req, res, next) => {
  jobController.createJob(req, res, next);
});

router.patch('/:id', authenticate, requireRole('COMPANY', 'ADMIN'), (req, res, next) => {
  jobController.updateJob(req, res, next);
});

router.patch('/:id/status', authenticate, requireRole('COMPANY', 'ADMIN'), validateBody(updateJobStatusSchema), (req, res, next) => {
  jobController.updateJobStatus(req, res, next);
});

export default router;
