<template>
  <div class="hot-movies-page">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-background"></div>
      <div class="header-content">
        <div class="header-icon">🏆</div>
        <h1 class="page-title">热门电影排行榜</h1>
        <p class="page-subtitle">发现最受欢迎的电影作品，探索精彩纷呈的影视世界</p>
        <div class="header-stats" v-if="!loading && total > 0">
          <span class="stat-item">
            <span class="stat-number">{{ total }}</span>
            <span class="stat-label">部作品</span>
          </span>
        </div>
      </div>
    </div>

    <!-- 电影列表容器 -->
    <div class="movies-container">
      <div v-if="loading" class="grid">
        <div v-for="n in 12" :key="n" class="card skeleton">
          <div class="skeleton-poster"></div>
          <div class="skeleton-content">
            <div class="skeleton-title"></div>
            <div class="skeleton-subtitle"></div>
          </div>
        </div>
      </div>

      <div v-else-if="movies.length" class="grid">
        <article 
          v-for="(movie, index) in movies" 
          :key="movie.id" 
          class="card" 
          :class="getRankClass(index)"
          :style="{ animationDelay: `${index * 0.05}s` }"
        >
          <router-link :to="`/movie/${movie.id}`" class="card-link">
            <!-- 排名徽章 -->
            <div class="rank-badge" :class="getRankBadgeClass(index)">
              <span class="rank-number">{{ getRankNumber(index) }}</span>
              <div class="rank-icon" v-if="index < 3">
                <span v-if="index === 0">🥇</span>
                <span v-else-if="index === 1">🥈</span>
                <span v-else-if="index === 2">🥉</span>
              </div>
            </div>
            
            <div class="poster-wrapper">
              <div class="poster" :style="{ backgroundImage: movie.poster ? `url(${movie.poster})` : undefined }">
                <div class="poster-overlay">
                  <div class="poster-rating" v-if="movie.rating">
                    <i class="icon-star"></i>
                    <span>{{ movie.rating.toFixed(1) }}</span>
                  </div>
                  <div class="poster-play">
                    <i class="icon-play"></i>
                  </div>
                </div>
              </div>
              <div class="poster-shine"></div>
            </div>
            <div class="meta">
              <h3 class="movie-title">{{ movie.title }}</h3>
              <div class="movie-year">{{ movie.year || '-' }}</div>
              <div class="tags" v-if="movie.tags && movie.tags.length > 0">
                <span v-for="(tag, idx) in movie.tags.slice(0, 3)" :key="tag" :class="['tag', `tag-${idx % 6}`]">{{ tag }}</span>
              </div>
              <div class="rating-row">
                <RatingStars :readonly="true" :modelValue="movie.rating || 0" tooltip-base="评分" />
                <span v-if="movie.rating" class="rating-text">{{ movie.rating.toFixed(1) }}/10</span>
                <span v-else class="rating-text no-rating">暂无评分</span>
              </div>
            </div>
          </router-link>
        </article>
      </div>

      <div v-else class="empty">
        <div class="empty-icon">🎬</div>
        <p class="empty-text">暂无热门电影数据</p>
        <p class="empty-hint">请稍后再试</p>
      </div>

      <div class="pagination-container" v-if="!loading && movies.length > 0">
        <div class="pagination-info">
          <span>共 {{ total }} 条记录</span>
          <span class="divider" v-if="total > 0">|</span>
          <template v-if="total > 0">
            <span>每页显示</span>
            <select v-model="pageSize" @change="handleSizeChange" class="page-size-select">
              <option :value="10">10</option>
              <option :value="20">20</option>
              <option :value="50">50</option>
              <option :value="100">100</option>
            </select>
            <span>条</span>
          </template>
        </div>
        <div class="pagination" v-if="total > 0 && totalPages > 0">
          <button 
            class="pagination-btn" 
            :disabled="currentPage <= 1 || totalPages <= 1" 
            @click.stop="changePage(1)"
            title="首页"
          >
            首页
          </button>
          <button 
            class="pagination-btn" 
            :disabled="currentPage <= 1 || totalPages <= 1" 
            @click.stop="changePage(currentPage - 1)"
            title="上一页"
          >
            上一页
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
            class="pagination-btn" 
            :disabled="currentPage >= totalPages || totalPages <= 1" 
            @click.stop="changePage(currentPage + 1)"
            title="下一页"
          >
            下一页
          </button>
          <button 
            class="pagination-btn" 
            :disabled="currentPage >= totalPages || totalPages <= 1" 
            @click.stop="changePage(totalPages)"
            title="末页"
          >
            末页
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
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { fetchHotMovies } from '@/api/movies'
import RatingStars from '@/components/RatingStars.vue'
import type { MovieItem } from '@/types/movies'

