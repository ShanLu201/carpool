import { Router } from 'express';
import reviewController from '../controllers/review.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import { createReviewSchema } from '../validators/review.validator';

const router = Router();

router.post('/', authMiddleware, validate(createReviewSchema), reviewController.create);
router.get('/user/:userId', reviewController.userReviews);

export default router;
