import { http } from './http';

/**
 * 用户经验值接口
 */
export interface UserExp {
  now: string;
  next: string;
}

/**
 * 用户信息接口
 */
export interface UserInfo {
  id: number;
  username: string;
  email: string;
  avatar: string;
  nickname: string;
  level: number;
  exp: UserExp;
  join_date: string;
  posts_count: number;
  followers_count: number;
  following_count: number;
  role: string;
}

/**
 * 用户信息响应接口
 */
export interface UserInfoResponse {
  code: number;
  message: string;
  data: UserInfo;
}

/**
 * 用户相关API服务
 */
export const userApi = {
  /**
   * 获取指定用户的详细信息
   * @param userId 用户ID
   * @returns 用户信息响应
   */
  getUserInfo: async (userId: number): Promise<UserInfoResponse> => {
    try {
      const response = await http<UserInfoResponse>(`/user/${userId}/info`);
      return response;
    } catch (error) {
      console.error('获取用户信息失败:', error);
      throw error;
    }
  },

  /**
   * 获取当前登录用户信息
   * @returns 当前用户信息
   */
  getCurrentUser: async (): Promise<UserInfoResponse> => {
    try {
      const response = await http<UserInfoResponse>('/user/info');
      return response;
    } catch (error) {
      console.error('获取当前用户信息失败:', error);
      throw error;
    }
  },
};