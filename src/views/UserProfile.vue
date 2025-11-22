<template>
  <div class="user-profile">
    <div class="container">
      <div v-if="loading" class="loading">
        <div class="loading-spinner"></div>
        <p>加载中...</p>
      </div>
      
      <div v-else-if="user" class="profile-content">
        <!-- 用户信息卡片 -->
        <div class="profile-card">
          <div class="profile-header">
            <div class="avatar-section">
              <img :src="user.avatar || '/avatar.png'" :alt="user.username" class="user-avatar" referrerpolicy="no-referrer" />
            </div>
            <div class="user-info">
              <h1 class="username" v-if="user.nickname">{{ user.nickname }}</h1>
              <p class="user-nickname" >{{ user.username }}</p>
              <div class="user-stats">
                <div class="stat-item">
                  <span class="stat-number">{{ user.followersCount }}</span>
                  <span class="stat-label">粉丝</span>
                </div>
                <div class="stat-item">
                  <span class="stat-number">{{ user.followingCount }}</span>
                  <span class="stat-label">关注</span>
                </div>
              </div>
            </div>
            <div class="profile-actions" v-if="!isCurrentUser">
              <button class="btn btn-primary" @click="handleFollow">
                {{ isFollowing ? '取消关注' : '关注' }}
              </button>
            </div>
          </div>
          
          <div class="profile-details">
            <div class="detail-item" v-if="user?.bio">
              <i class="icon-user"></i>
              <span>{{ user?.bio }}</span>
            </div>
            <div class="detail-item">
              <i class="icon-calendar"></i>
              <span>加入时间：{{ formatDate(user?.joinDate || '') }}</span>
            </div>
            <div class="detail-item">
              <i class="icon-level"></i>
              <span>等级：{{ user?.level || 1 }}</span>
            </div>
            <div class="detail-item" v-if="user?.location">
              <i class="icon-location"></i>
              <span>{{ user?.location }}</span>
            </div>
            <div class="detail-item" v-if="user?.website">
              <i class="icon-link"></i>
              <a :href="user?.website" target="_blank" class="website-link">{{ user?.website }}</a>
            </div>
            <div class="detail-item" v-if="user?.role">
              <i class="icon-role"></i>
              <span>角色：{{ user?.role === 'ADMIN' ? '管理员' : '普通用户' }}</span>
            </div>
          </div>
        </div>

        <!-- 标签页导航 -->
        <div class="tabs">
          <button 
            v-for="tab in tabs" 
            :key="tab.id"
            class="tab-btn"
            :class="{ active: activeTab === tab.id }"
            @click="activeTab = tab.id"
          >
            <i :class="tab.icon"></i>
            {{ tab.label }}
          </button>
        </div>

        <!-- 标签页内容 -->
        <div class="tab-content">
          <!-- 帖子列表 -->
          <div v-if="activeTab === 'posts'" class="posts-section">
            <div v-if="activeTab === 'posts' && userPosts.length === 0 && totalPosts > 0" class="loading">
              <div class="loading-spinner"></div>
              <p>加载中...</p>
            </div>
            <div v-if="userPosts.length === 0" class="empty-state">
              <i class="icon-empty"></i>
              <h3>暂无帖子</h3>
              <p>该用户还没有发布任何帖子</p>
            </div>
            <div v-else class="posts-list">
              <div v-for="post in userPosts" :key="post.id" class="post-item">
                <div class="post-header">
                  <div class="post-meta">
                    <span class="post-time">{{ formatTime(post.createTime) }}</span>
                  </div>
                </div>
                <h3 class="post-title">
                  <router-link :to="`/post/${post.id}`">{{ post.title }}</router-link>
                </h3>
                <p class="post-excerpt">{{ post.content.length > 100 ? post.content.substring(0, 100) + '...' : post.content }}</p>
                <div class="post-stats">
                  <span class="stat">
                    <i class="icon-eye"></i>
                    {{ post.views }}
                  </span>
                  <span class="stat">
                    <i class="icon-comment"></i>
                    {{ post.commentsCount }}
                  </span>
                  <span class="stat">
                    <i class="icon-like"></i>
                    {{ post.likes }}
                  </span>
                </div>
              </div>
              
              <!-- 分页组件 -->
              <div v-if="userPosts.length > 0" class="pagination-container">
                <div class="pagination-info">
                  <span>共 {{ totalPosts }} 条帖子</span>
                  <span class="divider">|</span>
                  <span>每页显示</span>
                  <select v-model="pageSize" @change="handleSizeChange" class="page-size-select">
                    <option :value="10">10</option>
                    <option :value="20">20</option>
                    <option :value="50">50</option>
                  </select>
                  <span>条</span>
                </div>
                <div class="pagination" v-if="totalPages > 0">
                  <button 
                    class="pagination-btn pagination-nav-btn"
                    :class="{ disabled: currentPage <= 1 || totalPages <= 1 }"
                    :disabled="currentPage <= 1 || totalPages <= 1" 
                    @click.stop="changePage(1)"
                    title="首页"
                  >
                    <i class="icon-home"></i>
                    <span>首页</span>
                  </button>
                  <button 
                    class="pagination-btn pagination-nav-btn"
                    :class="{ disabled: currentPage <= 1 || totalPages <= 1 }"
                    :disabled="currentPage <= 1 || totalPages <= 1" 
                    @click.stop="changePage(currentPage - 1)"
                    title="上一页"
                  >
                    <i class="icon-chevron-left"></i>
                    <span>上一页</span>
                  </button>
                  
                  <div class="page-numbers">
                    <template v-for="(p, index) in visiblePages" :key="`page-${index}-${p}`">
                      <button
                        v-if="typeof p === 'number'"
                        class="pagination-btn page-number"
                        :class="{ active: p === currentPage }"
                        @click.stop="changePage(p)"
                      >
                        {{ p }}
                      </button>
                      <span v-else class="page-ellipsis">{{ p }}</span>
                    </template>
                  </div>
                  
                  <button 
                    class="pagination-btn pagination-nav-btn"
                    :class="{ disabled: currentPage >= totalPages || totalPages <= 1 }"
                    :disabled="currentPage >= totalPages || totalPages <= 1" 
                    @click.stop="changePage(currentPage + 1)"
                    title="下一页"
                  >
                    <span>下一页</span>
                    <i class="icon-chevron-right"></i>
                  </button>
                  <button 
                    class="pagination-btn pagination-nav-btn"
                    :class="{ disabled: currentPage >= totalPages || totalPages <= 1 }"
                    :disabled="currentPage >= totalPages || totalPages <= 1" 
                    @click.stop="changePage(totalPages)"
                    title="末页"
                  >
                    <span>末页</span>
                    <i class="icon-end"></i>
                  </button>
                  <div class="page-jump">
                    <span>跳至</span>
                    <input 
                      type="number" 
                      v-model.number="jumpPage" 
                      :min="1" 
                      :max="totalPages"
                      @keyup.enter="handleJump"
                      class="jump-input"
                    />
                    <span>页</span>
                    <button @click.stop="handleJump" class="jump-btn">确定</button>
                  </div>
                </div>
              </div>
            </div>
          </div>


          <!-- 收藏列表（电影、电视剧、综艺） -->
          <div v-if="activeTab === 'favorites'" class="favorites-section">
            <!-- 分类标签 -->
            <div class="favorites-tabs">
              <button 
                v-for="type in favoriteTypes" 
                :key="type"
                :class="['favorite-tab-btn', { active: activeFavoritesType === type }]"
                @click="handleFavoritesTypeChange(type)"
              >
                {{ type === 'movies' ? '电影' : type === 'tvshows' ? '电视剧' : '综艺' }}
              </button>
            </div>
            
            <!-- 加载状态 -->
            <div v-if="loadingFavorites" class="loading-state">
              <div class="loading-spinner"></div>
              <p>加载中...</p>
            </div>
            
            <!-- 空状态 -->
            <div v-else-if="favorites[activeFavoritesType].length === 0" class="empty-state">
              <i class="icon-star"></i>
              <h3>暂无收藏</h3>
              <p>该用户还没有收藏任何{{ activeFavoritesType === 'movies' ? '电影' : activeFavoritesType === 'tvshows' ? '电视剧' : '综艺' }}</p>
            </div>
            
            <!-- 收藏列表 -->
              <div v-else class="bookmarks-list">
                <div v-for="item in favorites[activeFavoritesType]" :key="item.id" class="bookmark-item">
                  <router-link :to="`/${activeFavoritesType === 'movies' ? 'movie' : activeFavoritesType === 'tvshows' ? 'tv' : 'variety'}/${item.id}`">
                      <div class="bookmark-header">
                        <h3 class="bookmark-title">{{ item.title }}</h3>
                        <div class="bookmark-meta">
                          <span class="bookmark-year">{{ item.year }}</span>
                          <span class="bookmark-rating">
                            <i class="icon-star"></i> {{ item.rating }}
                          </span>
                          <span class="bookmark-likes">
                            <i class="icon-heart"></i> {{ item.likes }} 赞
                          </span>
                        </div>
                      </div>
                    </router-link>
                </div>
              </div>
              
              <!-- 分页组件 -->
            <div v-if="favoritesPagination[activeFavoritesType].total > 0" class="pagination-container">
              <div class="pagination-info">
                <span>共 {{ favoritesPagination[activeFavoritesType].total }} 条收藏</span>
                <span class="divider">|</span>
                <span>每页显示</span>
                <select v-model.number="favoritesPageSize" @change="handleFavoritesPageSizeChange(favoritesPageSize)" class="page-size-select">
                  <option :value="10">10</option>
                  <option :value="20">20</option>
                  <option :value="50">50</option>
                </select>
                <span>条</span>
              </div>
              <div class="pagination">
                <button 
                  class="pagination-btn pagination-nav-btn"
                  :class="{ disabled: favoritesPagination[activeFavoritesType].page === 1 }"
                  :disabled="favoritesPagination[activeFavoritesType].page === 1" 
                  @click.stop="handleFavoritesPageChange(1)"
                  title="首页"
                >
                  <i class="icon-home"></i>
                  <span>首页</span>
                </button>
                <button 
                  class="pagination-btn pagination-nav-btn"
                  :class="{ disabled: favoritesPagination[activeFavoritesType].page === 1 }"
                  :disabled="favoritesPagination[activeFavoritesType].page === 1" 
                  @click.stop="handleFavoritesPageChange(favoritesPagination[activeFavoritesType].page - 1)"
                  title="上一页"
                >
                  <i class="icon-chevron-left"></i>
                  <span>上一页</span>
                </button>
                <div class="page-numbers">
                  <template v-for="(page, index) in visibleFavoritesPages" :key="`fav-page-${index}-${page}`">
                    <button
                      v-if="typeof page === 'number'"
                      class="pagination-btn page-number"
                      :class="{ active: page === favoritesPagination[activeFavoritesType].page }"
                      @click.stop="handleFavoritesPageChange(page)"
                    >
                      {{ page }}
                    </button>
                    <span v-else class="page-ellipsis">{{ page }}</span>
                  </template>
                </div>
                <button 
                  class="pagination-btn pagination-nav-btn"
                  :class="{ disabled: !favoritesPagination[activeFavoritesType].has_next }"
                  :disabled="!favoritesPagination[activeFavoritesType].has_next" 
                  @click.stop="handleFavoritesPageChange(favoritesPagination[activeFavoritesType].page + 1)"
                  title="下一页"
                >
                  <span>下一页</span>
                  <i class="icon-chevron-right"></i>
                </button>
                <button 
                  class="pagination-btn pagination-nav-btn"
                  :class="{ disabled: !favoritesPagination[activeFavoritesType].has_next }"
                  :disabled="!favoritesPagination[activeFavoritesType].has_next" 
                  @click.stop="handleFavoritesPageChange(totalFavoritesPages)"
                  title="末页"
                >
                  <span>末页</span>
                  <i class="icon-end"></i>
                </button>
                <div class="page-jump">
                  <span>跳至</span>
                  <input 
                    type="number" 
                    v-model.number="favoritesJumpPage" 
                    :min="1" 
                    :max="totalFavoritesPages"
                    @keyup.enter="handleFavoritesJump"
                    class="jump-input"
                  />
                  <span>页</span>
                  <button @click.stop="handleFavoritesJump" class="jump-btn">确定</button>
                </div>
              </div>
            </div>
          </div>

          <!-- 关注列表 -->
          <div v-if="activeTab === 'following'" class="following-section">
            <div v-loading="followingLoading" class="following-list-wrapper">
              <div v-if="followingList.length === 0 && !followingLoading" class="empty-state">
                <i class="icon-users"></i>
                <h3>暂无关注</h3>
                <p>该用户还没有关注任何人</p>
              </div>
              
              <div v-else class="following-list">
                <div 
                  v-for="followingUser in followingList" 
                  :key="followingUser.id"
                  class="following-item"
                >
                  <img 
                    :src="followingUser.avatar || '/avatar.png'" 
                    :alt="followingUser.nickname || followingUser.username"
                    class="following-avatar"
                    referrerpolicy="no-referrer"
                    @error="handleAvatarError"
                  />
                  <div class="following-info">
                    <h4 class="following-name">
                      <router-link :to="`/user/${followingUser.id}`">
                        {{ followingUser.nickname || followingUser.username }}
                      </router-link>
                    </h4>
                    <div class="following-stats">
                      <span>粉丝: {{ followingUser.followers_count }}</span>
                    </div>
                  </div>
                  <button 
                    v-if="isCurrentUser"
                    class="btn btn-outline btn-sm unfollow-btn"
                    @click="handleUnfollow(followingUser.id)"
                    :disabled="unfollowingId === followingUser.id"
                  >
                    {{ unfollowingId === followingUser.id ? '取消中...' : '取消关注' }}
                  </button>
                </div>
              </div>

              <!-- 分页组件 -->
              <div v-if="followingList.length > 0" class="pagination-container">
                <div class="pagination-info">
                  <span>共 {{ followingPagination.total }} 条记录</span>
                  <span class="divider" v-if="followingPagination.total > 0">|</span>
                  <template v-if="followingPagination.total > 0">
                    <span>每页显示</span>
                    <select v-model="followingPageSize" @change="handleFollowingSizeChange" class="page-size-select">
                      <option :value="10">10</option>
                      <option :value="20">20</option>
                      <option :value="50">50</option>
                    </select>
                    <span>条</span>
                  </template>
                </div>
                <div class="pagination" v-if="followingPagination.total > 0 && totalFollowingPages > 0">
                  <button 
                    class="pagination-btn pagination-nav-btn"
                    :class="{ disabled: followingPage <= 1 || totalFollowingPages <= 1 }"
                    :disabled="followingPage <= 1 || totalFollowingPages <= 1" 
                    @click.stop="changeFollowingPage(1)"
                    title="首页"
                  >
                    <i class="icon-home"></i>
                    <span>首页</span>
                  </button>
                  <button 
                    class="pagination-btn pagination-nav-btn"
                    :class="{ disabled: followingPage <= 1 || totalFollowingPages <= 1 }"
                    :disabled="followingPage <= 1 || totalFollowingPages <= 1" 
                    @click.stop="changeFollowingPage(followingPage - 1)"
                    title="上一页"
                  >
                    <i class="icon-chevron-left"></i>
                    <span>上一页</span>
                  </button>
                  
                  <div class="page-numbers">
                    <template v-for="(p, index) in visibleFollowingPages" :key="`page-${index}-${p}`">
                      <button
                        v-if="typeof p === 'number'"
                        class="pagination-btn page-number"
                        :class="{ active: p === followingPage }"
                        @click.stop="changeFollowingPage(p)"
                      >
                        {{ p }}
                      </button>
                      <span v-else class="page-ellipsis">{{ p }}</span>
                    </template>
                  </div>
                  
                  <button 
                    class="pagination-btn pagination-nav-btn"
                    :class="{ disabled: !followingPagination.has_next || totalFollowingPages <= 1 }"
                    :disabled="!followingPagination.has_next || totalFollowingPages <= 1" 
                    @click.stop="changeFollowingPage(followingPage + 1)"
                    title="下一页"
                  >
                    <span>下一页</span>
                    <i class="icon-chevron-right"></i>
                  </button>
                  <button 
                    class="pagination-btn pagination-nav-btn"
                    :class="{ disabled: !followingPagination.has_next || totalFollowingPages <= 1 }"
                    :disabled="!followingPagination.has_next || totalFollowingPages <= 1" 
                    @click.stop="changeFollowingPage(totalFollowingPages)"
                    title="末页"
                  >
                    <span>末页</span>
                    <i class="icon-end"></i>
                  </button>
                  <div class="page-jump">
                    <span>跳至</span>
                    <input 
                      type="number" 
                      v-model.number="followingJumpPage" 
                      :min="1" 
                      :max="totalFollowingPages"
                      @keyup.enter="handleFollowingJump"
                      class="jump-input"
                    />
                    <span>页</span>
                    <button @click.stop="handleFollowingJump" class="jump-btn">确定</button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 片单部分已删除 -->
          <!-- 功能已迁移到账号设置页面 -->
        </div>
      </div>
      <!-- 编辑资料和头像上传功能已迁移到账号设置页面 -->
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed, getCurrentInstance, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import ImageUploader from '@/components/ImageUploader.vue'
import { userApi } from '@/api/users'
import { postApi } from '@/api/posts'
import { http, jsonBody } from '@/api/http'
import type { FollowingUser, Pagination } from '@/types/user'
import notificationService from '@/utils/notification'

