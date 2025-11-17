export interface User {
  id: number;
  username: string;
  email: string;
  avatar: string;
  nickname: string;
  level: number;
  joinDate: string;
  postsCount: number;
  followersCount: number;
  followingCount: number;
  role?: string; // 用户角色，如 "ADMIN"
  bio?: string; // 用户简介
  location?: string; // 用户位置
  website?: string; // 用户网站
}

export interface LoginCredentials {
  username: string;
  password: string;
  /** 是否记住我；在请求中将映射为字符串参数 'remember-me' */
  remember?: boolean;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  nickname: string;
  favors: string[];
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  user?: T;
  token?: string;
}

export interface ProfileUpdateData {
  nickname?: string;
  email?: string;
  avatar?: string;
  [key: string]: any;
}

/**
 * 关注用户信息接口
 */
export interface FollowingUser {
  id: number;
  username: string;
  nickname: string;
  avatar: string;
  followers_count: number;
  is_following: boolean;
}

/**
 * 分页信息接口
 */
export interface Pagination {
  total: number;
  page: number;
  size: number;
  has_next: boolean;
}

/**
 * 用户关注列表响应接口
 */
export interface FollowingListResponse {
  code: number;
  message: string;
  data: {
    list: FollowingUser[];
    pagination: Pagination;
  };
}