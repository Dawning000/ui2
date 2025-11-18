<template>
  <div class="forum">
    <div class="container">
      <!-- 页面头部 -->
      <div class="forum-header">
        <div class="header-content">
          <h1 class="page-title">
            <i class="icon-forum"></i>
            {{ getCategoryTitle() }}
          </h1>
          <p class="page-subtitle">
            {{ getCategoryDescription() }}
          </p>
        </div>
        <div class="header-actions">
          <button class="btn btn-primary" @click="showCreatePost = true">
            <i class="icon-plus"></i>
            发布新帖
          </button>
        </div>
      </div>

      <!-- 筛选和搜索 -->
      <div class="forum-filters">
        <div class="search-box">
          <div class="search-icon-wrapper">
            <i class="icon-search"></i>
          </div>
          <input 
            type="text" 
            placeholder="搜索帖子标题、内容或标签..."
            v-model="searchQuery"
            @keyup.enter="handleSearch"
            class="search-input"
          >
          <button @click="handleSearch" class="search-btn">
            <span>搜索</span>
          </button>
        </div>
        <div class="filter-group">
          <div class="filter-label">
            <i class="icon-filter"></i>
          </div>
          <select v-model="selectedCategory" @change="handleCategoryChange" class="filter-select">
            <option value="">全部分类</option>
            <option value="movie">🎬 电影</option>
            <option value="tv">📺 电视剧</option>
            <option value="variety">🎭 综艺</option>
          </select>
        </div>
      </div>

      <!-- 帖子列表 -->
      <div class="posts-container">
        <div v-if="loading" class="loading">
          <div class="loading-spinner"></div>
          <p>加载中...</p>
        </div>
        
        <div v-else-if="!posts || posts.length === 0" class="empty-state">
          <i class="icon-empty"></i>
          <h3>暂无帖子</h3>
          <p>还没有人在这里发布帖子，快来成为第一个吧！</p>
          <button class="btn btn-primary" @click="showCreatePost = true">
            发布第一个帖子
          </button>
        </div>
        
        <div v-else class="posts-list">
          <div v-for="post in sortedPosts" :key="post.id" class="post-item">
            
            <div class="post-content">
              <div class="post-header">
                <div class="post-meta">
                  <img :src="post.author.avatar || '/avatar.png'" :alt="post.author.username" class="author-avatar" referrerpolicy="no-referrer" @error="(e: Event) => { const target = e.target as HTMLImageElement; if (target) target.src = '/avatar.png' }" />
                  <div class="author-info">
                    <router-link :to="`/user/${post.author.id}`" class="author-name">
                      {{ post.author.nickname }}
                    </router-link>
                    <span class="post-time">{{ formatTime(post.createdAt || post.createTime) }}</span>
                  </div>
                </div>
                <div class="post-category">
                  <span :class="`category-tag category-${post.category}`">{{ post.categoryName || '未分类' }}</span>
                </div>
              </div>
              
              <router-link :to="`/post/${post.id}`" class="post-title">
                {{ post.title }}
              </router-link>
              
              <p class="post-excerpt">{{ post.excerpt }}</p>
              
              <div class="post-tags" v-if="post.tags && post.tags.length > 0">
                <span v-for="tag in post.tags" :key="tag" class="tag">{{ tag }}</span>
              </div>
              
              <div class="post-footer">
                <div class="post-stats">
                  <span class="stat">
                    <i class="icon-eye"></i>
                    {{ post.views }}
                  </span>
                  <span class="stat">
                    <i class="icon-comment"></i>
                    {{ post.commentsCount || 0 }}
                  </span>
                </div>
                <div class="post-actions">
                  <button class="action-btn" @click="handleShare(post)">
                    <i class="icon-share"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 分页 -->
        <div v-if="pagination.total > 0" class="pagination-container">
          <div class="pagination-info">
            <span>共 {{ pagination.total }} 条记录</span>
            <span class="divider" v-if="pagination.total > 0">|</span>
            <template v-if="pagination.total > 0">
              <span>每页显示</span>
              <select v-model="postsPerPage" @change="handleSizeChange" class="page-size-select">
                <option :value="10">10</option>
                <option :value="20">20</option>
                <option :value="50">50</option>
                <option :value="100">100</option>
              </select>
              <span>条</span>
            </template>
          </div>
          <div class="pagination" v-if="totalPages >= 1">
            <button 
              class="pagination-btn" 
              :disabled="currentPage <= 1"
              @click="goToPage(1)"
              title="首页"
            >
              首页
            </button>
            <button 
              class="pagination-btn" 
              :disabled="currentPage === 1"
              @click="goToPage(currentPage - 1)"
              title="上一页"
            >
              上一页
            </button>
            
            <div class="page-numbers" v-if="totalPages > 1">
              <template v-for="page in visiblePages" :key="page">
                <button 
                  v-if="typeof page === 'number'"
                  class="pagination-btn page-number"
                  :class="{ active: page === currentPage }"
                  @click="goToPage(page)"
                >
                  {{ page }}
                </button>
                <span v-else class="page-ellipsis">{{ page }}</span>
              </template>
            </div>
            
            <button 
              class="pagination-btn" 
              :disabled="currentPage >= totalPages"
              @click="goToPage(currentPage + 1)"
              title="下一页"
            >
              下一页
            </button>
            <button 
              class="pagination-btn" 
              :disabled="currentPage >= totalPages"
              @click="goToPage(totalPages)"
              title="末页"
            >
              末页
            </button>
            <div class="page-jump" v-if="totalPages > 1">
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
              <button @click="handleJump" class="jump-btn">确定</button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 创建帖子模态框 -->
    <div v-if="showCreatePost" class="modal-overlay" @click="closeCreatePost">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
            <h3>发布新帖子</h3>
            <button class="close-btn" @click="closeCreatePost">
              <i class="icon-close"></i>
            </button>
          </div>
        <div class="modal-body">
          <form @submit.prevent="handleCreatePost">
            <div class="form-group">
              <label>标题</label>
              <input 
                type="text" 
                v-model="newPost.title"
                placeholder="请输入帖子标题..."
                required
                class="form-input"
              >
            </div>
            <div class="form-group">
              <label>分类</label>
              <select v-model="newPost.category" required class="form-select">
                <option value="">请选择分类</option>
                <option value="movie">电影</option>
                <option value="tv">电视剧</option>
                <option value="variety">综艺</option>
              </select>
            </div>
            <div class="form-group">
              <label>标签</label>
              <input 
                type="text" 
                v-model="newPost.tagsInput"
                placeholder="用逗号分隔多个标签..."
                class="form-input"
              >
            </div>
            <div class="form-group">
              <label>内容</label>
              <textarea 
                v-model="newPost.content"
                placeholder="分享你的想法..."
                rows="8"
                required
                class="form-textarea"
              ></textarea>
            </div>
            <div class="form-actions">
              <button type="button" class="btn btn-outline" @click="closeCreatePost">
                取消
              </button>
              <button type="submit" class="btn btn-primary" :disabled="creating">
              {{ creating ? '发布中...' : '发布帖子' }}
            </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, getCurrentInstance } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { postApi, CreatePostParams } from '../api/posts'
