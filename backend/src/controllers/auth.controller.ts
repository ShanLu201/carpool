import { Request, Response } from 'express';
import { JwtPayload } from '../config/jwt';

interface AuthenticatedRequest extends Request {
  user?: JwtPayload;
}
import authService from '../services/auth.service';
import { successResponse, errorResponse } from '../utils/response';

export class AuthController {
  /**
   * 用户注册
   */
  async register(req: Request, res: Response) {
    try {
      const { phone, password } = req.body;
      const result = await authService.register(phone, password);
      res.json(successResponse(result, '注册成功'));
    } catch (error) {
      res.status(400).json(errorResponse((error as Error).message));
    }
  }

  /**
   * 用户登录
   */
  async login(req: Request, res: Response) {
    try {
      const { phone, password } = req.body;
      const result = await authService.login(phone, password);
      res.json(successResponse(result, '登录成功'));
    } catch (error) {
      res.status(400).json(errorResponse((error as Error).message));
    }
  }

  /**
   * 获取当前用户信息
   */
  async me(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json(errorResponse('未登录'));
      }
      const user = await authService.getUserById(req.user.userId);
      res.json(successResponse({ user }));
    } catch (error) {
      res.status(400).json(errorResponse((error as Error).message));
    }
  }

  /**
   * 实名认证
   */
  async verify(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json(errorResponse('未登录'));
      }
      const { real_name, id_card } = req.body;
      const result = await authService.verify(req.user.userId, real_name, id_card);
      res.json(successResponse(result, '实名认证成功'));
    } catch (error) {
      res.status(400).json(errorResponse((error as Error).message));
    }
  }

  /**
   * 更新个人资料
   */
  async updateProfile(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json(errorResponse('未登录'));
      }
      const user = await authService.updateProfile(req.user.userId, req.body);
      res.json(successResponse({ user }, '更新成功'));
    } catch (error) {
      res.status(400).json(errorResponse((error as Error).message));
    }
  }

  /**
   * 修改密码
   */
  async changePassword(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json(errorResponse('未登录'));
      }
      const { old_password, new_password } = req.body;
      const result = await authService.changePassword(req.user.userId, old_password, new_password);
      res.json(successResponse(result, '密码修改成功'));
    } catch (error) {
      res.status(400).json(errorResponse((error as Error).message));
    }
  }
}

export default new AuthController();