const notify = notificationService

const route = useRoute()
const router = useRouter()

// 响应式数据
const loading = ref(true)
import type { User } from '../types/user'
const user = ref<User | null>(null)
import type { Post } from '../api/posts'
const userPosts = ref<Post[]>([]);
type TabId = 'posts' | 'favorites' | 'following'
const activeTab = ref<TabId>('posts')
const isFollowing = ref(false)

// 关注列表相关数据
const followingList = ref<FollowingUser[]>([])
const followingPagination = ref<Pagination>({
  total: 0,
  page: 1,
  size: 10,
  has_next: false
})
const followingPage = ref(1)
const followingPageSize = ref(10)
const followingJumpPage = ref(1)
const followingLoading = ref(false)
const unfollowingId = ref<number | null>(null)
// 分页相关状态
const currentPage = ref(1)
const pageSize = ref(10)
const totalPosts = ref(0)
const jumpPage = ref(1)
// 收藏相关状态
interface Favorites {
  movies: any[];
  tvshows: any[];
  varieties: any[];
}

const loadingFavorites = ref(false);
const favorites = ref<Favorites>({
  movies: [],
  tvshows: [],
  varieties: []
});

// 处理海报加载失败，设置纯色背景
function handlePosterError(event: Event) {
  const target = event.target as HTMLImageElement;
  // 设置图片不可见
  target.style.display = 'none';
  // 给父元素添加纯色背景
  const parent = target.parentElement;
  if (parent) {
    // 生成随机的深色系背景色
    const hue = Math.floor(Math.random() * 360);
    const saturation = 30 + Math.floor(Math.random() * 20); // 30-50%
    const lightness = 25 + Math.floor(Math.random() * 15); // 25-40%
    parent.style.backgroundColor = `hsl(${hue}, ${saturation}%, ${lightness}%)`;
    
    // 添加电影标题文本作为替代显示
    const title = target.alt || '未知标题';
    // 检查是否已有文本元素
    if (!parent.querySelector('.poster-placeholder-text')) {
      const textElement = document.createElement('div');
      textElement.className = 'poster-placeholder-text';
      textElement.textContent = title;
      parent.appendChild(textElement);
    }
  }
}
interface FavoritesPagination {
  movies: { total: number; page: number; size: number; has_next: boolean }
  tvshows: { total: number; page: number; size: number; has_next: boolean }
  varieties: { total: number; page: number; size: number; has_next: boolean }
}

