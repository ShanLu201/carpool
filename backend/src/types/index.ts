export interface User {
  id: number;
  phone: string;
  real_name?: string;
  id_card?: string;
  id_card_verified: number;
  gender?: number;
  avatar_url?: string;
  rating: number;
  rating_count: number;
  status: number;
  created_at: Date;
  updated_at: Date;
  last_login_at?: Date;
}

export interface PassengerRequest {
  id: number;
  user_id: number;
  travel_date: string;
  time_start: string;
  time_end: string;
  origin: string;
  origin_latitude?: number;
  origin_longitude?: number;
  destination: string;
  destination_latitude?: number;
  destination_longitude?: number;
  passenger_count: number;
  price_min?: number;
  price_max?: number;
  remarks?: string;
  status: number;
  created_at: Date;
  updated_at: Date;
  user?: User;
}

export interface DriverInvite {
  id: number;
  user_id: number;
  travel_date: string;
  time_start: string;
  time_end: string;
  origin: string;
  origin_latitude?: number;
  origin_longitude?: number;
  destination: string;
  destination_latitude?: number;
  destination_longitude?: number;
  available_seats: number;
  price?: number;
  car_model?: string;
  car_plate?: string;
  remarks?: string;
  status: number;
  created_at: Date;
  updated_at: Date;
  user?: User;
}

export interface ChatMessage {
  id: number;
  order_id?: number;
  from_user_id: number;
  to_user_id: number;
  message_type: number;
  content: string;
  is_read: number;
  created_at: Date;
  from_user?: User;
}

export interface Review {
  id: number;
  target_type: 'passenger' | 'driver';
  target_id: number;
  order_id?: number;
  from_user_id: number;
  to_user_id: number;
  rating: number;
  comment?: string;
  created_at: Date;
}

import { JwtPayload } from '../config/jwt';

declare module 'express-serve-static-core' {
  interface Request {
    user?: JwtPayload;
  }
}

export type MessageStatus = 0 | 1;
export type MessageType = 1 | 2 | 3; // 1-文本 2-图片 3-语音
export type UserStatus = 0 | 1; // 0-禁用 1-正常
export type RideStatus = 0 | 1 | 2; // 0-已取消 1-进行中 2-已完成
