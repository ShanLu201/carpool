import apiClient from './api';
import { User, AuthData, ApiResponse } from '../types';

export const authService = {
  // 注册
  register: (phone: string, password: string): Promise<ApiResponse<AuthData>> => {
    return apiClient.post('/auth/register', { phone, password });
  },

  // 登录
  login: (phone: string, password: string): Promise<ApiResponse<AuthData>> => {
    return apiClient.post('/auth/login', { phone, password });
  },

  // 获取当前用户
  me: (): Promise<ApiResponse<{ user: User }>> => {
    return apiClient.get('/auth/me');
  },

  // 实名认证
  verify: (realName: string, idCard: string): Promise<ApiResponse> => {
    return apiClient.post('/auth/verify', { real_name: realName, id_card: idCard });
  },

  // 更新个人资料
  updateProfile: (data: Partial<User>): Promise<ApiResponse<{ user: User }>> => {
    return apiClient.put('/auth/profile', data);
  },

  // 修改密码
  changePassword: (oldPassword: string, newPassword: string): Promise<ApiResponse> => {
    return apiClient.put('/auth/password', { old_password: oldPassword, new_password: newPassword });
  },
};

export default authService;