const route = useRoute()
const router = useRouter()

const loading = ref(false)
const movies = ref<MovieItem[]>([])
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(10)
const jumpPage = ref(1)

// 计算总页数
const totalPages = computed(() => Math.max(1, Math.ceil(total.value / pageSize.value)))

// 计算可见的页码
const visiblePages = computed(() => {
  const pages: (number | string)[] = []
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

// 加载热门电影
async function loadHotMovies() {
  loading.value = true
  try {
    const response = await fetchHotMovies({
      page: currentPage.value,
      size: pageSize.value
    })
    movies.value = response.movies || []
    total.value = response.total || 0
    currentPage.value = response.page || 1
    pageSize.value = response.size || 10
    
    // 同步jumpPage
    jumpPage.value = currentPage.value
    
    // 更新URL参数
    router.replace({
      query: {
        page: currentPage.value.toString(),
        size: pageSize.value.toString()
      }
    })
  } catch (error: any) {
    console.error('加载热门电影失败:', error)
    movies.value = []
    total.value = 0
  } finally {
    loading.value = false
  }
}

function changePage(p: number) {
  const targetPage = Math.max(1, Math.min(p, totalPages.value))
  if (targetPage === currentPage.value) return
  currentPage.value = targetPage
  jumpPage.value = targetPage
  // 滚动到顶部
  window.scrollTo({ top: 0, behavior: 'smooth' })
  loadHotMovies()
}

function handleSizeChange() {
  currentPage.value = 1
  jumpPage.value = 1
  loadHotMovies()
}

function handleJump() {
  const targetPage = Math.max(1, Math.min(jumpPage.value, totalPages.value))
  if (targetPage !== currentPage.value) {
    changePage(targetPage)
  }
}

// 从URL参数初始化
function initFromRoute() {
  const page = parseInt(route.query.page as string) || 1
  const size = parseInt(route.query.size as string) || 10
  currentPage.value = page
  pageSize.value = size
  jumpPage.value = page
}

// 同步 jumpPage 与当前页码
watch(() => currentPage.value, (newPage) => {
  jumpPage.value = newPage
})

// 计算排名（考虑分页）
function getRankNumber(index: number): number {
  return (currentPage.value - 1) * pageSize.value + index + 1
}

// 获取排名样式类
function getRankClass(index: number): string {
  if (index === 0) return 'rank-first'
  if (index === 1) return 'rank-second'
  if (index === 2) return 'rank-third'
  return ''
}

// 获取排名徽章样式类
function getRankBadgeClass(index: number): string {
  if (index === 0) return 'rank-badge-gold'
  if (index === 1) return 'rank-badge-silver'
  if (index === 2) return 'rank-badge-bronze'
  return ''
}

onMounted(() => {
  initFromRoute()
  loadHotMovies()
})
</script>

<style lang="scss" scoped>
.hot-movies-page {
  min-height: calc(100vh - 70px);
  background: var(--bg-secondary);
}

// 页面头部
.page-header {
  position: relative;
  background: linear-gradient(135deg, var(--primary-color) 0%, var(--secondary-color) 100%);
  color: white;
  padding: 80px 20px 60px;
  margin-bottom: 60px;
  overflow: hidden;
  
  .header-background {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: 
      radial-gradient(1200px 300px at 20% 0%, rgba(255, 186, 73, 0.2), transparent 60%),
      radial-gradient(1200px 300px at 80% 0%, rgba(255, 115, 29, 0.2), transparent 60%);
    pointer-events: none;
  }
  
  .header-content {
    position: relative;
    max-width: 1400px;
    margin: 0 auto;
    text-align: center;
    z-index: 2;
  }
  
  .header-icon {
    font-size: 4rem;
    margin-bottom: 20px;
    animation: bounce 2s infinite;
    display: inline-block;
  }
  
  .page-title {
    font-size: 3rem;
    font-weight: 800;
    margin: 0 0 16px 0;
    text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
    line-height: 1.2;
  }
  
  .page-subtitle {
    font-size: 1.2rem;
    margin: 0 0 24px 0;
    opacity: 0.95;
    line-height: 1.6;
    text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.2);
  }
  
  .header-stats {
    display: flex;
    justify-content: center;
    gap: 40px;
    margin-top: 30px;
    
    .stat-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
      
      .stat-number {
        font-size: 2.5rem;
        font-weight: 800;
        color: #fbbf24;
        text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.3);
      }
      
      .stat-label {
        font-size: 1rem;
        opacity: 0.9;
      }
    }
  }
}

