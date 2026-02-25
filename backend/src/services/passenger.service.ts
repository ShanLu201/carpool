import type { RowDataPacket, ResultSetHeader } from 'mysql2';
import pool from '../config/database';
import { PassengerRequest } from '../types';
import logger from '../utils/logger';

export class PassengerService {
  /**
   * 发布乘客需求
   */
  async publish(userId: number, data: any) {
    try {
      const [result] = await pool.query<ResultSetHeader>(
        `INSERT INTO passenger_requests
         (user_id, travel_date, time_start, time_end, origin, origin_latitude, origin_longitude,
          destination, destination_latitude, destination_longitude, passenger_count, price_min, price_max, remarks)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          userId,
          data.travel_date,
          data.time_start,
          data.time_end,
          data.origin,
          data.origin_latitude || null,
          data.origin_longitude || null,
          data.destination,
          data.destination_latitude || null,
          data.destination_longitude || null,
          data.passenger_count,
          data.price_min || null,
          data.price_max || null,
          data.remarks || null,
        ]
      );

      return { id: result.insertId };
    } catch (error) {
      logger.error('Publish passenger error:', error);
      throw error;
    }
  }

  /**
   * 查询乘客需求列表
   */
  async getList(query: any) {
    try {
      const { page = 1, limit = 10, travel_date, origin, destination, status } = query;
      const pageNum = Number(page) || 1;
      const limitNum = Number(limit) || 10;
      const offset = (pageNum - 1) * limitNum;

      let whereConditions = ['pr.status IN (1, 2)'];
      let params: any[] = [];

      if (travel_date) {
        whereConditions.push('pr.travel_date = ?');
        params.push(travel_date);
      }

      if (origin) {
        whereConditions.push('pr.origin LIKE ?');
        params.push(`%${origin}%`);
      }

      if (destination) {
        whereConditions.push('pr.destination LIKE ?');
        params.push(`%${destination}%`);
      }

      if (status !== undefined) {
        whereConditions.push('pr.status = ?');
        params.push(status);
      }

      const whereClause = whereConditions.join(' AND ');

      // 查询总数
      const [countResult] = await pool.query<RowDataPacket[]>(
        `SELECT COUNT(*) as total FROM passenger_requests pr WHERE ${whereClause}`,
        params
      );
      const total = countResult[0].total;

      // 查询列表
      const [rows] = await pool.query<RowDataPacket[]>(
        `SELECT pr.*, u.id as publisher_id, u.phone, u.real_name, u.avatar_url, u.rating
         FROM passenger_requests pr
         LEFT JOIN users u ON pr.user_id = u.id
         WHERE ${whereClause}
         ORDER BY pr.created_at DESC
         LIMIT ? OFFSET ?`,
        [...params, limitNum, offset]
      );

      // 格式化返回数据
      const list = rows.map((row: any) => {
        const user = {
          id: row.publisher_id,
          phone: row.phone,
          real_name: row.real_name,
          avatar_url: row.avatar_url,
          rating: row.rating,
        };
        const { publisher_id, phone, real_name, avatar_url, rating, ...pr } = row;
        return { ...pr, user };
      });

      return { list, total, page: pageNum, limit: limitNum };
    } catch (error) {
      logger.error('Get passenger list error:', error);
      throw error;
    }
  }

  /**
   * 获取乘客需求详情
   */
  async getById(id: number) {
    try {
      const [rows] = await pool.query<RowDataPacket[]>(
        `SELECT pr.*, u.id as user_id, u.phone, u.real_name, u.avatar_url, u.rating, u.rating_count
         FROM passenger_requests pr
         LEFT JOIN users u ON pr.user_id = u.id
         WHERE pr.id = ?`,
        [id]
      );

      if (rows.length === 0) {
        throw new Error('需求不存在');
      }

      const row = rows[0] as any;
      const user = {
        id: row.user_id,
        phone: row.phone,
        real_name: row.real_name,
        avatar_url: row.avatar_url,
        rating: row.rating,
        rating_count: row.rating_count,
      };
      const { user_id, phone, real_name, avatar_url, rating, rating_count, ...pr } = row;
      return { ...pr, user };
    } catch (error) {
      logger.error('Get passenger detail error:', error);
      throw error;
    }
  }

  /**
   * 更新乘客需求
   */
  async update(id: number, userId: number, data: any) {
    try {
      // 检查是否是自己的需求
      const [rows] = await pool.query<RowDataPacket[]>(
        'SELECT user_id FROM passenger_requests WHERE id = ?',
        [id]
      );

      if (rows.length === 0) {
        throw new Error('需求不存在');
      }

      if ((rows[0] as any).user_id !== userId) {
        throw new Error('无权修改此需求');
      }

      const updates: string[] = [];
      const values: any[] = [];

      if (data.travel_date) {
        updates.push('travel_date = ?');
        values.push(data.travel_date);
      }
      if (data.time_start) {
        updates.push('time_start = ?');
        values.push(data.time_start);
      }
      if (data.time_end) {
        updates.push('time_end = ?');
        values.push(data.time_end);
      }
      if (data.origin) {
        updates.push('origin = ?');
        values.push(data.origin);
      }
      if (data.destination) {
        updates.push('destination = ?');
        values.push(data.destination);
      }
      if (data.passenger_count) {
        updates.push('passenger_count = ?');
        values.push(data.passenger_count);
      }
      if (data.price_min !== undefined) {
        updates.push('price_min = ?');
        values.push(data.price_min || null);
      }
      if (data.price_max !== undefined) {
        updates.push('price_max = ?');
        values.push(data.price_max || null);
      }
      if (data.remarks !== undefined) {
        updates.push('remarks = ?');
        values.push(data.remarks || null);
      }
      if (data.status !== undefined) {
        updates.push('status = ?');
        values.push(data.status);
      }

      if (updates.length === 0) {
        return await this.getById(id);
      }

      updates.push('updated_at = NOW()');
      values.push(id);

      await pool.query(
        `UPDATE passenger_requests SET ${updates.join(', ')} WHERE id = ?`,
        values
      );

      return await this.getById(id);
    } catch (error) {
      logger.error('Update passenger error:', error);
      throw error;
    }
  }

  /**
   * 取消乘客需求
   */
  async cancel(id: number, userId: number) {
    try {
      // 检查是否是自己的需求
      const [rows] = await pool.query<RowDataPacket[]>(
        'SELECT user_id FROM passenger_requests WHERE id = ?',
        [id]
      );

      if (rows.length === 0) {
        throw new Error('需求不存在');
      }

      if ((rows[0] as any).user_id !== userId) {
        throw new Error('无权取消此需求');
      }

      await pool.query(
        'UPDATE passenger_requests SET status = 0, updated_at = NOW() WHERE id = ?',
        [id]
      );

      return { success: true };
    } catch (error) {
      logger.error('Cancel passenger error:', error);
      throw error;
    }
  }

  /**
   * 获取我的需求
   */
  async getMyRequests(userId: number, query: any) {
    try {
      const { page = 1, limit = 10, status } = query;
      const pageNum = Number(page) || 1;
      const limitNum = Number(limit) || 10;
      const offset = (pageNum - 1) * limitNum;

      let whereConditions = ['user_id = ?'];
      let params: any[] = [userId];

      if (status !== undefined) {
        whereConditions.push('status = ?');
        params.push(status);
      }

      const whereClause = whereConditions.join(' AND ');

      // 查询总数
      const [countResult] = await pool.query<RowDataPacket[]>(
        `SELECT COUNT(*) as total FROM passenger_requests WHERE ${whereClause}`,
        params
      );
      const total = countResult[0].total;

      // 查询列表
      const [rows] = await pool.query<RowDataPacket[]>(
        `SELECT * FROM passenger_requests WHERE ${whereClause}
         ORDER BY created_at DESC
         LIMIT ? OFFSET ?`,
        [...params, limitNum, offset]
      );

      return {
        list: rows as PassengerRequest[],
        total,
        page: parseInt(page),
        limit: parseInt(limit),
      };
    } catch (error) {
      logger.error('Get my requests error:', error);
      throw error;
    }
  }
}

export default new PassengerService();
