import { Router } from 'express';
import { authController, registerSchema, loginSchema } from '../controllers/authController.js';
import { validateBody } from '../middleware/validate.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.post('/register', validateBody(registerSchema), (req, res, next) => {
  authController.register(req, res, next);
});

router.post('/login', validateBody(loginSchema), (req, res, next) => {
  authController.login(req, res, next);
});

router.get('/me', authenticate, (req, res, next) => {
  authController.getMe(req, res, next);
});

export default router;
