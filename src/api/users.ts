import { http, jsonBody } from './http';
import type { FollowingListResponse } from '@/types/user';

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
  isFollowing?: boolean;
}

/**
 * 更新用户资料请求接口
 */
export interface UpdateUserProfileRequest {
  nickname: string;
  avatar: string;
  email: string;
}

/**
 * 修改密码请求接口
 */
export interface ChangePasswordRequest {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
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
 * 更新用户资料响应接口
 */
export interface UpdateUserProfileResponse {
  code: number;
  message: string;
  data: {
    updated: boolean;
    id: number;
  };
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
   * @param userId 用户ID（可选），如果不提供则从/user/me接口获取
   * @returns 当前用户信息
   */
  getCurrentUser: async (userId?: number): Promise<UserInfoResponse> => {
    try {
      // 如果提供了userId，则使用传统接口获取信息
      // 否则使用/user/me接口获取当前登录用户信息
      const response = await http<UserInfoResponse>(
        userId ? `/user/${userId}/info` : '/user/me'
      );
      return response;
    } catch (error) {
      console.error('获取当前用户信息失败:', error);
      throw error;
    }
  },

  /**
   * 更新用户资料
   * @param userId 用户ID
   * @param data 更新的用户资料
   * @returns 更新结果
   */
  async updateUserProfile(userId: number, data: UpdateUserProfileRequest): Promise<UpdateUserProfileResponse> {
    try {
      const response = await http<UpdateUserProfileResponse>(`/user/${userId}/update`, {
        method: 'POST',
        body: jsonBody(data)
      });
      return response;
    } catch (error) {
      console.error('更新用户资料失败:', error);
      throw error;
    }
  },

  /**
   * 修改用户密码
   * @param userId 用户ID
   * @param data 修改密码的数据
   * @returns 修改结果
   */
  changePassword: async (userId: number, data: ChangePasswordRequest): Promise<UserInfoResponse> => {
    try {
      const response = await http<UserInfoResponse>(`/user/${userId}/password`, {
        method: 'POST',
        body: jsonBody(data)
      });
      return response;
    } catch (error) {
      console.error('修改密码失败:', error);
      throw error;
    }
  },

  /**
   * 关注用户
   * @param userId 要关注的用户ID
   * @returns 操作结果
   */
  followUser: async (userId: number): Promise<{ code: number; message: string; data?: any }> => {
    try {
      const response = await http<{ code: number; message: string; data?: any }>(`/user/${userId}/follow`, {
        method: 'POST'
      });
      return response;
    } catch (error) {
      console.error('关注用户失败:', error);
      throw error;
    }
  },

  /**
   * 取消关注用户
   * @param userId 要取消关注的用户ID
   * @returns 操作结果
   */
  unfollowUser: async (userId: number): Promise<{ code: number; message: string; data?: any }> => {
    try {
      const response = await http<{ code: number; message: string; data?: any }>(`/user/${userId}/unfollow`, {
        method: 'POST'
      });
      return response;
    } catch (error) {
      console.error('取消关注用户失败:', error);
      throw error;
    }
  },

  /**
   * 获取用户关注列表
   * @param userId 用户ID
   * @param page 页码，默认为1
   * @param size 每页数量，默认为10
   * @returns 关注列表响应
   */
  getFollowingList: async (userId: number, page: number = 1, size: number = 10): Promise<FollowingListResponse> => {
    try {
      const params = new URLSearchParams();
      if (page) params.append('page', page.toString());
      if (size) params.append('size', size.toString());
      
      const queryString = params.toString();
      const url = `/user/${userId}/following${queryString ? `?${queryString}` : ''}`;
      
      const response = await http<FollowingListResponse>(url);
      return response;
    } catch (error) {
      console.error('获取用户关注列表失败:', error);
      throw error;
    }
  },
};