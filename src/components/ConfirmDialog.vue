<template>
  <Teleport to="body">
    <Transition name="confirm-dialog">
      <div v-if="visible" class="confirm-dialog-overlay" @click="handleOverlayClick">
        <div class="confirm-dialog" @click.stop>
          <div class="confirm-dialog__header">
            <div class="confirm-dialog__icon">
              <i :class="iconClass"></i>
            </div>
            <h3 class="confirm-dialog__title">{{ title }}</h3>
          </div>
          <div class="confirm-dialog__content">
            {{ message }}
          </div>
          <div class="confirm-dialog__actions">
            <button 
              class="btn btn-outline confirm-dialog__btn--cancel" 
              @click="handleCancel"
              :disabled="isProcessing"
            >
              {{ cancelText }}
            </button>
            <button 
              class="btn btn-primary confirm-dialog__btn--confirm" 
              @click="handleConfirm"
              :disabled="isProcessing"
            >
              <i v-if="isProcessing" class="icon-spinner icon-spin"></i>
              {{ confirmText }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

// Props
interface Props {
  visible: boolean
  title?: string
  message: string
  confirmText?: string
  cancelText?: string
  type?: 'warning' | 'danger' | 'info'
  isProcessing?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  title: '确认操作',
  confirmText: '确认',
  cancelText: '取消',
  type: 'warning',
  isProcessing: false
})

// Emits
const emit = defineEmits<{
  confirm: []
  cancel: []
  close: []
}>()

// Computed
const iconClass = computed(() => {
  const base = 'confirm-dialog__icon-i'
  switch (props.type) {
    case 'danger':
      return `${base} icon-error-circle`
    case 'info':
      return `${base} icon-info-circle`
    case 'warning':
    default:
      return `${base} icon-warning-circle`
  }
})

// Methods
const handleConfirm = () => {
  // 只发出confirm事件，close事件由confirmService内部处理
  // 这样可以确保Promise先解析，再关闭对话框
  emit('confirm')
}

const handleCancel = () => {
  // 只发出cancel事件，close事件由confirmService内部处理
  emit('cancel')
}

const handleOverlayClick = () => {
  // 只发出cancel事件，close事件由confirmService内部处理
  emit('cancel')
}
</script>

<style lang="scss" scoped>
.confirm-dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  backdrop-filter: blur(2px);
}

.confirm-dialog {
  background: white;
  border-radius: 16px;
  padding: 24px;
  width: 90%;
  max-width: 480px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.25);
  animation: confirm-dialog-bounce 0.3s ease-out;
}

@keyframes confirm-dialog-bounce {
  0% {
    opacity: 0;
    transform: scale(0.9) translateY(-20px);
  }
  100% {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

.confirm-dialog__header {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  margin-bottom: 16px;
}

.confirm-dialog__icon {
  flex-shrink: 0;
  margin-top: 2px;
}

.confirm-dialog__icon-i {
  font-size: 28px;
  
  &.icon-warning-circle {
    color: #f59e0b;
  }
  
  &.icon-error-circle {
    color: #ef4444;
  }
  
  &.icon-info-circle {
    color: #3b82f6;
  }
}

.confirm-dialog__title {
  font-size: 20px;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
}

.confirm-dialog__content {
  font-size: 16px;
  color: #4b5563;
  line-height: 1.6;
  margin-bottom: 24px;
}

.confirm-dialog__actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.confirm-dialog__btn--cancel {
  min-width: 80px;
  
  &:hover {
    background-color: #f9fafb;
  }
}

.confirm-dialog__btn--confirm {
  min-width: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

/* Animation */
.confirm-dialog-enter-active,
.confirm-dialog-leave-active {
  transition: opacity 0.3s ease;
}

.confirm-dialog-enter-from,
.confirm-dialog-leave-to {
  opacity: 0;
}

/* Button styles */
.btn {
  padding: 10px 20px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  border: none;
  outline: none;
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
}

.btn-outline {
  background-color: transparent;
  border: 1px solid #d1d5db;
  color: #4b5563;
  
  &:hover:not(:disabled) {
    border-color: #9ca3af;
  }
}

.btn-primary {
  background-color: #3b82f6;
  color: white;
  
  &:hover:not(:disabled) {
    background-color: #2563eb;
  }
}

/* Spinner animation */
.icon-spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>