const favoritesPagination = ref<FavoritesPagination>({
  movies: { total: 0, page: 1, size: 10, has_next: false },
  tvshows: { total: 0, page: 1, size: 10, has_next: false },
  varieties: { total: 0, page: 1, size: 10, has_next: false }
})
const currentFavoritesPage = ref(1)
const favoritesJumpPage = ref(1)
const favoritesPageSize = ref(10)
const activeFavoritesType = ref<keyof FavoritesPagination>('movies')
// 定义收藏类型数组，用于类型安全的循环遍历
const favoriteTypes: Array<keyof FavoritesPagination> = ['movies', 'tvshows', 'varieties']

const tabs: Array<{ id: TabId; label: string; icon: string }> = [
  { id: 'posts', label: '帖子', icon: 'icon-edit' },
  { id: 'favorites', label: '收藏', icon: 'icon-star' },
  { id: 'following', label: '关注', icon: 'icon-users' }
]
const availableTabIds = tabs.map(tab => tab.id)

// 修改密码功能已迁移到账号设置页面

const getValidTabFromQuery = (tabValue: unknown): TabId | null => {
  const value = Array.isArray(tabValue) ? tabValue[0] : tabValue
  return typeof value === 'string' && availableTabIds.includes(value as TabId)
    ? (value as TabId)
    : null
}

const updateTabQuery = (tab: TabId) => {
  const currentTab = getValidTabFromQuery(route.query.tab)
  if (currentTab === tab) return
  router.replace({
    query: {
      ...route.query,
      tab
    }
  })
}

