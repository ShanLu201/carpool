export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

export const successResponse = <T>(data: T, message: string = 'Success'): ApiResponse<T> => {
  return {
    success: true,
    message,
    data,
  };
};

export const errorResponse = (error: string): ApiResponse => {
  return {
    success: false,
    error,
  };
};

export const paginatedResponse = <T>(
  data: T[],
  total: number,
  page: number,
  limit: number
): ApiResponse<{ list: T[]; total: number; page: number; limit: number }> => {
  return {
    success: true,
    data: {
      list: data,
      total,
      page,
      limit,
    },
  };
};
