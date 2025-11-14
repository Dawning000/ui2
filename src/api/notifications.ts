import { http } from './http';

/**
 * 通知数量响应接口
 */
export interface NotificationCountResponse {
  code: number;
  message: string;
  data: {
    unread: number;
  };
}

/**
 * 通知项接口
 */
export interface NotificationItem {
  id: number;
  title: string;
  content: string;
  type: string;
  isRead: boolean;
  read?: boolean;  // 后端可能返回的是 read 字段
  createdAt: string;
  [key: string]: any;
}

/**
 * 通知列表响应接口
 */
export interface NotificationListResponse {
  code: number;
  message: string;
  data: {
    notifications: NotificationItem[];
    total: number;
    unread: number;
  };
}

/**
 * 标记已读响应接口
 */
export interface MarkReadResponse {
  code: number;
  message: string;
  data?: any;
}

/**
 * 通知相关API服务
 */
export const notificationApi = {
  /**
   * 获取未读通知数量
   * @returns 通知数量响应
   */
  getNotificationCount: async (): Promise<NotificationCountResponse> => {
    try {
      const response = await http<NotificationCountResponse>('/notifications/count');
      return response;
    } catch (error) {
      console.error('获取通知数量失败:', error);
      throw error;
    }
  },

  /**
   * 获取通知列表
   * @returns 通知列表响应
   */
  getNotificationList: async (): Promise<NotificationListResponse> => {
    try {
      const response = await http<NotificationListResponse>('/notifications/list?page=1&size=10000000');
      return response;
    } catch (error) {
      console.error('获取通知列表失败:', error);
      throw error;
    }
  },

  /**
   * 标记通知为已读
   * @param notificationId 通知ID
   * @returns 标记结果响应
   */
  markAsRead: async (notificationId: number): Promise<MarkReadResponse> => {
    try {
      const response = await http<MarkReadResponse>(`/notifications/${notificationId}/read`, {
        method: 'POST'
      });
      return response;
    } catch (error) {
      console.error('标记通知已读失败:', error);
      throw error;
    }
  },

  /**
   * 标记所有通知为已读
   * @returns 标记结果响应
   */
  readAll: async (): Promise<MarkReadResponse> => {
    try {
      const response = await http<MarkReadResponse>('/notifications/readAll', {
        method: 'POST'
      });
      return response;
    } catch (error) {
      console.error('标记所有通知已读失败:', error);
      throw error;
    }
  },
};