.movies-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 24px 60px;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 24px;
}

.card {
  background: #fff;
  border-radius: 16px;
  overflow: visible;
  position: relative;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  animation: fadeInUp 0.6s ease-out backwards;
  
  &:hover {
    transform: translateY(-8px);
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
  }
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(180deg, transparent 0%, rgba(0, 0, 0, 0.02) 100%);
    pointer-events: none;
    z-index: 1;
    border-radius: 16px;
  }
  
  // 前三名特殊样式
  &.rank-first {
    border: 2px solid #fbbf24;
    box-shadow: 0 8px 16px rgba(251, 191, 36, 0.2);
    
    &:hover {
      box-shadow: 0 20px 40px rgba(251, 191, 36, 0.3);
    }
  }
  
  &.rank-second {
    border: 2px solid #e5e7eb;
    box-shadow: 0 8px 16px rgba(229, 231, 235, 0.2);
    
    &:hover {
      box-shadow: 0 20px 40px rgba(229, 231, 235, 0.3);
    }
  }
  
  &.rank-third {
    border: 2px solid #f97316;
    box-shadow: 0 8px 16px rgba(249, 115, 22, 0.2);
    
    &:hover {
      box-shadow: 0 20px 40px rgba(249, 115, 22, 0.3);
    }
  }
}

// 排名徽章
.rank-badge {
  position: absolute;
  top: -12px;
  left: 12px;
  z-index: 10;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  font-size: 18px;
  color: #fff;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  transition: all 0.3s;
  
  .rank-number {
    position: relative;
    z-index: 2;
  }
  
  .rank-icon {
    position: absolute;
    font-size: 24px;
    z-index: 1;
    opacity: 0.3;
  }
  
  .card:hover & {
    transform: scale(1.1);
  }
  
  // 第一名 - 金色
  &.rank-badge-gold {
    background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
    border: 3px solid #fff;
    
    .rank-number {
      text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
    }
  }
  
  // 第二名 - 银色
  &.rank-badge-silver {
    background: linear-gradient(135deg, #e5e7eb 0%, #d1d5db 100%);
    border: 3px solid #fff;
    
    .rank-number {
      color: #374151;
      text-shadow: 0 1px 2px rgba(255, 255, 255, 0.5);
    }
  }
  
  // 第三名 - 铜色
  &.rank-badge-bronze {
    background: linear-gradient(135deg, #f97316 0%, #ea580c 100%);
    border: 3px solid #fff;
    
    .rank-number {
      text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
    }
  }
  
  // 其他排名
  &:not(.rank-badge-gold):not(.rank-badge-silver):not(.rank-badge-bronze) {
    background: linear-gradient(135deg, var(--primary-color) 0%, var(--secondary-color) 100%);
    border: 3px solid #fff;
    width: 40px;
    height: 40px;
    font-size: 16px;
    top: -10px;
    left: 14px;
    
    .rank-number {
      text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
    }
  }
}

.card-link {
  text-decoration: none;
  color: inherit;
  display: block;
}

.poster-wrapper {
  position: relative;
  width: 100%;
  padding-top: 142.86%; // 7:10 比例
  overflow: hidden;
  background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%);
  border-radius: 16px 16px 0 0;
}

.poster {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: #f3f4f6;
  background-size: cover;
  background-position: center;
  transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  
  .card:hover & {
    transform: scale(1.08);
  }
}

.poster-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(to bottom, transparent 0%, rgba(0, 0, 0, 0.4) 100%);
  opacity: 0;
  transition: opacity 0.3s;
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  padding: 12px;
  z-index: 2;
  
  .card:hover & {
    opacity: 1;
  }
}

