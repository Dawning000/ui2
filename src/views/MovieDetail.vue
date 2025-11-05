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
            <button 
              v-if="isAdmin" 
              class="edit-btn"
              @click="handleEditClick"
            >
              修改电影信息
            </button>
          </div>
          <div class="sub-title" v-if="detail.originalTitle">
            {{ detail.originalTitle }}
          </div>
          <div class="meta">
            <span v-if="detail.year">{{ detail.year }}</span>
            <span v-if="detail.country"> · {{ detail.country }}</span>
            <span v-if="detail.language"> · {{ detail.language }}</span>
            <span v-if="detail.duration"> · {{ detail.duration }}分钟</span>
          </div>
          <div class="rating-row" v-if="detail.rating >= 0">
            <RatingStars :readonly="true" :modelValue="detail.rating" tooltip-base="评分" />
            <span class="rating-text">{{ (detail.rating / 2).toFixed(1) }}/5</span>
          </div>
          <div class="tags-row" v-if="detail.tags && detail.tags.length > 0">
            <span v-for="(tag, idx) in detail.tags" :key="tag" :class="['tag', `tag-${idx % 6}`]">{{ tag }}</span>
          </div>
          <div class="director" v-if="detail.director">
            <span class="label">导演：</span>
            <router-link :to="`/actor/${detail.director.id}`" class="person-link">
              {{ detail.director.name }}
            </router-link>
          </div>
          <div class="actors" v-if="detail.actors && detail.actors.length > 0">
            <span class="label">演员：</span>
            <template v-for="(actor, index) in detail.actors" :key="actor.id">
              <router-link :to="`/actor/${actor.id}`" class="person-link">{{ actor.name }}</router-link>
              <span v-if="index < detail.actors.length - 1">、</span>
            </template>
          </div>
          <div class="stats">
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

      <div class="photos-section" v-if="detail.photos && detail.photos.length > 0">
        <h2>剧照</h2>
        <div class="photos-grid">
          <div 
            v-for="(photo, index) in detail.photos" 
            :key="index"
            class="photo-wrapper"
          >
            <img 
              :src="photo" 
              alt="photo" 
              @error="handlePhotoError"
            />
          </div>
        </div>
      </div>

      <div class="awards-section" v-if="detail.awards && detail.awards.length > 0">
        <h2>获奖与提名</h2>
        <ul class="awards">
          <li v-for="award in detail.awards" :key="award.id">
            <span v-if="award.year">{{ award.year }}</span>
            <span v-if="award.category"> · {{ award.category }}</span>
            <span v-if="award.name"> · {{ award.name }}</span>
          </li>
        </ul>
      </div>

      <!-- 评分提交区域 -->
      <div class="rating-section" v-if="userStore.isLoggedIn">
        <h2>我的评分</h2>
        <div class="rating-form">
          <div class="rating-input-group">
            <label class="rating-label">评分：</label>
            <RatingStars 
              v-model="userRating.score" 
              :readonly="false" 
              tooltip-base="我的评分"
            />
            <span class="rating-value" v-if="userRating.score">
              {{ userRating.score }}/10
            </span>
          </div>
          <div class="comment-input-group">
            <label class="comment-label">评论：</label>
            <textarea
              v-model="userRating.comment"
              class="comment-textarea"
              placeholder="分享你对这部电影的看法..."
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
    <MovieForm
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
import { fetchMovieDetail, saveMovie, likeMovie, unlikeMovie, rateMovie, favoriteMovie, unfavoriteMovie, type MovieSaveData, type MovieRateData } from '@/api/movies'
import type { MovieDetail } from '@/types/movies'
import MovieForm from '@/components/MovieForm.vue'
import RatingStars from '@/components/RatingStars.vue'

const route = useRoute()
const userStore = useUserStore()
const id = route.params.id as string

