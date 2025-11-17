<template>
  <nav class="navbar">
    <div class="navbar-container">
      <!-- Logo 区域 -->
      <div class="navbar-brand">
        <router-link to="/" class="brand-link">
          <div class="brand-icon">
            <i class="icon-orange"></i>
          </div>
          <div class="brand-text">
            <span class="brand-name">橘橙影志</span>
            <span class="brand-tagline">橘橙暖时光，影志话悠长</span>
          </div>
        </router-link>
      </div>

      <!-- 搜索区域 -->
      <div class="navbar-search">
        <div class="search-container">
          <input 
            v-model="searchQuery" 
            @keyup.enter="handleSearch"
            type="text" 
            placeholder="搜索电影..."
            class="search-input"
          />
          <button @click="handleSearch" class="search-btn">
            <i class="icon-search"></i>
          </button>
        </div>
      </div>

      <!-- 主导航菜单 -->
      <div class="navbar-menu">
        <router-link to="/" class="nav-item" :class="{ active: $route.name === 'Home' }">
          <i class="nav-icon icon-home"></i>
          <span class="nav-text">首页</span>
        </router-link>
        
        <router-link to="/forum" class="nav-item" :class="{ active: $route.name === 'Forum' }">
          <i class="nav-icon icon-forum"></i>
          <span class="nav-text">论坛</span>
        </router-link>
        
        <div class="nav-dropdown" @mouseenter="showDropdown = true" @mouseleave="showDropdown = false">
          <button class="nav-item dropdown-trigger">
            <i class="nav-icon icon-category"></i>
            <span class="nav-text">分类</span>
            <i class="dropdown-arrow icon-arrow-down" :class="{ rotated: showDropdown }"></i>
          </button>
          <div class="dropdown-menu" :class="{ show: showDropdown }">
            <div class="dropdown-content">
              <div class="dropdown-section">
                <h4 class="section-title">影视分类</h4>
                <div class="category-grid">
                  <router-link :to="{ name: 'Search', query: { type: 'movie' } }" class="category-item">
                    <i class="category-icon icon-film"></i>
                    <span>电影</span>
                  </router-link>
                  <router-link :to="{ name: 'Search', query: { type: 'tv' } }" class="category-item">
                    <i class="category-icon icon-tv"></i>
                    <span>电视剧</span>
                  </router-link>

                  <router-link :to="{ name: 'Search', query: { type: 'variety' } }" class="category-item">
                    <i class="category-icon icon-variety"></i>
                    <span>综艺</span>
                  </router-link>
                </div>
              </div>
              <div class="dropdown-divider"></div>
              <div class="dropdown-section">
                <h4 class="section-title">热门标签</h4>
                <div class="tag-list">
                  <a href="#" class="tag-item">科幻</a>
                  <a href="#" class="tag-item">悬疑</a>
                  <a href="#" class="tag-item">爱情</a>
                  <a href="#" class="tag-item">动作</a>
                  <a href="#" class="tag-item">喜剧</a>
                  <a href="#" class="tag-item">恐怖</a>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <router-link to="/trending" class="nav-item">
          <i class="nav-icon icon-star"></i>
          <span class="nav-text">热门</span>
        </router-link>

        <router-link to="/actors" class="nav-item" :class="{ active: $route.name === 'Actors' }">
          <i class="nav-icon icon-user"></i>
          <span class="nav-text">演员/导演</span>
        </router-link>
      </div>

      <!-- 用户区域 -->
      <div class="navbar-user">
        <div v-if="!isLoggedIn" class="auth-section">
          <router-link to="/login" class="auth-btn login-btn">
            <i class="icon-user"></i>
            <span>登录</span>
          </router-link>
          <router-link to="/register" class="auth-btn register-btn">
            <i class="icon-plus"></i>
            <span>注册</span>
          </router-link>
        </div>
        
        <div v-else class="user-section">
          <!-- 通知按钮 -->
          <div class="notification-wrapper">
            <button class="notification-btn" @click="toggleNotifications">
              <i class="icon-bell"></i>
              <span v-if="unreadCount > 0" class="notification-badge">{{ unreadCount }}</span>
            </button>
          </div>

          <!-- 通知面板 -->
          <NotificationPanel
            :visible="showNotificationPanel"
            :unread-count="unreadCount"
            @close="showNotificationPanel = false"
            @update-unread="handleUpdateUnread"
          />
          
          <!-- 用户菜单 -->
          <div class="user-menu" @mouseenter="showUserMenu = true" @mouseleave="showUserMenu = false">
            <button class="user-trigger">
              <img :src="user?.avatar || '/avatar.png'" :alt="user?.username || '用户'" class="user-avatar" />
              <div class="user-info">
                <span class="username">{{ user?.nickname || user?.username || '用户' }}</span>
                <span class="user-level">Lv.{{ user?.level || 0 }}</span>
              </div>
              <i class="user-arrow icon-arrow-down" :class="{ rotated: showUserMenu }"></i>
            </button>
            
            <div class="user-dropdown" :class="{ show: showUserMenu }">
              <div class="user-profile">
                <img :src="user?.avatar || '/avatar.png'" :alt="user?.username || '用户'" class="profile-avatar" />
                <div class="profile-info">
                  <h4>{{ user?.nickname || user?.username || '用户' }}</h4>
                  <!-- <p>{{ user.nickname }}</p> -->
                </div>
              </div>
              <div class="user-menu-list">
                <router-link :to="user ? `/user/${user.id}` : '#'" class="menu-item">
                  <i class="menu-icon icon-user"></i>
                  <span>个人中心</span>
                </router-link>
                <router-link to="/user/settings" class="menu-item">
                  <i class="menu-icon icon-settings"></i>
                  <span>账户设置</span>
                </router-link>
                <div class="menu-divider"></div>
                <button @click="handleLogout" class="menu-item logout-item">
                  <i class="menu-icon icon-logout"></i>
                  <span>退出登录</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>


    </div>


  </nav>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../stores/user'
