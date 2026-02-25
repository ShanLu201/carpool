import apiClient from './api';
import { DriverInvite, ApiResponse, PaginatedResponse } from '../types';

export const driverService = {
  // 发布车主邀客
  publish: (data: Partial<DriverInvite>): Promise<ApiResponse<{ id: number }>> => {
    return apiClient.post('/driver/publish', data);
  },

  // 查询车主邀客列表
  list: (params?: any): Promise<ApiResponse<PaginatedResponse<DriverInvite>>> => {
    return apiClient.get('/driver/list', params);
  },

  // 获取详情
  getById: (id: number): Promise<ApiResponse<{ invite: DriverInvite }>> => {
    return apiClient.get(`/driver/${id}`);
  },

  // 更新邀客
  update: (id: number, data: Partial<DriverInvite>): Promise<ApiResponse<{ invite: DriverInvite }>> => {
    return apiClient.put(`/driver/${id}`, data);
  },

  // 取消邀客
  cancel: (id: number): Promise<ApiResponse> => {
    return apiClient.delete(`/driver/${id}`);
  },

  // 我的邀客
  myInvites: (params?: any): Promise<ApiResponse<PaginatedResponse<DriverInvite>>> => {
    return apiClient.get('/driver/my/invites', params);
  },
};

export default driverService;
