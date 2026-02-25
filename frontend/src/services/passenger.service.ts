import apiClient from './api';
import { PassengerRequest, ApiResponse, PaginatedResponse } from '../types';

export const passengerService = {
  // 发布乘客需求
  publish: (data: Partial<PassengerRequest>): Promise<ApiResponse<{ id: number }>> => {
    return apiClient.post('/passenger/publish', data);
  },

  // 查询乘客需求列表
  list: (params?: any): Promise<ApiResponse<PaginatedResponse<PassengerRequest>>> => {
    return apiClient.get('/passenger/list', params);
  },

  // 获取详情
  getById: (id: number): Promise<ApiResponse<{ request: PassengerRequest }>> => {
    return apiClient.get(`/passenger/${id}`);
  },

  // 更新需求
  update: (id: number, data: Partial<PassengerRequest>): Promise<ApiResponse<{ request: PassengerRequest }>> => {
    return apiClient.put(`/passenger/${id}`, data);
  },

  // 取消需求
  cancel: (id: number): Promise<ApiResponse> => {
    return apiClient.delete(`/passenger/${id}`);
  },

  // 我的需求
  myRequests: (params?: any): Promise<ApiResponse<PaginatedResponse<PassengerRequest>>> => {
    return apiClient.get('/passenger/my/requests', params);
  },
};

export default passengerService;
