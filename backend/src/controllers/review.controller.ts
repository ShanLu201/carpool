import { Request, Response } from 'express';
import reviewService from '../services/review.service';
import { errorResponse, paginatedResponse, successResponse } from '../utils/response';

export class ReviewController {
  async create(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json(errorResponse('未登录'));
      }

      const result = await reviewService.createReview(req.user.userId, req.body);
      res.json(successResponse(result, '评价成功'));
    } catch (error) {
      res.status(400).json(errorResponse((error as Error).message));
    }
  }

  async userReviews(req: Request, res: Response) {
    try {
      const userId = parseInt(req.params.userId);
      const result = await reviewService.getUserReviews(userId, req.query);
      res.json(paginatedResponse(result.list, result.total, result.page, result.limit));
    } catch (error) {
      res.status(400).json(errorResponse((error as Error).message));
    }
  }
}

export default new ReviewController();
