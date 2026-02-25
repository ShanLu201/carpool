import type { RowDataPacket, ResultSetHeader } from 'mysql2';
import pool from '../config/database';
import { hashPassword, comparePassword } from '../utils/bcrypt';
import { generateToken, generateRefreshToken } from '../config/jwt';
import { User } from '../types';
import logger from '../utils/logger';

export class AuthService {
  /**
   * 用户注册
   */
  async register(phone: string, password: string) {
    try {
      // 检查手机号是否已存在
      const [existing] = await pool.query<RowDataPacket[]>(
        'SELECT id FROM users WHERE phone = ?',
        [phone]
      );

      if (existing.length > 0) {
        throw new Error('手机号已被注册');
      }

      // 加密密码
      const passwordHash = await hashPassword(password);

      // 创建用户
      const [result] = await pool.query<ResultSetHeader>(
        `INSERT INTO users (phone, password_hash) VALUES (?, ?)`,
        [phone, passwordHash]
      );

      const userId = result.insertId;

      // 生成 Token
      const payload = { userId, phone };
      const token = generateToken(payload);
      const refreshToken = generateRefreshToken(payload);

      // 获取用户信息
      const [users] = await pool.query<RowDataPacket[]>(
        'SELECT id, phone, real_name, id_card_verified, gender, avatar_url, rating, rating_count, status FROM users WHERE id = ?',
        [userId]
      );

      return {
        token,
        refreshToken,
        user: users[0] as User,
      };
    } catch (error) {
      logger.error('Register error:', error);
      throw error;
    }
  }

  /**
   * 用户登录
   */
  async login(phone: string, password: string) {
    try {
      // 查找用户
      const [users] = await pool.query<RowDataPacket[]>(
        'SELECT * FROM users WHERE phone = ?',
        [phone]
      );

      if (users.length === 0) {
        throw new Error('手机号或密码错误');
      }

      const user = users[0] as any;

      // 验证密码
      const isValid = await comparePassword(password, user.password_hash);
      if (!isValid) {
        throw new Error('手机号或密码错误');
      }

      // 检查用户状态
      if (user.status !== 1) {
        throw new Error('账号已被禁用');
      }

      // 生成 Token
      const payload = { userId: user.id, phone: user.phone };
      const token = generateToken(payload);
      const refreshToken = generateRefreshToken(payload);

      // 更新最后登录时间
      await pool.query(
        'UPDATE users SET last_login_at = NOW() WHERE id = ?',
        [user.id]
      );

      // 返回用户信息（不包含密码）
      const { password_hash, ...userInfo } = user;

      return {
        token,
        refreshToken,
        user: userInfo as User,
      };
    } catch (error) {
      logger.error('Login error:', error);
      throw error;
    }
  }

  /**
   * 实名认证
   */
  async verify(userId: number, realName: string, idCard: string) {
    try {
      // 更新用户实名信息
      await pool.query(
        `UPDATE users SET real_name = ?, id_card = ?, id_card_verified = 1, updated_at = NOW() WHERE id = ?`,
        [realName, idCard, userId]
      );

      return { success: true, verified: true };
    } catch (error) {
      logger.error('Verify error:', error);
      throw error;
    }
  }

  /**
   * 获取用户信息
   */
  async getUserById(userId: number) {
    try {
      const [users] = await pool.query<RowDataPacket[]>(
        'SELECT id, phone, real_name, id_card_verified, gender, avatar_url, rating, rating_count, status FROM users WHERE id = ?',
        [userId]
      );

      if (users.length === 0) {
        throw new Error('用户不存在');
      }

      return users[0] as User;
    } catch (error) {
      logger.error('Get user error:', error);
      throw error;
    }
  }

  /**
   * 更新用户资料
   */
  async updateProfile(userId: number, data: Partial<User>) {
    try {
      const updates: string[] = [];
      const values: any[] = [];

      if (data.real_name !== undefined) {
        updates.push('real_name = ?');
        values.push(data.real_name);
      }
      if (data.gender !== undefined) {
        updates.push('gender = ?');
        values.push(data.gender);
      }
      if (data.avatar_url !== undefined) {
        updates.push('avatar_url = ?');
        values.push(data.avatar_url);
      }

      if (updates.length === 0) {
        return await this.getUserById(userId);
      }

      updates.push('updated_at = NOW()');
      values.push(userId);

      await pool.query(
        `UPDATE users SET ${updates.join(', ')} WHERE id = ?`,
        values
      );

      return await this.getUserById(userId);
    } catch (error) {
      logger.error('Update profile error:', error);
      throw error;
    }
  }

  /**
   * 修改密码
   */
  async changePassword(userId: number, oldPassword: string, newPassword: string) {
    try {
      // 获取当前密码
      const [users] = await pool.query<RowDataPacket[]>(
        'SELECT password_hash FROM users WHERE id = ?',
        [userId]
      );

      if (users.length === 0) {
        throw new Error('用户不存在');
      }

      const user = users[0] as any;

      // 验证旧密码
      const isValid = await comparePassword(oldPassword, user.password_hash);
      if (!isValid) {
        throw new Error('原密码错误');
      }

      // 加密新密码
      const newPasswordHash = await hashPassword(newPassword);

      // 更新密码
      await pool.query(
        'UPDATE users SET password_hash = ?, updated_at = NOW() WHERE id = ?',
        [newPasswordHash, userId]
      );

      return { success: true };
    } catch (error) {
      logger.error('Change password error:', error);
      throw error;
    }
  }
}

export default new AuthService();
