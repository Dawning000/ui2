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
            <img :src="post.author.avatar || '/avatar.png'" :alt="post.author.username" class="author-avatar" referrerpolicy="no-referrer" @error="e => (e.target as HTMLImageElement).src = '/avatar.png'" />
            <div class="author-info">
              <router-link :to="`/user/${post.author.id}`" class="author-name">
                {{ post.author.nickname }}
              </router-link>
              <span class="post-time">{{ formatTime(post.createTime) }}</span>
            </div>
          </div>
          <div class="post-actions">
            <!-- 编辑按钮 -->
            <button class="action-btn" @click="handleEditPost" 
           v-if="postPermission.canEdit"
            >
              <i class="icon-edit"></i>
              编辑
            </button>
            <!-- 删除按钮 -->
            <button class="action-btn" @click="handleDeletePost" 
           v-if="postPermission.canDelete"
            >
              <i class="icon-trash"></i>
              删除
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
            <div 
              v-for="comment in comments" 
              :key="comment.id" 
              :id="`comment-${comment.id}`"
              class="comment-item"
              :class="{ 'comment-highlight': route.query.commentId === comment.id.toString() }"
            >
              <div class="comment-header">
                <img :src="comment.author.avatar || '/avatar.png'" :alt="comment.author.username" class="comment-avatar" referrerpolicy="no-referrer" @error="e => (e.target as HTMLImageElement).src = '/avatar.png'" />
                <div class="comment-meta">
                  <span class="comment-author">{{ comment.author.nickname }}</span>
                  <span class="comment-time">{{ formatTime(comment.createdAt) }}</span>
                </div>
                <div class="comment-actions">
                  <button class="action-btn" @click="handleReply(comment)">
                    <i class="icon-reply"></i>
                    回复
                  </button>
                  <button 
                    v-if="comment.canEdit" 
                    class="action-btn" 
                    @click="handleEditComment(comment)"
                  >
                    <i class="icon-edit"></i>
                    编辑
                  </button>
                  <button 
                    v-if="comment.canDelete" 
                    class="action-btn delete-btn" 
                    @click="handleDeleteComment(comment)"
                  >
                    <i class="icon-trash"></i>
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
                <div 
                  v-for="reply in comment.replies" 
                  :key="reply.id" 
                  :id="`comment-${reply.id}`"
                  class="reply-item"
                  :class="{ 'comment-highlight': route.query.commentId === reply.id.toString() }"
                >
                  <div class="comment-header">
                    <img :src="reply.author.avatar || '/avatar.png'" :alt="reply.author.username" class="comment-avatar" referrerpolicy="no-referrer" @error="e => (e.target as HTMLImageElement).src = '/avatar.png'" />
                    <div class="comment-meta">
                      <span class="comment-author">{{ reply.author.nickname }}</span>
                      <span class="comment-time">{{ formatTime(reply.createdAt) }}</span>
                    </div>
                    <div class="comment-actions">
                      <button 
                        v-if="reply.canEdit" 
                        class="action-btn" 
                        @click="handleEditComment(reply)"
                      >
                        <i class="icon-edit"></i>
                        编辑
                      </button>
                      <button 
                        v-if="reply.canDelete" 
                        class="action-btn delete-btn" 
                        @click="handleDeleteComment(reply)"
                      >
                        <i class="icon-trash"></i>
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

      <!-- 编辑帖子模态框 -->
      <div v-if="showEditForm" class="modal-overlay">
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
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { postApi, Post, Comment } from '../api/posts'
import { confirmService } from '../utils/confirm'
import { notificationService } from '../utils/notification'
import { useUserStore } from '../stores/user'

const route = useRoute()
const userStore = useUserStore()

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
  const postPermission = ref({ canEdit: false, canDelete: false }) // 帖子权限

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
      console.log('评论删除成功，重新加载评论列表')
      
      notificationService.success('评论已成功删除')
      
      // 重新加载评论列表
      const postId = parseInt(route.params.id.toString())
      await loadComments(postId)
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

