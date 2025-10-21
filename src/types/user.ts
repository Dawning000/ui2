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
