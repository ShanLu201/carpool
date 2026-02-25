export const APP_NAME = '拼车平台';
export const APP_DESCRIPTION = '乘客与车主的出行信息发布与匹配平台';

export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  PASSENGER_LIST: '/passenger',
  PASSENGER_PUBLISH: '/passenger/publish',
  PASSENGER_DETAIL: '/passenger/:id',
  DRIVER_LIST: '/driver',
  DRIVER_PUBLISH: '/driver/publish',
  DRIVER_DETAIL: '/driver/:id',
  CHAT: '/chat',
  CHAT_ROOM: '/chat/:userId',
  PROFILE: '/profile',
  VERIFICATION: '/profile/verification',
} as const;

export const GENDERS = {
  UNKNOWN: 0,
  MALE: 1,
  FEMALE: 2,
} as const;

export const GENDER_OPTIONS = [
  { label: '保密', value: 0 },
  { label: '男', value: 1 },
  { label: '女', value: 2 },
];

export const RIDE_STATUS = {
  CANCELLED: 0,
  ACTIVE: 1,
  COMPLETED: 2,
} as const;

export const RIDE_STATUS_OPTIONS = [
  { label: '已取消', value: 0 },
  { label: '进行中', value: 1 },
  { label: '已完成', value: 2 },
];

export const MESSAGE_TYPES = {
  TEXT: 1,
  IMAGE: 2,
  VOICE: 3,
} as const;
