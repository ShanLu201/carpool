import { Request, Response } from 'express';
import chatService from '../services/chat.service';
import { successResponse, errorResponse, paginatedResponse } from '../utils/response';

export class ChatController {
  /**
   * 获取联系人列表
   */
  async contacts(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json(errorResponse('未登录'));
      }
      const contacts = await chatService.getContacts(req.user.userId);
      res.json(successResponse({ contacts }));
    } catch (error) {
      res.status(400).json(errorResponse((error as Error).message));
    }
  }

  /**
   * 获取与某用户的消息历史
   */
  async messages(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json(errorResponse('未登录'));
      }
      const otherUserId = parseInt(req.params.userId);
      const { page = 1, limit = 50 } = req.query;
      const result = await chatService.getMessages(req.user.userId, otherUserId, Number(page), Number(limit));
      res.json(paginatedResponse(result.list, result.total, result.page, result.limit));
    } catch (error) {
      res.status(400).json(errorResponse((error as Error).message));
    }
  }

  /**
   * 标记消息为已读
   */
  async markAsRead(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json(errorResponse('未登录'));
      }
      const fromUserId = parseInt(req.params.userId);
      const result = await chatService.markAsRead(req.user.userId, fromUserId);
      res.json(successResponse(result, '已标记为已读'));
    } catch (error) {
      res.status(400).json(errorResponse((error as Error).message));
    }
  }

  /**
   * 获取未读消息数量
   */
  async unread(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json(errorResponse('未登录'));
      }
      const result = await chatService.getUnreadCount(req.user.userId);
      res.json(successResponse(result));
    } catch (error) {
      res.status(400).json(errorResponse((error as Error).message));
    }
  }
}

export default new ChatController();
