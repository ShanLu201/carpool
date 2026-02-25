import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/zh-cn';

dayjs.extend(relativeTime);
dayjs.locale('zh-cn');

export const formatDate = (date: string | Date): string => {
  return dayjs(date).format('YYYY-MM-DD');
};

export const formatTime = (time: string): string => {
  return time.substring(0, 5); // HH:mm
};

export const formatDateTime = (datetime: string): string => {
  return dayjs(datetime).format('YYYY-MM-DD HH:mm');
};

export const fromNow = (datetime: string): string => {
  return dayjs(datetime).fromNow();
};

export const isToday = (date: string): boolean => {
  return dayjs(date).isSame(dayjs(), 'day');
};

export const isTomorrow = (date: string): boolean => {
  return dayjs(date).isSame(dayjs().add(1, 'day'), 'day');
};

export const getWeekday = (date: string): string => {
  const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
  return weekdays[dayjs(date).day()];
};

export const getDisplayDate = (date: string): string => {
  if (isToday(date)) return '今天';
  if (isTomorrow(date)) return '明天';
  return formatDate(date);
};
