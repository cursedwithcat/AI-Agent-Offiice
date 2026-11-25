import { Router } from 'express';
import { uploadController } from '../controllers/uploadController.js';
import { authenticate } from '../middleware/auth.js';
import { requireRole } from '../middleware/rbac.js';
import { resumeUpload } from '../middleware/upload.js';

const router = Router();

// Resume upload endpoint for seekers
router.post(
  '/resume',
  authenticate,
  requireRole('SEEKER'),
  resumeUpload.single('resume'),
  (req, res, next) => {
    uploadController.uploadResume(req, res, next);
  }
);

export default router;
