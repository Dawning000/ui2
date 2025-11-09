import { ref } from 'vue';

// 通知类型
export type NotificationType = 'success' | 'error' | 'warning' | 'info';

// 通知选项
export interface NotificationOptions {
  type?: NotificationType;
  duration?: number;
  showClose?: boolean;
  onClose?: () => void;
}

// 通知实例
export interface NotificationInstance {
  id: number;
  message: string;
  type: NotificationType;
  duration: number;
  showClose: boolean;
  onClose?: () => void;
  visible: boolean;
}

// 通知状态
const notifications = ref<NotificationInstance[]>([]);
let notificationId = 0;

/**
 * 通知服务类
 * 用于显示自定义的通知消息，替代原生alert
 */
class NotificationService {
  /**
   * 显示通知
   * @param message 通知消息内容
   * @param options 通知配置选项
   * @returns 通知ID，可用于手动关闭
   */
  notify(message: string, options: NotificationOptions = {}): number {
    const id = ++notificationId;
    const notification: NotificationInstance = {
      id,
      message,
      type: options.type || 'info',
      duration: options.duration ?? 3000,
      showClose: options.showClose ?? true,
      onClose: options.onClose,
      visible: true
    };

    notifications.value.push(notification);

    // 设置自动关闭定时器
    if (notification.duration > 0) {
      setTimeout(() => {
        this.close(id);
      }, notification.duration);
    }

    return id;
  }

  /**
   * 显示成功通知
   * @param message 通知消息内容
   * @param options 通知配置选项
   * @returns 通知ID
   */
  success(message: string, options: Omit<NotificationOptions, 'type'> = {}): number {
    return this.notify(message, { ...options, type: 'success' });
  }

  /**
   * 显示错误通知
   * @param message 通知消息内容
   * @param options 通知配置选项
   * @returns 通知ID
   */
  error(message: string, options: Omit<NotificationOptions, 'type'> = {}): number {
    return this.notify(message, { ...options, type: 'error' });
  }

  /**
   * 显示警告通知
   * @param message 通知消息内容
   * @param options 通知配置选项
   * @returns 通知ID
   */
  warning(message: string, options: Omit<NotificationOptions, 'type'> = {}): number {
    return this.notify(message, { ...options, type: 'warning' });
  }

  /**
   * 显示信息通知
   * @param message 通知消息内容
   * @param options 通知配置选项
   * @returns 通知ID
   */
  info(message: string, options: Omit<NotificationOptions, 'type'> = {}): number {
    return this.notify(message, { ...options, type: 'info' });
  }

  /**
   * 关闭指定ID的通知
   * @param id 通知ID
   */
  close(id: number): void {
    const index = notifications.value.findIndex(notification => notification.id === id);
    if (index !== -1) {
      const notification = notifications.value[index];
      notification.visible = false;
      
      // 触发onClose回调
      if (notification.onClose) {
        notification.onClose();
      }
      
      // 动画结束后移除通知
      setTimeout(() => {
        notifications.value.splice(index, 1);
      }, 300);
    }
  }

  /**
   * 关闭所有通知
   */
  closeAll(): void {
    notifications.value.forEach(notification => {
      notification.visible = false;
      if (notification.onClose) {
        notification.onClose();
      }
    });
    
    // 动画结束后清空所有通知
    setTimeout(() => {
      notifications.value = [];
    }, 300);
  }
}

// 创建通知服务实例
export const notificationService = new NotificationService();

// 导出通知列表，用于Notification组件
export { notifications };

// 默认导出通知服务
export default notificationService;