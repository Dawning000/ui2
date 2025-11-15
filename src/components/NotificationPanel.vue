<template>
  <Teleport to="body">
    <Transition name="notification-panel">
      <div v-if="visible" class="notification-panel-overlay" @click="handleOverlayClick">
        <div class="notification-panel" @click.stop>
          <!-- 面板头部 -->
          <div class="notification-panel-header">
            <h3 class="panel-title">通知</h3>
            <div class="header-actions">
              <button 
                v-if="!loading && !error && notifications.length > 0"
                class="read-all-btn" 
                @click="handleReadAll"
                :disabled="markingAllRead || displayUnreadCount === 0"
              >
                <i class="icon-broom"></i>
                <span>全部已读</span>
              </button>
              <button class="close-btn" @click="handleClose">
                <i class="icon-close"></i>
              </button>
            </div>
          </div>

          <!-- 标签页 -->
          <div class="notification-tabs">
            <button
              v-for="tab in tabs"
              :key="tab.id"
              :class="['tab-item', { active: activeTab === tab.id }]"
              @click="activeTab = tab.id"
            >
              <span>{{ tab.label }}</span>
              <span v-if="tab.badge && tab.badge > 0" class="tab-badge">{{ tab.badge }}</span>
            </button>
          </div>

          <!-- 通知列表 -->
          <div class="notification-content">
            <div v-if="loading" class="loading-state">
              <div class="loading-spinner"></div>
              <p>加载中...</p>
            </div>

            <div v-else-if="error" class="error-state">
              <i class="icon-error-circle"></i>
              <p>{{ error }}</p>
              <button class="retry-btn" @click="fetchNotifications">重试</button>
            </div>

            <div v-else-if="filteredNotifications.length === 0" class="empty-state">
              <i class="icon-bell"></i>
              <p>暂无通知</p>
            </div>

            <div v-else class="notification-list">
              <div
                v-for="notification in filteredNotifications"
                :key="notification.id"
                :class="['notification-item', { unread: !notification.isRead, read: notification.isRead }]"
                @click="handleNotificationClick(notification)"
              >
                <div class="notification-icon" :class="{ 'unread-icon': !notification.isRead }">
                  <i :class="getNotificationIcon(notification)"></i>
                </div>
                <div class="notification-body">
                  <div class="notification-title" :class="{ 'unread-title': !notification.isRead }">
                    {{ notification.title }}
                    <span v-if="!notification.isRead" class="unread-badge">新</span>
                  </div>
                  <div class="notification-text">
                    <span v-if="notification.fromUser" class="notification-content">
                      <span 
                        class="user-name-link" 
                        @click.stop="handleUserClick(notification.fromUser.id)"
                      >
                        {{ notification.fromUser.nickname || notification.fromUser.username }}
                      </span>
                      <span class="notification-content-text">{{ getNotificationContentText(notification) }}</span>
                    </span>
                    <span v-else>{{ notification.content }}</span>
                  </div>
                  <div class="notification-time" :class="{ 'unread-time': !notification.isRead }">
                    <i class="icon-clock time-icon"></i>
                    {{ formatTime(notification.createdAt) }}
                  </div>
                </div>
                <div v-if="!notification.isRead" class="unread-dot"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { notificationApi, type NotificationItem } from '../api/notifications'

const router = useRouter()

interface Props {
  visible: boolean
  unreadCount?: number
}

const props = withDefaults(defineProps<Props>(), {
  unreadCount: 0
})

const emit = defineEmits<{
  close: []
  updateUnread: [count: number]
}>()

// 标签页数据 - 只保留已读和未读
const tabs = computed(() => [
  { id: 'unread', label: '未读', badge: props.unreadCount },
  { id: 'read', label: '已读', badge: null }
])

const activeTab = ref('unread')
const notifications = ref<NotificationItem[]>([])
const loading = ref(false)
const error = ref<string | null>(null)
const markingAllRead = ref(false)

// 计算实际未读数量（从通知列表中统计）
const actualUnreadCount = computed(() => {
  return notifications.value.filter(n => !n.isRead).length
})

// 使用实际未读数量或传入的未读数量
const displayUnreadCount = computed(() => {
  // 如果通知列表已加载，使用实际统计的数量
  if (notifications.value.length > 0) {
    return actualUnreadCount.value
  }
  // 否则使用传入的 props
  return props.unreadCount
})

