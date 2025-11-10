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
      // 只使用用户ID获取信息的接口，不再使用/user/me接口
      const response = await http<UserInfoResponse>(`/user/${userId}/info`);
      return response;
    } catch (error) {
      console.error('获取用户信息失败:', error);
      throw error;
    }
  },

  /**
   * 获取当前登录用户信息
   * @param userId 当前用户ID
   * @returns 当前用户信息
   * @throws 如果未提供userId则抛出错误
   */
  getCurrentUser: async (userId: number): Promise<UserInfoResponse> => {
    try {
      if (!userId) {
        throw new Error('获取当前用户信息失败：未提供用户ID');
      }
      // 使用用户ID获取信息，不再使用/user/me接口
      const response = await http<UserInfoResponse>(`/user/${userId}/info`);
      return response;
    } catch (error) {
      console.error('获取当前用户信息失败:', error);
      throw error;
    }
  },
};