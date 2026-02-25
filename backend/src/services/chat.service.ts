import type { RowDataPacket, ResultSetHeader } from 'mysql2';
import pool from '../config/database';
import { ChatMessage } from '../types';
import logger from '../utils/logger';

export class ChatService {
  /**
   * 保存消息到数据库
   */
  async saveMessage(data: {
    from_user_id: number;
    to_user_id: number;
    content: string;
    message_type: number;
    order_id?: number;
  }) {
    try {
      const [result] = await pool.query<ResultSetHeader>(
        `INSERT INTO chat_messages (from_user_id, to_user_id, content, message_type, order_id)
         VALUES (?, ?, ?, ?, ?)`,
        [data.from_user_id, data.to_user_id, data.content, data.message_type, data.order_id || null]
      );

      return { id: result.insertId };
    } catch (error) {
      logger.error('Save message error:', error);
      throw error;
    }
  }

  /**
   * 获取与某用户的消息历史
   */
  async getMessages(userId: number, otherUserId: number, page: number, limit: number) {
    try {
      const offset = (page - 1) * limit;

      // 查询总数
      const [countResult] = await pool.query<RowDataPacket[]>(
        `SELECT COUNT(*) as total FROM chat_messages
         WHERE (from_user_id = ? AND to_user_id = ?)
            OR (from_user_id = ? AND to_user_id = ?)`,
        [userId, otherUserId, otherUserId, userId]
      );
      const total = countResult[0].total;

      // 查询消息列表
      const [rows] = await pool.query<RowDataPacket[]>(
        `SELECT cm.*, u_from.real_name as from_real_name, u_from.avatar_url as from_avatar_url,
                u_to.real_name as to_real_name, u_to.avatar_url as to_avatar_url
         FROM chat_messages cm
         LEFT JOIN users u_from ON cm.from_user_id = u_from.id
         LEFT JOIN users u_to ON cm.to_user_id = u_to.id
         WHERE (cm.from_user_id = ? AND cm.to_user_id = ?)
            OR (cm.from_user_id = ? AND cm.to_user_id = ?)
         ORDER BY cm.created_at DESC
         LIMIT ? OFFSET ?`,
        [userId, otherUserId, otherUserId, userId, limit, offset]
      );

      // 标记发送给我的消息为已读
      await pool.query(
        `UPDATE chat_messages SET is_read = 1
         WHERE from_user_id = ? AND to_user_id = ? AND is_read = 0`,
        [otherUserId, userId]
      );

      // 反转顺序，最新的在最后
      const list = rows.reverse().map((row: any) => ({
        id: row.id,
        from_user_id: row.from_user_id,
        to_user_id: row.to_user_id,
        message_type: row.message_type,
        content: row.content,
        is_read: row.is_read,
        created_at: row.created_at,
        from_user: {
          real_name: row.from_real_name,
          avatar_url: row.from_avatar_url,
        },
        to_user: {
          real_name: row.to_real_name,
          avatar_url: row.to_avatar_url,
        },
      }));

      return { list, total, page, limit };
    } catch (error) {
      logger.error('Get messages error:', error);
      throw error;
    }
  }

  /**
   * 获取联系人列表（最近聊天的用户）
   */
  async getContacts(userId: number) {
    try {
      // 获取最近消息的联系人
      const [rows] = await pool.query<RowDataPacket[]>(
        `SELECT
          c.peer_id as user_id,
          u.real_name,
          u.avatar_url,
          u.rating,
          c.last_message_time,
          (
            SELECT COUNT(*)
            FROM chat_messages cm2
            WHERE cm2.from_user_id = c.peer_id
              AND cm2.to_user_id = ?
              AND cm2.is_read = 0
          ) as unread_count,
          (
            SELECT cm3.content
            FROM chat_messages cm3
            WHERE (cm3.from_user_id = c.peer_id AND cm3.to_user_id = ?)
               OR (cm3.from_user_id = ? AND cm3.to_user_id = c.peer_id)
            ORDER BY cm3.created_at DESC, cm3.id DESC
            LIMIT 1
          ) as last_message
         FROM (
           SELECT
             CASE
               WHEN cm.from_user_id = ? THEN cm.to_user_id
               ELSE cm.from_user_id
             END as peer_id,
             MAX(cm.created_at) as last_message_time
           FROM chat_messages cm
           WHERE cm.from_user_id = ? OR cm.to_user_id = ?
           GROUP BY CASE
             WHEN cm.from_user_id = ? THEN cm.to_user_id
             ELSE cm.from_user_id
           END
         ) c
         LEFT JOIN users u ON u.id = c.peer_id
         ORDER BY c.last_message_time DESC`,
        [userId, userId, userId, userId, userId, userId, userId]
      );

      const contacts = rows.map((row: any) => ({
        user_id: row.user_id,
        real_name: row.real_name,
        avatar_url: row.avatar_url,
        rating: row.rating,
        last_message_time: row.last_message_time,
        unread_count: row.unread_count,
        last_message: row.last_message,
      }));

      return contacts;
    } catch (error) {
      logger.error('Get contacts error:', error);
      throw error;
    }
  }

  /**
   * 获取未读消息数量
   */
  async getUnreadCount(userId: number) {
    try {
      const [rows] = await pool.query<RowDataPacket[]>(
        `SELECT COUNT(*) as count FROM chat_messages WHERE to_user_id = ? AND is_read = 0`,
        [userId]
      );
      return { count: rows[0].count };
    } catch (error) {
      logger.error('Get unread count error:', error);
      throw error;
    }
  }

  /**
   * 标记消息为已读
   */
  async markAsRead(userId: number, fromUserId: number) {
    try {
      await pool.query(
        `UPDATE chat_messages SET is_read = 1
         WHERE from_user_id = ? AND to_user_id = ? AND is_read = 0`,
        [fromUserId, userId]
      );
      return { success: true };
    } catch (error) {
      logger.error('Mark as read error:', error);
      throw error;
    }
  }
}

export default new ChatService();