// 过滤后的通知列表 - 默认显示未读
const filteredNotifications = computed(() => {
  console.log('当前激活标签:', activeTab.value)
  console.log('所有通知数据:', notifications.value.map(n => ({ id: n.id, title: n.title, isRead: n.isRead })))
  
  if (activeTab.value === 'read') {
    const readNotifications = notifications.value.filter(n => n.isRead)
    console.log('已读标签 - 过滤结果:', { total: notifications.value.length, read: readNotifications.length })
    return readNotifications
  }
  // 默认显示未读通知
  const unreadNotifications = notifications.value.filter(n => !n.isRead)
  console.log('未读标签 - 过滤结果:', { total: notifications.value.length, unread: unreadNotifications.length })
  return unreadNotifications
})

/**
 * 获取通知列表
 */
const fetchNotifications = async () => {
  if (!props.visible) return
  
  loading.value = true
  error.value = null
  
  try {
    const response = await notificationApi.getNotificationList()
    if (response && response.code === 200) {
      let notificationsData = response.data?.notifications || []
      
      // 适配后端返回的字段名
      notificationsData = notificationsData.map((notification: any) => {
        // 如果后端返回的是 read 字段，将其转换为 isRead
        if (notification.read !== undefined && notification.isRead === undefined) {
          notification.isRead = notification.read
        }
        // 如果后端返回的是 createTime 字段，将其转换为 createdAt
        if (notification.createTime !== undefined && notification.createdAt === undefined) {
          notification.createdAt = notification.createTime
        }
        // 如果没有 title 字段，根据类型生成简短的 title
        if (!notification.title) {
          notification.title = getNotificationTitle(notification.type)
        }
        return notification
      })
      
      notifications.value = notificationsData
      
      // 更新未读数量
      const unreadCount = response.data?.unread || 0
      emit('updateUnread', unreadCount)
      
      // 调试：输出通知数据详情
      console.log('通知数据详情:', {
        total: notifications.value.length,
        unread: notifications.value.filter(n => !n.isRead).length,
        read: notifications.value.filter(n => n.isRead).length,
        firstFew: notifications.value.slice(0, 3).map(n => ({ id: n.id, title: n.title, isRead: n.isRead }))
      })
      
      // 检查实际返回的字段名
      if (notifications.value.length > 0) {
        console.log('第一条通知的原始数据:', notifications.value[0])
        console.log('检查字段名 - isRead:', notifications.value[0].isRead, 'read:', (notifications.value[0] as any).read)
      }
    }
  } catch (err: any) {
    console.error('获取通知列表失败:', err)
    error.value = err.message || '获取通知列表失败'
  } finally {
    loading.value = false
  }
}

/**
 * 根据通知类型生成标题
 */
const getNotificationTitle = (type: string | undefined): string => {
  if (!type) return '通知'
  
  const typeUpper = type.toUpperCase()
  switch (typeUpper) {
    case 'FOLLOW':
      return '新关注'
    case 'REPLY_POST':
      return '新回复'
    case 'REPLY_COMMENT':
      return '新回复'
    case 'LIKE_POST':
      return '新点赞'
    case 'LIKE_COMMENT':
      return '新点赞'
    default:
      return '通知'
  }
}

/**
 * 获取通知图标类名
 */
const getNotificationIcon = (notification: NotificationItem): string => {
  // 根据通知类型返回不同的图标
  if (notification.type) {
    const typeUpper = notification.type.toUpperCase()
    switch (typeUpper) {
      case 'FOLLOW':
        return 'icon-users'
      case 'REPLY_POST':
      case 'REPLY_COMMENT':
        return 'icon-comment'
      case 'LIKE_POST':
      case 'LIKE_COMMENT':
        return 'icon-like'
      default:
        return 'icon-bell'
    }
  }
  
  // 未读通知使用更醒目的图标
  return 'icon-bell'
}

/**
 * 格式化时间
 */
const formatTime = (timeStr: string | undefined): string => {
  if (!timeStr) {
    return '刚刚'
  }
  
  const date = new Date(timeStr)
  // 检查日期是否有效
  if (isNaN(date.getTime())) {
    return '刚刚'
  }
  
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  
  // 如果时间差为负数（未来时间），返回"刚刚"
  if (diff < 0) {
    return '刚刚'
  }
  
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const minutes = Math.floor(diff / (1000 * 60))

  if (days > 0) {
    return `${days} 天前`
  } else if (hours > 0) {
    return `${hours} 小时前`
  } else if (minutes > 0) {
    return `${minutes} 分钟前`
  } else {
    return '刚刚'
  }
}

/**
 * 获取通知内容文本（去除用户名后的部分）
 */
