import { Router } from 'express';
import {
  adminController,
  updateKybSchema,
  updateUserStatusSchema,
  moderateJobSchema
} from '../controllers/adminController.js';
import { authenticate } from '../middleware/auth.js';
import { requireRole } from '../middleware/rbac.js';
import { validateBody } from '../middleware/validate.js';

const router = Router();

// All admin routes require ADMIN role
router.use(authenticate, requireRole('ADMIN'));

router.get('/stats', (req, res, next) => {
  adminController.getStats(req, res, next);
});

router.get('/users', (req, res, next) => {
  adminController.listUsers(req, res, next);
});

router.patch('/users/:id/kyb', validateBody(updateKybSchema), (req, res, next) => {
  adminController.updateCompanyKyb(req, res, next);
});

router.patch('/users/:id/status', validateBody(updateUserStatusSchema), (req, res, next) => {
  adminController.updateUserStatus(req, res, next);
});

router.get('/jobs', (req, res, next) => {
  adminController.listJobs(req, res, next);
});

router.patch('/jobs/:id/moderate', validateBody(moderateJobSchema), (req, res, next) => {
  adminController.moderateJob(req, res, next);
});

router.get('/audit-logs', (req, res, next) => {
  adminController.listAuditLogs(req, res, next);
});

export default router;
