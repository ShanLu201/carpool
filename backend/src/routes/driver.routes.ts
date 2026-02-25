import { Router } from 'express';
import driverController from '../controllers/driver.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import { publishDriverSchema, updateDriverSchema, queryDriverSchema } from '../validators/driver.validator';

const router = Router();

// 公开路由（用于浏览）
router.get('/list', validate(queryDriverSchema), driverController.list);
router.get('/:id', driverController.getById);

// 需要认证的路由
router.post('/publish', authMiddleware, validate(publishDriverSchema), driverController.publish);
router.put('/:id', authMiddleware, validate(updateDriverSchema), driverController.update);
router.delete('/:id', authMiddleware, driverController.cancel);
router.get('/my/invites', authMiddleware, driverController.myInvites);

export default router;
