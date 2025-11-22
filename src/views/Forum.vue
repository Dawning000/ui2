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
          <button class="btn btn-primary" @click="openCreatePost">
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
        
        <div v-else-if="error" class="error">
          <div class="error-icon">❌</div>
          <p class="error-text">{{ error }}</p>
        </div>
        
        <div v-else-if="!posts || posts.length === 0" class="empty-state">
          <i class="icon-empty"></i>
          <h3>暂无帖子</h3>
          <p>还没有人在这里发布帖子，快来成为第一个吧！</p>
          <button class="btn btn-primary" @click="openCreatePost">
            发布第一个帖子
          </button>
        </div>
        
        <div v-else class="posts-list">
          <div 
            v-for="post in sortedPosts" 
            :key="post.id" 
            class="post-item"
            @click="goToPost(post.id)"
            role="button"
            tabindex="0"
            @keyup.enter="goToPost(post.id)"
          >
            
            <div class="post-content">
              <div class="post-header">
                <div class="post-meta">
                  <img :src="post.author.avatar || '/avatar.png'" :alt="post.author.username" class="author-avatar" referrerpolicy="no-referrer" @error="(e: Event) => { const target = e.target as HTMLImageElement; if (target) target.src = '/avatar.png' }" />
                  <div class="author-info">
                    <router-link 
                      :to="`/user/${post.author.id}`" 
                      class="author-name"
                      @click.stop
                    >
                      {{ post.author.nickname }}
                    </router-link>
                    <span class="post-time">{{ formatTime(post.createdAt || post.createTime) }}</span>
                  </div>
                </div>
                <div class="post-category">
                  <span :class="`category-tag category-${post.category}`">{{ post.categoryName || '未分类' }}</span>
                </div>
              </div>
              
              <div class="post-title">
                {{ post.title }}
              </div>
              
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
                  <button class="action-btn" @click.stop="handleShare(post)">
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
    <div v-if="showCreatePost" class="modal-overlay">
      <div class="modal-content">
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
                placeholder="用英文逗号分隔多个标签..."
                class="form-input"
              >
            </div>
            <div class="form-group rich-text-editor">
              <label>内容</label>
              <div class="editor-toolbar">
                <button type="button" class="editor-btn" @mousedown.prevent @click="formatText('bold')" title="加粗">
                  B
                </button>
                <button type="button" class="editor-btn" @mousedown.prevent @click="formatText('italic')" title="斜体">
                  I
                </button>
                <button type="button" class="editor-btn" @mousedown.prevent @click="formatText('underline')" title="下划线">
                  U
                </button>
                <span class="toolbar-divider"></span>
                <button type="button" class="editor-btn" @mousedown.prevent @click="formatText('insertUnorderedList')" title="无序列表">
                  ••
                </button>
                <button type="button" class="editor-btn" @mousedown.prevent @click="formatText('insertOrderedList')" title="有序列表">
                  1.
                </button>
                <button type="button" class="editor-btn" @mousedown.prevent @click="formatText('blockquote')" title="引用">
                  ❝
                </button>
                <span class="toolbar-divider"></span>
                <button type="button" class="editor-btn" @mousedown.prevent @click="insertLink" title="插入链接">
                  🔗
                </button>
                <button type="button" class="editor-btn" @mousedown.prevent @click="triggerImageUpload" title="插入图片">
                  🌄
                </button>
                <button type="button" class="editor-btn" @mousedown.prevent @click="clearFormatting" title="清除格式">
                  ⌫
                </button>
                <div v-if="selectedImage" class="image-resize-controls">
                  <label>宽度: {{ imageWidth }}%</label>
                  <input
                    type="range"
                    min="20"
                    max="100"
                    v-model.number="imageWidth"
                    @input="applyImageWidth"
                  />
                  <button type="button" class="editor-btn" @mousedown.prevent @click="resetImageWidth" title="恢复默认宽度">
                    ↺
                  </button>
                  <button type="button" class="editor-btn" @mousedown.prevent @click="clearImageSelection" title="取消选中图片">
                    ✕
                  </button>
                </div>
              </div>
              <input
                type="file"
                ref="imageInputRef"
                class="sr-only"
                accept="image/*"
                @change="handleImageSelected"
              />
              <div
                class="editor-content"
                contenteditable="true"
                ref="editorRef"
                @input="handleEditorInput"
                @click="handleEditorClick"
                data-placeholder="分享你的想法..."
              ></div>
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
import { ref, computed, onMounted, watch, nextTick } from 'vue'
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
const error = ref('')
const sortBy = ref('latest') // 固定为最新发布
const searchQuery = ref('')
const selectedCategory = ref('')
const currentPage = ref(1)
const postsPerPage = ref(10)
const showCreatePost = ref(false)
const creating = ref(false)
const jumpPage = ref(1)
const editorRef = ref<HTMLDivElement | null>(null)
const imageInputRef = ref<HTMLInputElement | null>(null)
const selectedImage = ref<HTMLImageElement | null>(null)
const imageWidth = ref(100)
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