// 方法
const formatDate = (date: Date | string) => {
  return new Date(date).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

watch(
  () => route.query.tab,
  (tabValue) => {
    const nextTab = getValidTabFromQuery(tabValue)
    if (nextTab && nextTab !== activeTab.value) {
      activeTab.value = nextTab
    } else if (!nextTab && tabValue !== undefined && tabValue !== null) {
      activeTab.value = 'posts'
    }
  },
  { immediate: true }
)

// 监听activeTab变化
watch(activeTab, (newTab) => {
  updateTabQuery(newTab)
  if (newTab === 'favorites') {
    // 切换到收藏影片标签时，加载电影分类的收藏数据
    loadUserFavorites(activeFavoritesType.value, 1, favoritesPageSize.value)
  } else if (newTab === 'following') {
    // 切换到关注标签时，加载关注列表
    loadFollowingList()
  }
})

// 监听路由参数变化，当用户ID变化时重新加载数据
watch(() => route.params.id, (newId, oldId) => {
  if (newId && newId !== oldId) {
    // 重置状态
    activeTab.value = getValidTabFromQuery(route.query.tab) || 'posts'
    followingPage.value = 1
    followingPageSize.value = 10
    followingJumpPage.value = 1
    followingList.value = []
    followingPagination.value = {
      total: 0,
      page: 1,
      size: 10,
      has_next: false
    }
    currentPage.value = 1
    pageSize.value = 10
    jumpPage.value = 1
    userPosts.value = []
    totalPosts.value = 0
    favorites.value = {
      movies: [],
      tvshows: [],
      varieties: []
    }
    favoritesPagination.value = {
      movies: { total: 0, page: 1, size: 10, has_next: false },
      tvshows: { total: 0, page: 1, size: 10, has_next: false },
      varieties: { total: 0, page: 1, size: 10, has_next: false }
    }
    // 重新加载用户数据
    loadUserProfile()
  }
}, { immediate: false })

const formatTime = (date: Date | string) => {
  const now = new Date().getTime()
  const diff = now - new Date(date).getTime()
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const minutes = Math.floor(diff / (1000 * 60))
  
  if (days > 0) return `${days}天前`
  if (hours > 0) return `${hours}小时前`
  if (minutes > 0) return `${minutes}分钟前`
  return '刚刚'
}

// 加载用户收藏列表
const loadUserFavorites = async (type = 'movies', page = 1, size = 10) => {
  loadingFavorites.value = true
  try {
    const userId = parseInt(route.params.id as string)
    // 构建查询参数
    const queryParams = new URLSearchParams({
      type,
      page: page.toString(),
      size: size.toString()
    })
    // 调用API获取用户收藏列表 - 使用正确的http函数调用方式
    const response = await http<{ code: number; data?: { movies?: any[]; tvshows?: any[]; varieties?: any[]; pagination?: any } }>(`/user/${userId}/favorites?${queryParams}`)
    
    if (response && response.code === 200 && response.data) {
      // 确保type是有效的Favorites键
      const safeType = type as keyof Favorites;
      // 更新收藏数据
      favorites.value[safeType] = response.data[safeType] || []
      
      // 更新分页信息
      favoritesPagination.value[safeType] = {
        total: (response as any).data?.pagination?.[type]?.total || 0,
        page: (response as any).data?.pagination?.[type]?.page || page,
        size: (response as any).data?.pagination?.[type]?.size || size,
        has_next: (response as any).data?.pagination?.[type]?.has_next || false
      }
      
      // 确保收藏数据在页面加载时正确初始化
      const favoritesKey = type as keyof Favorites;
        if (favorites.value[favoritesKey].length === 0 && favoritesPagination.value[favoritesKey].total > 0) {
        console.log('No favorites data returned for type:', type)
      }
    }
  } catch (error) {
    console.error('Failed to load user favorites:', error)
  } finally {
    loadingFavorites.value = false
  }
}

const loadUserProfile = async () => {
  loading.value = true
  try {
      // 使用真实API获取用户信息
      const userId = parseInt(route.params.id as string)
      
      // 获取用户store实例
      const userStore = useUserStore();
      const currentUser = userStore.user;
      let response;
      
      // 无论是访问自己还是他人的资料，都使用getUserInfo接口并传入userId
      response = await userApi.getUserInfo(userId);
    
    if (response && response.code === 200 && response.data) {
      // 将API返回的snake_case格式数据转换为camelCase
      user.value = {
        id: response.data.id,
        username: response.data.username,
        email: response.data.email,
        avatar: response.data.avatar || '/avatar.png',
        nickname: response.data.nickname,
        level: response.data.level,
        joinDate: response.data.join_date,
        postsCount: response.data.posts_count,
        followersCount: response.data.followers_count,
        followingCount: response.data.following_count,
        role: response.data.role,
        // 以下字段API可能未提供，保留以保持兼容性
        bio: '',
        location: '',
        website: ''
      }
      
      // 从API响应中获取关注状态
      if (response.data.isFollowing !== undefined) {
        isFollowing.value = response.data.isFollowing
      }
      
      // 用户信息已加载完成
      
      // 加载用户帖子
      currentPage.value = 1
      jumpPage.value = 1
      await loadUserPosts(userId, currentPage.value, pageSize.value)
      
      // 如果当前标签是关注，加载关注列表
      if (activeTab.value === 'following') {
        loadFollowingList()
      }
    } else {
      console.error('获取用户信息失败:', response?.message || '未知错误')
    }
  } catch (error) {
    console.error('获取用户信息出错:', error)
  } finally {
    loading.value = false
  }
}

const handleFollow = async () => {
  try {
    const userId = parseInt(route.params.id as string)
    let response
    
    // 根据当前关注状态调用不同的接口
    if (isFollowing.value) {
      // 当前已关注，执行取消关注
      response = await userApi.unfollowUser(userId)
    } else {
      // 当前未关注，执行关注
      response = await userApi.followUser(userId)
    }
    
    if (response && response.code === 200) {
      // 切换关注状态
      isFollowing.value = !isFollowing.value
      
      // 更新粉丝数
      if (user.value) {
        if (isFollowing.value) {
          user.value.followersCount++
        } else {
          user.value.followersCount--
        }
      }
    } else {
      console.error('关注操作失败:', response?.message || '未知错误')
      // 可以在这里添加错误提示
    }
  } catch (error) {
    console.error('关注用户出错:', error)
    // 可以在这里添加错误提示
  }
}

/**
 * 加载用户关注列表
 */
const loadFollowingList = async () => {
  if (!user.value?.id) return
  
  try {
    followingLoading.value = true
    const userId = parseInt(Array.isArray(route.params.id) ? route.params.id[0] : route.params.id)
    const response = await userApi.getFollowingList(userId, followingPage.value, followingPageSize.value)
    
    if (response && response.code === 200 && response.data) {
      followingList.value = response.data.list || []
      followingPagination.value = response.data.pagination || {
        total: 0,
        page: 1,
        size: followingPageSize.value,
        has_next: false
      }
      followingPage.value = followingPagination.value.page
      followingJumpPage.value = followingPage.value
    } else {
      console.error('获取关注列表失败:', response?.message || '未知错误')
      notify.error('获取关注列表失败，请稍后重试')
    }
  } catch (error) {
    console.error('获取关注列表出错:', error)
    notify.error('获取关注列表失败，请稍后重试')
  } finally {
    followingLoading.value = false
  }
}

/**
 * 取消关注用户
 */
const handleUnfollow = async (userId: number) => {
  try {
    unfollowingId.value = userId
    const response = await userApi.unfollowUser(userId)
    
    if (response && response.code === 200) {
      notify.success('取消关注成功')
      // 重新加载关注列表
      await loadFollowingList()
      // 更新用户信息中的关注数
      if (user.value) {
        user.value.followingCount = Math.max(0, (user.value.followingCount || 0) - 1)
      }
    } else {
      notify.error(response?.message || '取消关注失败，请稍后重试')
    }
  } catch (error) {
    console.error('取消关注出错:', error)
    notify.error('取消关注失败，请稍后重试')
  } finally {
    unfollowingId.value = null
  }
}

/**
 * 处理头像加载错误
 */
const handleAvatarError = (event: Event) => {
  const target = event.target as HTMLImageElement
  target.src = '/avatar.png'
}

/**
 * 总页数计算
 */
const totalFollowingPages = computed(() => {
  return Math.max(1, Math.ceil(followingPagination.value.total / followingPagination.value.size))
})

/**
 * 计算可见的页码
 */
const visibleFollowingPages = computed(() => {
  const pages: (number | string)[] = []
  const current = followingPage.value
  const total = totalFollowingPages.value
  
  if (total <= 7) {
    // 总页数少于等于7页，显示所有页码
    for (let i = 1; i <= total; i++) {
      pages.push(i)
    }
  } else {
    // 总页数大于7页，显示部分页码
    if (current <= 4) {
      // 当前页在前4页，显示前5页和最后一页
      for (let i = 1; i <= 5; i++) {
        pages.push(i)
      }
      pages.push('...')
      pages.push(total)
    } else if (current >= total - 3) {
      // 当前页在后4页，显示第一页和最后5页
      pages.push(1)
      pages.push('...')
      for (let i = total - 4; i <= total; i++) {
        pages.push(i)
      }
    } else {
      // 当前页在中间，显示第一页、当前页前后各2页和最后一页
      pages.push(1)
      pages.push('...')
      for (let i = current - 2; i <= current + 2; i++) {
        pages.push(i)
      }
      pages.push('...')
      pages.push(total)
    }
  }
  
  return pages
})

/**
 * 切换关注列表页码
 */
const changeFollowingPage = (page: number) => {
  const targetPage = Math.max(1, Math.min(page, totalFollowingPages.value))
  if (targetPage === followingPage.value) return
  
  followingPage.value = targetPage
  followingJumpPage.value = targetPage
  loadFollowingList()
}

/**
 * 处理每页数量变化
 */
const handleFollowingSizeChange = () => {
  followingPage.value = 1
  followingJumpPage.value = 1
  loadFollowingList()
}

/**
 * 处理跳转页码
 */
const handleFollowingJump = () => {
  let page = followingJumpPage.value
  const maxPage = totalFollowingPages.value
  
  if (page < 1) page = 1
  if (page > maxPage) page = maxPage
  
  changeFollowingPage(page)
}

/**
 * 加载用户帖子列表
 * @param userId 用户ID
 * @param page 页码
 * @param size 每页数量
 */
const loadUserPosts = async (userId: number, page: number, size: number) => {
  const loadingPosts = ref(true)
  try {
    const response = await postApi.getUserPosts(userId, page, size)
    if (response && response.code === 200 && response.data) {
      // 更新帖子列表
      userPosts.value = response.data.posts || []
      
      // 更新分页信息
      totalPosts.value = response.data.pagination.total || 0
      currentPage.value = page
      // 滚动到顶部
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } else {
      console.error('获取用户帖子失败:', response?.message || '未知错误')
    }
  } catch (error) {
    console.error('获取用户帖子出错:', error)
  } finally {
    loadingPosts.value = false
  }
}

/**
   * 判断是否是当前登录用户
   */
  const isCurrentUser = computed(() => {
    const userStore = useUserStore()
    const currentUser = userStore.user
    return currentUser && user.value && currentUser.id === user.value.id
  })

/**
   * 总页数计算
   */
  const totalPages = computed(() => Math.max(1, Math.ceil(totalPosts.value / pageSize.value)))
  
  /**
   * 计算可见的页码
   */
  const visiblePages = computed(() => {
    const pages = []
    const current = currentPage.value
    const total = totalPages.value
    
    if (total <= 7) {
      // 总页数少于等于7页，显示所有页码
      for (let i = 1; i <= total; i++) {
        pages.push(i)
      }
    } else {
      // 总页数大于7页，显示部分页码
      if (current <= 4) {
        // 当前页在前4页，显示前5页和最后一页
        for (let i = 1; i <= 5; i++) {
          pages.push(i)
        }
        pages.push('...')
        pages.push(total)
      } else if (current >= total - 3) {
        // 当前页在后4页，显示第一页和最后5页
        pages.push(1)
        pages.push('...')
        for (let i = total - 4; i <= total; i++) {
          pages.push(i)
        }
      } else {
        // 当前页在中间，显示第一页、当前页前后各2页和最后一页
        pages.push(1)
        pages.push('...')
        for (let i = current - 2; i <= current + 2; i++) {
          pages.push(i)
        }
        pages.push('...')
        pages.push(total)
      }
    }
    
    return pages
  })
  
  // 收藏列表相关计算属性
  const totalFavoritesPages = computed(() => {
    const type = activeFavoritesType.value as keyof FavoritesPagination
    const pagination = favoritesPagination.value[type]
    return Math.ceil(pagination.total / pagination.size)
  })
  
  const visibleFavoritesPages = computed(() => {
    const pages = []
    const total = totalFavoritesPages.value
    const type = activeFavoritesType.value as keyof FavoritesPagination
    const current = favoritesPagination.value[type].page
    
    // 生成可见页码
    if (total <= 7) {
      for (let i = 1; i <= total; i++) {
        pages.push(i)
      }
    } else if (current <= 4) {
      for (let i = 1; i <= 5; i++) {
        pages.push(i)
      }
      pages.push('...')
      pages.push(total)
    } else if (current >= total - 3) {
      pages.push(1)
      pages.push('...')
      for (let i = total - 4; i <= total; i++) {
        pages.push(i)
      }
    } else {
      pages.push(1)
      pages.push('...')
      for (let i = current - 1; i <= current + 1; i++) {
        pages.push(i)
      }
      pages.push('...')
      pages.push(total)
    }
    
    return pages
  })
  
  // 收藏分页控制函数
  const handleFavoritesPageChange = (page: number) => {
    currentFavoritesPage.value = page
    favoritesJumpPage.value = page
    loadUserFavorites(activeFavoritesType.value, page, favoritesPageSize.value)
  }
  
  const handleFavoritesPageSizeChange = (size: number) => {
    favoritesPageSize.value = size
    currentFavoritesPage.value = 1
    favoritesJumpPage.value = 1
    loadUserFavorites(activeFavoritesType.value, 1, size)
  }
  
  const handleFavoritesJump = () => {
    let page = favoritesJumpPage.value
    const maxPage = totalFavoritesPages.value
    
    if (page < 1) page = 1
    if (page > maxPage) page = maxPage
    
    handleFavoritesPageChange(page)
  }
  
  const handleFavoritesTypeChange = (type: keyof FavoritesPagination) => {
    activeFavoritesType.value = type
    // 切换类型时重新加载数据
    loadUserFavorites(type, 1, favoritesPageSize.value)
  }
  
  /**
   * 切换页码
   * @param p 目标页码
   */
  const changePage = (p: number) => {
    const targetPage = Math.max(1, Math.min(p, totalPages.value))
    if (targetPage === currentPage.value || !user.value) return // 如果目标页就是当前页或用户不存在，不重复加载
    currentPage.value = targetPage
    jumpPage.value = targetPage
    loadUserPosts(user.value.id, targetPage, pageSize.value)
  }

/**
 * 处理每页显示数量变化
 */
const handleSizeChange = () => {
  currentPage.value = 1
  jumpPage.value = 1
  if (user.value) {
    loadUserPosts(user.value.id, 1, pageSize.value)
  }
}

/**
 * 处理页码跳转
 */
const handleJump = () => {
  const targetPage = Math.max(1, Math.min(jumpPage.value, totalPages.value))
  if (targetPage !== currentPage.value && user.value) {
    changePage(targetPage)
  }
}

// 编辑资料和头像上传功能已迁移到账号设置页面

// 获取全局通知服务已删除，未使用

onMounted(() => {
  loadUserProfile()
  // 初始化加载收藏数据（如果当前显示的是收藏标签页）
  if (activeTab.value === 'favorites') {
    loadUserFavorites(activeFavoritesType.value, 1, favoritesPageSize.value)
  }
})

// 片单相关函数已删除
</script>

<style lang="scss" scoped>
.user-profile {
  min-height: 100vh;
  background: var(--bg-primary);
  padding: 40px 0;
  transition: background-color 0.3s ease;
}

.container {
  max-width: 1000px;
  margin: 0 auto;
  padding: 0 20px;
}

.loading {
  text-align: center;
  padding: 60px;
  color: var(--text-secondary);
  transition: color 0.3s ease;
  
  .loading-spinner {
    width: 40px;
    height: 40px;
    border: 4px solid var(--border-color);
    border-top: 4px solid var(--primary-color);
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin: 0 auto 20px;
  }
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.profile-content {
  display: flex;
  flex-direction: column;
  gap: 30px;
}

// 分页组件样式
.pagination-container {
  margin-top: 40px;
  padding: 20px;
  background: var(--bg-card);
  border-radius: 12px;
  box-shadow: 0 2px 4px var(--shadow-color);
  transition: background-color 0.3s ease, box-shadow 0.3s ease;
}

.pagination-info {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 15px;
  margin-bottom: 20px;
  color: var(--text-secondary);
  font-size: 14px;
  transition: color 0.3s ease;
  
  .divider {
    color: var(--border-color);
  }
  
  .page-size-select {
    padding: 6px 12px;
    border: 1px solid var(--border-color);
    border-radius: 6px;
    background: var(--bg-card);
    color: var(--text-primary);
    font-size: 14px;
    cursor: pointer;
    transition: border-color 0.2s, background-color 0.3s ease, color 0.3s ease;
    
    &:focus {
      outline: none;
      border-color: var(--primary-color);
      box-shadow: 0 0 0 3px rgba(249, 115, 22, 0.1);
    }
  }
}

.pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  flex-wrap: wrap;
}

.pagination-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px 12px;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  background: var(--bg-card);
  color: var(--text-primary);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover:not(:disabled) {
    background: var(--bg-secondary);
    border-color: var(--primary-color);
    color: var(--primary-color);
    transform: translateY(-1px);
  }
  
  &:active:not(:disabled) {
    transform: translateY(0);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
}

.pagination-nav-btn {
  gap: 6px;
  padding: 8px 16px;
  
  &.disabled {
    opacity: 0.4;
  }
  
  i {
    font-size: 12px;
  }
}

.page-number {
  min-width: 40px;
  height: 40px;
  padding: 0;
  font-weight: 600;
  
  &.active {
    background: var(--primary-color);
    border-color: var(--primary-color);
    color: white;
    box-shadow: 0 2px 8px rgba(249, 115, 22, 0.3);
  }
  
  &:hover:not(.active):not(:disabled) {
    background: var(--bg-secondary);
    border-color: var(--primary-color);
    color: var(--primary-color);
  }
}

.page-ellipsis {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 12px;
  color: var(--text-light);
  font-size: 16px;
  font-weight: 500;
  user-select: none;
}

.page-jump {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-left: 16px;
  color: var(--text-secondary);
  font-size: 14px;
  transition: color 0.3s ease;
  
  .jump-input {
    width: 70px;
    padding: 8px 12px;
    border: 1px solid var(--border-color);
    border-radius: 6px;
    background: var(--bg-card);
    color: var(--text-primary);
    font-size: 14px;
    text-align: center;
    transition: border-color 0.2s, background-color 0.3s ease, color 0.3s ease;
    
    &:focus {
      outline: none;
      border-color: var(--primary-color);
      box-shadow: 0 0 0 3px rgba(249, 115, 22, 0.1);
    }
    
    &::-webkit-inner-spin-button,
    &::-webkit-outer-spin-button {
      -webkit-appearance: none;
      margin: 0;
    }
    
    & {
      -moz-appearance: textfield;
    }
  }
  
  .jump-btn {
    padding: 8px 16px;
    border: none;
    border-radius: 6px;
    background: var(--primary-color);
    color: white;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
    
    &:hover {
      background: var(--primary-dark);
      transform: translateY(-1px);
    }
    
    &:active {
      transform: translateY(0);
    }
  }
}

// 响应式设计
@media (max-width: 768px) {
  .pagination-container {
    padding: 15px;
    margin-top: 30px;
  }
  
  .pagination-info {
    flex-direction: column;
    gap: 10px;
    margin-bottom: 15px;
  }
  
  .pagination {
    gap: 6px;
  }
  
  .pagination-btn {
    padding: 6px 10px;
    font-size: 13px;
  }
  
  .pagination-nav-btn {
    padding: 6px 12px;
    
    span {
      display: none;
    }
    
    gap: 0;
  }
  
  .page-number {
    min-width: 36px;
    height: 36px;
  }
  
  .page-jump {
    margin-left: 10px;
    
    .jump-input {
      width: 60px;
      padding: 6px 8px;
    }
    
    .jump-btn {
      padding: 6px 12px;
    }
  }
}

@media (max-width: 480px) {
  .pagination {
    flex-direction: column;
    gap: 10px;
  }
  
  .page-numbers {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 6px;
  }
  
  .page-jump {
    margin-left: 0;
    width: 100%;
    justify-content: center;
  }
}

// 用户信息卡片
.profile-card {
  background: var(--bg-card);
  border-radius: 16px;
  padding: 40px;
  box-shadow: 0 4px 6px var(--shadow-color);
  transition: background-color 0.3s ease, box-shadow 0.3s ease;
}

.profile-header {
  display: flex;
  align-items: flex-start;
  gap: 30px;
  margin-bottom: 30px;
}

.avatar-section {
  position: relative;
  
  .user-avatar {
    width: 120px;
    height: 120px;
    border-radius: 50%;
    object-fit: cover;
    border: 4px solid var(--border-color);
    transition: border-color 0.3s ease;
  }
  
  .edit-avatar-btn {
    position: absolute;
    bottom: 5px;
    right: 5px;
    width: 36px;
    height: 36px;
    background: var(--primary-color);
    border: none;
    border-radius: 50%;
    color: white;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s;
    
    &:hover {
      background: var(--primary-dark);
      transform: scale(1.1);
    }
  }
}

.user-info {
  flex: 1;
  
  .username {
    font-size: 2rem;
    font-weight: 700;
    color: var(--text-primary);
    margin-bottom: 5px;
    transition: color 0.3s ease;
  }
  
  .user-nickname {
    font-size: 1.1rem;
    color: var(--text-secondary);
    margin-bottom: 20px;
    transition: color 0.3s ease;
  }
}

.user-stats {
  display: flex;
  gap: 30px;
}

.stat-item {
  text-align: center;
  
  .stat-number {
    display: block;
    font-size: 1.5rem;
    font-weight: 700;
    color: var(--text-primary);
    transition: color 0.3s ease;
  }
  
  .stat-label {
    font-size: 0.9rem;
    color: var(--text-secondary);
    transition: color 0.3s ease;
  }
}

.profile-actions {
  display: flex;
  gap: 15px;
  align-items: flex-start;
}

.profile-details {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.detail-item {
  display: flex;
  align-items: center;
  gap: 12px;
  color: var(--text-secondary);
  font-size: 14px;
  transition: color 0.3s ease;
  
  i {
    color: var(--text-light);
    width: 16px;
    transition: color 0.3s ease;
  }
  
  .website-link {
    color: var(--primary-color);
    text-decoration: none;
    transition: color 0.3s ease;
    
    &:hover {
      color: var(--primary-dark);
    }
  }
}

// 标签页
.tabs {
  display: flex;
  background: var(--bg-card);
  border-radius: 12px;
  padding: 8px;
  box-shadow: 0 2px 4px var(--shadow-color);
  transition: background-color 0.3s ease, box-shadow 0.3s ease;
}

.tab-btn {
  flex: 1;
  padding: 12px 20px;
  border: none;
  background: transparent;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 500;
  color: var(--text-secondary);
  
  &:hover {
    background: var(--bg-secondary);
  }
  
  &.active {
    background: var(--primary-color);
    color: white;
  }
}

.tab-content {
  background: var(--bg-card);
  border-radius: 12px;
  padding: 30px;
  box-shadow: 0 2px 4px var(--shadow-color);
  transition: background-color 0.3s ease, box-shadow 0.3s ease;
}

.lists-grid{ display:grid; grid-template-columns: repeat(2,1fr); gap:16px; }
.list-card{ border:1px solid var(--border-color); border-radius:12px; overflow:hidden; background:var(--bg-card); transition: all 0.3s ease; }
.list-cover{ height:120px; background:var(--bg-secondary); transition: background-color 0.3s ease; }
.list-meta{ padding:12px; }
.list-meta .sub{ color:var(--text-secondary); font-size:12px; transition: color 0.3s ease; }
.list-actions-row{ display:flex; gap:8px; padding:0 12px 12px; }

// 帖子列表
.posts-list {
  display: flex;
  flex-direction: column;
  gap: 25px;
}

.post-item {
  padding: 25px;
  border: 1px solid var(--border-color);
  border-radius: 12px;
  transition: all 0.2s;
  background: var(--bg-card);
  
  &:hover {
    border-color: var(--primary-color);
    box-shadow: 0 4px 12px rgba(249, 115, 22, 0.1);
  }
}

.post-header {
  margin-bottom: 15px;
}

.post-meta {
  display: flex;
  gap: 15px;
  align-items: center;
  
  .post-category {
    padding: 4px 12px;
    background: var(--bg-secondary);
    color: var(--primary-color);
    border-radius: 16px;
    font-size: 12px;
    font-weight: 500;
    transition: background-color 0.3s ease, color 0.3s ease;
  }
  
  .post-time {
    color: var(--text-light);
    font-size: 12px;
    transition: color 0.3s ease;
  }
}

.post-title {
  margin-bottom: 10px;
  
  a {
    font-size: 1.25rem;
    font-weight: 600;
    color: var(--text-primary);
    text-decoration: none;
    transition: color 0.3s ease;
    
    &:hover {
      color: var(--primary-color);
    }
  }
}

.post-excerpt {
  color: var(--text-secondary);
  line-height: 1.6;
  margin-bottom: 15px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  transition: color 0.3s ease;
}

.post-stats {
  display: flex;
  gap: 20px;
  
  .stat {
    display: flex;
    align-items: center;
    gap: 5px;
    color: var(--text-light);
    font-size: 14px;
    transition: color 0.3s ease;
  }
}

// 收藏列表
.favorites-section {
  padding: 0;
}

.favorites-tabs {
  display: flex;
  gap: 12px;
  margin-bottom: 24px;
  border-bottom: 1px solid var(--border-color);
  transition: border-color 0.3s ease;
}

.favorite-tab-btn {
  padding: 12px 24px;
  border: none;
  background: transparent;
  color: var(--text-secondary);
  cursor: pointer;
  border-bottom: 2px solid transparent;
  transition: all 0.2s;
  font-size: 14px;
  font-weight: 500;
  
  &.active {
    color: var(--primary-color);
    border-bottom-color: var(--primary-color);
  }
  
  &:hover:not(.active) {
    color: var(--text-primary);
  }
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  color: var(--text-secondary);
  transition: color 0.3s ease;
  
  .loading-spinner {
    width: 40px;
    height: 40px;
    border: 4px solid var(--border-color);
    border-top: 4px solid var(--primary-color);
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin-bottom: 20px;
  }
}

.bookmarks-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.bookmark-item {
  padding: 20px;
  border: 1px solid var(--border-color);
  border-radius: 12px;
  transition: all 0.2s;
  background: var(--bg-card);
  
  &:hover {
    border-color: var(--primary-color);
    box-shadow: 0 4px 12px rgba(249, 115, 22, 0.1);
  }
}

.bookmark-header {
  margin-bottom: 15px;
}

.bookmark-meta {
  display: flex;
  align-items: center;
  gap: 12px;
  color: var(--text-secondary);
  font-size: 14px;
  transition: color 0.3s ease;
}

.bookmark-year,
.bookmark-rating,
.bookmark-likes {
  display: flex;
  align-items: center;
  gap: 4px;
}

.bookmark-title a {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--text-primary);
  text-decoration: none;
  transition: color 0.3s ease;
  
  &:hover {
    color: var(--primary-color);
  }
}

.author-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;
}

