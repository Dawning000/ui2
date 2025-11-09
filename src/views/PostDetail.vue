<template>
  <div class="post-detail">
    <div class="container">
      <div v-if="loading" class="loading">
        <div class="loading-spinner"></div>
        <p>加载中...</p>
      </div>
      
      <div v-else-if="post" class="post-content">
        <!-- 帖子头部 -->
        <div class="post-header">
          <div class="post-meta">
            <img :src="post.author.avatar || '/avatar.png'" :alt="post.author.username" class="author-avatar" @error="e => e.target.src = '/avatar.png'" />
            <div class="author-info">
              <router-link :to="`/user/${post.author.id}`" class="author-name">
                {{ post.author.username }}
              </router-link>
              <span class="post-time">{{ formatTime(post.createdAt) }}</span>
            </div>
          </div>
          <div class="post-actions">
            <!-- 编辑按钮 - 对所有人开放 -->
            <button class="action-btn" @click="handleEditPost" 
           v-if="isCurrentUserAuthor"
            >
              <i class="icon-edit"></i>
              编辑
            </button>
            <!-- 删除按钮 - 对所有人开放 -->
            <button class="action-btn" @click="handleDeletePost" 
           v-if="isCurrentUserAuthor"
            >
              <i class="icon-trash"></i>
              删除
            </button>
            <button class="action-btn" @click="handleBookmark">
              <i class="icon-bookmark" :class="{ active: post.isBookmarked }"></i>
              收藏
            </button>
            <button class="action-btn" @click="handleShare">
              <i class="icon-share"></i>
              分享
            </button>
          </div>
        </div>

        <!-- 帖子内容 -->
        <div class="post-body">
          <h1 class="post-title">{{ post.title }}</h1>
          <div class="post-tags" v-if="post.tags && post.tags.length > 0">
            <span v-for="tag in post.tags" :key="tag" class="tag">{{ tag }}</span>
          </div>
          <div class="post-text" v-html="formatContent(post.content)"></div>
        </div>

        <!-- 帖子统计 -->
        <div class="post-stats">
          <div class="stat-item">
            <i class="icon-eye"></i>
            <span>{{ post.views }} 次浏览</span>
          </div>
          <div class="stat-item">
            <i class="icon-comment"></i>
            <span>{{ commentsCount }} 条评论</span>
          </div>
          <div class="stat-item">
            <i class="icon-like"></i>
            <span>{{ post.likes }} 个赞</span>
          </div>
        </div>

        <!-- 投票区域 -->
        <div class="post-voting">
          <button class="vote-btn upvote" :class="{ active: post.isLiked }" @click="handleVote('up')">
            <i class="icon-arrow-up"></i>
            {{ post.isLiked ? '取消点赞' : '赞同' }}
          </button>
        </div>
      </div>

      <!-- 编辑帖子模态框 -->
      <div v-if="showEditForm" class="modal-overlay" @click="closeEditForm">
        <div class="modal-content" @click.stop>
          <div class="modal-header">
            <h3>编辑帖子</h3>
            <button class="close-btn" @click="closeEditForm">
              <i class="icon-close"></i>
            </button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="handleSubmitEdit">
              <div class="form-group">
                <label>标题</label>
                <input 
                  type="text" 
                  v-model="editPostData.title"
                  placeholder="请输入帖子标题..."
                  required
                  class="form-input"
                >
              </div>
              <div class="form-group">
                <label>分类</label>
                <select v-model="editPostData.category" required class="form-select">
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
                  v-model="editPostData.tagsInput"
                  placeholder="用逗号分隔多个标签..."
                  class="form-input"
                >
              </div>
              <div class="form-group">
                <label>内容</label>
                <textarea 
                  v-model="editPostData.content"
                  placeholder="分享你的想法..."
                  rows="8"
                  required
                  class="form-textarea"
                ></textarea>
              </div>
              <div class="form-actions">
                <button type="button" class="btn btn-outline" @click="closeEditForm">
                  取消
                </button>
                <button type="submit" class="btn btn-primary" :disabled="editing">
                  {{ editing ? '保存中...' : '保存修改' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <!-- 评论区 -->
      <div class="comments-section">
        <div class="comments-header">
          <h3>评论 ({{ commentsCount }})</h3>
          <button class="btn btn-primary" @click="showCommentForm = !showCommentForm">
            <i class="icon-plus"></i>
            发表评论
          </button>
        </div>

        <!-- 评论表单 -->
        <div v-if="showCommentForm" class="comment-form">
          <div class="form-group">
            <textarea 
              v-model="newComment"
              placeholder="写下你的想法..."
              rows="4"
              class="comment-textarea"
            ></textarea>
          </div>
          <div class="form-actions">
            <button class="btn btn-outline" @click="showCommentForm = false">
              取消
            </button>
            <button class="btn btn-primary" @click="handleSubmitComment" :disabled="submitting">
              {{ submitting ? '提交中...' : '发表评论' }}
            </button>
          </div>
        </div>

        <!-- 评论列表 -->
        <div class="comments-list">
          <div v-for="comment in comments" :key="comment.id" class="comment-item">
            <div class="comment-header">
              <img :src="comment.author.avatar || '/avatar.png'" :alt="comment.author.username" class="comment-avatar" @error="e => e.target.src = '/avatar.png'" />
              <div class="comment-meta">
                <span class="comment-author">{{ comment.author.username }}</span>
                <span class="comment-time">{{ formatTime(comment.createdAt) }}</span>
              </div>
              <div class="comment-actions">
                <button class="action-btn" @click="handleReply(comment)">
                  <i class="icon-reply"></i>
                  回复
                </button>
                <button class="action-btn" @click="handleEditComment(comment)">
                  <i class="icon-edit"></i>
                  编辑
                </button>
                <button class="action-btn delete-btn" @click="handleDeleteComment(comment)">
                  <i class="icon-delete"></i>
                  删除
                </button>
              </div>
            </div>
            <div class="comment-content" v-html="formatContent(comment.content)"></div>
            <!-- 已移除评论投票功能 -->
            
            <!-- 评论编辑表单 -->
            <div 
              v-if="showCommentEditForm && editingComment && editingComment.id === comment.id" 
              :id="`comment-edit-form-${comment.id}`"
              class="comment-edit-form"
            >
              <div class="form-group">
                <textarea 
                  v-model="editContent"
                  placeholder="编辑你的评论..."
                  rows="4"
                  class="comment-textarea"
                ></textarea>
              </div>
              <div class="form-actions">
                <button class="btn btn-outline" @click="cancelEditComment">
                  取消
                </button>
                <button class="btn btn-primary" @click="submitEditComment" :disabled="submitting">
                  {{ submitting ? '保存中...' : '保存修改' }}
                </button>
              </div>
            </div>
            
            <!-- 回复表单 -->
            <div 
              v-if="showReplyForm && replyingTo && replyingTo.id === comment.id" 
              :id="`reply-form-${comment.id}`"
              class="reply-form"
            >
              <div class="form-group">
                <textarea 
                  v-model="replyContent"
                  placeholder="写下你的回复..."
                  rows="3"
                  class="comment-textarea"
                ></textarea>
              </div>
              <div class="form-actions">
                <button class="btn btn-outline" @click="showReplyForm = false; replyingTo = null">
                  取消
                </button>
                <button class="btn btn-primary" @click="handleSubmitReply" :disabled="submitting">
                  {{ submitting ? '提交中...' : '回复' }}
                </button>
              </div>
            </div>
            
            <!-- 显示回复列表 -->
            <div v-if="comment.replies && comment.replies.length > 0" class="replies-list">
              <div v-for="reply in comment.replies" :key="reply.id" class="reply-item">
                <div class="comment-header">
                  <img :src="reply.author.avatar || '/avatar.png'" :alt="reply.author.username" class="comment-avatar" @error="e => e.target.src = '/avatar.png'" />
                  <div class="comment-meta">
                    <span class="comment-author">{{ reply.author.username }}</span>
                    <span class="comment-time">{{ formatTime(reply.createdAt) }}</span>
                  </div>
                  <div class="comment-actions">
                    <button class="action-btn" @click="handleEditComment(reply)">
                      <i class="icon-edit"></i>
                      编辑
                    </button>
                    <button class="action-btn delete-btn" @click="handleDeleteComment(reply)">
                      <i class="icon-delete"></i>
                      删除
                    </button>
                  </div>
                </div>
                <div class="comment-content" v-html="formatContent(reply.content)"></div>
                <!-- 已移除回复投票功能 -->
                
                <!-- 回复编辑表单 -->
                <div 
                  v-if="showCommentEditForm && editingComment && editingComment.id === reply.id" 
                  :id="`comment-edit-form-${reply.id}`"
                  class="comment-edit-form"
                >
                  <div class="form-group">
                    <textarea 
                      v-model="editContent"
                      placeholder="编辑你的回复..."
                      rows="3"
                      class="comment-textarea"
                    ></textarea>
                  </div>
                  <div class="form-actions">
                    <button class="btn btn-outline" @click="cancelEditComment">
                      取消
                    </button>
                    <button class="btn btn-primary" @click="submitEditComment" :disabled="submitting">
                      {{ submitting ? '保存中...' : '保存修改' }}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { postApi, Post, Comment } from '../api/posts'
import { confirmService } from '../utils/confirm'
import { notificationService } from '../utils/notification'

const route = useRoute()

// 响应式数据
  const loading = ref(true)
  const post = ref(null as Post | null)
  const comments = ref<Comment[]>([])
  const commentsCount = ref(0) // 用于显示评论数
  const userVote = ref(null)
  const showCommentForm = ref(false)
  const showReplyForm = ref(false)
  const showEditForm = ref(false)
  const newComment = ref('')
  const replyContent = ref('')
  const submitting = ref(false)
  const editing = ref(false)
  const replyingTo = ref(null as Comment | null)
  const editingComment = ref<Comment | null>(null)
  const editContent = ref('')
  const showCommentEditForm = ref(false)
  const deletingCommentId = ref<number | null>(null) // 当前正在删除的评论ID

/**
 * 处理编辑评论按钮点击
 * @param comment 要编辑的评论对象
 */
const handleEditComment = (comment: Comment) => {
  editingComment.value = comment
  editContent.value = comment.content
  showCommentEditForm.value = true
  
  // 滚动到评论编辑表单
  setTimeout(() => {
    const editForm = document.getElementById(`comment-edit-form-${comment.id}`)
    if (editForm) {
      editForm.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }, 100)
}

/**
 * 处理删除评论
 * @param comment 要删除的评论对象
 */
const handleDeleteComment = async (comment: Comment) => {
  console.log('开始处理删除评论，评论ID:', comment.id)
  
  // 使用美观的确认对话框
  const confirmed = await confirmService.danger('确定要删除这条评论吗？删除后将无法恢复。', {
    title: '删除确认'
  })

  console.log('确认对话框结果:', confirmed)
  
  if (!confirmed) {
    console.log('用户取消删除操作')
    return
  }
  
  deletingCommentId.value = comment.id
  console.log('设置删除中的评论ID:', comment.id)
  
  try {
    console.log('准备调用API删除评论，评论ID:', comment.id)
    // 调用API删除评论
    const response = await postApi.deleteComment(comment.id)
    
    console.log('API删除评论响应:', response)
    
    // 检查响应是否成功
    if (response.code === 200) {
      notificationService.success('评论已成功删除')
      
      // 尝试从顶级评论列表中移除
      let found = false
      const commentIndex = comments.value.findIndex(c => c.id === comment.id)
      if (commentIndex !== -1) {
        console.log('从顶级评论列表中移除评论，索引位置:', commentIndex)
        comments.value.splice(commentIndex, 1)
        found = true
      } else {
        // 如果不是顶级评论，尝试从某个评论的replies中查找并移除
        for (let i = 0; i < comments.value.length; i++) {
          const parentComment = comments.value[i]
          if (parentComment.replies && parentComment.replies.length > 0) {
            const replyIndex = parentComment.replies.findIndex(r => r.id === comment.id)
            if (replyIndex !== -1) {
              console.log('从评论的replies中移除回复，父评论ID:', parentComment.id, '回复索引:', replyIndex)
              parentComment.replies.splice(replyIndex, 1)
              found = true
              break
            }
          }
        }
      }
      
      // 更新评论计数
      if (found) {
        commentsCount.value = Math.max(0, commentsCount.value - 1)
        console.log('更新后的评论计数:', commentsCount.value)
      }
    } else {
      const errorMessage = response.message || '删除评论失败'
      console.error('删除评论API返回失败:', errorMessage)
      notificationService.error(errorMessage)
    }
  } catch (error: any) {
    console.error('删除评论异常:', error)
    // 特别处理未授权错误
    if (error.message === 'UNAUTHORIZED' || error.message.includes('401')) {
      notificationService.error('请先登录再删除评论')
    } else {
      notificationService.error(error.message || '删除评论失败，请稍后重试')
    }
  } finally {
    deletingCommentId.value = null
    console.log('重置删除中的评论ID')
  }
}

// 编辑帖子表单数据
const editPostData = ref({
  id: 0,
  title: '',
  content: '',
  category: '',
  tagsInput: ''
})

// 按照要求，对所有人开放编辑权限
const isCurrentUserAuthor = computed(() => {
  // 总是返回true，确保编辑按钮对所有用户可见
  return post.value !== null
})

// 方法
const formatTime = (date) => {
  const now = new Date()
  const diff = now - new Date(date)
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const minutes = Math.floor(diff / (1000 * 60))
  
  if (days > 0) return `${days}天前`
  if (hours > 0) return `${hours}小时前`
  if (minutes > 0) return `${minutes}分钟前`
  return '刚刚'
}

const formatContent = (content: string) => {
  // 简单的格式化，实际项目中可以使用markdown解析器
  return content.replace(/\n/g, '<br>')
}

// 获取评论列表的函数
const loadComments = async (postId) => {
  try {
    const response = await postApi.getComments(postId);
    console.log('评论API响应:', response);
    
    if (response.code === 200) {
      // 评论数据实际在response.data.comments中
      const commentsData = response.data && response.data.comments ? response.data.comments : [];
      comments.value = Array.isArray(commentsData) ? commentsData : [];
      // 更新评论数
      commentsCount.value = comments.value.length;
      console.log('加载后的评论列表:', comments.value);
      console.log('评论数:', commentsCount.value);
    } else {
      throw new Error(response.message || '获取评论失败');
    }
  } catch (error) {
    console.error('加载评论失败:', error);
    comments.value = [];
    commentsCount.value = 0;
  }
}

/**
 * 取消编辑评论
 */
const cancelEditComment = () => {
  showCommentEditForm.value = false
  editingComment.value = null
  editContent.value = ''
}

/**
 * 提交编辑后的评论
 */
const submitEditComment = async () => {
  if (!editingComment.value || !editContent.value.trim()) return
  
  console.log('开始处理评论编辑')
  submitting.value = true
  console.log('submitting状态设置为:', submitting.value)
  
  try {
    console.log('准备发送评论编辑请求:', { id: editingComment.value.id, content: editContent.value.trim() })
    
    // 调用API更新评论
    const response = await postApi.updateComment({
      id: editingComment.value.id,
      content: editContent.value.trim()
    })
    
    console.log('评论编辑API响应:', response)
    
    // 检查响应是否成功
    if (response.code === 200) {
      console.log('评论编辑成功，更新UI')
      
      // 更新评论内容
      let updated = false
      
      // 先在顶级评论中查找
      const commentIndex = comments.value.findIndex(c => c.id === editingComment.value?.id)
      if (commentIndex !== -1) {
        comments.value[commentIndex].content = editContent.value.trim()
        updated = true
      } else {
        // 如果不是顶级评论，在各评论的replies中查找
        for (let i = 0; i < comments.value.length; i++) {
          const parentComment = comments.value[i]
          if (parentComment.replies && parentComment.replies.length > 0) {
            const replyIndex = parentComment.replies.findIndex(r => r.id === editingComment.value?.id)
            if (replyIndex !== -1) {
              parentComment.replies[replyIndex].content = editContent.value.trim()
              updated = true
              break
            }
          }
        }
      }
      
      if (updated) {
        notificationService.success('评论已成功更新')
      }
      
      cancelEditComment() // 编辑成功后重置状态
    } else {
      const errorMessage = response.message || '编辑评论失败'
      console.error('评论编辑API返回非成功状态:', response.code, errorMessage)
      notificationService.error(errorMessage)
    }
  } catch (error: any) {
    console.error('编辑评论异常:', error)
    // 特别处理未授权错误
    if (error.message === 'UNAUTHORIZED' || error.message.includes('401')) {
      notificationService.error('请先登录再编辑评论')
    } else {
      notificationService.error(error.message || '编辑评论失败，请稍后重试')
    }
  } finally {
    // 无论成功失败，都确保重置submitting状态
    console.log('进入finally块，准备重置submitting状态')
    setTimeout(() => {
      submitting.value = false
      console.log('submitting状态已重置为:', submitting.value)
    }, 100)
  }
}

const loadPost = async () => {
  loading.value = true
  try {
    const postId = parseInt(route.params.id.toString())
    if (isNaN(postId)) {
      throw new Error('无效的帖子ID')
    }
    
    // 调用API获取帖子详情
    const response = await postApi.getPostDetail(postId)
    
    if (response.code === 200) {
      // 确保post对象包含createdAt字段
      const postData = {
        ...response.data,
        createdAt: response.data.createTime
      }
      post.value = postData
      // 不再需要userVote变量，直接使用post.value.isLiked
      
      // 获取评论列表
      await loadComments(postId)
    } else {
      throw new Error((response as any).message || '获取帖子详情失败')
    }
  } catch (error) {
    console.error('加载帖子失败:', error)
    notificationService.error('加载帖子失败，请稍后重试')
  } finally {
    loading.value = false
  }
}

/**
 * 处理帖子投票
 * 只处理点赞操作
 */
const handleVote = async (type: 'up' | 'down') => {
  if (!post.value || submitting.value || type !== 'up') return
  
  submitting.value = true
  try {
    // 点赞操作
      // 如果当前已经点赞，则取消点赞
      // 使用any类型断言避免类型错误
      const postValue = post.value as any;
      if (postValue.isLiked) {
        await postApi.unlikePost(postValue.id)
        postValue.isLiked = false
        postValue.votes = (postValue.votes || 0) - 1;
        postValue.likes = (postValue.likes || 0) - 1;
      } else {
        // 如果当前未点赞，则进行点赞
        await postApi.likePost(post.value.id)
        // 使用any类型断言避免类型错误
        const postValue = post.value as any;
        postValue.isLiked = true;
        postValue.votes = (postValue.votes || 0) + 1;
        postValue.likes = (postValue.likes || 0) + 1;
      }
  } catch (error) {
    console.error('投票失败:', error)
    notificationService.error('投票失败，请稍后重试')
  } finally {
    submitting.value = false
  }
}

const handleBookmark = () => {
  // 使用any类型断言避免类型错误
  const postValue = post.value as any;
  postValue.isBookmarked = !postValue.isBookmarked
}

/**
 * 处理编辑帖子
 * 在当前页面打开编辑模态框
 */
const handleEditPost = () => {
  if (post.value) {
    // 填充编辑表单数据
    editPostData.value = {
      id: post.value.id,
      title: post.value.title,
      content: post.value.content,
      category: post.value.category,
      // 将标签数组转换为逗号分隔的字符串
      tagsInput: post.value.tags ? post.value.tags.join(', ') : ''
    }
    
    // 打开编辑模态框
    showEditForm.value = true
  }
}

/**
 * 处理编辑帖子提交
 * 调用updatePost API更新帖子
 */
const handleSubmitEdit = async () => {
  if (!editPostData.value.title.trim() || !editPostData.value.content.trim()) {
    notificationService.warning('请填写标题和内容')
    return
  }
  
  editing.value = true
  try {
    // 解析标签
    const tags = editPostData.value.tagsInput.split(',')
      .map(tag => tag.trim())
      .filter(tag => tag)
    
    // 准备请求数据
    const postData = {
      title: editPostData.value.title,
      content: editPostData.value.content,
      category: editPostData.value.category,
      tags
    }
    
    // 调用API更新帖子
    const response = await postApi.updatePost(editPostData.value.id, postData)
    
    if (response.code === 200) {
      // 更新本地帖子数据
      const updatedPost = {
        ...post.value,
        ...response.data,
        createdAt: response.data.createTime,
        tags: tags
      }
      // 安全地更新post值，确保author属性存在
      post.value = {
        ...updatedPost,
        author: updatedPost.author || {
          id: 0,
          username: '',
          avatar: ''
        }
      } as any
      
      // 关闭编辑模态框
      closeEditForm()
      
      // 提示用户更新成功
      notificationService.success('帖子更新成功')
    } else {
      throw new Error(response.message || '更新帖子失败')
    }
  } catch (error) {
    console.error('更新帖子失败:', error)
    notificationService.error('更新帖子失败，请稍后重试')
  } finally {
    editing.value = false
  }
}

/**
 * 关闭编辑表单
 */
const closeEditForm = () => {
  showEditForm.value = false
  // 重置表单数据
  editPostData.value = {
    id: 0,
    title: '',
    content: '',
    category: '',
    tagsInput: ''
  }
}

/**
 * 处理删除帖子
 * 调用deletePost API删除帖子
 */
const handleDeletePost = async () => {
  if (!confirm('确定要删除这篇帖子吗？此操作不可恢复。')) {
    return
  }
  
  try {
    const postId = parseInt(route.params.id.toString())
    
    // 调用API删除帖子
    const response = await postApi.deletePost(postId)
    
    if (response.code === 200) {
      // 提示用户删除成功
      notificationService.success('帖子删除成功')
      // 重定向到论坛页面
      window.location.href = '/forum'
    } else {
      throw new Error(response.message || '删除帖子失败')
    }
  } catch (error) {
    console.error('删除帖子失败:', error)
    notificationService.error('删除帖子失败，请稍后重试')
  }
}

const handleShare = () => {
  if (navigator.share) {
    navigator.share({
      title: post.value?.title || '',
      text: post.value?.content?.substring(0, 100) || '',
      url: window.location.href
    })
  } else {
      navigator.clipboard.writeText(window.location.href)
      notificationService.success('链接已复制到剪贴板')
    }
}

const handleSubmitComment = async () => {
  if (!newComment.value.trim()) return
  
  console.log('开始处理评论提交')
  
  // 立即设置提交状态为true
  submitting.value = true
  console.log('submitting状态设置为:', submitting.value)
  
  const postId = parseInt(route.params.id.toString())
  
  try {
    console.log('准备发送评论请求:', { content: newComment.value.trim(), postId })
    
    // 调用API创建评论（给帖子评论，不需要parentId）
    const response = await postApi.createComment({
      content: newComment.value.trim(),
      postId
    })
    
    console.log('评论API响应:', response)
    
    // 检查响应是否成功
    if (response.code === 200) {
      console.log('评论创建成功，准备更新UI')
      
      // 创建最小化的评论对象用于显示
      const newCommentData = {
        id: response.data?.id || Date.now(), // 使用响应ID或当前时间戳
        content: newComment.value.trim(),
        createdAt: new Date().toISOString(),
        author: { /* 简化的作者信息 */ },
        votes: 0,
        replies: []
      }
      
      // 添加新评论到列表开头
      comments.value.unshift(newCommentData)
      console.log('评论已添加到列表，当前评论数:', comments.value.length)
      
      // 更新评论数
      commentsCount.value = comments.value.length
      console.log('评论数已更新:', commentsCount.value)
      
      notificationService.success('评论发布成功')
      
      // 重置表单
      newComment.value = ''
      showCommentForm.value = false
      console.log('表单已重置')
    } else {
      const errorMessage = response.message || '发表评论失败'
      console.error('评论API返回非成功状态:', response.code, errorMessage)
      notificationService.error(errorMessage)
    }
  } catch (error: any) {
    console.error('发表评论异常:', error)
    // 特别处理未授权错误
    if (error.message === 'UNAUTHORIZED' || error.message.includes('401')) {
      notificationService.error('请先登录再发表评论')
    } else {
      notificationService.error(error.message || '发表评论失败，请稍后重试')
    }
  } finally {
    // 无论成功失败，都确保重置submitting状态
    console.log('进入finally块，准备重置submitting状态')
    // 强制重置submitting状态
    setTimeout(() => {
      submitting.value = false
      console.log('submitting状态已重置为:', submitting.value)
    }, 100)
  }
}

const handleReply = (comment: any) => {
  replyingTo.value = comment
  showReplyForm.value = true
  replyContent.value = ''
  
  // 滚动到回复表单
  setTimeout(() => {
    const replyForm = document.getElementById(`reply-form-${comment.id}`)
    if (replyForm) {
      replyForm.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }, 100)
}

const handleSubmitReply = async () => {
  if (!replyContent.value.trim() || !replyingTo.value) return
  
  console.log('开始处理评论回复')
  
  // 立即设置提交状态为true
  submitting.value = true
  console.log('submitting状态设置为:', submitting.value)
  
  const postId = parseInt(route.params.id.toString())
  const parentId = replyingTo.value.id
  
  try {
    console.log('准备发送回复请求:', { content: replyContent.value.trim(), postId, parentId })
    
    // 调用API创建评论（给评论回复，需要parentId）
    const response = await postApi.createComment({
      content: replyContent.value.trim(),
      postId,
      parentId
    })
    
    console.log('回复API响应:', response)
    
    // 检查响应是否成功
    if (response.code === 200) {
      console.log('回复创建成功，准备更新UI')
      
      // 创建最小化的回复对象用于显示
      const newReplyData = {
        id: response.data?.id || Date.now(), // 使用响应ID或当前时间戳
        content: replyContent.value.trim(),
        createdAt: new Date().toISOString(),
        author: { /* 简化的作者信息 */ },
        votes: 0,
        userVote: null
      }
      
      // 将回复添加到对应评论的replies数组中
      notificationService.success('回复发布成功')
      if (replyingTo.value.replies) {
        replyingTo.value.replies.push(newReplyData)
      } else {
        replyingTo.value.replies = [newReplyData]
      }
      console.log('回复已添加到评论中')
      
      // 重置表单
      replyContent.value = ''
      showReplyForm.value = false
      replyingTo.value = null
      console.log('回复表单已重置')
    } else {
      const errorMessage = response.message || '回复评论失败'
      console.error('回复API返回非成功状态:', response.code, errorMessage)
      notificationService.error(errorMessage)
    }
  } catch (error: any) {
    console.error('回复评论异常:', error)
    // 特别处理未授权错误
    if (error.message === 'UNAUTHORIZED' || error.message.includes('401')) {
      notificationService.error('请先登录再回复评论')
    } else {
      notificationService.error(error.message || '回复评论失败，请稍后重试')
    }
  } finally {
    // 无论成功失败，都确保重置submitting状态
    console.log('进入finally块，准备重置submitting状态')
    // 强制重置submitting状态
    setTimeout(() => {
      submitting.value = false
      console.log('submitting状态已重置为:', submitting.value)
    }, 100)
  }
}

// 已移除评论投票相关函数



// 组件初始化
onMounted(() => {
  loadPost()
})
</script>

<style lang="scss" scoped>
// 模态框样式 - 与创建帖子保持一致
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
  animation: fadeIn 0.2s ease-out;
}

.modal-content {
  background: white;
  border-radius: 12px;
  width: 100%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  animation: slideIn 0.3s ease-out;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
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
    transition: background-color 0.2s;
    
    &:hover {
      background: #e5e7eb;
    }
  }
}

.modal-body {
  padding: 25px;
}

// 表单样式
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
  transition: border-color 0.2s, box-shadow 0.2s;
  
  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
}

.form-textarea {
  resize: vertical;
  min-height: 120px;
  font-family: inherit;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 15px;
  margin-top: 30px;
}

// 动画效果
@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes slideIn {
  from {
    transform: translateY(-20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}
.post-detail {
  min-height: 100vh;
  background: #f9fafb;
  padding: 40px 0;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.loading {
  text-align: center;
  padding: 60px;
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

.post-content {
  background: white;
  border-radius: 12px;
  padding: 40px;
  margin-bottom: 30px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.post-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 1px solid #e5e7eb;
}

.post-meta {
  display: flex;
  align-items: center;
  gap: 15px;
}

.author-avatar {
  width: 50px;
  height: 50px;
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
    font-size: 16px;
    
    &:hover {
      color: #3b82f6;
    }
  }
  
  .post-time {
    color: #9ca3af;
    font-size: 14px;
  }
}

.post-actions {
  display: flex;
  gap: 10px;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border: 1px solid #d1d5db;
  background: white;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 14px;
  
  &:hover {
    background: #f3f4f6;
  }
  
  i.active {
    color: #3b82f6;
  }
}



.post-body {
  margin-bottom: 30px;
}

.post-title {
  font-size: 2rem;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 20px;
  line-height: 1.3;
}

.post-tags {
  margin-bottom: 25px;
  
  .tag {
    display: inline-block;
    padding: 6px 12px;
    background: #f3f4f6;
    color: #6b7280;
    border-radius: 16px;
    font-size: 14px;
    margin-right: 10px;
    margin-bottom: 8px;
  }
}

.post-text {
  font-size: 16px;
  line-height: 1.8;
  color: #374151;
  
  :deep(br) {
    margin-bottom: 10px;
  }
}

.post-stats {
  display: flex;
  gap: 30px;
  margin-bottom: 30px;
  padding: 20px 0;
  border-top: 1px solid #e5e7eb;
  border-bottom: 1px solid #e5e7eb;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #6b7280;
  font-size: 14px;
  
  i {
    color: #9ca3af;
  }
}

.post-voting {
  display: flex;
  align-items: center;
  gap: 20px;
  justify-content: center;
  padding: 20px 0;
}

.vote-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  border: 1px solid #d1d5db;
  background: white;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 14px;
  font-weight: 500;
  
  &:hover {
    background: #f3f4f6;
  }
  
  &.active {
    background: #3b82f6;
    color: white;
    border-color: #3b82f6;
  }
  
  &.upvote.active {
    background: #10b981;
    border-color: #10b981;
  }
  
  &.downvote.active {
    background: #ef4444;
    border-color: #ef4444;
  }
}

.vote-count {
  font-size: 18px;
  font-weight: 600;
  color: #374151;
  min-width: 40px;
  text-align: center;
}

// 评论区
.comments-section {
  background: white;
  border-radius: 12px;
  padding: 30px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.comments-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 1px solid #e5e7eb;
  
  h3 {
    margin: 0;
    font-size: 1.5rem;
    font-weight: 600;
    color: #1f2937;
  }
}

.comment-form {
  margin-bottom: 30px;
  padding: 20px;
  background: #f9fafb;
  border-radius: 8px;
}

.form-group {
  margin-bottom: 15px;
}

.comment-textarea {
  width: 100%;
  padding: 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
  resize: vertical;
  
  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.comments-list {
  margin-top: 30px;
  
  .comment-item {
    background: white;
    border-radius: 8px;
    padding: 20px;
    margin-bottom: 20px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  }
}

/* 回复表单样式 */
.reply-form {
  margin-top: 20px;
  padding: 15px;
  background: #f8f9fa;
  border-radius: 8px;
  border-left: 3px solid #3b82f6;
}

/* 回复列表样式 */
.replies-list {
  margin-top: 15px;
  margin-left: 50px;
  border-left: 2px solid #e5e7eb;
  padding-left: 20px;
}

.reply-item {
  background: #f9fafb;
  border-radius: 6px;
  padding: 15px;
  margin-bottom: 15px;
}

.reply-item .comment-avatar {
  width: 32px;
  height: 32px;
}

.comment-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 15px;
}

.comment-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
  margin-right: 12px;
}

.comment-meta {
  flex: 1;
  
  .comment-author {
    font-weight: 600;
    color: #1f2937;
    font-size: 14px;
  }
  
  .comment-time {
    color: #9ca3af;
    font-size: 12px;
    margin-left: 10px;
  }
}

.comment-content {
  margin-bottom: 15px;
  line-height: 1.6;
  color: #374151;
}

.comment-voting {
  display: flex;
  gap: 10px;
  
  .vote-btn {
    padding: 6px 12px;
    font-size: 12px;
    
    &.active {
      background: #3b82f6;
      color: white;
    }
  }
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
  .container {
    padding: 0 15px;
  }
  
  .post-content {
    padding: 25px;
  }
  
  .post-header {
    flex-direction: column;
    gap: 20px;
  }
  
  .post-title {
    font-size: 1.5rem;
  }
  
  .post-stats {
    flex-direction: column;
    gap: 15px;
  }
  
  .post-voting {
    flex-direction: column;
    gap: 15px;
  }
  
  .comments-section {
    padding: 20px;
  }
  
  .comments-header {
    flex-direction: column;
    gap: 15px;
    align-items: flex-start;
  }
  
  .comment-header {
    flex-direction: column;
    gap: 10px;
  }
  
  .comment-meta {
    display: flex;
    flex-direction: column;
    gap: 5px;
  }
}
</style>
