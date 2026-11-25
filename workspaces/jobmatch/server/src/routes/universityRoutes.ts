import { Router } from 'express';
import { universityController } from '../controllers/universityController.js';
import { authenticate } from '../middleware/auth.js';
import { requireRole } from '../middleware/rbac.js';

const router = Router();

// All university endpoints require authenticated UNIVERSITY role
router.use(authenticate, requireRole('UNIVERSITY', 'ADMIN'));

router.get('/students', (req, res, next) => {
  universityController.getStudents(req, res, next);
});

router.get('/analytics', (req, res, next) => {
  universityController.getAnalytics(req, res, next);
});

router.post('/export-mhesi', (req, res, next) => {
  universityController.exportMHESI(req, res, next);
});

export default router;
