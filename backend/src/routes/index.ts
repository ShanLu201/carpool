import { Router } from 'express';
import authRoutes from './auth.routes';
import passengerRoutes from './passenger.routes';
import driverRoutes from './driver.routes';
import chatRoutes from './chat.routes';
import reviewRoutes from './review.routes';

const router = Router();

// 健康检查
router.get('/health', (req, res) => {
  res.json({ success: true, message: 'Server is running', timestamp: new Date().toISOString() });
});

// 挂载各模块路由
router.use('/auth', authRoutes);
router.use('/passenger', passengerRoutes);
router.use('/driver', driverRoutes);
router.use('/chat', chatRoutes);
router.use('/reviews', reviewRoutes);

export default router;
