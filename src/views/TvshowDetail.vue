<template>
  <div class="movie-detail-page" v-if="loaded">
    <div v-if="loading" class="loading">加载中...</div>
    <div v-else-if="error" class="error">{{ error }}</div>
    <div v-else-if="detail">
      <div class="header">
        <div class="poster-wrapper">
          <img 
            v-if="detail.poster"
            :src="detail.poster" 
            class="poster" 
            :alt="detail.title || 'poster'" 
            @error="handlePosterError"
          />
          <div v-else class="poster-placeholder"></div>
        </div>
        <div class="info">
          <div class="title-row">
            <h1>{{ detail.title }}</h1>
            <div class="admin-actions" v-if="isAdmin">
              <button 
                class="edit-btn"
                @click="handleEditClick"
                :disabled="deleteLoading"
              >
                修改电视剧信息
              </button>
              <button 
                class="delete-btn"
                @click="handleDeleteClick"
                :disabled="deleteLoading"
              >
                {{ deleteLoading ? '删除中...' : '删除电视剧' }}
              </button>
            </div>
          </div>
          <div class="sub-title" v-if="detail.originalTitle">
            {{ detail.originalTitle }}
          </div>
          <div class="meta">
            <span v-if="detail.year">{{ detail.year }}</span>
            <span v-if="detail.country"> · {{ detail.country }}</span>
            <span v-if="detail.director && detail.director.name"> · 导演：{{ detail.director.name }}</span>
            <span v-if="detail.language"> · {{ detail.language }}</span>
            <span v-if="detail.duration"> · {{ detail.duration }}分钟/集</span>
          </div>
          <div class="tags">
            <span v-for="tag in detail.tags" :key="tag" class="tag">{{ tag }}</span>
          </div>
          <div class="rating">
            <div class="rating-score">{{ detail.rating }}</div>
            <div class="rating-stars">
              <RatingStars :rating="detail.rating" :readonly="true" />
            </div>
            <div class="rating-count">评分人数：{{ detail.views || 0 }}</div>
          </div>
          <div class="meta">
            <span v-if="detail.views !== undefined">浏览次数：{{ detail.views }}</span>
            <span v-if="detail.likes !== undefined"> · 点赞：{{ detail.likes }}</span>
          </div>
          <div class="action-buttons" v-if="userStore.isLoggedIn">
            <button 
              class="like-btn" 
              :class="{ active: isLiked }"
              @click="handleLike"
              :disabled="likeLoading"
            >
              <i class="icon-like"></i>
              <span>{{ isLiked ? '已点赞' : '点赞' }}</span>
              <span class="like-count" v-if="detail.likes !== undefined">({{ detail.likes }})</span>
            </button>
            <button 
              class="favorite-btn" 
              :class="{ active: isFavorited }"
              @click="handleFavorite"
              :disabled="favoriteLoading"
            >
              <i class="icon-star"></i>
              <span>{{ isFavorited ? '已收藏' : '收藏' }}</span>
            </button>
          </div>
        </div>
      </div>

      <div class="summary" v-if="detail.summary">
        <h2>剧情简介</h2>
        <p>{{ detail.summary }}</p>
      </div>

      <div class="trailer-section" v-if="detail.trailer">
        <h2>预告片</h2>
        <iframe 
          :src="detail.trailer" 
          frameborder="0" 
          allowfullscreen
          class="trailer-video"
        ></iframe>
      </div>

      <div class="actors-section">
        <h2>演员列表</h2>
        <div class="actors-grid">
          <div v-for="actor in detail.actors" :key="actor.id" class="actor-item">
            <div class="actor-avatar">
              <img 
                v-if="actor.avatar"
                :src="actor.avatar" 
                :alt="actor.name"
                @error="handleActorAvatarError"
              />
              <div v-else class="avatar-placeholder"></div>
            </div>
            <div class="actor-info">
              <div class="actor-name">{{ actor.name }}</div>
            </div>
          </div>
        </div>
      </div>

      <div class="awards-section" v-if="detail.awards && detail.awards.length > 0">
        <h2>获奖记录</h2>
        <ul class="awards-list">
          <li v-for="award in detail.awards" :key="award.id" class="award-item">
            <span class="award-year" v-if="award.year">{{ award.year }}</span>
            <span class="award-name">{{ award.name }}</span>
            <span class="award-category" v-if="award.category"> · {{ award.category }}</span>
          </li>
        </ul>
      </div>

      <div class="photos-section" v-if="detail.photos && detail.photos.length > 0">
        <h2>剧照</h2>
        <div class="photos-grid">
          <img 
            v-for="(photo, index) in detail.photos" 
            :key="index" 
            :src="photo" 
            class="photo"
            @error="handlePhotoError"
          />
        </div>
      </div>

      <div class="comments-section">
        <h2>用户评论</h2>
        <div class="rating-form" v-if="userStore.isLoggedIn">
          <div class="rating-input">
            <label>评分：</label>
            <RatingStars v-model="userRating.score" :readonly="false" />
            <span class="score-text">{{ userRating.score || 0 }}</span>
          </div>
          <div class="comment-input-group">
            <label class="comment-label">评论：</label>
            <textarea
              v-model="userRating.comment"
              class="comment-textarea"
              placeholder="分享你对这部电视剧的看法..."
              :maxlength="1000"
              rows="6"
            ></textarea>
            <div class="comment-count">
              {{ userRating.comment.length }}/1000
            </div>
          </div>
          <div class="rating-actions">
            <button 
              class="submit-rating-btn" 
              @click="handleSubmitRating"
              :disabled="ratingLoading || !userRating.score || userRating.score < 1 || !userRating.comment.trim()"
            >
              {{ ratingLoading ? '提交中...' : '提交评分' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 编辑表单弹窗 -->
    <TvshowForm
      v-if="showEditForm"
      :isEdit="true"
      :initialData="editFormData"
      @submit="handleFormSubmit"
      @cancel="handleFormCancel"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { fetchTvshowDetail, saveTvshow, likeTvshow, unlikeTvshow, rateTvshow, favoriteTvshow, unfavoriteTvshow, deleteTvshow, type TvshowSaveData, type TvshowRateData } from '@/api/tvshows'
import type { TvshowDetail } from '@/types/tvshows'
import TvshowForm from '@/components/TvshowForm.vue'
import RatingStars from '@/components/RatingStars.vue'

const route = useRoute()
const userStore = useUserStore()
const id = route.params.id as string

const loaded = ref(false)
const loading = ref(false)
const error = ref('')
const detail = ref<TvshowDetail | null>(null)
const showEditForm = ref(false)
const likeLoading = ref(false)
const favoriteLoading = ref(false)
const ratingLoading = ref(false)
const deleteLoading = ref(false)
const userRating = ref<TvshowRateData>({
  score: 0,
  comment: ''
})

// 点赞状态
const isLiked = computed(() => {
  return detail.value?.isLiked ?? false
})

// 收藏状态
const isFavorited = computed(() => {
  return detail.value?.isFavorited ?? false
})

// 判断是否为管理员
const isAdmin = computed(() => {
  return userStore.user?.role === 'ADMIN'
})

// 编辑表单数据
const editFormData = computed(() => {
  if (!detail.value) return undefined
  
  return {
    id: detail.value.id,
    title: detail.value.title || '',
    original_title: detail.value.originalTitle || '',
    year: detail.value.year,
    tags: detail.value.tags || [],
    director: detail.value.director.id, // 导演ID
    // 演员列表：如果后端返回了 role 和 description，使用它们；否则使用空值
    actors: detail.value.actors.map((a: any) => ({
      id: a.id,
      role: a.role || '',
      description: a.description || ''
    })),
    poster: detail.value.poster || '',
    summary: detail.value.summary || '',
    awards: detail.value.awards.map(a => a.id), // 奖项ID数组
    duration: detail.value.duration,
    country: detail.value.country || '',
    language: detail.value.language || '',
    trailer: detail.value.trailer || '',
    photos: detail.value.photos || []
  }
})

async function load() {
  loading.value = true
  error.value = ''
  try {
    detail.value = await fetchTvshowDetail(id)
    loaded.value = true
  } catch (err: any) {
    console.error('Failed to load tvshow detail:', err)
    if (err?.code === 404) {
      error.value = '电视剧信息未找到'
    } else if (err?.message) {
      error.value = err.message
    } else {
      error.value = '加载失败，请稍后重试'
    }
    loaded.value = true
  } finally {
    loading.value = false
  }
}

// 处理海报加载失败
function handlePosterError(event: Event) {
  const img = event.target as HTMLImageElement
  img.style.display = 'none'
}

// 处理照片加载失败
function handlePhotoError(event: Event) {
  const img = event.target as HTMLImageElement
  img.style.display = 'none'
}

// 处理演员头像加载失败
function handleActorAvatarError(event: Event) {
  const img = event.target as HTMLImageElement
  img.style.display = 'none'
}

// 点击编辑按钮
function handleEditClick() {
  showEditForm.value = true
}

// 处理表单提交
async function handleFormSubmit(data: TvshowSaveData) {
  try {
    await saveTvshow(data)
    showEditForm.value = false
    // 重新加载数据
    await load()
  } catch (err: any) {
    console.error('保存电视剧信息失败:', err)
    alert(err?.message || '保存失败，请稍后重试')
  }
}

// 取消编辑
function handleFormCancel() {
  showEditForm.value = false
}

// 处理删除按钮点击
async function handleDeleteClick() {
    if (!confirm('确定要删除这部电视剧吗？此操作无法撤销！')) {
      return
    }
    
    deleteLoading.value = true
    try {
      await deleteTvshow(id)
      alert('电视剧删除成功！')
      // 删除成功后跳转到电视剧列表页面
      window.location.href = '/search?type=tvshow'
  } catch (err: any) {
    console.error('删除电视剧失败:', err)
    alert(err?.message || '删除失败，请稍后重试')
  } finally {
    deleteLoading.value = false
  }
}

// 处理点赞
async function handleLike() {
  if (!userStore.isLoggedIn) {
    alert('请先登录')
    return
  }
  
  if (!detail.value) return
  
  likeLoading.value = true
  try {
    if (isLiked.value) {
      // 取消点赞
      await unlikeTvshow(id)
      detail.value.isLiked = false
      if (detail.value.likes > 0) {
        detail.value.likes--
      }
    } else {
      // 点赞
      await likeTvshow(id)
      detail.value.isLiked = true
      detail.value.likes++
    }
  } catch (err: any) {
    console.error('点赞失败:', err)
    alert(err?.message || '操作失败，请稍后重试')
  } finally {
    likeLoading.value = false
  }
}

// 处理收藏
async function handleFavorite() {
  if (!userStore.isLoggedIn) {
    alert('请先登录')
    return
  }
  
  if (!detail.value) return
  
  favoriteLoading.value = true
  try {
    if (isFavorited.value) {
      // 取消收藏
      await unfavoriteTvshow(id)
      detail.value.isFavorited = false
    } else {
      // 收藏
      await favoriteTvshow(id)
      detail.value.isFavorited = true
    }
  } catch (err: any) {
    console.error('收藏失败:', err)
    alert(err?.message || '操作失败，请稍后重试')
  } finally {
    favoriteLoading.value = false
  }
}

// 提交评分
async function handleSubmitRating() {
  if (!userStore.isLoggedIn) {
    alert('请先登录')
    return
  }
  
  if (!detail.value || !userRating.value.score || userRating.value.score < 1 || !userRating.value.comment.trim()) {
    alert('请填写完整的评分和评论')
    return
  }
  
  ratingLoading.value = true
  try {
    await rateTvshow(id, userRating.value)
    alert('评分提交成功！')
    // 重置评分表单
    userRating.value = {
      score: 0,
      comment: ''
    }
    // 重新加载数据
    await load()
  } catch (err: any) {
    console.error('评分失败:', err)
    alert(err?.message || '提交失败，请稍后重试')
  } finally {
    ratingLoading.value = false
  }
}

onMounted(() => {
  load()
})
</script>