import { notificationService as notify } from '../utils/notification'

const route = useRoute()
const router = useRouter()

import type { Post } from '../api/posts'

// 扩展 Post 类型以包含前端添加的字段
interface ExtendedPost extends Post {
  createdAt?: string
  categoryName?: string
}

// 响应式数据
const loading = ref(false)
const posts = ref<ExtendedPost[]>([])
const sortBy = ref('latest') // 固定为最新发布
const searchQuery = ref('')
const selectedCategory = ref('')
const currentPage = ref(1)
const postsPerPage = ref(10)
const showCreatePost = ref(false)
const creating = ref(false)
const jumpPage = ref(1)
// 分页信息
const pagination = ref({
  total: 0,
  page: 1,
  size: 10,
  has_next: false
})

// 不再需要编辑模式标志，因为编辑功能已移至PostDetail页面

const newPost = ref({
  title: '',
  category: '',
  tagsInput: '',
  content: ''
})

// 计算属性 - 使用后端返回的数据，只做前端排序（如果需要）
const sortedPosts = computed(() => {
  // 安全检查：确保 posts.value 存在且是数组
  if (!posts.value || !Array.isArray(posts.value)) {
    return []
  }
  
  // 如果后端已经排序，可以直接返回 posts.value
  // 如果需要前端排序，可以在这里排序
  let sorted = [...posts.value]
  
  // 前端排序（如果后端不支持排序参数）
  sorted.sort((a, b) => {
    switch (sortBy.value) {
      case 'hot':
        return (b.commentsCount || 0) * 2 - (a.commentsCount || 0) * 2
      case 'views':
        return (b.views || 0) - (a.views || 0)
      case 'comments':
        return (b.commentsCount || 0) - (a.commentsCount || 0)
      case 'latest':
      default:
        const timeA = (a.createdAt || a.createTime) ? new Date(a.createdAt || a.createTime).getTime() : 0
        const timeB = (b.createdAt || b.createTime) ? new Date(b.createdAt || b.createTime).getTime() : 0
        return timeB - timeA
    }
  })
  
  return sorted
})

