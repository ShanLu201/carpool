import { Router } from 'express';
import authController from '../controllers/auth.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import {
  registerSchema,
  loginSchema,
  verifySchema,
  updateProfileSchema,
  changePasswordSchema,
} from '../validators/auth.validator';

const router = Router();

// 公开路由
router.post('/register', validate(registerSchema), authController.register);
router.post('/login', validate(loginSchema), authController.login);

// 需要认证的路由
router.get('/me', authMiddleware, authController.me);
router.post('/verify', authMiddleware, validate(verifySchema), authController.verify);
router.put('/profile', authMiddleware, validate(updateProfileSchema), authController.updateProfile);
router.put('/password', authMiddleware, validate(changePasswordSchema), authController.changePassword);

export default router;