.poster-rating {
  display: flex;
  align-items: center;
  gap: 4px;
  background: rgba(0, 0, 0, 0.7);
  color: #fbbf24;
  padding: 6px 10px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 600;
  backdrop-filter: blur(10px);
  
  i {
    font-size: 14px;
  }
}

.poster-play {
  width: 44px;
  height: 44px;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s;
  backdrop-filter: blur(10px);
  
  i {
    font-size: 18px;
    color: var(--primary-color);
    margin-left: 2px;
  }
  
  &:hover {
    background: white;
    transform: scale(1.1);
  }
}

.poster-shine {
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
  transition: left 0.6s;
  z-index: 3;
  pointer-events: none;
  
  .card:hover & {
    left: 100%;
  }
}

.meta {
  padding: 16px;
  position: relative;
  z-index: 1;
  border-radius: 0 0 16px 16px;
  background: #fff;
}

.movie-title {
  margin: 0 0 8px 0;
  font-size: 15px;
  color: #111827;
  font-weight: 600;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  min-height: 42px;
  transition: color 0.3s;
  
  .card-link:hover & {
    color: var(--primary-color);
  }
}

.movie-year {
  margin: 0 0 10px 0;
  color: #6b7280;
  font-size: 13px;
  font-weight: 500;
}

.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 4px;
}

.tag {
  padding: 4px 10px;
  border: none;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 500;
  color: #fff;
  transition: all 0.2s ease;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.15);
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
  transform: translateY(-1px);
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.2);
  opacity: 0.9;
}

.rating-row {
  margin-top: 6px;
  margin-bottom: 4px;
  display: flex;
  align-items: center;
  gap: 6px;
}

.rating-text {
  color: #6b7280;
  font-size: 12px;
  
  &.no-rating {
    color: #9ca3af;
  }
}

// 骨架屏
.skeleton {
  background: #fff;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  animation: fadeInUp 0.6s ease-out backwards;
}