const getNotificationContentText = (notification: NotificationItem): string => {
  if (!notification.fromUser || !notification.content) {
    return notification.content || ''
  }
  
  const userName = notification.fromUser.nickname || notification.fromUser.username
  // 从 content 中移除用户名，返回剩余部分
  if (notification.content.startsWith(userName)) {
    return notification.content.substring(userName.length).trim()
  }
  
  return notification.content
}

/**
 * 处理用户点击
 */
const handleUserClick = (userId: number) => {
  // 关闭通知面板
  emit('close')
  // 跳转到用户详情页
  router.push(`/user/${userId}`)
}

/**
 * 处理通知点击
 */
const handleNotificationClick = async (notification: NotificationItem) => {
  // 标记为已读（如果还未读）
  if (!notification.isRead) {
    try {
      // 调用 API 标记为已读
      const response = await notificationApi.markAsRead(notification.id)
      
      if (response && response.code === 200) {
        // 更新本地状态
        const index = notifications.value.findIndex(n => n.id === notification.id)
        if (index !== -1) {
          notifications.value[index].isRead = true
          notifications.value[index].read = true
        }
        
        // 更新未读数量
        const newUnreadCount = Math.max(0, props.unreadCount - 1)
        emit('updateUnread', newUnreadCount)
      }
    } catch (error) {
      console.error('标记通知已读失败:', error)
    }
  }

  // 根据通知类型和关联信息进行跳转
  handleNotificationNavigation(notification)
}

/**
 * 处理通知导航跳转
 */
const handleNotificationNavigation = (notification: NotificationItem) => {
  // 关闭通知面板
  emit('close')

  // 如果有 postId，跳转到帖子详情页
  if (notification.postId) {
    const postId = notification.postId
    const query: Record<string, string> = {}
    
    // 如果有 commentId，通过 query 参数传递，让页面定位到该评论
    if (notification.commentId) {
      query.commentId = notification.commentId.toString()
    }
    
    // 如果有 parentCommentId，也传递过去
    if (notification.parentCommentId) {
      query.parentCommentId = notification.parentCommentId.toString()
    }
    
    router.push({
      path: `/post/${postId}`,
      query: query
    })
  } else if (notification.fromUser) {
    // 如果没有 postId 但有 fromUser，跳转到用户详情页
    handleUserClick(notification.fromUser.id)
  }
}

/**
 * 处理全部已读
 */
const handleReadAll = async () => {
  if (markingAllRead.value || displayUnreadCount.value === 0) {
    return
  }

  markingAllRead.value = true
  
  try {
    const response = await notificationApi.readAll()
    
    if (response && response.code === 200) {
      // 更新所有通知状态为已读
      notifications.value.forEach(notification => {
        notification.isRead = true
        notification.read = true
      })
      
      // 更新未读数量为0
      emit('updateUnread', 0)
    }
  } catch (error) {
    console.error('标记所有通知已读失败:', error)
    // 可以在这里显示错误提示
  } finally {
    markingAllRead.value = false
  }
}

/**
 * 处理关闭
 */
const handleClose = () => {
  emit('close')
}

/**
 * 处理遮罩层点击
 */
const handleOverlayClick = () => {
  emit('close')
}

// 监听 visible 变化，显示时获取通知列表
watch(() => props.visible, (newVal) => {
  if (newVal) {
    fetchNotifications()
  }
})
</script>

<style lang="scss" scoped>
.notification-panel-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: flex-start;
  justify-content: flex-end;
  z-index: 10000;
  padding: 20px;
  backdrop-filter: blur(4px);
}

.notification-panel {
  background: #1f2937;
  border-radius: 16px;
  width: 100%;
  max-width: 420px;
  max-height: calc(100vh - 40px);
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  overflow: hidden;
  animation: slideIn 0.3s ease-out;
}

