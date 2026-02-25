// 用户类型
export interface User {
  id: number;
  phone: string;
  real_name?: string;
  id_card_verified: number;
  gender?: number;
  avatar_url?: string;
  rating: number;
  rating_count: number;
  status: number;
}

// 乘客需求类型
export interface PassengerRequest {
  id: number;
  user_id: number;
  travel_date: string;
  time_start: string;
  time_end: string;
  origin: string;
  destination: string;
  passenger_count: number;
  price_min?: number;
  price_max?: number;
  remarks?: string;
  status: number;
  created_at: string;
  updated_at: string;
  user?: User;
}

// 车主邀客类型
export interface DriverInvite {
  id: number;
  user_id: number;
  travel_date: string;
  time_start: string;
  time_end: string;
  origin: string;
  destination: string;
  available_seats: number;
  price?: number;
  car_model?: string;
  car_plate?: string;
  remarks?: string;
  status: number;
  created_at: string;
  updated_at: string;
  user?: User;
}

// 聊天消息类型
export interface ChatMessage {
  id: number;
  from_user_id: number;
  to_user_id: number;
  message_type: number;
  content: string;
  is_read: number;
  created_at: string;
  from_user?: {
    real_name?: string;
    avatar_url?: string;
  };
  to_user?: {
    real_name?: string;
    avatar_url?: string;
  };
}

// 联系人类型
export interface Contact {
  user_id: number;
  real_name?: string;
  avatar_url?: string;
  rating: number;
  last_message_time: string;
  unread_count: number;
  last_message: string;
}

export interface Review {
  id: number;
  target_type: 'passenger' | 'driver';
  target_id: number;
  from_user_id: number;
  to_user_id: number;
  rating: number;
  comment?: string;
  created_at: string;
  from_user?: {
    real_name?: string;
    avatar_url?: string;
  };
}

// API 响应类型
export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

export interface PaginatedResponse<T> {
  list: T[];
  total: number;
  page: number;
  limit: number;
}

// 认证相关
export interface AuthData {
  token: string;
  refreshToken: string;
  user: User;
}