import { notificationApi } from '../api/notifications'
import NotificationPanel from './NotificationPanel.vue'

const router = useRouter()
const userStore = useUserStore()

// 响应式数据
const searchQuery = ref('')
const showDropdown = ref(false)
const showUserMenu = ref(false)
const unreadCount = ref(0)
const showNotificationPanel = ref(false)

// 计算属性
const isLoggedIn = computed(() => userStore.isLoggedIn)
const user = computed(() => userStore.user)

// 方法
const handleSearch = () => {
  // 保留当前路由的 type 参数，确保在分类页面搜索时不会丢失分类信息
  const query: Record<string, any> = {}
  if (searchQuery.value.trim()) {
    query.q = searchQuery.value
  }
  // 如果当前路由有 type 参数，保留它
  if (router.currentRoute.value.query.type) {
    query.type = router.currentRoute.value.query.type
  }
  
  router.push({
    name: 'Search',
    query: Object.keys(query).length > 0 ? query : undefined
  })
}


/**
 * 获取通知数量
 */
const fetchNotificationCount = async () => {
  if (!isLoggedIn.value) {
    unreadCount.value = 0
    return
  }
  
  try {
    const response = await notificationApi.getNotificationCount()
    if (response && response.code === 200) {
      unreadCount.value = response.data?.unread || 0
    }
  } catch (error) {
    console.error('获取通知数量失败:', error)
    // 发生错误时保持当前值或设为0
    unreadCount.value = 0
  }
}

const toggleNotifications = () => {
  showNotificationPanel.value = !showNotificationPanel.value
  // 如果关闭面板，刷新通知数量
  if (!showNotificationPanel.value) {
    fetchNotificationCount()
  }
}

/**
 * 处理未读数量更新
 */
const handleUpdateUnread = (count: number) => {
  unreadCount.value = count
}

const handleLogout = () => {
  userStore.logout()
  router.push('/')
  showUserMenu.value = false
  // 登出后清空通知数量
  unreadCount.value = 0
}

// 监听登录状态变化，登录后获取通知数量
watch(isLoggedIn, (newValue) => {
  if (newValue) {
    fetchNotificationCount()
  } else {
    unreadCount.value = 0
  }
})