.author-info {
  display: flex;
  flex-direction: column;
  
  .author-name {
    font-weight: 500;
    color: #1f2937;
    font-size: 14px;
  }
  
  .bookmark-time {
    color: #9ca3af;
    font-size: 12px;
  }
}

.bookmark-title {
  margin-bottom: 10px;
  
  a {
    font-size: 1.1rem;
    font-weight: 600;
    color: #1f2937;
    text-decoration: none;
    
    &:hover {
      color: #3b82f6;
    }
  }
}

.bookmark-excerpt {
  color: #6b7280;
  line-height: 1.6;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

// 关注列表
.following-list-wrapper {
  min-height: 200px;
}

.following-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.following-item {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 20px;
  border: 1px solid var(--border-color);
  border-radius: 12px;
  transition: all 0.2s;
  background: var(--bg-card);
  
  &:hover {
    border-color: var(--primary-color);
    box-shadow: 0 4px 12px rgba(249, 115, 22, 0.1);
  }
}

.following-avatar {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  object-fit: cover;
}

.following-info {
  flex: 1;
  
  .following-name {
    margin-bottom: 5px;
    
    a {
      font-size: 1.1rem;
      font-weight: 600;
      color: var(--text-primary);
      text-decoration: none;
      transition: color 0.3s ease;
      
      &:hover {
        color: var(--primary-color);
      }
    }
  }
  
  .following-bio {
    color: var(--text-secondary);
    font-size: 14px;
    margin-bottom: 8px;
    transition: color 0.3s ease;
  }
  
  .following-stats {
    display: flex;
    gap: 15px;
    font-size: 12px;
    color: var(--text-light);
    transition: color 0.3s ease;
  }
}

// 空状态
.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: var(--text-secondary);
  transition: color 0.3s ease;
  
  i {
    font-size: 4rem;
    color: var(--text-light);
    margin-bottom: 20px;
    transition: color 0.3s ease;
  }
  
  h3 {
    font-size: 1.5rem;
    margin-bottom: 10px;
    color: var(--text-primary);
    transition: color 0.3s ease;
  }
  
  p {
    margin: 0;
  }
}

