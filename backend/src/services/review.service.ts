import type { RowDataPacket, ResultSetHeader } from 'mysql2';
import pool from '../config/database';
import logger from '../utils/logger';

interface CreateReviewData {
  target_type: 'passenger' | 'driver';
  target_id: number;
  to_user_id: number;
  rating: number;
  comment?: string | null;
}

export class ReviewService {
  private async getUserRatingSummary(userId: number, connection?: any) {
    const [rows] = await (connection || pool).query(
      'SELECT AVG(rating) AS avg_rating, COUNT(*) AS rating_count FROM reviews WHERE to_user_id = ?',
      [userId]
    );

    const summaryRows = rows as RowDataPacket[];
    const avgRating = summaryRows[0]?.avg_rating ? Number(summaryRows[0].avg_rating) : 0;
    const ratingCount = summaryRows[0]?.rating_count ? Number(summaryRows[0].rating_count) : 0;

    return {
      rating: Number(avgRating.toFixed(2)),
      rating_count: ratingCount,
    };
  }

  async createReview(fromUserId: number, data: CreateReviewData) {
    const { target_type, target_id, to_user_id, rating, comment } = data;

    if (fromUserId === to_user_id) {
      throw new Error('不能评价自己');
    }

    const connection = await pool.getConnection();

    try {
      await connection.beginTransaction();

      const targetTable = target_type === 'passenger' ? 'passenger_requests' : 'driver_invites';
      const [targetRows] = await connection.query<RowDataPacket[]>(
        `SELECT id FROM ${targetTable} WHERE id = ? AND status = 2 AND user_id = ? LIMIT 1`,
        [target_id, to_user_id]
      );

      if (targetRows.length === 0) {
        throw new Error('仅状态已完成的发布可评价');
      }

      const [duplicateRows] = await connection.query<RowDataPacket[]>(
        'SELECT id FROM reviews WHERE from_user_id = ? AND target_type = ? AND target_id = ? LIMIT 1',
        [fromUserId, target_type, target_id]
      );

      if (duplicateRows.length > 0) {
        throw new Error('该发布已评价，请勿重复评价');
      }

      const [insertResult] = await connection.query<ResultSetHeader>(
        `INSERT INTO reviews (target_type, target_id, from_user_id, to_user_id, rating, comment)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [target_type, target_id, fromUserId, to_user_id, rating, comment || null]
      );

      const summary = await this.getUserRatingSummary(to_user_id, connection);

      await connection.query(
        'UPDATE users SET rating = ?, rating_count = ? WHERE id = ?',
        [summary.rating, summary.rating_count, to_user_id]
      );

      await connection.commit();

      return {
        id: insertResult.insertId,
        to_user_id,
        ...summary,
      };
    } catch (error) {
      await connection.rollback();
      logger.error('Create review error:', error);
      throw error;
    } finally {
      connection.release();
    }
  }

  async getUserReviews(userId: number, query: any) {
    try {
      const pageNum = Math.max(Number(query.page) || 1, 1);
      const limitNum = Math.min(Math.max(Number(query.limit) || 10, 1), 100);
      const offset = (pageNum - 1) * limitNum;

      const [countResult] = await pool.query<RowDataPacket[]>(
        'SELECT COUNT(*) AS total FROM reviews WHERE to_user_id = ?',
        [userId]
      );
      const total = Number(countResult[0]?.total || 0);

      const [rows] = await pool.query<RowDataPacket[]>(
        `SELECT r.*, u.real_name AS from_real_name, u.avatar_url AS from_avatar_url
         FROM reviews r
         LEFT JOIN users u ON r.from_user_id = u.id
         WHERE r.to_user_id = ?
         ORDER BY r.created_at DESC
         LIMIT ? OFFSET ?`,
        [userId, limitNum, offset]
      );

      const list = rows.map((row: any) => ({
        id: row.id,
        target_type: row.target_type,
        target_id: row.target_id,
        from_user_id: row.from_user_id,
        to_user_id: row.to_user_id,
        rating: row.rating,
        comment: row.comment,
        created_at: row.created_at,
        from_user: {
          real_name: row.from_real_name,
          avatar_url: row.from_avatar_url,
        },
      }));

      return {
        list,
        total,
        page: pageNum,
        limit: limitNum,
      };
    } catch (error) {
      logger.error('Get user reviews error:', error);
      throw error;
    }
  }
}

export default new ReviewService();
