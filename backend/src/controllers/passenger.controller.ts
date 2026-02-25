import { Request, Response } from 'express';
import passengerService from '../services/passenger.service';
import { successResponse, errorResponse, paginatedResponse } from '../utils/response';

export class PassengerController {
  /**
   * 发布乘客需求
   */
  async publish(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json(errorResponse('未登录'));
      }
      const result = await passengerService.publish(req.user.userId, req.body);
      res.json(successResponse(result, '发布成功'));
    } catch (error) {
      res.status(400).json(errorResponse((error as Error).message));
    }
  }

  /**
   * 查询乘客需求列表
   */
  async list(req: Request, res: Response) {
    try {
      const result = await passengerService.getList(req.query);
      res.json(paginatedResponse(result.list, result.total, result.page, result.limit));
    } catch (error) {
      res.status(400).json(errorResponse((error as Error).message));
    }
  }

  /**
   * 获取乘客需求详情
   */
  async getById(req: Request, res: Response) {
    try {
      const request = await passengerService.getById(parseInt(req.params.id));
      res.json(successResponse({ request }));
    } catch (error) {
      res.status(400).json(errorResponse((error as Error).message));
    }
  }

  /**
   * 更新乘客需求
   */
  async update(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json(errorResponse('未登录'));
      }
      const request = await passengerService.update(parseInt(req.params.id), req.user.userId, req.body);
      res.json(successResponse({ request }, '更新成功'));
    } catch (error) {
      res.status(400).json(errorResponse((error as Error).message));
    }
  }

  /**
   * 取消乘客需求
   */
  async cancel(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json(errorResponse('未登录'));
      }
      const result = await passengerService.cancel(parseInt(req.params.id), req.user.userId);
      res.json(successResponse(result, '取消成功'));
    } catch (error) {
      res.status(400).json(errorResponse((error as Error).message));
    }
  }

  /**
   * 获取我的需求
   */
  async myRequests(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json(errorResponse('未登录'));
      }
      const result = await passengerService.getMyRequests(req.user.userId, req.query);
      res.json(paginatedResponse(result.list, result.total, result.page, result.limit));
    } catch (error) {
      res.status(400).json(errorResponse((error as Error).message));
    }
  }
}

export default new PassengerController();