const totalPages = computed(() => {
  if (!pagination.value) {
    return 0
  }
  const total = pagination.value.total || 0
  if (total === 0) {
    return 0
  }
  const pageSize = postsPerPage.value || pagination.value.size || 10
  const pages = Math.ceil(total / pageSize)
  return pages > 0 ? pages : 1
})

const visiblePages = computed(() => {
  const pages = []
  const total = totalPages.value
  const current = currentPage.value
  
  if (total <= 7) {
    for (let i = 1; i <= total; i++) {
      pages.push(i)
    }
  } else {
    if (current <= 4) {
      for (let i = 1; i <= 5; i++) pages.push(i)
      pages.push('...')
      pages.push(total)
    } else if (current >= total - 3) {
      pages.push(1)
      pages.push('...')
      for (let i = total - 4; i <= total; i++) pages.push(i)
    } else {
      pages.push(1)
      pages.push('...')
      for (let i = current - 2; i <= current + 2; i++) pages.push(i)
      pages.push('...')
      pages.push(total)
    }
  }
  
  return pages
})

// 方法
const getCategoryTitle = () => {
  const categoryMap: Record<string, string> = {
    movie: '电影讨论',
    tv: '电视剧讨论',
    variety: '综艺讨论'
  }
  const category = Array.isArray(route.params.category) ? route.params.category[0] : route.params.category
  return categoryMap[category as string] || '影视论坛'
}

const getCategoryDescription = () => {
  const descMap: Record<string, string> = {
    movie: '分享最新电影评论，讨论经典影片',
    tv: '热播剧集深度解析，追剧心得分享',
    variety: '娱乐综艺节目观后感分享'
  }
  const category = Array.isArray(route.params.category) ? route.params.category[0] : route.params.category
  return descMap[category as string] || '与千万影迷一起讨论精彩内容'
}

const formatTime = (date: string | undefined) => {
  if (!date) return '刚刚'
  const now = new Date()
  const dateObj = new Date(date)
  const diff = now.getTime() - dateObj.getTime()
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const minutes = Math.floor(diff / (1000 * 60))
  
  if (days > 0) return `${days}天前`
  if (hours > 0) return `${hours}小时前`
  if (minutes > 0) return `${minutes}分钟前`
  return '刚刚'
}