@keyframes slideIn {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

.notification-panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  background: #111827;

  .panel-title {
    margin: 0;
    font-size: 20px;
    font-weight: 600;
    color: #ffffff;
  }

  .header-actions {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .read-all-btn {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 6px 12px;
    border: none;
    background: rgba(249, 115, 22, 0.2);
    border-radius: 6px;
    color: var(--primary-color, #f97316);
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover:not(:disabled) {
      background: rgba(249, 115, 22, 0.3);
      transform: translateY(-1px);
    }

    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .icon-broom {
      font-family: inherit !important; // 使用系统字体显示 emoji
    }
    
    i {
      font-size: 14px;
    }
  }

  .close-btn {
    width: 32px;
    height: 32px;
    border: none;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    color: #9ca3af;
    transition: all 0.2s ease;

    &:hover {
      background: rgba(255, 255, 255, 0.2);
      color: #ffffff;
    }

    i {
      font-size: 18px;
    }
  }
}

.notification-tabs {
  display: flex;
  padding: 0 24px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  background: #111827;
  gap: 8px;

  .tab-item {
    position: relative;
    padding: 12px 16px;
    border: none;
    background: none;
    color: #9ca3af;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
    border-bottom: 2px solid transparent;
    margin-bottom: -1px;
    display: flex;
    align-items: center;
    gap: 8px;

    &:hover {
      color: #ffffff;
    }

    &.active {
      color: #ffffff;
      border-bottom-color: var(--primary-color, #f97316);
    }

    .tab-badge {
      background: #ef4444;
      color: white;
      font-size: 11px;
      font-weight: 600;
      padding: 2px 6px;
      border-radius: 10px;
      min-width: 18px;
      height: 18px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
  }
}

.notification-content {
  flex: 1;
  overflow-y: auto;
  padding: 8px 0;
}

.loading-state,
.error-state,
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 24px;
  color: #9ca3af;
  text-align: center;

  i {
    font-size: 48px;
    margin-bottom: 16px;
    opacity: 0.5;
  }

  p {
    margin: 8px 0 0 0;
    font-size: 14px;
  }
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid rgba(255, 255, 255, 0.1);
  border-top-color: var(--primary-color, #f97316);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.error-state {
  .retry-btn {
    margin-top: 16px;
    padding: 8px 16px;
    background: var(--primary-color, #f97316);
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-size: 14px;
    transition: all 0.2s ease;

    &:hover {
      opacity: 0.9;
      transform: translateY(-1px);
    }
  }
}

.notification-list {
  display: flex;
  flex-direction: column;
}

.notification-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 16px 24px;
  cursor: pointer;
  transition: all 0.2s ease;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  position: relative;

  &:hover {
    background: rgba(255, 255, 255, 0.05);
    transform: translateX(2px);
  }

  &.unread {
    background: rgba(249, 115, 22, 0.08);
    border-left: 3px solid var(--primary-color, #f97316);
    padding-left: 21px;

    &:hover {
      background: rgba(249, 115, 22, 0.15);
    }
  }

  &.read {
    opacity: 0.8;
    
    &:hover {
      opacity: 0.9;
    }
  }

  .notification-icon {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.1);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    transition: all 0.2s ease;

    i {
      font-size: 20px;
      color: #9ca3af;
      transition: all 0.2s ease;
    }

    &.unread-icon {
      background: rgba(249, 115, 22, 0.2);
      
      i {
        color: var(--primary-color, #f97316);
        animation: pulse 2s infinite;
      }
    }
  }

  @keyframes pulse {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.1); }
  }

  .notification-body {
    flex: 1;
    min-width: 0;

    .notification-title {
      font-size: 15px;
      font-weight: 600;
      color: #ffffff;
      margin-bottom: 4px;
      line-height: 1.4;
      display: flex;
      align-items: center;
      gap: 8px;

      &.unread-title {
        color: #fbbf24;
        font-weight: 700;
      }

      .unread-badge {
        background: #ef4444;
        color: white;
        font-size: 10px;
        font-weight: 700;
        padding: 2px 6px;
        border-radius: 10px;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        animation: blink 1.5s infinite;
      }

      @keyframes blink {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.7; }
      }
    }

    .notification-text {
      font-size: 13px;
      color: #9ca3af;
      line-height: 1.5;
      margin-bottom: 8px;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;

      .notification-content {
        display: inline;
      }

      .user-name-link {
        color: var(--primary-color, #f97316);
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s ease;
        text-decoration: none;

        &:hover {
          color: #fb923c;
          text-decoration: underline;
        }

        &:active {
          color: #ea580c;
        }
      }

      .notification-content-text {
        color: #9ca3af;
      }
    }

    .notification-time {
      font-size: 12px;
      color: #6b7280;
      display: flex;
      align-items: center;
      gap: 6px;

      &.unread-time {
        color: #f59e0b;
        font-weight: 500;
      }

      .time-icon {
        font-size: 10px;
        opacity: 0.7;
      }
    }
  }

  .unread-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: #ef4444;
    flex-shrink: 0;
    margin-top: 6px;
  }
}

// 过渡动画
.notification-panel-enter-active,
.notification-panel-leave-active {
  transition: opacity 0.3s ease;
}

.notification-panel-enter-active .notification-panel,
.notification-panel-leave-active .notification-panel {
  transition: transform 0.3s ease;
}

.notification-panel-enter-from,
.notification-panel-leave-to {
  opacity: 0;
}

.notification-panel-enter-from .notification-panel,
.notification-panel-leave-to .notification-panel {
  transform: translateX(100%);
}
</style>