const loaded = ref(false)
const loading = ref(false)
const error = ref('')
const detail = ref<MovieDetail | null>(null)
const showEditForm = ref(false)
const likeLoading = ref(false)
const favoriteLoading = ref(false)
const ratingLoading = ref(false)
const userRating = ref<MovieRateData>({
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
    detail.value = await fetchMovieDetail(id)
    loaded.value = true
  } catch (err: any) {
    console.error('Failed to load movie detail:', err)
    if (err?.code === 404) {
      error.value = '电影信息未找到'
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

// 点击编辑按钮
function handleEditClick() {
  showEditForm.value = true
}

// 处理表单提交
async function handleFormSubmit(data: MovieSaveData) {
  try {
    await saveMovie(data)
    showEditForm.value = false
    // 重新加载数据
    await load()
  } catch (err: any) {
    console.error('保存电影信息失败:', err)
    alert(err?.message || '保存失败，请稍后重试')
  }
}

// 取消编辑
function handleFormCancel() {
  showEditForm.value = false
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
      await unlikeMovie(id)
      detail.value.isLiked = false
      if (detail.value.likes > 0) {
        detail.value.likes--
      }
    } else {
      // 点赞
      await likeMovie(id)
      detail.value.isLiked = true
      detail.value.likes++
    }
  } catch (err: any) {
    console.error('点赞操作失败:', err)
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
      await unfavoriteMovie(id)
      detail.value.isFavorited = false
    } else {
      // 收藏
      await favoriteMovie(id)
      detail.value.isFavorited = true
    }
  } catch (err: any) {
    console.error('收藏操作失败:', err)
    alert(err?.message || '操作失败，请稍后重试')
  } finally {
    favoriteLoading.value = false
  }
}

// 处理提交评分
async function handleSubmitRating() {
  if (!userStore.isLoggedIn) {
    alert('请先登录')
    return
  }
  
  if (!detail.value) return
  
  // 验证评分范围（1-10整数）
  const score = userRating.value.score
  if (!score || score < 1 || score > 10) {
    alert('请选择1-10分的评分')
    return
  }
  
  // 验证评分是否为整数（API要求整数）
  const roundedScore = Math.round(score)
  if (roundedScore < 1 || roundedScore > 10) {
    alert('评分必须是1-10之间的整数')
    return
  }
  
  // 验证评论
  if (!userRating.value.comment.trim()) {
    alert('请输入评论内容')
    return
  }
  
  if (userRating.value.comment.length > 1000) {
    alert('评论长度不能超过1000字')
    return
  }
  
  ratingLoading.value = true
  try {
    await rateMovie(id, {
      score: roundedScore,
      comment: userRating.value.comment.trim()
    })
    alert('评分提交成功！')
    // 清空表单
    userRating.value = {
      score: 0,
      comment: ''
    }
    // 可选：重新加载电影详情以获取最新评分
    // await load()
  } catch (err: any) {
    console.error('提交评分失败:', err)
    alert(err?.message || '提交失败，请稍后重试')
  } finally {
    ratingLoading.value = false
  }
}

onMounted(load)
</script>

