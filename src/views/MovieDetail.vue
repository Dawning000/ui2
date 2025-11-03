<template>
  <div class="movie-detail-page" v-if="loaded">
    <div v-if="loading" class="loading">加载中...</div>
    <div v-else-if="error" class="error">{{ error }}</div>
    <div v-else-if="detail">
      <div class="header">
        <img 
          :src="detail.poster || fallbackPoster" 
          class="poster" 
          :alt="detail.title || 'poster'" 
          @error="handlePosterError"
        />
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
            <span class="rating-text">{{ detail.rating }}/10</span>
          </div>
          <div class="tags-row" v-if="detail.tags && detail.tags.length > 0">
            <span v-for="tag in detail.tags" :key="tag" class="tag">{{ tag }}</span>
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
          <img 
            v-for="(photo, index) in detail.photos" 
            :key="index"
            :src="photo" 
            alt="photo" 
            @error="handlePhotoError"
          />
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
import { fetchMovieDetail, saveMovie, type MovieSaveData } from '@/api/movies'
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
// const fallbackPoster = '/avatar.png'
const showEditForm = ref(false)

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
    actors: detail.value.actors.map(a => a.id), // 演员ID数组
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
  if (img.src !== fallbackPoster) {
    img.src = fallbackPoster
  }
}

// 处理照片加载失败
function handlePhotoError(event: Event) {
  const img = event.target as HTMLImageElement
  img.src = fallbackPoster
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
.poster { width: 240px; height: 320px; object-fit: contain; object-position: center; border-radius: 12px; background: #f3f4f6; flex-shrink: 0; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
.info { display: flex; flex-direction: column; gap: 12px; flex: 1; }
.title-row { display: flex; align-items: center; justify-content: space-between; gap: 16px; }
.info h1 { font-size: 32px; font-weight: 700; color: #111827; margin: 0; flex: 1; }
.sub-title { font-size: 20px; color: #6b7280; font-style: italic; }
.edit-btn { padding: 8px 16px; background: var(--primary-color); color: white; border: none; border-radius: 8px; font-size: 14px; font-weight: 600; cursor: pointer; transition: all 0.2s; white-space: nowrap; }
.edit-btn:hover { background: var(--primary-dark); transform: translateY(-1px); box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
.meta { color: #6b7280; font-size: 14px; }
.rating-row { display: flex; align-items: center; gap: 8px; }
.rating-text { color: #6b7280; font-size: 14px; }
.tags-row { display: flex; flex-wrap: wrap; gap: 8px; }
.tag { padding: 4px 12px; background: #f3f4f6; border-radius: 16px; font-size: 14px; color: #374151; }
.director, .actors { color: #374151; font-size: 14px; display: flex; align-items: center; gap: 4px; }
.label { font-weight: 600; }
.person-link { color: var(--primary-color); text-decoration: none; }
.person-link:hover { text-decoration: underline; }
.stats { color: #6b7280; font-size: 14px; margin-top: 4px; }
.summary, .trailer-section, .photos-section, .awards-section { margin-top: 32px; }
.summary h2, .trailer-section h2, .photos-section h2, .awards-section h2 { font-size: 24px; font-weight: 600; color: #111827; margin-bottom: 16px; padding-bottom: 8px; border-bottom: 2px solid var(--primary-color); }
.summary p { color: #374151; line-height: 1.8; font-size: 15px; white-space: pre-wrap; }
.trailer-video { width: 100%; height: 500px; border-radius: 8px; }
.photos-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 16px; }
.photos-grid img { width: 100%; height: 280px; object-fit: cover; border-radius: 8px; cursor: pointer; transition: transform 0.2s; }
.photos-grid img:hover { transform: scale(1.05); }
.awards { padding-left: 24px; list-style: disc; }
.awards li { color: #374151; line-height: 1.8; margin-bottom: 8px; }
.loading, .error { text-align: center; padding: 40px; color: #6b7280; font-size: 16px; }
.error { color: #ef4444; }
</style>

