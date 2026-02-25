import { Router } from 'express';
import chatController from '../controllers/chat.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import { queryMessagesSchema } from '../validators/chat.validator';

const router = Router();

// 所有聊天路由都需要认证
router.get('/contacts', authMiddleware, chatController.contacts);
router.get('/messages/:userId', authMiddleware, validate(queryMessagesSchema), chatController.messages);
router.put('/messages/read/:userId', authMiddleware, chatController.markAsRead);
router.get('/unread', authMiddleware, chatController.unread);

export default router;
