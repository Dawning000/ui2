<template>
  <div class="notification-container">
    <transition-group name="notification" tag="div">
      <div
        v-for="notification in notifications"
        :key="notification.id"
        :class="[
          'notification',
          `notification--${notification.type}`,
          {
            'notification--visible': notification.visible
          }
        ]"
      >
        <div class="notification__content">
          <div class="notification__icon">
            <i v-if="notification.type === 'success'" class="icon-check-circle"></i>
            <i v-else-if="notification.type === 'error'" class="icon-error-circle"></i>
            <i v-else-if="notification.type === 'warning'" class="icon-warning-circle"></i>
            <i v-else class="icon-info-circle"></i>
          </div>
          <div class="notification__message">{{ notification.message }}</div>
        </div>
        <button
          v-if="notification.showClose"
          class="notification__close"
          @click="close(notification.id)"
          aria-label="关闭通知"
        >
          <i class="icon-close"></i>
        </button>
      </div>
    </transition-group>
  </div>
</template>

<script setup lang="ts">
import { notifications, notificationService } from '../utils/notification';

/**
 * 关闭指定通知
 * @param id 通知ID
 */
const close = (id: number) => {
  notificationService.close(id);
};
</script>

<style lang="scss" scoped>
.notification-container {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  gap: 12px;
  align-items: flex-end;
}

.notification {
  position: relative;
  max-width: 400px;
  min-width: 300px;
  padding: 16px 20px;
  border-radius: 12px;
  background: white;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  display: flex;
  align-items: center;
  justify-content: space-between;
  transform: translateX(100%);
  opacity: 0;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border-left: 4px solid transparent;

  &--visible {
    transform: translateX(0);
    opacity: 1;
  }

  &--success {
    border-left-color: #10b981;

    .notification__icon i {
      color: #10b981;
    }
  }

  &--error {
    border-left-color: #ef4444;

    .notification__icon i {
      color: #ef4444;
    }
  }

  &--warning {
    border-left-color: #f59e0b;

    .notification__icon i {
      color: #f59e0b;
    }
  }

  &--info {
    border-left-color: #3b82f6;

    .notification__icon i {
      color: #3b82f6;
    }
  }

  &__content {
    display: flex;
    align-items: center;
    gap: 12px;
    flex: 1;
  }

  &__icon {
    font-size: 20px;
    flex-shrink: 0;
  }

  &__message {
    color: #374151;
    font-size: 14px;
    line-height: 1.5;
    word-wrap: break-word;
  }

  &__close {
    background: none;
    border: none;
    color: #9ca3af;
    font-size: 16px;
    cursor: pointer;
    padding: 4px;
    margin-left: 12px;
    border-radius: 4px;
    transition: all 0.2s ease;

    &:hover {
      background: #f3f4f6;
      color: #374151;
    }
  }
}

// 动画
.notification-enter-active,
.notification-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.notification-enter-from {
  transform: translateX(100%);
  opacity: 0;
}

.notification-leave-to {
  transform: translateX(100%);
  opacity: 0;
}

// 堆叠效果
.notification-move {
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

// 响应式设计
@media (max-width: 768px) {
  .notification-container {
    top: 16px;
    right: 16px;
    left: 16px;
    align-items: stretch;
  }

  .notification {
    min-width: auto;
    max-width: none;
  }
}
</style>