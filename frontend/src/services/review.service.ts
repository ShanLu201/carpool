import apiClient from './api';
import { ApiResponse, PaginatedResponse, Review } from '../types';

interface CreateReviewPayload {
  target_type: 'passenger' | 'driver';
  target_id: number;
  to_user_id: number;
  rating: number;
  comment?: string;
}

export const reviewService = {
  create: (data: CreateReviewPayload): Promise<ApiResponse<{ id: number; to_user_id: number; rating: number; rating_count: number }>> => {
    return apiClient.post('/reviews', data);
  },

  getUserReviews: (userId: number, params?: { page?: number; limit?: number }): Promise<ApiResponse<PaginatedResponse<Review>>> => {
    return apiClient.get(`/reviews/user/${userId}`, params);
  },
};

export default reviewService;