<style scoped>
.movie-detail-page { 
  padding: 24px; 
  width: 100%;
  max-width: 1600px;
  margin: 80px auto 40px; 
}
.header { display: flex; gap: 24px; margin-bottom: 32px; padding-bottom: 32px; border-bottom: 1px solid #e5e7eb; }
.poster-wrapper {
  width: 240px;
  height: 320px;
  flex-shrink: 0;
  border-radius: 12px;
  overflow: hidden;
  background: #e5e7eb;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
  display: flex;
  align-items: center;
  justify-content: center;
}
.poster {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
}
.poster-placeholder {
  width: 100%;
  height: 100%;
  background: #e5e7eb;
}
.info { display: flex; flex-direction: column; gap: 12px; flex: 1; }
.title-row { display: flex; align-items: center; justify-content: space-between; gap: 16px; }
.info h1 { font-size: 32px; font-weight: 700; color: #111827; margin: 0; flex: 1; }
.sub-title { font-size: 20px; color: #6b7280; font-style: italic; }
.edit-btn { padding: 8px 16px; background: var(--primary-color); color: white; border: none; border-radius: 8px; font-size: 14px; font-weight: 600; cursor: pointer; transition: all 0.2s; white-space: nowrap; }
.edit-btn:hover { background: var(--primary-dark); transform: translateY(-1px); box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
.meta { color: #6b7280; font-size: 14px; }
.rating-row { display: flex; align-items: center; gap: 8px; }
.rating-text { color: #6b7280; font-size: 14px; }
.tags-row { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 8px; }
.tag { 
  padding: 6px 14px; 
  border: none;
  border-radius: 16px; 
  font-size: 13px; 
  font-weight: 500;
  color: #fff;
  transition: all 0.2s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.15);
  display: inline-block;
}
.tag.tag-0 {
  background: linear-gradient(135deg, #f97316 0%, #fb923c 100%);
}
.tag.tag-1 {
  background: linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%);
}
.tag.tag-2 {
  background: linear-gradient(135deg, #22c55e 0%, #4ade80 100%);
}
.tag.tag-3 {
  background: linear-gradient(135deg, #a855f7 0%, #c084fc 100%);
}
.tag.tag-4 {
  background: linear-gradient(135deg, #ef4444 0%, #f87171 100%);
}
.tag.tag-5 {
  background: linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%);
}
.tag:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  opacity: 0.9;
}
.director, .actors { color: #374151; font-size: 14px; display: flex; align-items: center; gap: 4px; }
.label { font-weight: 600; }
.person-link { color: var(--primary-color); text-decoration: none; }
.person-link:hover { text-decoration: underline; }
.stats { color: #6b7280; font-size: 14px; margin-top: 4px; }
.action-buttons { 
  margin-top: 16px; 
  display: flex; 
  gap: 12px; 
  flex-wrap: wrap; 
}
.like-btn, .favorite-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  background: #f3f4f6;
  color: #374151;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}
.like-btn:hover:not(:disabled), .favorite-btn:hover:not(:disabled) {
  background: #e5e7eb;
  border-color: #d1d5db;
}
.like-btn.active, .favorite-btn.active {
  background: var(--bg-primary);
  color: var(--primary-color);
  border-color: var(--primary-color);
}
.like-btn:disabled, .favorite-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
.like-btn i, .favorite-btn i {
  font-size: 16px;
}
.like-count {
  color: #6b7280;
  font-size: 13px;
}
.favorite-btn.active i {
  color: #fbbf24;
}
.summary, .trailer-section, .photos-section, .awards-section { margin-top: 32px; }
.summary h2, .trailer-section h2, .photos-section h2, .awards-section h2 { font-size: 24px; font-weight: 600; color: #111827; margin-bottom: 16px; padding-bottom: 8px; border-bottom: 2px solid var(--primary-color); }
.summary p { color: #374151; line-height: 1.8; font-size: 15px; white-space: pre-wrap; }
.trailer-video { width: 100%; height: 500px; border-radius: 8px; }
.photos-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 16px; }
.photo-wrapper {
  width: 100%;
  height: 280px;
  border-radius: 8px;
  overflow: hidden;
  background: #e5e7eb;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: transform 0.2s;
}
.photo-wrapper:hover {
  transform: scale(1.05);
}
.photo-wrapper img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
}
.awards { padding-left: 24px; list-style: disc; }
.awards li { color: #374151; line-height: 1.8; margin-bottom: 8px; }
.rating-section { margin-top: 32px; padding: 24px; background: #f9fafb; border-radius: 12px; border: 1px solid #e5e7eb; }
.rating-section h2 { font-size: 24px; font-weight: 600; color: #111827; margin-bottom: 20px; padding-bottom: 8px; border-bottom: 2px solid var(--primary-color); }
.rating-form { display: flex; flex-direction: column; gap: 20px; }
.rating-input-group { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }
.rating-label, .comment-label { font-weight: 600; color: #374151; font-size: 15px; min-width: 60px; }
.rating-value { color: var(--primary-color); font-weight: 600; font-size: 15px; }
.comment-input-group { display: flex; flex-direction: column; gap: 8px; }
.comment-textarea { 
  width: 100%; 
  padding: 12px; 
  border: 1px solid #e5e7eb; 
  border-radius: 8px; 
  font-size: 14px; 
  font-family: inherit;
  resize: vertical;
  transition: border-color 0.2s;
}
.comment-textarea:focus { 
  outline: none; 
  border-color: var(--primary-color); 
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}
.comment-count { 
  text-align: right; 
  color: #6b7280; 
  font-size: 12px; 
}
.rating-actions { display: flex; justify-content: flex-end; }
.submit-rating-btn {
  padding: 10px 24px;
  background: var(--primary-color);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}
.submit-rating-btn:hover:not(:disabled) {
  background: var(--primary-dark);
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}
.submit-rating-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}
.loading, .error { text-align: center; padding: 40px; color: #6b7280; font-size: 16px; }
.error { color: #ef4444; }
</style>