// 组件挂载时，如果已登录则获取通知数量
onMounted(() => {
  if (isLoggedIn.value) {
    fetchNotificationCount()
  }
})
</script>

<style lang="scss" scoped>
// 导航栏基础样式
.navbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.98) 0%, rgba(255, 255, 255, 0.95) 100%);
  backdrop-filter: blur(24px) saturate(180%);
  -webkit-backdrop-filter: blur(24px) saturate(180%);
  border-bottom: 1px solid rgba(249, 115, 22, 0.08);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04), 0 4px 12px rgba(249, 115, 22, 0.06);
  z-index: 1000;
  height: 72px;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  width: 100%;
  display: block;
}

.navbar-container {
  max-width: 1600px;
  margin: 0 auto;
  padding: 0 40px;
  display: flex;
  align-items: center;
  height: 100%;
  gap: 32px;
  min-width: 0;
  width: 100%;
  box-sizing: border-box;
  
  @media (max-width: 1200px) {
    padding: 0 24px;
    gap: 20px;
  }
}

// Logo 样式
.navbar-brand {
  flex: 0 0 auto;
  flex-shrink: 0;
  display: block;
  visibility: visible;
  
  .brand-link {
    display: flex;
    align-items: center;
    gap: 14px;
    text-decoration: none;
    color: #1f2937;
    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    padding: 4px;
    border-radius: 14px;
    
    &:hover {
      transform: translateY(-1px);
      
      .brand-icon {
        transform: scale(1.08) rotate(5deg);
        box-shadow: 0 12px 32px rgba(249, 115, 22, 0.35);
      }
      
      .brand-name {
        color: var(--primary-color);
      }
    }
    
    .brand-icon {
      width: 48px;
      height: 48px;
      background: linear-gradient(135deg, #f97316 0%, #ea580c 50%, #dc2626 100%);
      border-radius: 14px;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 8px 24px rgba(249, 115, 22, 0.25), 
                  0 2px 8px rgba(249, 115, 22, 0.15),
                  inset 0 1px 0 rgba(255, 255, 255, 0.2);
      transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
      position: relative;
      overflow: hidden;
      
      &::before {
        content: '';
        position: absolute;
        top: 0;
        left: -100%;
        width: 100%;
        height: 100%;
        background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
        transition: left 0.5s ease;
      }
      
      &:hover::before {
        left: 100%;
      }
      
      .icon-orange {
        font-size: 24px;
        color: white;
        filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.2));
        position: relative;
        z-index: 1;
      }
    }
    
    .brand-text {
      display: flex;
      flex-direction: column;
      gap: 2px;
      
      .brand-name {
        font-weight: 700;
        font-size: 21px;
        line-height: 1.2;
        color: #1f2937;
        letter-spacing: -0.3px;
        transition: color 0.3s ease;
        background: linear-gradient(135deg, #1f2937 0%, var(--primary-color) 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
      }
      
      .brand-tagline {
        font-size: 11px;
        color: #9ca3af;
        font-weight: 500;
        letter-spacing: 0.8px;
        text-transform: uppercase;
        margin-top: 1px;
        opacity: 0.8;
      }
    }
  }
}

// 搜索区域
.navbar-search {
  flex: 1 1 auto;
  max-width: 500px;
  min-width: 0;
  display: block;
  visibility: visible;
  
  .search-container {
    position: relative;
    display: flex;
    align-items: center;
    background: #f8fafc;
    border: 2px solid transparent;
    border-radius: 12px;
    transition: all 0.3s ease;
    
    &:focus-within {
      background: white;
      border-color: var(--primary-color);
      box-shadow: 0 0 0 3px rgba(249, 115, 22, 0.1);
    }
    
    .search-input {
      flex: 1;
      padding: 12px 16px;
      border: none;
      background: transparent;
      font-size: 14px;
      color: #374151;
      outline: none;
      
      &::placeholder {
        color: #9ca3af;
      }
    }
    
    .search-btn {
      padding: 12px 16px;
      background: var(--primary-color);
      color: white;
      border: none;
      border-radius: 0 10px 10px 0;
      cursor: pointer;
      transition: all 0.3s ease;
      
      &:hover {
        background: var(--primary-dark);
        transform: scale(1.05);
      }
      
      i {
        font-size: 16px;
      }
    }
  }
}

