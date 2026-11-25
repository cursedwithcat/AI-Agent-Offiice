import { Router } from 'express';
import { applicationController, applySchema, updateStageSchema } from '../controllers/applicationController.js';
import { authenticate } from '../middleware/auth.js';
import { requireRole } from '../middleware/rbac.js';
import { validateBody } from '../middleware/validate.js';

const router = Router();

// Candidate 1-Click apply
router.post('/', authenticate, requireRole('SEEKER'), validateBody(applySchema), (req, res, next) => {
  applicationController.apply(req, res, next);
});

// Candidate track application history
router.get('/my', authenticate, requireRole('SEEKER'), (req, res, next) => {
  applicationController.getMyApplications(req, res, next);
});

// Company ATS Kanban applicants
router.get('/job/:jobId', authenticate, requireRole('COMPANY', 'ADMIN'), (req, res, next) => {
  applicationController.getJobApplicants(req, res, next);
});

// Application details
router.get('/:id', authenticate, (req, res, next) => {
  applicationController.getApplicationById(req, res, next);
});

// Update ATS Stage (Triggers atomic sync when stage is 'HIRED')
router.patch('/:id/stage', authenticate, requireRole('COMPANY', 'ADMIN'), validateBody(updateStageSchema), (req, res, next) => {
  applicationController.updateStage(req, res, next);
});

export default router;