// 模态框
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.modal-content {
  background: var(--bg-card);
  border-radius: 12px;
  width: 100%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
  transition: background-color 0.3s ease;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 25px;
  border-bottom: 1px solid var(--border-color);
  transition: border-color 0.3s ease;
  
  h3 {
    margin: 0;
    font-size: 1.25rem;
    font-weight: 600;
    color: var(--text-primary);
    transition: color 0.3s ease;
  }
  
  .close-btn {
    width: 32px;
    height: 32px;
    border: none;
    background: var(--bg-secondary);
    border-radius: 6px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: background-color 0.3s ease;
    
    &:hover {
      background: var(--border-color);
    }
  }
}

.modal-body {
  padding: 25px;
}

.form-group {
  margin-bottom: 20px;
  
  label {
  }
}

/* 修改密码相关样式 */
.password-section {
  padding: 20px;
  background: var(--bg-card);
  border-radius: 8px;
  box-shadow: 0 2px 8px var(--shadow-color);
  transition: background-color 0.3s ease, box-shadow 0.3s ease;
}

.password-form-container h3 {
  margin-bottom: 10px;
  color: var(--text-primary);
  font-size: 1.5em;
  transition: color 0.3s ease;
}

.form-description {
  color: var(--text-secondary);
  margin-bottom: 20px;
  transition: color 0.3s ease;
}

