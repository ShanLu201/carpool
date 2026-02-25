import apiClient from './api';
import { ChatMessage, Contact, ApiResponse, PaginatedResponse } from '../types';

export const chatService = {
  // 获取联系人列表
  getContacts: (): Promise<ApiResponse<{ contacts: Contact[] }>> => {
    return apiClient.get('/chat/contacts');
  },

  // 获取消息历史
  getMessages: (userId: number, params?: { page?: number; limit?: number }): Promise<ApiResponse<PaginatedResponse<ChatMessage>>> => {
    return apiClient.get(`/chat/messages/${userId}`, params);
  },

  // 标记为已读
  markAsRead: (userId: number): Promise<ApiResponse> => {
    return apiClient.put(`/chat/messages/read/${userId}`);
  },

  // 获取未读数量
  getUnread: (): Promise<ApiResponse<{ count: number }>> => {
    return apiClient.get('/chat/unread');
  },
};

export default chatService;
