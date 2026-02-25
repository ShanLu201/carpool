import type { RowDataPacket } from 'mysql2';
import { Server as SocketIOServer, Socket } from 'socket.io';
import pool from '../config/database';
import { verifyToken } from '../config/jwt';
import chatService from '../services/chat.service';
import logger from '../utils/logger';

// 存储在线用户: userId -> socketId
const onlineUsers = new Map<number, Set<string>>();

// 存储socket: socketId -> userId
const socketToUser = new Map<string, number>();

export const initializeSocket = (io: SocketIOServer) => {
  // 认证中间件
  io.use(async (socket: any, next) => {
    try {
      const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.replace('Bearer ', '');

      if (!token) {
        return next(new Error('Authentication error'));
      }

      const decoded = verifyToken(token);
      socket.userId = decoded.userId;

      next();
    } catch (error) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', async (socket: any) => {
    const userId = socket.userId;

    logger.info(`User connected: ${userId}, socket: ${socket.id}`);

    // 记录用户在线状态
    if (!onlineUsers.has(userId)) {
      onlineUsers.set(userId, new Set());
    }
    onlineUsers.get(userId)!.add(socket.id);
    socketToUser.set(socket.id, userId);

    // 加入个人房间
    socket.join(`user:${userId}`);

    // 广播用户上线
    socket.broadcast.emit('user:online', { userId });

    // 发送在线用户列表（可选）
    socket.emit('user:online-list', { users: Array.from(onlineUsers.keys()) });

    // 发送未读消息数量
    try {
      const unread = await chatService.getUnreadCount(userId);
      socket.emit('chat:unread', unread);
    } catch (error) {
      logger.error('Get unread count error:', error);
    }

    // 处理发送消息
    socket.on('message:send', async (data: { to_user_id: number; content: string; message_type?: number; order_id?: number }) => {
      try {
        const { to_user_id, content, message_type = 1, order_id } = data;

        // 保存消息到数据库
        const messageResult = await chatService.saveMessage({
          from_user_id: userId,
          to_user_id,
          content,
          message_type,
          order_id,
        });

        // 获取收发双方信息
        const [users] = await pool.query<RowDataPacket[]>(
          'SELECT id, real_name, avatar_url FROM users WHERE id IN (?, ?)',
          [userId, to_user_id]
        );
        const fromUser = users.find((u: any) => u.id === userId);
        const toUser = users.find((u: any) => u.id === to_user_id);

        // 构造消息数据
        const messageData = {
          id: messageResult.id,
          from_user_id: userId,
          to_user_id,
          content,
          message_type,
          is_read: 0,
          created_at: new Date().toISOString(),
          from_user: {
            real_name: fromUser?.real_name,
            avatar_url: fromUser?.avatar_url,
          },
          to_user: {
            real_name: toUser?.real_name,
            avatar_url: toUser?.avatar_url,
          },
        };

        // 同步给接收者和发送者（发送方即时可见）
        io.to(`user:${to_user_id}`).emit('message:receive', messageData);
        io.to(`user:${userId}`).emit('message:receive', messageData);

        // 确认发送成功
        socket.emit('message:sent', { id: messageResult.id });

        // 更新接收者的未读消息数
        try {
          const unread = await chatService.getUnreadCount(to_user_id);
          io.to(`user:${to_user_id}`).emit('chat:unread', unread);
        } catch (error) {
          logger.error('Update unread count error:', error);
        }
      } catch (error) {
        logger.error('Send message error:', error);
        socket.emit('message:error', { error: '发送消息失败' });
      }
    });

    // 处理消息已读
    socket.on('message:read', async (data: { from_user_id: number }) => {
      try {
        const { from_user_id } = data;
        await chatService.markAsRead(userId, from_user_id);

        // 通知发送者消息已读
        io.to(`user:${from_user_id}`).emit('message:read', {
          to_user_id: userId,
          timestamp: new Date().toISOString(),
        });

        // 获取最新未读数并发送
        const unread = await chatService.getUnreadCount(userId);
        socket.emit('chat:unread', unread);
      } catch (error) {
        logger.error('Mark message read error:', error);
      }
    });

    // 处理正在输入
    socket.on('typing:start', (data: { to_user_id: number }) => {
      io.to(`user:${data.to_user_id}`).emit('typing:notify', {
        user_id: userId,
        is_typing: true,
      });
    });

    socket.on('typing:stop', (data: { to_user_id: number }) => {
      io.to(`user:${data.to_user_id}`).emit('typing:notify', {
        user_id: userId,
        is_typing: false,
      });
    });

    // 处理断开连接
    socket.on('disconnect', () => {
      logger.info(`User disconnected: ${userId}, socket: ${socket.id}`);

      // 移除socket记录
      const userSockets = onlineUsers.get(userId);
      if (userSockets) {
        userSockets.delete(socket.id);
        if (userSockets.size === 0) {
          onlineUsers.delete(userId);
          // 广播用户下线
          socket.broadcast.emit('user:offline', { userId });
        }
      }
      socketToUser.delete(socket.id);
    });

    // 处理错误
    socket.on('error', (error: Error) => {
      logger.error(`Socket error for user ${userId}:`, error);
    });
  });
};

export { onlineUsers };