// 方法
const formatTime = (date: string | undefined) => {
  if (!date) return '刚刚'
  const now = new Date()
  const diff = now.getTime() - new Date(date).getTime()
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
const loadComments = async (postId: number) => {
  try {
    const response = await postApi.getComments(postId);
    console.log('评论API响应:', response);
    
    if (response.code === 200) {
      // response.data 是一个对象，包含 comments 数组
      const commentsData = response.data?.comments || [];
      
      // 转换评论数据：将 createTime 转换为 createdAt，并处理回复和权限
      const transformComment = (comment: any) => {
        const currentUserId = userStore.userId;
        const isAuthor = currentUserId !== null && comment.author?.id === currentUserId;
        
        const transformed = {
          ...comment,
          createdAt: comment.createTime || comment.createdAt,
          canEdit: isAuthor,
          canDelete: isAuthor
        };
        
        // 处理回复数据
        if (transformed.replies && Array.isArray(transformed.replies)) {
          transformed.replies = transformed.replies.map((reply: any) => {
            const isReplyAuthor = currentUserId !== null && reply.author?.id === currentUserId;
            return {
              ...reply,
              createdAt: reply.createTime || reply.createdAt,
              canEdit: isReplyAuthor,
              canDelete: isReplyAuthor
            };
          });
        }
        
        return transformed;
      };
      
      comments.value = commentsData.map(transformComment);
      
      // 评论数应该使用帖子详情中的 commentsCount，或者使用返回的 total
      if (post.value && post.value.commentsCount !== undefined) {
        commentsCount.value = post.value.commentsCount;
      } else if (response.data?.total !== undefined) {
        // 使用返回的 total（包含所有评论和回复）
        commentsCount.value = response.data.total;
      } else {
        // 如果没有，则计算列表中的评论数（包括回复）
        const totalComments = commentsData.reduce((count, comment) => {
          return count + 1 + (comment.replies ? comment.replies.length : 0);
        }, 0);
        commentsCount.value = totalComments;
      }
      console.log('加载后的评论列表:', comments.value);
      console.log('评论数:', commentsCount.value);
    } else {
      throw new Error(response.message || '获取评论失败');
    }
  } catch (error) {
    console.error('加载评论失败:', error);
    comments.value = [];
    // 如果加载失败，使用帖子详情中的评论数
    if (post.value && post.value.commentsCount !== undefined) {
      commentsCount.value = post.value.commentsCount;
    } else {
      commentsCount.value = 0;
    }
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
      console.log('评论编辑成功，重新加载评论列表')
      
      notificationService.success('评论已成功更新')
      
      cancelEditComment() // 编辑成功后重置状态
      
      // 重新加载评论列表
      const postId = parseInt(route.params.id.toString())
      await loadComments(postId)
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
      // 初始化评论数（使用帖子详情中的评论数）
      if (postData.commentsCount !== undefined) {
        commentsCount.value = postData.commentsCount;
      }
      // 不再需要userVote变量，直接使用post.value.isLiked
      
      // 获取帖子权限
      try {
        const permissionResponse = await postApi.getPostPermission(postId)
        if (permissionResponse.code === 200) {
          postPermission.value = permissionResponse.data
        }
      } catch (error) {
        console.error('获取帖子权限失败:', error)
        // 如果获取权限失败，默认设置为无权限
        postPermission.value = { canEdit: false, canDelete: false }
      }
      
      // 获取评论列表
      await loadComments(postId)
      
      // 如果 URL 中有 commentId 参数，定位到该评论
      const commentId = route.query.commentId
      if (commentId) {
        setTimeout(() => {
          scrollToComment(commentId.toString())
        }, 300) // 延迟一下确保 DOM 已渲染
      }
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
          nickname: '',
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
  // 使用美观的确认对话框
  const confirmed = await confirmService.danger('确定要删除这篇帖子吗？删除后将无法恢复。', {
    title: '删除确认'
  })

  if (!confirmed) {
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
      console.log('评论创建成功，重新加载评论列表')
      
      notificationService.success('评论发布成功')
      
      // 重置表单
      newComment.value = ''
      showCommentForm.value = false
      console.log('表单已重置')
      
      // 重新加载评论列表
      await loadComments(postId)
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
      console.log('回复创建成功，重新加载评论列表')
      
      notificationService.success('回复发布成功')
      
      // 重置表单
      replyContent.value = ''
      showReplyForm.value = false
      replyingTo.value = null
      console.log('回复表单已重置')
      
      // 重新加载评论列表
      await loadComments(postId)
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



/**
 * 滚动到指定评论
 */
const scrollToComment = (commentId: string) => {
  // 先尝试在顶级评论中查找
  const commentElement = document.getElementById(`comment-${commentId}`)
  if (commentElement) {
    commentElement.scrollIntoView({ behavior: 'smooth', block: 'center' })
    // 高亮显示
    commentElement.classList.add('comment-highlight')
    // 3秒后移除高亮
    setTimeout(() => {
      commentElement.classList.remove('comment-highlight')
    }, 3000)
    return
  }
  
  // 如果在顶级评论中没找到，可能在回复中
  // 需要展开父评论的回复列表
  const parentCommentId = route.query.parentCommentId
  if (parentCommentId) {
    // 查找父评论并展开回复
    const parentElement = document.getElementById(`comment-${parentCommentId}`)
    if (parentElement) {
      // 滚动到父评论
      parentElement.scrollIntoView({ behavior: 'smooth', block: 'center' })
      // 等待一下再查找子评论
      setTimeout(() => {
        const replyElement = document.getElementById(`comment-${commentId}`)
        if (replyElement) {
          replyElement.scrollIntoView({ behavior: 'smooth', block: 'center' })
          replyElement.classList.add('comment-highlight')
          setTimeout(() => {
            replyElement.classList.remove('comment-highlight')
          }, 3000)
        }
      }, 500)
    }
  }
}

// 组件初始化
onMounted(() => {
  loadPost()
})
</script>

<style lang="scss" scoped>
// 主题色变量
$primary-color: #f97316;
$primary-dark: #ea580c;
$primary-light: #fb923c;
$secondary-color: #fbbf24;
$success-color: #22c55e;
$danger-color: #ef4444;
$warning-color: #f59e0b;
$text-primary: #1f2937;
$text-secondary: #6b7280;
$text-tertiary: #9ca3af;
$bg-primary: #ffffff;
$bg-secondary: #f9fafb;
$bg-tertiary: #f3f4f6;
$border-color: #e5e7eb;
$shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
$shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
$shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
$shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);

// 模态框样式
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
  animation: fadeIn 0.3s ease-out;
}

.modal-content {
  background: $bg-primary;
  border-radius: 16px;
  width: 100%;
  max-width: 650px;
  max-height: 90vh;
  overflow-y: auto;
  animation: slideIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  box-shadow: $shadow-xl;
  border: 1px solid $border-color;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px 28px;
  border-bottom: 1px solid $border-color;
  background: linear-gradient(135deg, $bg-secondary 0%, $bg-primary 100%);
  
  h3 {
    margin: 0;
    font-size: 1.5rem;
    font-weight: 700;
    color: $text-primary;
    background: linear-gradient(135deg, $primary-color 0%, $primary-dark 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
  
  .close-btn {
    width: 36px;
    height: 36px;
    border: none;
    background: $bg-tertiary;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.2s;
    color: $text-secondary;
    
    &:hover {
      background: $border-color;
      transform: rotate(90deg);
      color: $text-primary;
    }
  }
}

.modal-body {
  padding: 28px;
}

// 表单样式
.form-group {
  margin-bottom: 24px;
  
  label {
    display: block;
    font-weight: 600;
    color: $text-primary;
    margin-bottom: 10px;
    font-size: 14px;
  }
}

.form-input,
.form-select,
.form-textarea {
  width: 100%;
  padding: 12px 16px;
  border: 2px solid $border-color;
  border-radius: 10px;
  font-size: 14px;
  transition: all 0.2s;
  background: $bg-primary;
  color: $text-primary;
  
  &:focus {
    outline: none;
    border-color: $primary-color;
    box-shadow: 0 0 0 4px rgba(249, 115, 22, 0.1);
    transform: translateY(-1px);
  }
  
  &::placeholder {
    color: $text-tertiary;
  }
}

.form-textarea {
  resize: vertical;
  min-height: 140px;
  font-family: inherit;
  line-height: 1.6;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 32px;
  padding-top: 24px;
  border-top: 1px solid $border-color;
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
    transform: translateY(-30px) scale(0.95);
    opacity: 0;
  }
  to {
    transform: translateY(0) scale(1);
    opacity: 1;
  }
}

.post-detail {
  min-height: 100vh;
  background: linear-gradient(135deg, #fef3e7 0%, #f9fafb 50%, #f3f4f6 100%);
  padding: 60px 0 80px;
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 200px;
    background: linear-gradient(135deg, rgba(249, 115, 22, 0.05) 0%, rgba(251, 191, 36, 0.03) 100%);
    pointer-events: none;
  }
}

.container {
  max-width: 1000px;
  margin: 0 auto;
  padding: 0 24px;
  position: relative;
  z-index: 1;
}

.loading {
  text-align: center;
  padding: 100px 20px;
  color: $text-secondary;
  
  .loading-spinner {
    width: 50px;
    height: 50px;
    border: 4px solid $bg-tertiary;
    border-top: 4px solid $primary-color;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
    margin: 0 auto 24px;
  }
  
  p {
    font-size: 16px;
    font-weight: 500;
    margin: 0;
  }
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.post-content {
  background: $bg-primary;
  border-radius: 20px;
  padding: 48px;
  margin-bottom: 32px;
  box-shadow: $shadow-lg;
  border: 1px solid rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
  animation: slideUp 0.5s ease-out;
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(90deg, $primary-color 0%, $secondary-color 100%);
  }
}

@keyframes slideUp {
  from {
    transform: translateY(20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.post-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 32px;
  padding-bottom: 24px;
  border-bottom: 2px solid $bg-tertiary;
}

.post-meta {
  display: flex;
  align-items: center;
  gap: 16px;
}

.author-avatar {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid $bg-tertiary;
  box-shadow: $shadow-sm;
  transition: all 0.3s ease;
  
  &:hover {
    transform: scale(1.05);
    box-shadow: $shadow-md;
    border-color: $primary-light;
  }
}

.author-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
  
  .author-name {
    font-weight: 700;
    color: $text-primary;
    text-decoration: none;
    font-size: 17px;
    transition: all 0.2s;
    
    &:hover {
      color: $primary-color;
      transform: translateX(2px);
    }
  }
  
  .post-time {
    color: $text-tertiary;
    font-size: 13px;
    display: flex;
    align-items: center;
    gap: 6px;
    
    &::before {
      content: '🕐';
      font-size: 12px;
    }
  }
}

.post-actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 18px;
  border: 2px solid $border-color;
  background: $bg-primary;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  font-size: 14px;
  font-weight: 500;
  color: $text-secondary;
  
  &:hover {
    background: $bg-tertiary;
    border-color: $primary-light;
    color: $primary-color;
    transform: translateY(-2px);
    box-shadow: $shadow-md;
  }
  
  &:active {
    transform: translateY(0);
  }
  
  i {
    font-size: 16px;
  }
  
  &.delete-btn {
    color: $danger-color;
    border-color: rgba(239, 68, 68, 0.2);
    
    &:hover {
      background: rgba(239, 68, 68, 0.1);
      border-color: $danger-color;
      color: $danger-color;
    }
  }
}

.post-body {
  margin-bottom: 36px;
}

.post-title {
  font-size: 2.5rem;
  font-weight: 800;
  color: $text-primary;
  margin-bottom: 24px;
  line-height: 1.2;
  letter-spacing: -0.5px;
  background: linear-gradient(135deg, $text-primary 0%, $primary-color 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.post-tags {
  margin-bottom: 28px;
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  
  .tag {
    display: inline-flex;
    align-items: center;
    padding: 8px 16px;
    background: linear-gradient(135deg, $bg-tertiary 0%, $bg-secondary 100%);
    color: $text-secondary;
    border-radius: 20px;
    font-size: 13px;
    font-weight: 500;
    border: 1px solid $border-color;
    transition: all 0.2s;
    cursor: pointer;
    
    &:hover {
      background: linear-gradient(135deg, $primary-light 0%, $primary-color 100%);
      color: white;
      border-color: $primary-color;
      transform: translateY(-2px);
      box-shadow: $shadow-md;
    }
  }
}

.post-text {
  font-size: 17px;
  line-height: 1.9;
  color: $text-primary;
  word-break: break-word;
  
  :deep(br) {
    margin-bottom: 12px;
  }
  
  :deep(p) {
    margin-bottom: 16px;
  }
  
  :deep(a) {
    color: $primary-color;
    text-decoration: none;
    border-bottom: 1px solid transparent;
    transition: all 0.2s;
    
    &:hover {
      border-bottom-color: $primary-color;
    }
  }
}

.post-stats {
  display: flex;
  gap: 40px;
  margin-bottom: 32px;
  padding: 24px 0;
  border-top: 2px solid $bg-tertiary;
  border-bottom: 2px solid $bg-tertiary;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 10px;
  color: $text-secondary;
  font-size: 15px;
  font-weight: 500;
  padding: 8px 16px;
  border-radius: 10px;
  background: $bg-secondary;
  transition: all 0.2s;
  
  &:hover {
    background: $bg-tertiary;
    color: $primary-color;
    transform: translateY(-2px);
  }
  
  i {
    color: $primary-color;
    font-size: 18px;
  }
}

.post-voting {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 28px 0;
  margin: 32px 0;
  background: linear-gradient(135deg, $bg-secondary 0%, $bg-tertiary 100%);
  border-radius: 16px;
}

.vote-btn {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 28px;
  border: 2px solid $border-color;
  background: $bg-primary;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  font-size: 15px;
  font-weight: 600;
  color: $text-secondary;
  box-shadow: $shadow-sm;
  
  &:hover {
    background: $bg-tertiary;
    border-color: $primary-light;
    transform: translateY(-3px);
    box-shadow: $shadow-md;
  }
  
  &:active {
    transform: translateY(-1px);
  }
  
  &.active {
    background: linear-gradient(135deg, $success-color 0%, #16a34a 100%);
    color: white;
    border-color: $success-color;
    box-shadow: 0 4px 12px rgba(34, 197, 94, 0.3);
    
    &:hover {
      background: linear-gradient(135deg, #16a34a 0%, #15803d 100%);
      transform: translateY(-3px);
      box-shadow: 0 6px 16px rgba(34, 197, 94, 0.4);
    }
  }
  
  i {
    font-size: 20px;
  }
}

// 评论区
.comments-section {
  background: $bg-primary;
  border-radius: 20px;
  padding: 40px;
  box-shadow: $shadow-lg;
  border: 1px solid rgba(255, 255, 255, 0.8);
  animation: slideUp 0.5s ease-out 0.1s both;
}

.comments-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
  padding-bottom: 24px;
  border-bottom: 2px solid $bg-tertiary;
  
  h3 {
    margin: 0;
    font-size: 1.75rem;
    font-weight: 700;
    color: $text-primary;
    display: flex;
    align-items: center;
    gap: 12px;
    
    &::before {
      content: '💬';
      font-size: 24px;
    }
  }
}

.comment-form {
  margin-bottom: 32px;
  padding: 24px;
  background: linear-gradient(135deg, $bg-secondary 0%, $bg-tertiary 100%);
  border-radius: 16px;
  border: 2px solid $border-color;
  transition: all 0.3s;
  
  &:focus-within {
    border-color: $primary-color;
    box-shadow: 0 0 0 4px rgba(249, 115, 22, 0.1);
  }
}

.comment-textarea {
  width: 100%;
  padding: 16px;
  border: 2px solid $border-color;
  border-radius: 12px;
  font-size: 15px;
  resize: vertical;
  background: $bg-primary;
  color: $text-primary;
  transition: all 0.2s;
  font-family: inherit;
  line-height: 1.6;
  
  &:focus {
    outline: none;
    border-color: $primary-color;
    box-shadow: 0 0 0 4px rgba(249, 115, 22, 0.1);
  }
  
  &::placeholder {
    color: $text-tertiary;
  }
}

.comments-list {
  margin-top: 32px;
  
  .comment-item {
    background: $bg-primary;
    border-radius: 16px;
    padding: 24px;
    margin-bottom: 20px;
    box-shadow: $shadow-sm;
    border: 2px solid $bg-tertiary;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    position: relative;
    overflow: hidden;

    &::before {
      content: '';
      position: absolute;
      left: 0;
      top: 0;
      bottom: 0;
      width: 4px;
      background: linear-gradient(180deg, $primary-color 0%, $secondary-color 100%);
      opacity: 0;
      transition: opacity 0.3s;
    }

    &:hover {
      box-shadow: $shadow-md;
      border-color: $primary-light;
      transform: translateX(4px);
      
      &::before {
        opacity: 1;
      }
    }

    &.comment-highlight {
      background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
      border: 2px solid $warning-color;
      box-shadow: 0 0 0 4px rgba(245, 158, 11, 0.2), $shadow-lg;
      animation: highlightPulse 0.6s ease-out;
      
      &::before {
        opacity: 1;
        background: $warning-color;
      }
    }
  }
}

@keyframes highlightPulse {
  0% {
    box-shadow: 0 0 0 0 rgba(245, 158, 11, 0.7);
  }
  50% {
    box-shadow: 0 0 0 12px rgba(245, 158, 11, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(245, 158, 11, 0);
  }
}

/* 回复表单样式 */
.reply-form {
  margin-top: 20px;
  padding: 20px;
  background: linear-gradient(135deg, $bg-secondary 0%, $bg-tertiary 100%);
  border-radius: 12px;
  border-left: 4px solid $primary-color;
  box-shadow: $shadow-sm;
}

/* 回复列表样式 */
.replies-list {
  margin-top: 20px;
  margin-left: 60px;
  border-left: 3px solid $border-color;
  padding-left: 24px;
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    left: -3px;
    top: 0;
    bottom: 0;
    width: 3px;
    background: linear-gradient(180deg, $primary-light 0%, $primary-color 100%);
    border-radius: 0 3px 3px 0;
  }
}

.reply-item {
  background: $bg-secondary;
  border-radius: 12px;
  padding: 18px;
  margin-bottom: 16px;
  transition: all 0.3s ease;
  border: 1px solid $border-color;
  position: relative;

  &:hover {
    background: $bg-tertiary;
    box-shadow: $shadow-sm;
    transform: translateX(4px);
  }

  &.comment-highlight {
    background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
    border: 2px solid $warning-color;
    box-shadow: 0 0 0 2px rgba(245, 158, 11, 0.2);
    animation: highlightPulse 0.6s ease-out;
  }
}

.reply-item .comment-avatar {
  width: 36px;
  height: 36px;
}

.comment-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
  gap: 12px;
}

.comment-avatar {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid $bg-tertiary;
  box-shadow: $shadow-sm;
  flex-shrink: 0;
  transition: all 0.2s;
  
  &:hover {
    transform: scale(1.1);
    border-color: $primary-light;
  }
}

.comment-meta {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
  
  .comment-author {
    font-weight: 700;
    color: $text-primary;
    font-size: 15px;
  }
  
  .comment-time {
    color: $text-tertiary;
    font-size: 12px;
    display: flex;
    align-items: center;
    gap: 6px;
  }
}

.comment-actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.comment-content {
  margin-bottom: 16px;
  line-height: 1.7;
  color: $text-primary;
  font-size: 15px;
  word-break: break-word;
}

.comment-edit-form {
  margin-top: 16px;
  padding: 20px;
  background: $bg-secondary;
  border-radius: 12px;
  border: 2px solid $border-color;
}

// 按钮样式
.btn {
  padding: 12px 24px;
  border-radius: 10px;
  text-decoration: none;
  font-weight: 600;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: 2px solid transparent;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-size: 14px;
  
  &.btn-primary {
    background: linear-gradient(135deg, $primary-color 0%, $primary-dark 100%);
    color: white;
    box-shadow: $shadow-md;
    
    &:hover:not(:disabled) {
      background: linear-gradient(135deg, $primary-dark 0%, #c2410c 100%);
      transform: translateY(-2px);
      box-shadow: $shadow-lg;
    }
    
    &:active:not(:disabled) {
      transform: translateY(0);
    }
    
    &:disabled {
      opacity: 0.6;
      cursor: not-allowed;
      transform: none;
    }
  }
  
  &.btn-outline {
    background: transparent;
    color: $text-secondary;
    border-color: $border-color;
    
    &:hover {
      background: $bg-tertiary;
      color: $text-primary;
      border-color: $primary-light;
    }
  }
}

// 响应式设计
@media (max-width: 768px) {
  .post-detail {
    padding: 40px 0 60px;
  }
  
  .container {
    padding: 0 16px;
  }
  
  .post-content {
    padding: 28px 20px;
    border-radius: 16px;
  }
  
  .post-header {
    flex-direction: column;
    gap: 20px;
    align-items: flex-start;
  }
  
  .post-title {
    font-size: 1.75rem;
  }
  
  .post-stats {
    flex-direction: column;
    gap: 12px;
  }
  
  .stat-item {
    width: 100%;
    justify-content: center;
  }
  
  .post-voting {
    padding: 20px 0;
  }
  
  .comments-section {
    padding: 24px 20px;
    border-radius: 16px;
  }
  
  .comments-header {
    flex-direction: column;
    gap: 16px;
    align-items: flex-start;
    
    h3 {
      font-size: 1.5rem;
    }
  }
  
  .comment-header {
    flex-direction: column;
    gap: 12px;
  }
  
  .comment-meta {
    width: 100%;
  }
  
  .comment-actions {
    width: 100%;
    justify-content: flex-end;
  }
  
  .replies-list {
    margin-left: 20px;
    padding-left: 16px;
  }
  
  .post-actions {
    width: 100%;
    justify-content: flex-end;
  }
}
</style>