const loadPosts = async () => {
  loading.value = true
  try {
    // 优先使用选中的分类，如果没有则使用路由参数中的分类
    const category = selectedCategory.value || (route.params.category as string) || ''
    
    // 调用API获取帖子列表，传递分页参数和搜索参数
    const response = await postApi.getPosts(
      currentPage.value,
      postsPerPage.value,
      category || undefined,
      searchQuery.value || undefined
    )
    
    if (response.code === 200) {
      // 转换API返回的数据，添加categoryName字段并确保createdAt字段存在
      const categoryMap: Record<string, string> = {
        movie: '电影讨论',
        tv: '电视剧讨论',
        variety: '综艺讨论'
      }
      
      posts.value = response.data.posts.map(post => ({
        ...post,
        // 复制createTime到createdAt以兼容现有代码
        createdAt: post.createTime,
        // 添加categoryName字段
        categoryName: categoryMap[post.category] || '未分类'
      }))
      
      // 更新分页信息
      if (response.data.pagination) {
        pagination.value = {
          total: response.data.pagination.total || 0,
          page: response.data.pagination.page || currentPage.value,
          size: response.data.pagination.size || postsPerPage.value,
          has_next: response.data.pagination.has_next || false
        }
        // 同步当前页码
        currentPage.value = pagination.value.page
        // 同步跳转页码
        jumpPage.value = pagination.value.page
      } else {
        // 如果API没有返回分页信息，根据返回的帖子数量估算
        // 如果返回的帖子数量等于每页数量，说明可能还有更多页
        const estimatedTotal = response.data.posts.length === postsPerPage.value 
          ? (currentPage.value * postsPerPage.value) + 1 
          : (currentPage.value - 1) * postsPerPage.value + response.data.posts.length
        pagination.value = {
          total: estimatedTotal,
          page: currentPage.value,
          size: postsPerPage.value,
          has_next: response.data.posts.length === postsPerPage.value
        }
      }
    } else {
      throw new Error(response.message || '获取帖子列表失败')
    }
  } catch (error) {
    console.error('加载帖子失败:', error)
    posts.value = []
    pagination.value = {
      total: 0,
      page: 1,
      size: postsPerPage.value,
      has_next: false
    }
  } finally {
    loading.value = false
  }
}

const handleCategoryChange = () => {
  currentPage.value = 1
  jumpPage.value = 1
  // 更新路由（可选，如果需要URL反映分类）
  if (selectedCategory.value) {
    router.push(`/forum/${selectedCategory.value}`)
  } else {
    router.push('/forum')
  }
  loadPosts() // 重新加载数据
}

const handleSearch = () => {
  currentPage.value = 1
  jumpPage.value = 1
  loadPosts() // 重新加载数据，传递搜索关键词
}

