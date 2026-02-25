import { Router } from 'express';
import passengerController from '../controllers/passenger.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import { publishPassengerSchema, updatePassengerSchema, queryPassengerSchema } from '../validators/passenger.validator';

const router = Router();

// 公开路由（用于浏览）
router.get('/list', validate(queryPassengerSchema), passengerController.list);
router.get('/:id', passengerController.getById);

// 需要认证的路由
router.post('/publish', authMiddleware, validate(publishPassengerSchema), passengerController.publish);
router.put('/:id', authMiddleware, validate(updatePassengerSchema), passengerController.update);
router.delete('/:id', authMiddleware, passengerController.cancel);
router.get('/my/requests', authMiddleware, passengerController.myRequests);

export default router;