// 主导航菜单
.navbar-menu {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 0 0 auto;
  flex-shrink: 0;
  
  .nav-item {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 12px 18px;
    text-decoration: none;
    color: #64748b;
    border-radius: 12px;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    font-size: 15px;
    font-weight: 500;
    position: relative;
    white-space: nowrap;
    background: transparent;
    border: 1px solid transparent;
    
    &::before {
      content: '';
      position: absolute;
      inset: 0;
      border-radius: 12px;
      padding: 1px;
      background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
      -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
      -webkit-mask-composite: xor;
      mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
      mask-composite: exclude;
      opacity: 0;
      transition: opacity 0.3s ease;
    }
    
    &:hover {
      color: var(--primary-color);
      background: linear-gradient(135deg, rgba(249, 115, 22, 0.08), rgba(249, 115, 22, 0.05));
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(249, 115, 22, 0.12);
      
      &::before {
        opacity: 1;
      }
      
      .nav-icon {
        transform: scale(1.1);
      }
    }
    
    &.active {
      color: var(--primary-color);
      background: linear-gradient(135deg, rgba(249, 115, 22, 0.12), rgba(249, 115, 22, 0.08));
      box-shadow: 0 2px 8px rgba(249, 115, 22, 0.15);
      
      &::before {
        opacity: 1;
      }
      
      &::after {
        content: '';
        position: absolute;
        bottom: 6px;
        left: 50%;
        transform: translateX(-50%);
        width: 20px;
        height: 2.5px;
        background: linear-gradient(90deg, var(--primary-color), var(--secondary-color));
        border-radius: 2px;
        box-shadow: 0 0 8px rgba(249, 115, 22, 0.4);
      }
    }
    
    .nav-icon {
      font-size: 17px;
      transition: transform 0.3s ease;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    
    .nav-text {
      font-weight: 500;
      letter-spacing: 0.2px;
    }
  }
}

// 下拉菜单
.nav-dropdown {
  position: relative;
  
  .dropdown-trigger {
    background: none;
    border: none;
    cursor: pointer;
    width: 100%;
    
    .dropdown-arrow {
      font-size: 12px;
      transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      margin-left: 2px;
      
      &.rotated {
        transform: rotate(180deg);
      }
    }
  }
  
  .dropdown-menu {
    position: absolute;
    top: calc(100% + 12px);
    left: 0;
    background: rgba(255, 255, 255, 0.98);
    backdrop-filter: blur(20px) saturate(180%);
    -webkit-backdrop-filter: blur(20px) saturate(180%);
    border: 1px solid rgba(249, 115, 22, 0.12);
    border-radius: 20px;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.12),
                0 8px 24px rgba(249, 115, 22, 0.08),
                inset 0 1px 0 rgba(255, 255, 255, 0.9);
    min-width: 340px;
    opacity: 0;
    visibility: hidden;
    transform: translateY(-8px) scale(0.98);
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    z-index: 1000;
    overflow: hidden;
    
    &.show {
      opacity: 1;
      visibility: visible;
      transform: translateY(0) scale(1);
    }
    
    .dropdown-content {
      padding: 24px;
    }
    
    .dropdown-section {
      margin-bottom: 20px;
      
      &:last-child {
        margin-bottom: 0;
      }
      
      .section-title {
        font-size: 11px;
        font-weight: 700;
        color: #94a3b8;
        text-transform: uppercase;
        letter-spacing: 1px;
        margin: 0 0 14px 0;
        padding-bottom: 8px;
        border-bottom: 1px solid rgba(249, 115, 22, 0.1);
      }
    }
    
    .category-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;
      
      .category-item {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 14px 16px;
        text-decoration: none;
        color: #475569;
        border-radius: 12px;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        background: #f8fafc;
        border: 1px solid transparent;
        font-weight: 500;
        
        &:hover {
          background: linear-gradient(135deg, rgba(249, 115, 22, 0.1), rgba(249, 115, 22, 0.05));
          color: var(--primary-color);
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(249, 115, 22, 0.15);
          border-color: rgba(249, 115, 22, 0.2);
        }
        
        .category-icon {
          font-size: 18px;
          color: var(--primary-color);
          transition: transform 0.3s ease;
        }
        
        &:hover .category-icon {
          transform: scale(1.15) rotate(5deg);
        }
      }
    }
    
    .tag-list {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      
      .tag-item {
        padding: 8px 16px;
        background: linear-gradient(135deg, #f1f5f9, #e2e8f0);
        color: #64748b;
        text-decoration: none;
        border-radius: 24px;
        font-size: 13px;
        font-weight: 500;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        border: 1px solid transparent;
        
        &:hover {
          background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
          color: white;
          transform: translateY(-2px) scale(1.05);
          box-shadow: 0 4px 12px rgba(249, 115, 22, 0.3);
          border-color: transparent;
        }
      }
    }
    
    .dropdown-divider {
      height: 1px;
      background: linear-gradient(90deg, transparent, rgba(249, 115, 22, 0.2), transparent);
      margin: 20px 0;
    }
  }
}