const goToPage = (page: number | string) => {
  // 如果是省略号，不执行任何操作
  if (page === '...') {
    return
  }
  
  // 确保 page 是数字
  const pageNum = typeof page === 'string' ? parseInt(page, 10) : page
  
  // 验证页码范围
  if (pageNum >= 1 && pageNum <= totalPages.value && pageNum !== currentPage.value) {
    currentPage.value = pageNum
    jumpPage.value = pageNum
    loadPosts() // 重新加载对应页的数据
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
}

const handleSizeChange = () => {
  // 当每页显示条数变化时，重置页码为1并重新加载数据
  currentPage.value = 1
  jumpPage.value = 1
  loadPosts()
}

const handleJump = () => {
  // 确保jumpPage在有效范围内
  const targetPage = Math.max(1, Math.min(jumpPage.value, totalPages.value))
  if (targetPage !== currentPage.value) {
    currentPage.value = targetPage
    jumpPage.value = targetPage
    loadPosts()
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
}

const handleShare = (post: ExtendedPost) => {
  // 实现分享功能
  if (navigator.share) {
    navigator.share({
      title: post.title,
      text: post.excerpt || '',
      url: window.location.origin + `/post/${post.id}`
    })
  } else {
      // 复制链接到剪贴板
      navigator.clipboard.writeText(window.location.origin + `/post/${post.id}`)
      notify.success('链接已复制到剪贴板')
    }
}

const closeCreatePost = () => {
  showCreatePost.value = false
  newPost.value = {
    title: '',
    category: '',
    tagsInput: '',
    content: ''
  }
}

/**
 * 处理创建新帖子
 */
const handleCreatePost = async () => {
  creating.value = true
  try {
    // 解析标签
    const tags = newPost.value.tagsInput.split(',').map(tag => tag.trim()).filter(tag => tag)
    
    // 准备请求数据
    const postData: CreatePostParams = {
      title: newPost.value.title,
      content: newPost.value.content,
      category: newPost.value.category,
      tags
    }
    
    // 调用createPost API创建新帖子
    const response = await postApi.createPost(postData)
    
    if (response.code === 200) {
      // 关闭模态框
      closeCreatePost()
      
      // 刷新帖子列表
      await loadPosts()
      
      // 跳转到帖子详情页
      router.push(`/post/${response.data.id}`)
    } else {
      notify.error(response.message || '发布帖子失败，请重试')
    }
  } catch (error) {
    console.error('发布帖子失败:', error)
    notify.error('发布帖子失败，请检查网络连接或稍后重试')
  } finally {
    creating.value = false
  }
}

// 监听路由变化，更新分类选择
watch(() => route.params.category, (newCategory) => {
  if (newCategory) {
    selectedCategory.value = newCategory as string
  } else {
    selectedCategory.value = ''
  }
  currentPage.value = 1
  jumpPage.value = 1
  loadPosts()
})

// 监听搜索参数
watch(() => route.query.search, (newSearch) => {
  if (newSearch) {
    const searchValue = Array.isArray(newSearch) ? newSearch[0] : newSearch
    if (searchValue && typeof searchValue === 'string') {
      searchQuery.value = searchValue
    }
  }
})


onMounted(() => {
  // 初始化分类选择（从路由参数获取）
  if (route.params.category) {
    selectedCategory.value = route.params.category as string
  }
  
  // 如果有搜索参数，设置搜索框
  if (route.query.search) {
    const searchValue = Array.isArray(route.query.search) ? route.query.search[0] : route.query.search
    if (searchValue && typeof searchValue === 'string') {
      searchQuery.value = searchValue
    }
  }
  
  loadPosts()
  
  // 清除可能存在的旧编辑数据，避免干扰
  sessionStorage.removeItem('isEditMode')
  sessionStorage.removeItem('editPostData')
})
</script>

<style lang="scss" scoped>
.forum {
  min-height: 100vh;
  background: #f9fafb;
  padding: 40px 0;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

// 页面头部
.forum-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 40px;
  padding-bottom: 20px;
  border-bottom: 2px solid #e5e7eb;
}

.header-content {
  .page-title {
    font-size: 2.5rem;
    font-weight: 700;
    color: #1f2937;
    margin-bottom: 10px;
    display: flex;
    align-items: center;
    gap: 15px;
    
    i {
      color: #3b82f6;
    }
  }
  
  .page-subtitle {
    color: #6b7280;
    font-size: 1.1rem;
    margin: 0;
  }
}

.header-actions {
  .btn {
    display: flex;
    align-items: center;
    gap: 8px;
  }
}

// 筛选和搜索区域
.forum-filters {
  display: flex;
  gap: 20px;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 30px;
  padding: 24px;
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
  border-radius: 16px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  border: 1px solid rgba(226, 232, 240, 0.8);
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 160px;
  margin-left: auto;
  
  .filter-label {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 13px;
    font-weight: 600;
    color: #64748b;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    
    i {
      font-size: 14px;
      color: #3b82f6;
    }
  }
  
  .filter-select {
    padding: 12px 16px;
    border: 2px solid #e2e8f0;
    border-radius: 10px;
    background: white;
    font-size: 14px;
    font-weight: 500;
    color: #1e293b;
    cursor: pointer;
    transition: all 0.2s ease;
    appearance: none;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%2364748b' d='M6 9L1 4h10z'/%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right 12px center;
    padding-right: 36px;
    
    &:hover {
      border-color: #cbd5e1;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
    }
    
    &:focus {
      outline: none;
      border-color: #3b82f6;
      box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
    }
    
    option {
      padding: 8px;
      font-weight: 500;
    }
  }
}

.search-box {
  display: flex;
  align-items: center;
  flex: 1;
  max-width: 700px;
  background: white;
  border-radius: 12px;
  border: 2px solid #e2e8f0;
  overflow: hidden;
  transition: all 0.3s ease;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  
  &:focus-within {
    border-color: #3b82f6;
    box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1), 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  }
  
  .search-icon-wrapper {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0 16px;
    color: #94a3b8;
    background: #f8fafc;
    border-right: 1px solid #e2e8f0;
    
    i {
      font-size: 18px;
    }
  }
  
  .search-input {
    flex: 1;
    padding: 14px 16px;
    border: none;
    background: transparent;
    font-size: 15px;
    color: #1e293b;
    
    
    &::placeholder {
      color: #94a3b8;
    }
    
    &:focus {
      outline: none;
    }
  }
  
  .search-btn {
    padding: 14px 24px;
    background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
    border: none;
    color: white;
    font-weight: 600;
    font-size: 14px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;
    white-space: nowrap;
    
    &:hover {
      background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
    }
    
    &:active {
      transform: translateY(0);
    }
    
    span {
      display: flex;
      align-items: center;
      gap: 6px;
    }
  }
}

// 帖子列表
.posts-container {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  overflow: hidden;
}

.loading {
  padding: 60px;
  text-align: center;
  color: #6b7280;
  
  .loading-spinner {
    width: 40px;
    height: 40px;
    border: 4px solid #e5e7eb;
    border-top: 4px solid #3b82f6;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin: 0 auto 20px;
  }
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.empty-state {
  padding: 80px 40px;
  text-align: center;
  color: #6b7280;
  
  i {
    font-size: 4rem;
    color: #d1d5db;
    margin-bottom: 20px;
  }
  
  h3 {
    font-size: 1.5rem;
    margin-bottom: 10px;
    color: #374151;
  }
  
  p {
    margin-bottom: 30px;
  }
}

.posts-list {
  .post-item {
    display: flex;
    padding: 25px;
    border-bottom: 1px solid #f3f4f6;
    transition: background 0.2s;
    
    &:hover {
      background: #f9fafb;
    }
    
    &:last-child {
      border-bottom: none;
    }
  }
}

.post-votes {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-right: 20px;
  min-width: 60px;
  
  .vote-btn {
    width: 32px;
    height: 32px;
    border: none;
    background: #f3f4f6;
    border-radius: 6px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.2s;
    
    &:hover {
      background: #e5e7eb;
    }
    
    &.active {
      background: #3b82f6;
      color: white;
    }
    
    &.upvote.active {
      background: #10b981;
    }
    
    &.downvote.active {
      background: #ef4444;
    }
  }
  
  .vote-count {
    font-weight: 600;
    color: #374151;
    margin: 8px 0;
    font-size: 14px;
  }
}

.post-content {
  flex: 1;
}

.post-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 15px;
}

.post-meta {
  display: flex;
  align-items: center;
  gap: 12px;
}

.author-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
}

