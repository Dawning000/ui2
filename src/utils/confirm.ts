import { ref } from 'vue';

// 确认对话框类型
export type ConfirmDialogType = 'warning' | 'danger' | 'info';

// 确认对话框选项
export interface ConfirmOptions {
  title?: string;
  type?: ConfirmDialogType;
  confirmText?: string;
  cancelText?: string;
}

// 确认对话框配置
export interface ConfirmConfig {
  visible: boolean;
  title: string;
  message: string;
  confirmText: string;
  cancelText: string;
  type: ConfirmDialogType;
  resolve?: (value: boolean) => void;
  reject?: (reason?: any) => void;
  isProcessing: boolean;
}

// 确认对话框状态
const confirmConfig = ref<ConfirmConfig>({
  visible: false,
  title: '确认操作',
  message: '',
  confirmText: '确认',
  cancelText: '取消',
  type: 'warning',
  isProcessing: false
});

/**
 * 确认对话框服务类
 * 用于显示美观的确认对话框，替代原生confirm
 */
class ConfirmService {
  /**
   * 显示确认对话框
   * @param message 对话框消息内容
   * @param options 对话框配置选项
   * @returns Promise，确认返回true，取消返回false
   */
  confirm(message: string, options: ConfirmOptions = {}): Promise<boolean> {
    return new Promise((resolve, reject) => {
      confirmConfig.value = {
        visible: true,
        title: options.title || '确认操作',
        message,
        confirmText: options.confirmText || '确认',
        cancelText: options.cancelText || '取消',
        type: options.type || 'warning',
        resolve,
        reject,
        isProcessing: false
      };
    });
  }

  /**
   * 显示警告确认对话框
   * @param message 对话框消息内容
   * @param options 对话框配置选项
   * @returns Promise
   */
  warning(message: string, options: Omit<ConfirmOptions, 'type'> = {}): Promise<boolean> {
    return this.confirm(message, { ...options, type: 'warning' });
  }

  /**
   * 显示危险操作确认对话框
   * @param message 对话框消息内容
   * @param options 对话框配置选项
   * @returns Promise
   */
  danger(message: string, options: Omit<ConfirmOptions, 'type'> = {}): Promise<boolean> {
    return this.confirm(message, { ...options, type: 'danger' });
  }

  /**
   * 显示信息确认对话框
   * @param message 对话框消息内容
   * @param options 对话框配置选项
   * @returns Promise
   */
  info(message: string, options: Omit<ConfirmOptions, 'type'> = {}): Promise<boolean> {
    return this.confirm(message, { ...options, type: 'info' });
  }

  /**
   * 处理确认操作
   */
  handleConfirm = (): void => {
    confirmConfig.value.isProcessing = true;
    
    // 稍微延迟一下，让用户看到处理状态
    setTimeout(() => {
      if (confirmConfig.value.resolve) {
        confirmConfig.value.resolve(true);
      }
      // 使用this调用close方法，箭头函数会保持正确的this指向
      this.close();
    }, 100);
  }

  /**
   * 处理取消操作
   */
  handleCancel = (): void => {
    if (confirmConfig.value.resolve) {
      confirmConfig.value.resolve(false);
    }
    // 使用this调用close方法，箭头函数会保持正确的this指向
    this.close();
  }

  /**
   * 关闭对话框
   */
  close(): void {
    confirmConfig.value = {
      visible: false,
      title: '确认操作',
      message: '',
      confirmText: '确认',
      cancelText: '取消',
      type: 'warning',
      isProcessing: false
    };
  }

  /**
   * 设置处理中状态
   * @param isProcessing 是否正在处理
   */
  setProcessing(isProcessing: boolean): void {
    confirmConfig.value.isProcessing = isProcessing;
  }
}

// 创建单例实例
export const confirmService = new ConfirmService();

// 导出配置，供组件使用
export { confirmConfig };

// 默认导出
export default confirmService;