// 用户区域
.navbar-user {
  display: flex;
  align-items: center;
  gap: 20px;
  flex: 0 0 auto;
  flex-shrink: 0;
  visibility: visible;
  
    .auth-section {
    display: flex;
    gap: 12px;
    
    .auth-btn {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 12px 20px;
      text-decoration: none;
      border-radius: 10px;
      font-size: 15px;
      font-weight: 500;
      transition: all 0.3s ease;
      
      &.login-btn {
        color: #6b7280;
        background: #f8fafc;
        
        &:hover {
          color: var(--primary-color);
          background: var(--bg-primary);
        }
      }
      
      &.register-btn {
        color: white;
        background: var(--primary-color);
        
        &:hover {
          background: var(--primary-dark);
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(249, 115, 22, 0.3);
        }
      }
    }
  }
  
  .user-section {
    display: flex;
    align-items: center;
    gap: 12px;
    
    .notification-wrapper {
      position: relative;
      
      .notification-btn {
        width: 40px;
        height: 40px;
        border: none;
        background: #f8fafc;
        border-radius: 10px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: all 0.3s ease;
        position: relative;
        
        &:hover {
          background: var(--primary-color);
          color: white;
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(249, 115, 22, 0.3);
        }
        
        i {
          font-size: 18px;
        }
      }
      
      .notification-badge {
        position: absolute;
        top: -6px;
        right: -6px;
        background: #ef4444;
        color: white;
        font-size: 10px;
        font-weight: 600;
        padding: 2px 6px;
        border-radius: 10px;
        min-width: 18px;
        height: 18px;
        display: flex;
        align-items: center;
        justify-content: center;
        animation: pulse 2s infinite;
      }
    }
    
    .user-menu {
      position: relative;
      
      .user-trigger {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 6px 10px 6px 6px;
        background: linear-gradient(135deg, #f8fafc, #f1f5f9);
        border: 1px solid rgba(148, 163, 184, 0.15);
        cursor: pointer;
        border-radius: 14px;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        
        &:hover {
          background: linear-gradient(135deg, rgba(249, 115, 22, 0.08), rgba(249, 115, 22, 0.05));
          border-color: rgba(249, 115, 22, 0.2);
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(249, 115, 22, 0.15);
        }
        
        .user-avatar {
          width: 38px;
          height: 38px;
          border-radius: 50%;
          object-fit: cover;
          border: 2.5px solid var(--primary-color);
          box-shadow: 0 2px 8px rgba(249, 115, 22, 0.2);
          transition: all 0.3s ease;
        }
        
        &:hover .user-avatar {
          transform: scale(1.05);
          box-shadow: 0 4px 12px rgba(249, 115, 22, 0.3);
        }
        
        .user-info {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 2px;
          
          .username {
            font-size: 14px;
            font-weight: 600;
            color: #1f2937;
            line-height: 1.2;
            transition: color 0.3s ease;
          }
          
          .user-level {
            font-size: 11px;
            color: var(--primary-color);
            font-weight: 600;
            background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
          }
        }
        
        &:hover .user-info .username {
          color: var(--primary-color);
        }
        
        .user-arrow {
          font-size: 12px;
          color: #94a3b8;
          transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          margin-left: 4px;
          
          &.rotated {
            transform: rotate(180deg);
          }
        }
      }
      
      .user-dropdown {
        position: absolute;
        top: calc(100% + 12px);
        right: 0;
        background: rgba(255, 255, 255, 0.98);
        backdrop-filter: blur(20px) saturate(180%);
        -webkit-backdrop-filter: blur(20px) saturate(180%);
        border: 1px solid rgba(249, 115, 22, 0.12);
        border-radius: 20px;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.12),
                    0 8px 24px rgba(249, 115, 22, 0.08),
                    inset 0 1px 0 rgba(255, 255, 255, 0.9);
        min-width: 300px;
        opacity: 0;
        visibility: hidden;
        transform: translateY(-8px) scale(0.98);
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        z-index: 1000;
        overflow: hidden;
        
        &.show {
          opacity: 1;
          visibility: visible;
          transform: translateY(0) scale(1);
        }
        
        .user-profile {
          padding: 24px;
          background: linear-gradient(135deg, #f97316 0%, #ea580c 50%, #dc2626 100%);
          color: white;
          display: flex;
          align-items: center;
          gap: 16px;
          position: relative;
          overflow: hidden;
          
          &::before {
            content: '';
            position: absolute;
            top: -50%;
            right: -50%;
            width: 200%;
            height: 200%;
            background: radial-gradient(circle, rgba(255, 255, 255, 0.1) 0%, transparent 70%);
            animation: shimmer 3s infinite;
          }
          
          .profile-avatar {
            width: 56px;
            height: 56px;
            border-radius: 50%;
            object-fit: cover;
            border: 3px solid rgba(255, 255, 255, 0.4);
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
            position: relative;
            z-index: 1;
          }
          
          .profile-info {
            position: relative;
            z-index: 1;
            
            h4 {
              margin: 0 0 6px 0;
              font-size: 17px;
              font-weight: 700;
              text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
            }
            
            p {
              margin: 0;
              font-size: 13px;
              opacity: 0.9;
            }
          }
        }
        
        .user-menu-list {
          padding: 8px 0;
          
          .menu-item {
            display: flex;
            align-items: center;
            gap: 14px;
            padding: 14px 24px;
            text-decoration: none;
            color: #475569;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            border: none;
            background: none;
            width: 100%;
            text-align: left;
            cursor: pointer;
            font-weight: 500;
            position: relative;
            
            &::before {
              content: '';
              position: absolute;
              left: 0;
              top: 50%;
              transform: translateY(-50%);
              width: 3px;
              height: 0;
              background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
              border-radius: 0 2px 2px 0;
              transition: height 0.3s ease;
            }
            
            &:hover {
              background: linear-gradient(90deg, rgba(249, 115, 22, 0.08), transparent);
              color: var(--primary-color);
              transform: translateX(6px);
              
              &::before {
                height: 60%;
              }
              
              .menu-icon {
                transform: scale(1.15);
              }
            }
            
            &.logout-item {
              color: #ef4444;
              
              &:hover {
                background: linear-gradient(90deg, rgba(239, 68, 68, 0.08), transparent);
                color: #dc2626;
                
                &::before {
                  background: linear-gradient(135deg, #ef4444, #dc2626);
                }
              }
            }
            
            .menu-icon {
              font-size: 17px;
              width: 18px;
              text-align: center;
              transition: transform 0.3s ease;
              display: flex;
              align-items: center;
              justify-content: center;
            }
          }
          
          .menu-divider {
            height: 1px;
            background: linear-gradient(90deg, transparent, rgba(249, 115, 22, 0.2), transparent);
            margin: 10px 0;
          }
        }
      }
    }
  }
}



// 动画
@keyframes pulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.15);
  }
}

@keyframes shimmer {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

</style>