import type { RowDataPacket, ResultSetHeader } from 'mysql2';
import pool from '../config/database';
import { DriverInvite } from '../types';
import logger from '../utils/logger';

export class DriverService {
  /**
   * 发布车主邀客
   */
  async publish(userId: number, data: any) {
    try {
      const [result] = await pool.query<ResultSetHeader>(
        `INSERT INTO driver_invites
         (user_id, travel_date, time_start, time_end, origin, origin_latitude, origin_longitude,
          destination, destination_latitude, destination_longitude, available_seats, price, car_model, car_plate, remarks)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
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
          data.available_seats,
          data.price || null,
          data.car_model || null,
          data.car_plate || null,
          data.remarks || null,
        ]
      );

      return { id: result.insertId };
    } catch (error) {
      logger.error('Publish driver error:', error);
      throw error;
    }
  }

  /**
   * 查询车主邀客列表
   */
  async getList(query: any) {
    try {
      const { page = 1, limit = 10, travel_date, origin, destination, status } = query;
      const pageNum = Number(page) || 1;
      const limitNum = Number(limit) || 10;
      const offset = (pageNum - 1) * limitNum;

      let whereConditions = ['di.status IN (1, 2)'];
      let params: any[] = [];

      if (travel_date) {
        whereConditions.push('di.travel_date = ?');
        params.push(travel_date);
      }

      if (origin) {
        whereConditions.push('di.origin LIKE ?');
        params.push(`%${origin}%`);
      }

      if (destination) {
        whereConditions.push('di.destination LIKE ?');
        params.push(`%${destination}%`);
      }

      if (status !== undefined) {
        whereConditions.push('di.status = ?');
        params.push(status);
      }

      const whereClause = whereConditions.join(' AND ');

      // 查询总数
      const [countResult] = await pool.query<RowDataPacket[]>(
        `SELECT COUNT(*) as total FROM driver_invites di WHERE ${whereClause}`,
        params
      );
      const total = countResult[0].total;

      // 查询列表
      const [rows] = await pool.query<RowDataPacket[]>(
        `SELECT di.*, u.id as publisher_id, u.phone, u.real_name, u.avatar_url, u.rating
         FROM driver_invites di
         LEFT JOIN users u ON di.user_id = u.id
         WHERE ${whereClause}
         ORDER BY di.created_at DESC
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
        const { publisher_id, phone, real_name, avatar_url, rating, ...di } = row;
        return { ...di, user };
      });

      return { list, total, page: pageNum, limit: limitNum };
    } catch (error) {
      logger.error('Get driver list error:', error);
      throw error;
    }
  }

  /**
   * 获取车主邀客详情
   */
  async getById(id: number) {
    try {
      const [rows] = await pool.query<RowDataPacket[]>(
        `SELECT di.*, u.id as user_id, u.phone, u.real_name, u.avatar_url, u.rating, u.rating_count
         FROM driver_invites di
         LEFT JOIN users u ON di.user_id = u.id
         WHERE di.id = ?`,
        [id]
      );

      if (rows.length === 0) {
        throw new Error('邀客信息不存在');
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
      const { user_id, phone, real_name, avatar_url, rating, rating_count, ...di } = row;
      return { ...di, user };
    } catch (error) {
      logger.error('Get driver detail error:', error);
      throw error;
    }
  }

  /**
   * 更新车主邀客
   */
  async update(id: number, userId: number, data: any) {
    try {
      // 检查是否是自己的邀客
      const [rows] = await pool.query<RowDataPacket[]>(
        'SELECT user_id FROM driver_invites WHERE id = ?',
        [id]
      );

      if (rows.length === 0) {
        throw new Error('邀客信息不存在');
      }

      if ((rows[0] as any).user_id !== userId) {
        throw new Error('无权修改此邀客信息');
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
      if (data.available_seats) {
        updates.push('available_seats = ?');
        values.push(data.available_seats);
      }
      if (data.price !== undefined) {
        updates.push('price = ?');
        values.push(data.price || null);
      }
      if (data.car_model !== undefined) {
        updates.push('car_model = ?');
        values.push(data.car_model || null);
      }
      if (data.car_plate !== undefined) {
        updates.push('car_plate = ?');
        values.push(data.car_plate || null);
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
        `UPDATE driver_invites SET ${updates.join(', ')} WHERE id = ?`,
        values
      );

      return await this.getById(id);
    } catch (error) {
      logger.error('Update driver error:', error);
      throw error;
    }
  }

  /**
   * 取消车主邀客
   */
  async cancel(id: number, userId: number) {
    try {
      // 检查是否是自己的邀客
      const [rows] = await pool.query<RowDataPacket[]>(
        'SELECT user_id FROM driver_invites WHERE id = ?',
        [id]
      );

      if (rows.length === 0) {
        throw new Error('邀客信息不存在');
      }

      if ((rows[0] as any).user_id !== userId) {
        throw new Error('无权取消此邀客信息');
      }

      await pool.query(
        'UPDATE driver_invites SET status = 0, updated_at = NOW() WHERE id = ?',
        [id]
      );

      return { success: true };
    } catch (error) {
      logger.error('Cancel driver error:', error);
      throw error;
    }
  }

  /**
   * 获取我的邀客
   */
  async getMyInvites(userId: number, query: any) {
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
        `SELECT COUNT(*) as total FROM driver_invites WHERE ${whereClause}`,
        params
      );
      const total = countResult[0].total;

      // 查询列表
      const [rows] = await pool.query<RowDataPacket[]>(
        `SELECT * FROM driver_invites WHERE ${whereClause}
         ORDER BY created_at DESC
         LIMIT ? OFFSET ?`,
        [...params, limitNum, offset]
      );

      return {
        list: rows as DriverInvite[],
        total,
        page: pageNum,
        limit: limitNum,
      };
    } catch (error) {
      logger.error('Get my invites error:', error);
      throw error;
    }
  }
}

export default new DriverService();