.author-info {
  display: flex;
  flex-direction: column;
  
  .author-name {
    font-weight: 600;
    color: #1f2937;
    text-decoration: none;
    font-size: 14px;
    
    &:hover {
      color: #3b82f6;
    }
  }
  
  .post-time {
    color: #9ca3af;
    font-size: 12px;
  }
}

.category-tag {
  padding: 4px 12px;
  border-radius: 16px;
  font-size: 12px;
  font-weight: 500;
  
  &.category-movie {
    background: #fef3c7;
    color: #d97706;
  }
  
  &.category-tv {
    background: #dbeafe;
    color: #2563eb;
  }
  
  &.category-anime {
    background: #f3e8ff;
    color: #7c3aed;
  }
  
  &.category-variety {
    background: #fce7f3;
    color: #be185d;
  }
}

.post-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1f2937;
  text-decoration: none;
  display: block;
  margin-bottom: 10px;
  line-height: 1.4;
  
  &:hover {
    color: #3b82f6;
  }
}

.post-excerpt {
  color: #6b7280;
  line-height: 1.6;
  margin-bottom: 15px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.post-tags {
  margin-bottom: 15px;
  
  .tag {
    display: inline-block;
    padding: 4px 8px;
    background: #f3f4f6;
    color: #6b7280;
    border-radius: 12px;
    font-size: 12px;
    margin-right: 8px;
    margin-bottom: 4px;
  }
}

.post-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.post-stats {
  display: flex;
  gap: 20px;
  
  .stat {
    display: flex;
    align-items: center;
    gap: 5px;
    color: #9ca3af;
    font-size: 14px;
  }
}

.post-actions {
  display: flex;
  gap: 10px;
  
  .action-btn {
    width: 32px;
    height: 32px;
    border: none;
    background: #f3f4f6;
    border-radius: 6px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.2s;
    
    &:hover {
      background: #e5e7eb;
    }
    
    i.active {
      color: #3b82f6;
    }
  }
}

// 分页
.pagination-container {
  margin-top: 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.pagination-info {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: #6b7280;
  font-size: 14px;
}

.pagination-info .divider {
  margin: 0 4px;
}

.page-size-select {
  padding: 6px 8px;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  background: #fff;
  cursor: pointer;
  font-size: 14px;
}

.pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  flex-wrap: wrap;
  padding: 30px;
  background: #f9fafb;
}

.pagination-btn {
  padding: 8px 12px;
  border: 1px solid #e5e7eb;
  background: #fff;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  color: #374151;
  transition: all 0.2s;
  min-width: 36px;
}

.pagination-btn:hover:not(:disabled) {
  background: #f9fafb;
  border-color: var(--primary-color);
  color: var(--primary-color);
}

.pagination-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.pagination-btn.active {
  background: var(--primary-color);
  color: #fff;
  border-color: var(--primary-color);
  font-weight: 600;
}

.page-number {
  min-width: 36px;
  text-align: center;
}

.page-ellipsis {
  padding: 8px 4px;
  color: #9ca3af;
  user-select: none;
}

.page-jump {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-left: 12px;
  padding-left: 12px;
  border-left: 1px solid #e5e7eb;
  font-size: 14px;
  color: #6b7280;
}

.jump-input {
  width: 50px;
  padding: 6px 8px;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  text-align: center;
  font-size: 14px;
}

.jump-btn {
  padding: 6px 12px;
  border: 1px solid #e5e7eb;
  background: #fff;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  color: #374151;
}

.jump-btn:hover {
  background: #f9fafb;
  border-color: var(--primary-color);
  color: var(--primary-color);
}

/* 保留旧的分页样式以确保兼容性 */
.page-btn {
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  background: white;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 14px;
  
  &:hover:not(:disabled) {
    background: #f3f4f6;
    border-color: #9ca3af;
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  
  &.active {
    background: #3b82f6;
    color: white;
    border-color: #3b82f6;
  }
}

.page-numbers {
  display: flex;
  gap: 5px;
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
  background: white;
  border-radius: 12px;
  width: 100%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 25px;
  border-bottom: 1px solid #e5e7eb;
  
  h3 {
    margin: 0;
    font-size: 1.25rem;
    font-weight: 600;
    color: #1f2937;
  }
  
  .close-btn {
    width: 32px;
    height: 32px;
    border: none;
    background: #f3f4f6;
    border-radius: 6px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    
    &:hover {
      background: #e5e7eb;
    }
  }
}

.modal-body {
  padding: 25px;
}

.form-group {
  margin-bottom: 20px;
  
  label {
    display: block;
    font-weight: 500;
    color: #374151;
    margin-bottom: 8px;
  }
}

.form-input,
.form-select,
.form-textarea {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
  
  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
}

.form-textarea {
  resize: vertical;
  min-height: 120px;
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
    background: #3b82f6;
    color: white;
    
    &:hover:not(:disabled) {
      background: #2563eb;
    }
    
    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  }
  
  &.btn-outline {
    background: transparent;
    color: #6b7280;
    border-color: #d1d5db;
    
    &:hover {
      background: #f3f4f6;
      color: #374151;
    }
  }
}

// 响应式设计
@media (max-width: 768px) {
  .forum-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 20px;
  }
  
  .page-title {
    font-size: 2rem;
  }
  
  .forum-filters {
    flex-direction: column;
    gap: 16px;
    padding: 20px;
  }
  
  .filter-group {
    width: 100%;
    min-width: auto;
    
    .filter-select {
      width: 100%;
    }
  }
  
  .search-box {
    width: 100%;
    max-width: 100%;
    flex-direction: row;
    
    .search-icon-wrapper {
      display: flex;
    }
    
    .search-input {
      padding: 12px 16px;
    }
    
    .search-btn {
      padding: 12px 20px;
    }
  }
  
  .post-item {
    flex-direction: column;
    gap: 15px;
  }
  
  .post-votes {
    flex-direction: row;
    justify-content: center;
    margin-right: 0;
    min-width: auto;
  }
  
  .post-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
  
  .post-footer {
    flex-direction: column;
    align-items: flex-start;
    gap: 15px;
  }
  
  .pagination {
    flex-wrap: wrap;
    gap: 5px;
  }
  
  .page-numbers {
    order: -1;
    width: 100%;
    justify-content: center;
    margin-bottom: 10px;
  }
}

@media (max-width: 480px) {
  .container {
    padding: 0 15px;
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