const stripHtml = (html: string) =>
  html
    .replace(/<style([\s\S]*?)<\/style>/gi, '')
    .replace(/<script([\s\S]*?)<\/script>/gi, '')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .trim()

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
  error.value = ''
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
  } catch (err: any) {
    console.error('加载帖子失败:', err)
    posts.value = []
    pagination.value = {
      total: 0,
      page: 1,
      size: postsPerPage.value,
      has_next: false
    }
    if (err && err.code === 10005) {
       error.value = '请先登录'
     } else {
       error.value = err?.message || '加载失败，请稍后重试'
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

const goToPost = (postId: number) => {
  if (!postId) return
  router.push(`/post/${postId}`)
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

const updateEditorContent = (content = '') => {
  if (editorRef.value) {
    editorRef.value.innerHTML = content
  }
}

const openCreatePost = () => {
  showCreatePost.value = true
  nextTick(() => {
    updateEditorContent(newPost.value.content)
    editorRef.value?.focus()
  })
}

const closeCreatePost = () => {
  showCreatePost.value = false
  newPost.value = {
    title: '',
    category: '',
    tagsInput: '',
    content: ''
  }
  updateEditorContent('')
  clearImageSelection()
}

const handleEditorInput = () => {
  if (editorRef.value) {
    newPost.value.content = editorRef.value.innerHTML
  }
}

const handleEditorClick = (event: MouseEvent) => {
  const target = event.target as HTMLElement
  if (target && target.tagName === 'IMG') {
    if (selectedImage.value && selectedImage.value !== target) {
      selectedImage.value.classList.remove('selected-image')
    }
    selectedImage.value = target as HTMLImageElement
    selectedImage.value.classList.add('selected-image')
    const widthString = selectedImage.value.style.width
    if (widthString.endsWith('%')) {
      imageWidth.value = parseInt(widthString, 10)
    } else {
      const parentWidth = selectedImage.value.parentElement?.clientWidth || selectedImage.value.clientWidth
      imageWidth.value = Math.min(100, Math.max(20, Math.round((selectedImage.value.clientWidth / parentWidth) * 100)))
    }
  } else if (selectedImage.value) {
    selectedImage.value.classList.remove('selected-image')
    selectedImage.value = null
  }
}

const ensureEditorFocus = () => {
  if (!editorRef.value) return
  editorRef.value.focus()
  const selection = window.getSelection()
  if (selection && selection.rangeCount === 0) {
    const range = document.createRange()
    range.selectNodeContents(editorRef.value)
    range.collapse(false)
    selection.removeAllRanges()
    selection.addRange(range)
  }
}

const formatText = (command: string) => {
  ensureEditorFocus()
  if (command === 'blockquote') {
    document.execCommand('formatBlock', false, 'blockquote')
  } else {
    document.execCommand(command, false)
  }
  handleEditorInput()
}

const insertLink = () => {
  ensureEditorFocus()
  const url = prompt('请输入链接地址（包含 https://）')
  if (url) {
    document.execCommand('createLink', false, url)
    handleEditorInput()
  }
}

const triggerImageUpload = () => {
  imageInputRef.value?.click()
}

const handleImageSelected = () => {
  const file = imageInputRef.value?.files?.[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = () => {
    const result = reader.result
    if (!result || typeof result !== 'string') return
    ensureEditorFocus()
    const tempId = `temp-img-${Date.now()}`
    document.execCommand('insertHTML', false, `<img src="${result}" alt="用户上传图片" data-temp-id="${tempId}" />`)
    handleEditorInput()
    nextTick(() => {
      const newImg = editorRef.value?.querySelector(`img[data-temp-id='${tempId}']`) as HTMLImageElement | null
      if (newImg) {
        newImg.removeAttribute('data-temp-id')
        if (selectedImage.value && selectedImage.value !== newImg) {
          selectedImage.value.classList.remove('selected-image')
        }
        selectedImage.value = newImg
        selectedImage.value.classList.add('selected-image')
        imageWidth.value = 100
      }
    })
  }
  reader.readAsDataURL(file)
  if (imageInputRef.value) {
    imageInputRef.value.value = ''
  }
}

const applyImageWidth = () => {
  if (selectedImage.value) {
    selectedImage.value.style.width = `${imageWidth.value}%`
  }
}

const resetImageWidth = () => {
  if (selectedImage.value) {
    selectedImage.value.style.width = ''
    imageWidth.value = 100
  }
}

const clearImageSelection = () => {
  if (selectedImage.value) {
    selectedImage.value.classList.remove('selected-image')
    selectedImage.value = null
  }
  imageWidth.value = 100
}

const clearFormatting = () => {
  ensureEditorFocus()
  document.execCommand('removeFormat', false)
  document.execCommand('unlink', false)
  handleEditorInput()
}

/**
 * 处理创建新帖子
 */
const handleCreatePost = async () => {
  const plainContent = stripHtml(newPost.value.content)
  if (!plainContent) {
    notify.warning('请先填写帖子内容')
    return
  }

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

watch(showCreatePost, (visible) => {
  if (visible) {
    nextTick(() => {
      updateEditorContent(newPost.value.content)
      editorRef.value?.focus()
    })
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
  background: linear-gradient(180deg, 
    var(--bg-secondary) 0%, 
    var(--bg-card) 50%, 
    var(--bg-secondary) 100%
  );
  padding: 40px 0;
  position: relative;
  transition: background 0.3s ease;
  
  &::before {
    content: '';
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: 
      radial-gradient(circle at 20% 20%, rgba(249, 115, 22, 0.05) 0%, transparent 50%),
      radial-gradient(circle at 80% 80%, rgba(251, 191, 36, 0.05) 0%, transparent 50%);
    pointer-events: none;
    z-index: 0;
    transition: background 0.3s ease;
  }
  
  :root.dark &::before {
    background: 
      radial-gradient(circle at 20% 20%, rgba(249, 115, 22, 0.08) 0%, transparent 50%),
      radial-gradient(circle at 80% 80%, rgba(251, 191, 36, 0.06) 0%, transparent 50%);
  }
  
  .container {
    position: relative;
    z-index: 1;
  }
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

// 页面头部
.forum-header {
  position: relative;
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 50px;
  padding: 60px 30px 40px;
  background: linear-gradient(135deg, #fff7ed 0%, #ffedd5 50%, #fed7aa 100%);
  border-radius: 0 0 32px 32px;
  overflow: hidden;
  transition: background 0.3s ease;
  
  :root.dark & {
    background: linear-gradient(135deg, #3a3428 0%, #4a3f2f 50%, #3a3428 100%);
  }
  
  // 添加背景装饰
  &::before {
    content: '';
    position: absolute;
    top: -50%;
    right: -10%;
    width: 500px;
    height: 500px;
    background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
    border-radius: 50%;
    pointer-events: none;
    transition: background 0.3s ease;
  }
  
  :root.dark &::before {
    background: radial-gradient(circle, rgba(255,255,255,0.05) 0%, transparent 70%);
  }
  
  &::after {
    content: '';
    position: absolute;
    bottom: -30%;
    left: -5%;
    width: 400px;
    height: 400px;
    background: radial-gradient(circle, rgba(255,255,255,0.08) 0%, transparent 70%);
    border-radius: 50%;
    pointer-events: none;
    transition: background 0.3s ease;
  }
  
  :root.dark &::after {
    background: radial-gradient(circle, rgba(255,255,255,0.04) 0%, transparent 70%);
  }
}

.header-content {
  position: relative;
  z-index: 2;
  
  .page-title {
    font-size: 3rem;
    font-weight: 800;
    color: var(--primary-dark);
    margin-bottom: 12px;
    display: flex;
    align-items: center;
    gap: 15px;
    
    i {
      color: var(--primary-color);
      animation: pulse 2s ease-in-out infinite;
    }
  }
  
  .page-subtitle {
    color: var(--text-secondary);
    font-size: 1.2rem;
    margin: 0;
    transition: color 0.3s ease;
  }
}

.header-actions {
  position: relative;
  z-index: 2;
  
  .btn {
    display: flex;
    align-items: center;
    gap: 8px;
    background: linear-gradient(135deg, var(--primary-color) 0%, var(--primary-dark) 100%);
    border: none;
    color: white;
    box-shadow: 0 4px 12px rgba(249, 115, 22, 0.3), 0 2px 4px rgba(249, 115, 22, 0.2);
    transition: all 0.3s ease;
    font-weight: 600;
    
    &:hover:not(:disabled) {
      background: linear-gradient(135deg, var(--primary-dark) 0%, var(--primary-color) 100%);
      transform: translateY(-2px);
      box-shadow: 0 6px 16px rgba(249, 115, 22, 0.4), 0 2px 6px rgba(249, 115, 22, 0.3);
    }
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
  background: var(--bg-card);
  backdrop-filter: blur(20px);
  border-radius: 16px;
  box-shadow: 0 8px 32px var(--shadow-color);
  border: 1px solid var(--border-color);
  transition: all 0.3s ease;
  
  &:hover {
    box-shadow: 0 12px 40px var(--shadow-color);
  }
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
    color: var(--text-secondary);
    text-transform: uppercase;
    letter-spacing: 0.5px;
    transition: color 0.3s ease;
    
    i {
      font-size: 14px;
      color: var(--primary-color);
    }
  }
  
  .filter-select {
    padding: 12px 16px;
    border: 2px solid var(--border-color);
    border-radius: 10px;
    background: var(--bg-card);
    font-size: 14px;
    font-weight: 500;
    color: var(--text-primary);
    cursor: pointer;
    transition: all 0.3s ease;
    appearance: none;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%2364748b' d='M6 9L1 4h10z'/%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right 12px center;
    padding-right: 36px;
    
    :root.dark & {
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%239ca3af' d='M6 9L1 4h10z'/%3E%3C/svg%3E");
    }
    
    &:hover {
      background: var(--bg-secondary);
      border-color: var(--primary-color);
      box-shadow: 0 4px 12px var(--shadow-color);
      transform: translateY(-1px);
    }
    
    &:focus {
      outline: none;
      border-color: var(--primary-color);
      box-shadow: 0 0 0 4px rgba(249, 115, 22, 0.1);
    }
    
    option {
      padding: 8px;
      font-weight: 500;
      background: var(--bg-card);
      color: var(--text-primary);
    }
  }
}

.search-box {
  display: flex;
  align-items: center;
  flex: 1;
  max-width: 700px;
  background: var(--bg-secondary);
  backdrop-filter: blur(20px);
  border-radius: 12px;
  border: 1px solid var(--border-color);
  overflow: hidden;
  transition: all 0.3s ease;
  box-shadow: 0 1px 3px var(--shadow-color);
  
  &:focus-within {
    background: var(--bg-card);
    border-color: var(--primary-color);
    box-shadow: 0 8px 32px var(--shadow-color);
    transform: translateY(-2px);
  }
  
  .search-icon-wrapper {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0 16px;
    color: var(--text-light);
    background: var(--bg-secondary);
    border-right: 1px solid var(--border-color);
    transition: all 0.3s ease;
    
    i {
      font-size: 18px;
    }
  }
  
  &:focus-within .search-icon-wrapper {
    color: var(--primary-color);
    background: rgba(249, 115, 22, 0.1);
  }
  
  .search-input {
    flex: 1;
    padding: 14px 16px;
    border: none;
    background: transparent;
    font-size: 15px;
    color: var(--text-primary);
    transition: color 0.3s ease;
    
    &::placeholder {
      color: var(--text-light);
    }
    
    &:focus {
      outline: none;
    }
  }
  
  .search-btn {
    padding: 14px 24px;
    background: linear-gradient(135deg, var(--primary-color) 0%, var(--primary-dark) 100%);
    border: none;
    color: white;
    font-weight: 600;
    font-size: 14px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.3s ease;
    white-space: nowrap;
    position: relative;
    overflow: hidden;
    
    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
      transition: left 0.5s;
    }
    
    &:hover {
      background: linear-gradient(135deg, var(--primary-dark) 0%, var(--primary-color) 100%);
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(249, 115, 22, 0.4);
      
      &::before {
        left: 100%;
      }
    }
    
    &:active {
      transform: translateY(0);
    }
    
    span {
      display: flex;
      align-items: center;
      gap: 6px;
      position: relative;
      z-index: 1;
    }
  }
}

// 帖子列表
.posts-container {
  background: var(--bg-card);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  box-shadow: 0 8px 32px var(--shadow-color);
  overflow: hidden;
  border: 1px solid var(--border-color);
  transition: all 0.3s ease;
}

.loading {
  padding: 60px;
  text-align: center;
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
    transition: border-color 0.3s ease;
  }
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.empty-state {
  padding: 80px 40px;
  text-align: center;
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
    margin-bottom: 30px;
  }
}

.posts-list {
  padding: 20px;
  
  .post-item {
    display: flex;
    padding: 28px;
    margin-bottom: 20px;
    background: linear-gradient(135deg, var(--bg-card) 0%, var(--bg-secondary) 100%);
    border-radius: 20px;
    border: 1px solid var(--border-color);
    box-shadow: 0 4px 6px var(--shadow-color);
    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    position: relative;
    overflow: hidden;
    animation: fadeInUp 0.6s ease-out backwards;
    cursor: pointer;
    
    // 添加左侧装饰条
    &::before {
      content: '';
      position: absolute;
      left: 0;
      top: 0;
      bottom: 0;
      width: 4px;
      background: linear-gradient(180deg, var(--primary-color) 0%, var(--primary-dark) 100%);
      opacity: 0;
      transition: opacity 0.3s;
    }
    
    &:hover {
      transform: translateY(-4px) scale(1.01);
      box-shadow: 0 20px 40px var(--shadow-color);
      border-color: var(--primary-color);
      background: linear-gradient(135deg, var(--bg-card) 0%, var(--bg-primary) 100%);
      
      &::before {
        opacity: 1;
      }
    }
    
    @for $i from 1 through 10 {
      &:nth-child(#{$i}) {
        animation-delay: #{$i * 0.1}s;
      }
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
    background: var(--bg-secondary);
    border-radius: 6px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.2s;
    
    &:hover {
      background: var(--border-color);
    }
    
    &.active {
      background: var(--primary-color);
      color: white;
    }
    
    &.upvote.active {
      background: var(--success-color);
    }
    
    &.downvote.active {
      background: var(--error-color);
    }
  }
  
  .vote-count {
    font-weight: 600;
    color: var(--text-primary);
    margin: 8px 0;
    font-size: 14px;
    transition: color 0.3s ease;
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
  border: 3px solid var(--bg-card);
  box-shadow: 0 4px 12px var(--shadow-color);
  transition: all 0.3s ease;
  
  .post-item:hover & {
    transform: scale(1.1);
    box-shadow: 0 6px 20px rgba(249, 115, 22, 0.3);
  }
}

.author-info {
  display: flex;
  flex-direction: column;
  
  .author-name {
    font-weight: 600;
    color: var(--text-primary);
    text-decoration: none;
    font-size: 14px;
    transition: color 0.3s ease;
    
    &:hover {
      color: var(--primary-color);
    }
  }
  
  .post-time {
    color: var(--text-light);
    font-size: 12px;
    transition: color 0.3s ease;
  }
}

.category-tag {
  padding: 6px 14px;
  border-radius: 16px;
  font-size: 12px;
  font-weight: 600;
  position: relative;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
    transition: left 0.5s;
  }
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    
    &::before {
      left: 100%;
    }
  }
  
  &.category-movie {
    background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
    color: #d97706;
  }
  
  &.category-tv {
    background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
    color: #2563eb;
  }
  
  &.category-anime {
    background: linear-gradient(135deg, #f3e8ff 0%, #e9d5ff 100%);
    color: #7c3aed;
  }
  
  &.category-variety {
    background: linear-gradient(135deg, #fce7f3 0%, #fbcfe8 100%);
    color: #be185d;
  }
}

.post-title {
  font-size: 1.35rem;
  font-weight: 700;
  color: var(--text-primary);
  text-decoration: none;
  display: block;
  margin-bottom: 10px;
  line-height: 1.4;
  transition: all 0.3s ease;
  
  &:hover {
    background: linear-gradient(135deg, var(--primary-color) 0%, var(--primary-dark) 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    transform: translateX(4px);
  }
}

.post-excerpt {
  color: var(--text-secondary);
  line-height: 1.6;
  margin-bottom: 15px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  transition: color 0.3s ease;
}

.post-tags {
  margin-bottom: 15px;
  
  .tag {
    display: inline-block;
    padding: 4px 8px;
    background: var(--bg-secondary);
    color: var(--text-secondary);
    border-radius: 12px;
    font-size: 12px;
    margin-right: 8px;
    margin-bottom: 4px;
    transition: all 0.3s ease;
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
    color: var(--text-light);
    font-size: 14px;
    padding: 6px 12px;
    border-radius: 12px;
    background: rgba(249, 115, 22, 0.05);
    transition: all 0.3s ease;
    
    i {
      color: var(--primary-color);
      transition: transform 0.3s ease;
    }
    
    &:hover {
      background: rgba(249, 115, 22, 0.1);
      transform: translateY(-2px);
      color: var(--primary-color);
      
      i {
        transform: scale(1.2);
      }
    }
  }
}

.post-actions {
  display: flex;
  gap: 10px;
  
  .action-btn {
    width: 32px;
    height: 32px;
    border: none;
    background: var(--bg-secondary);
    border-radius: 6px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.2s;
    
    &:hover {
      background: var(--border-color);
    }
    
    i.active {
      color: var(--primary-color);
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
  color: var(--text-secondary);
  font-size: 14px;
  transition: color 0.3s ease;
}

.pagination-info .divider {
  margin: 0 4px;
}

.page-size-select {
  padding: 6px 8px;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  background: var(--bg-card);
  cursor: pointer;
  font-size: 14px;
  color: var(--text-primary);
  transition: all 0.3s ease;
}

.pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  flex-wrap: wrap;
  padding: 30px;
  background: linear-gradient(135deg, var(--bg-secondary) 0%, var(--bg-card) 100%);
  border-radius: 16px;
  box-shadow: 0 4px 12px var(--shadow-color);
  transition: all 0.3s ease;
}

.pagination-btn {
  padding: 8px 12px;
  border: 1px solid var(--border-color);
  background: var(--bg-card);
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  color: var(--text-primary);
  transition: all 0.3s ease;
  min-width: 36px;
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: 0;
    height: 0;
    border-radius: 50%;
    background: rgba(249, 115, 22, 0.2);
    transform: translate(-50%, -50%);
    transition: width 0.3s, height 0.3s;
  }
  
  &:hover:not(:disabled) {
    background: rgba(249, 115, 22, 0.05);
    border-color: var(--primary-color);
    color: var(--primary-color);
    transform: translateY(-2px);
    box-shadow: 0 4px 12px var(--shadow-color);
    
    &::before {
      width: 100px;
      height: 100px;
    }
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  
  &.active {
    background: linear-gradient(135deg, var(--primary-color) 0%, var(--primary-dark) 100%);
    color: #fff;
    border-color: transparent;
    font-weight: 600;
    box-shadow: 0 4px 12px rgba(249, 115, 22, 0.4);
    
    &::before {
      display: none;
    }
  }
}

.page-number {
  min-width: 36px;
  text-align: center;
}

.page-ellipsis {
  padding: 8px 4px;
  color: var(--text-light);
  user-select: none;
  transition: color 0.3s ease;
}

.page-jump {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-left: 12px;
  padding-left: 12px;
  border-left: 1px solid var(--border-color);
  font-size: 14px;
  color: var(--text-secondary);
  transition: all 0.3s ease;
}

.jump-input {
  width: 50px;
  padding: 6px 8px;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  text-align: center;
  font-size: 14px;
  background: var(--bg-card);
  color: var(--text-primary);
  transition: all 0.3s ease;
}

.jump-btn {
  padding: 6px 12px;
  border: 1px solid var(--border-color);
  background: var(--bg-card);
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  color: var(--text-primary);
  transition: all 0.3s ease;
}

.jump-btn:hover {
  background: var(--bg-secondary);
  border-color: var(--primary-color);
  color: var(--primary-color);
}

/* 保留旧的分页样式以确保兼容性 */
.page-btn {
  padding: 8px 12px;
  border: 1px solid var(--border-color);
  background: var(--bg-card);
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 14px;
  color: var(--text-primary);
  
  &:hover:not(:disabled) {
    background: var(--bg-secondary);
    border-color: var(--text-light);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  
  &.active {
    background: var(--primary-color);
    color: white;
    border-color: var(--primary-color);
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
  background: var(--bg-card);
  border-radius: 12px;
  width: 100%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  transition: background 0.3s ease;
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
    transition: all 0.3s ease;
    
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
    display: block;
    font-weight: 500;
    color: var(--text-primary);
    margin-bottom: 8px;
    transition: color 0.3s ease;
  }
}

.form-input,
.form-select,
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
  min-height: 120px;
}

.rich-text-editor {
  display: flex;
  flex-direction: column;
  gap: 10px;

  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    border: 0;
  }

  .editor-toolbar {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    padding: 8px 10px;
    border: 1px solid var(--border-color);
    border-radius: 6px;
    background: var(--bg-secondary);
    align-items: center;
    position: relative;
    transition: all 0.3s ease;
  }

  .editor-btn {
    min-width: 32px;
    height: 32px;
    border: 1px solid transparent;
    border-radius: 6px;
    background: var(--bg-card);
    cursor: pointer;
    font-size: 14px;
    font-weight: 600;
    color: var(--text-primary);
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s;

    &:hover {
      color: var(--primary-color);
      border-color: var(--primary-color);
      background: rgba(249, 115, 22, 0.1);
    }
  }

  .toolbar-divider {
    width: 1px;
    background: var(--border-color);
    margin: 0 4px;
    transition: background 0.3s ease;
  }

  .image-resize-controls {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;
    padding: 6px 10px;
    border: 1px dashed #cbd5f5;
    border-radius: 8px;
    background: #eef2ff;
    margin-left: auto;

    label {
      font-size: 13px;
      color: #4338ca;
      font-weight: 600;
    }

    input[type='range'] {
      width: 140px;
    }
  }

  .editor-content {
    min-height: 220px;
    border: 1px solid var(--border-color);
    border-radius: 6px;
    padding: 12px;
    font-size: 14px;
    line-height: 1.6;
    background: var(--bg-card);
    color: var(--text-primary);
    overflow-y: auto;
    transition: all 0.3s ease;

    &:focus {
      outline: none;
      border-color: var(--primary-color);
      box-shadow: 0 0 0 3px rgba(249, 115, 22, 0.1);
    }

    &:empty:before {
      content: attr(data-placeholder);
      color: var(--text-light);
    }

    ul {
      padding-left: 20px;
      list-style: disc;
      margin-bottom: 10px;
    }

    ol {
      padding-left: 20px;
      list-style: decimal;
      margin-bottom: 10px;
    }

    blockquote {
      border-left: 3px solid var(--primary-color);
      padding-left: 12px;
      color: var(--text-secondary);
      margin: 10px 0;
      background: var(--bg-secondary);
      transition: all 0.3s ease;
    }

    img {
      max-width: 100%;
      height: auto;
      border-radius: 8px;
      margin: 10px 0;
      display: block;
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
      transition: transform 0.2s, box-shadow 0.2s;

      &.selected-image {
        outline: 2px solid #6366f1;
        box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.2);
      }
    }
  }
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
    background: linear-gradient(135deg, var(--primary-color) 0%, var(--primary-dark) 100%);
    color: white;
    box-shadow: 0 4px 12px rgba(249, 115, 22, 0.3);
    
    &:hover:not(:disabled) {
      background: linear-gradient(135deg, var(--primary-dark) 0%, var(--primary-color) 100%);
      box-shadow: 0 6px 16px rgba(249, 115, 22, 0.4);
      transform: translateY(-2px);
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
    }
  }
}

// 响应式设计
@media (max-width: 768px) {
  .forum-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 20px;
    padding: 40px 20px 30px;
    
    &::before,
    &::after {
      display: none;
    }
  }
  
  .header-content .page-title {
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
  
  .posts-list .post-item {
    padding: 20px;
    margin-bottom: 16px;
    
    &:hover {
      transform: translateY(-2px) scale(1);
    }
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
    padding: 20px;
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
  
  .forum-header {
    padding: 40px 20px 30px;
    
    .page-title {
      font-size: 2rem;
    }
    
    .page-subtitle {
      font-size: 1rem;
    }
  }
}

// 动画效果
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
}
</style>