.skeleton-poster {
  width: 100%;
  padding-top: 142.86%;
  background: linear-gradient(90deg, #f3f4f6 25%, #e5e7eb 37%, #f3f4f6 63%);
  background-size: 400% 100%;
  animation: shimmer 1.4s ease infinite;
}

.skeleton-content {
  padding: 16px;
}

.skeleton-title {
  height: 20px;
  background: linear-gradient(90deg, #f3f4f6 25%, #e5e7eb 37%, #f3f4f6 63%);
  background-size: 400% 100%;
  animation: shimmer 1.4s ease infinite;
  border-radius: 4px;
  margin-bottom: 12px;
}

.skeleton-subtitle {
  height: 16px;
  width: 60%;
  background: linear-gradient(90deg, #f3f4f6 25%, #e5e7eb 37%, #f3f4f6 63%);
  background-size: 400% 100%;
  animation: shimmer 1.4s ease infinite;
  border-radius: 4px;
}

// 空状态
.empty {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  padding: 60px 20px;
  
  .empty-icon {
    font-size: 5rem;
    margin-bottom: 24px;
    opacity: 0.6;
  }
  
  .empty-text {
    color: #6b7280;
    font-size: 18px;
    font-weight: 500;
    margin: 0 0 8px 0;
  }
  
  .empty-hint {
    color: #9ca3af;
    font-size: 14px;
    margin: 0;
  }
}

// 分页
.pagination-container {
  margin-top: 50px;
  padding-top: 30px;
  border-top: 1px solid #e5e7eb;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.pagination-info {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: #6b7280;
  font-size: 14px;
  font-weight: 500;
}

.pagination-info .divider {
  margin: 0 8px;
  color: #d1d5db;
}

.page-size-select {
  padding: 8px 12px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background: #fff;
  cursor: pointer;
  font-size: 14px;
  color: #374151;
  transition: all 0.2s;
  
  &:hover {
    border-color: var(--primary-color);
  }
  
  &:focus {
    outline: none;
    border-color: var(--primary-color);
    box-shadow: 0 0 0 3px rgba(255, 115, 29, 0.1);
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
  padding: 10px 14px;
  border: 1px solid #e5e7eb;
  background: #fff;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  color: #374151;
  transition: all 0.2s;
  min-width: 40px;
  
  &:hover:not(:disabled) {
    background: #f9fafb;
    border-color: var(--primary-color);
    color: var(--primary-color);
    transform: translateY(-1px);
  }
  
  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
    background: #f9fafb;
  }
  
  &.active {
    background: var(--primary-color);
    color: #fff;
    border-color: var(--primary-color);
    font-weight: 600;
    box-shadow: 0 2px 8px rgba(255, 115, 29, 0.3);
  }
}

.page-numbers {
  display: flex;
  align-items: center;
  gap: 4px;
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
  width: 60px;
  padding: 8px 10px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  text-align: center;
  font-size: 14px;
  transition: all 0.2s;
  
  &:focus {
    outline: none;
    border-color: var(--primary-color);
    box-shadow: 0 0 0 3px rgba(255, 115, 29, 0.1);
  }
}

.jump-btn {
  padding: 8px 16px;
  border: 1px solid #e5e7eb;
  background: #fff;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  color: #374151;
  transition: all 0.2s;
  
  &:hover {
    background: var(--primary-color);
    border-color: var(--primary-color);
    color: #fff;
    transform: translateY(-1px);
  }
}

// 动画
@keyframes shimmer {
  0% {
    background-position: 100% 0;
  }
  100% {
    background-position: 0 0;
  }
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes bounce {
  0%, 20%, 50%, 80%, 100% {
    transform: translateY(0);
  }
  40% {
    transform: translateY(-10px);
  }
  60% {
    transform: translateY(-5px);
  }
}

// 响应式设计
@media (max-width: 1400px) {
  .grid {
    grid-template-columns: repeat(5, 1fr);
    gap: 20px;
  }
}

@media (max-width: 1200px) {
  .grid {
    grid-template-columns: repeat(4, 1fr);
    gap: 20px;
  }
  
  .page-header {
    padding: 60px 20px 50px;
    
    .page-title {
      font-size: 2.5rem;
    }
  }
}

@media (max-width: 968px) {
  .grid {
    grid-template-columns: repeat(3, 1fr);
    gap: 16px;
  }
  
  .movies-container {
    padding: 0 20px 40px;
  }
}

@media (max-width: 768px) {
  .grid {
    grid-template-columns: repeat(3, 1fr);
    gap: 16px;
  }
  
  .page-header {
    padding: 50px 20px 40px;
    margin-bottom: 40px;
    
    .header-icon {
      font-size: 3rem;
      margin-bottom: 16px;
    }
    
    .page-title {
      font-size: 2rem;
    }
    
    .page-subtitle {
      font-size: 1rem;
    }
    
    .header-stats .stat-item .stat-number {
      font-size: 2rem;
    }
  }
  
  .meta {
    padding: 12px;
  }
  
  .movie-title {
    font-size: 14px;
    min-height: 40px;
  }
}

@media (max-width: 640px) {
  .grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
  }
  
  .page-header {
    .page-title {
      font-size: 1.75rem;
    }
  }
  
  .pagination {
    flex-direction: column;
    gap: 12px;
  }
  
  .page-jump {
    margin-left: 0;
    padding-left: 0;
    border-left: none;
    border-top: 1px solid #e5e7eb;
    padding-top: 12px;
    width: 100%;
    justify-content: center;
  }
}

@media (max-width: 480px) {
  .page-header {
    padding: 40px 16px 30px;
    
    .header-icon {
      font-size: 2.5rem;
    }
    
    .page-title {
      font-size: 1.5rem;
    }
    
    .page-subtitle {
      font-size: 0.9rem;
    }
  }
  
  .movies-container {
    padding: 0 16px 30px;
  }
  
  .grid {
    gap: 10px;
  }
  
  .meta {
    padding: 10px;
  }
  
  .movie-title {
    font-size: 13px;
    min-height: 36px;
  }
  
  // 移动端排名徽章调整
  .rank-badge {
    width: 36px;
    height: 36px;
    font-size: 14px;
    top: -10px;
    left: 10px;
    
    &.rank-badge-gold,
    &.rank-badge-silver,
    &.rank-badge-bronze {
      width: 40px;
      height: 40px;
      font-size: 16px;
    }
    
    &:not(.rank-badge-gold):not(.rank-badge-silver):not(.rank-badge-bronze) {
      width: 32px;
      height: 32px;
      font-size: 13px;
      top: -8px;
      left: 12px;
    }
    
    .rank-icon {
      font-size: 18px;
    }
  }
}
</style>