.password-form {
  max-width: 500px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: var(--text-primary);
  transition: color 0.3s ease;
}

.form-input {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  font-size: 14px;
  background: var(--bg-card);
  color: var(--text-primary);
  transition: border-color 0.3s, background-color 0.3s ease, color 0.3s ease;
}

.form-input:focus {
  outline: none;
  border-color: var(--primary-color);
}

.form-input.error {
  border-color: var(--error-color);
}

.error-message {
  display: block;
  color: var(--error-color);
  font-size: 12px;
  margin-top: 4px;
}

.password-hint {
  font-size: 12px;
  color: var(--text-light);
  margin-top: 4px;
  transition: color 0.3s ease;
}

.form-actions {
  margin-top: 30px;
}

.btn-primary {
  background: var(--primary-color);
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.3s;
}

.btn-primary:hover {
  background: var(--primary-dark);
}

.btn-primary:disabled {
  background: var(--text-light);
  cursor: not-allowed;
}

.loading-spinner.small {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: #fff;
  border-radius: 50%;
  display: inline-block;
  margin-right: 8px;
  vertical-align: middle;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.access-denied {
  text-align: center;
  padding: 40px 20px;
  color: var(--text-secondary);
  transition: color 0.3s ease;
}

.icon-lock-large {
  font-size: 48px;
  margin-bottom: 16px;
  color: var(--text-light);
  transition: color 0.3s ease;
}

.access-denied h3 {
  margin-bottom: 8px;
  color: var(--text-primary);
  transition: color 0.3s ease;
}

.access-denied p {
  color: var(--text-secondary);
  font-size: 14px;
  transition: color 0.3s ease;
}

.form-group {
  
  label {
    display: block;
    font-weight: 500;
    color: var(--text-primary);
    margin-bottom: 8px;
    transition: color 0.3s ease;
  }
}

.form-input,
.form-textarea {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  font-size: 14px;
  background: var(--bg-card);
  color: var(--text-primary);
  transition: all 0.3s ease;
  
  &:focus {
    outline: none;
    border-color: var(--primary-color);
    box-shadow: 0 0 0 3px rgba(249, 115, 22, 0.1);
  }
}

.form-textarea {
  resize: vertical;
  min-height: 100px;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 15px;
  margin-top: 30px;
}

// 按钮样式
.btn {
  padding: 10px 20px;
  border-radius: 6px;
  text-decoration: none;
  font-weight: 500;
  transition: all 0.2s;
  border: 1px solid transparent;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  
  &.btn-primary {
    background: var(--primary-color);
    color: white;
    transition: background-color 0.3s ease;
    
    &:hover:not(:disabled) {
      background: var(--primary-dark);
    }
    
    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  }
  
  &.btn-outline {
    background: transparent;
    color: var(--text-secondary);
    border-color: var(--border-color);
    transition: all 0.3s ease;
    
    &:hover {
      background: var(--bg-secondary);
      color: var(--text-primary);
      border-color: var(--primary-color);
    }
  }
  
  &.btn-sm {
    padding: 6px 12px;
    font-size: 12px;
  }
}

// 响应式设计
@media (max-width: 768px) {
  .container {
    padding: 0 15px;
  }
  
  .profile-card {
    padding: 25px;
  }
  
  .profile-header {
    flex-direction: column;
    align-items: center;
    text-align: center;
    gap: 20px;
  }
  
  .user-stats {
    justify-content: center;
  }
  
  .profile-actions {
    width: 100%;
    justify-content: center;
  }
  
  .tabs {
    flex-direction: column;
    gap: 5px;
  }
  
  .tab-content {
    padding: 20px;
  }
  
  .following-item {
    flex-direction: column;
    text-align: center;
    gap: 15px;
  }
  
  .following-info {
    text-align: center;
  }
}

@media (max-width: 480px) {
  .profile-card {
    padding: 20px;
  }
  
  .user-info .username {
    font-size: 1.5rem;
  }
  
  .user-stats {
    gap: 20px;
  }
  
  .modal-content {
    margin: 10px;
    max-height: calc(100vh - 20px);
  }
  
  .modal-header,
  .modal-body {
    padding: 20px;
  }
}
</style>
