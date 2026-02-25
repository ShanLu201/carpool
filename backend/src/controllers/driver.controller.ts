import { Request, Response } from 'express';
import driverService from '../services/driver.service';
import { successResponse, errorResponse, paginatedResponse } from '../utils/response';

export class DriverController {
  /**
   * 发布车主邀客
   */
  async publish(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json(errorResponse('未登录'));
      }
      const result = await driverService.publish(req.user.userId, req.body);
      res.json(successResponse(result, '发布成功'));
    } catch (error) {
      res.status(400).json(errorResponse((error as Error).message));
    }
  }

  /**
   * 查询车主邀客列表
   */
  async list(req: Request, res: Response) {
    try {
      const result = await driverService.getList(req.query);
      res.json(paginatedResponse(result.list, result.total, result.page, result.limit));
    } catch (error) {
      res.status(400).json(errorResponse((error as Error).message));
    }
  }

  /**
   * 获取车主邀客详情
   */
  async getById(req: Request, res: Response) {
    try {
      const invite = await driverService.getById(parseInt(req.params.id));
      res.json(successResponse({ invite }));
    } catch (error) {
      res.status(400).json(errorResponse((error as Error).message));
    }
  }

  /**
   * 更新车主邀客
   */
  async update(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json(errorResponse('未登录'));
      }
      const invite = await driverService.update(parseInt(req.params.id), req.user.userId, req.body);
      res.json(successResponse({ invite }, '更新成功'));
    } catch (error) {
      res.status(400).json(errorResponse((error as Error).message));
    }
  }

  /**
   * 取消车主邀客
   */
  async cancel(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json(errorResponse('未登录'));
      }
      const result = await driverService.cancel(parseInt(req.params.id), req.user.userId);
      res.json(successResponse(result, '取消成功'));
    } catch (error) {
      res.status(400).json(errorResponse((error as Error).message));
    }
  }

  /**
   * 获取我的邀客
   */
  async myInvites(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json(errorResponse('未登录'));
      }
      const result = await driverService.getMyInvites(req.user.userId, req.query);
      res.json(paginatedResponse(result.list, result.total, result.page, result.limit));
    } catch (error) {
      res.status(400).json(errorResponse((error as Error).message));
    }
  }
}

export default new DriverController();
