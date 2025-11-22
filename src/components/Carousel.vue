<template>
  <div class="carousel-container">
    <div class="carousel-wrapper">
      <div class="carousel-track" :style="{ transform: `translateX(-${currentIndex * cardWidth}px)`, transition: 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)' }">
        <div 
          v-for="(slide, index) in slides" 
          :key="slide.id || index" 
          class="movie-card"
          :class="{ active: index === currentIndex }"
          @click="goToMovie(slide)"
        >
        <div class="card-poster">
          <img :src="slide.image" :alt="slide.title" referrerpolicy="no-referrer" />
          <div class="card-overlay">
            <div class="card-content-overlay">
              <div class="card-header-overlay">
                <h3 class="card-title-overlay">{{ slide.title }}</h3>
                <div class="card-rating-badge">
                  <i class="icon-star"></i>
                  <span>{{ slide.subtitle?.replace('评分 ', '') || '0.0' }}</span>
                </div>
              </div>
              <p class="card-description-overlay">{{ slide.description }}</p>

            </div>
          </div>
          <div class="card-shine"></div>
        </div>
        </div>
      </div>
    </div>

    <!-- 导航点 -->
    <div class="carousel-dots">
      <button 
        v-for="(slide, index) in slides" 
        :key="index"
        class="dot"
        :class="{ active: currentIndex === index }"
        @click="goToSlide(index)"
      ></button>
    </div>

    <!-- 导航箭头 -->
    <button class="carousel-nav prev" @click="prevSlide">
      <i class="icon-arrow-left"></i>
    </button>
    <button class="carousel-nav next" @click="nextSlide">
      <i class="icon-arrow-right"></i>
    </button>

    <!-- 自动播放指示器 -->
    <div class="autoplay-indicator" v-if="autoplay">
      <div class="progress-bar">
        <div class="progress" :style="{ width: `${progress}%` }"></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, getCurrentInstance } from 'vue'
import { fetchHotMovies } from '@/api/movies'
import { useRouter } from 'vue-router'

// 响应式数据
const currentIndex = ref(0) // 从0开始
const autoplay = ref(true)
const progress = ref(0)
const autoplayInterval = ref(null)
const progressInterval = ref(null)
const loading = ref(false)
const isTransitioning = ref(true)
const cardWidth = ref(600) // 卡片宽度（包含间距，550px卡片 + 50px间距）
const visibleCards = ref(3) // 可见卡片数量

// 获取路由实例
const router = useRouter()

// 获取全局通知服务
const instance = getCurrentInstance();
const $notification = instance?.proxy;

// 通知辅助函数
const notify = {
  success: (message) => $notification?.$notification?.success?.(message),
  error: (message) => $notification?.$notification?.error?.(message),
  warning: (message) => $notification?.$notification?.warning?.(message),
  info: (message) => $notification?.$notification?.info?.(message)
};

// 轮播图数据
const slides = ref([])

// 加载热映电影数据
const loadTopRatedMovies = async () => {
  if (loading.value) return
  loading.value = true
  try {
    // 调用fetchHotMovies接口并传入size参数
    const response = await fetchHotMovies({ size: 10 })
    // 添加健壮的错误检查，确保response和response.movies存在
    if (response && response.movies && Array.isArray(response.movies)) {
      // 调整数据转换逻辑，确保字段名匹配模板中的使用
      slides.value = response.movies.map(movie => ({
        id: movie.id,
        image: movie.poster || '',
        title: movie.title,
        subtitle: movie.rating ? `评分 ${movie.rating}` : '评分 0.0',
        description: movie.summary || '',
        link: `/movie/${movie.id}`
      }))
      // 重置当前索引到第一个
      currentIndex.value = 0
    } else {
      // 如果数据结构不正确，使用空数组
      console.warn('电影数据结构不正确，使用空数据')
      slides.value = []
      currentIndex.value = 0
    }
  } catch (error) {
    console.error('加载热映电影失败:', error)
    // 如果加载失败，不再使用默认数据
    slides.value = []
    currentIndex.value = 0
  } finally {
    loading.value = false
  }
}

// 方法
const nextSlide = () => {
  if (slides.value.length <= 1) return
  
  // 每次移动一张卡片
  currentIndex.value++
  resetAutoplay()
  
  // 如果到达最后一张，直接跳转到第一张
  if (currentIndex.value >= slides.value.length) {
    currentIndex.value = 0
  }
}

const prevSlide = () => {
  if (slides.value.length <= 1) return
  
  // 每次移动一张卡片
  currentIndex.value--
  resetAutoplay()
  
  // 如果到达第一张，直接跳转到最后一张
  if (currentIndex.value < 0) {
    currentIndex.value = slides.value.length - 1
  }
}

const goToMovie = (slide) => {
  // 点击卡片跳转到电影详情页
  if (slide && slide.link) {
    // 使用Vue Router进行路由跳转
    router.push(slide.link)
  } else if (slide && slide.id) {
    // 兜底方案：如果没有link属性，使用id构建默认路径
    router.push(`/movie/${slide.id}`)
  }
}

const goToSlide = (index) => {
  currentIndex.value = index
  resetAutoplay()
}

const playTrailer = (slide) => {
  // 模拟播放预告片
  notify.info(`播放 ${slide.title} 的预告片`)
}

const startAutoplay = () => {
  if (!autoplay.value) return
  
  autoplayInterval.value = setInterval(() => {
    nextSlide()
  }, 5000)
  
  startProgress()
}

const stopAutoplay = () => {
  if (autoplayInterval.value) {
    clearInterval(autoplayInterval.value)
    autoplayInterval.value = null
  }
  if (progressInterval.value) {
    clearInterval(progressInterval.value)
    progressInterval.value = null
  }
}

const resetAutoplay = () => {
  stopAutoplay()
  progress.value = 0
  startAutoplay()
}

const startProgress = () => {
  progress.value = 0
  progressInterval.value = setInterval(() => {
    progress.value += 2 // 5秒内完成，每50ms增加1%
    if (progress.value >= 100) {
      progress.value = 0
    }
  }, 100)
}

// 计算卡片宽度（响应式）
const updateCardWidth = () => {
  // 根据屏幕宽度调整可见卡片数和卡片大小
  const width = window.innerWidth
  if (width <= 480) {
    visibleCards.value = 1
    cardWidth.value = 420
  } else if (width <= 768) {
    visibleCards.value = 2
    cardWidth.value = 500
  } else {
    visibleCards.value = 3
    cardWidth.value = 600
  }
}

// 生命周期
onMounted(async () => {
  updateCardWidth()
  window.addEventListener('resize', updateCardWidth)
  
  // 加载热映电影数据
  await loadTopRatedMovies()
  // 确保有数据后再启动自动播放
  if (slides.value.length > 0) {
    startAutoplay()
  }
})

onUnmounted(() => {
  stopAutoplay()
  window.removeEventListener('resize', updateCardWidth)
})
</script>

<style lang="scss" scoped>
// 轮播图容器背景改为米黄色
.carousel-container {
  position: relative;
  width: 100%;
  padding: 40px 0;
  background: linear-gradient(135deg, #fffbeb 0%, #fef3c7 50%, #fde68a 100%);
  overflow: hidden;
  transition: background 0.3s ease;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: 
      radial-gradient(circle at 20% 30%, rgba(59, 130, 246, 0.08) 0%, transparent 50%),
      radial-gradient(circle at 80% 70%, rgba(249, 115, 22, 0.08) 0%, transparent 50%);
    pointer-events: none;
    transition: background 0.3s ease;
  }
}

// 暗色模式下的背景
:root.dark .carousel-container {
  background: linear-gradient(135deg, #4a4538 0%, #5a5548 50%, #4a4538 100%);
  
  &::before {
    background: 
      radial-gradient(circle at 20% 30%, rgba(251, 191, 36, 0.1) 0%, transparent 50%),
      radial-gradient(circle at 80% 70%, rgba(249, 115, 22, 0.08) 0%, transparent 50%);
  }
}

.carousel-wrapper {
  position: relative;
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 80px;
  overflow: visible;
}

.carousel-track {
  display: flex;
  gap: 50px;
  align-items: center;
  will-change: transform;
  height: 850px;
}

.movie-card {
  flex-shrink: 0;
  width: 550px;
  height: 800px;
  background: white;
  border-radius: 24px;
  overflow: hidden;
  box-shadow: 
    0 4px 6px -1px rgba(0, 0, 0, 0.1),
    0 2px 4px -1px rgba(0, 0, 0, 0.06);
  transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  position: relative;
  border: 1px solid rgba(226, 232, 240, 0.8);
  z-index: 1;
  
  &:not(.active) {
    transform: scale(0.85);
    opacity: 0.7;
    z-index: 0;
  }
  
  &.active {
    transform: scale(1);
    z-index: 10;
    box-shadow: 
      0 25px 50px -12px rgba(0, 0, 0, 0.4),
      0 0 0 1px rgba(59, 130, 246, 0.2);
    border-color: rgba(59, 130, 246, 0.3);
  }
  
  &:hover {
    transform: scale(1.05);
    z-index: 15;
    box-shadow: 
      0 30px 60px -12px rgba(0, 0, 0, 0.5),
      0 0 0 1px rgba(59, 130, 246, 0.3);
    border-color: rgba(59, 130, 246, 0.4);
  }
}

.card-poster {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.8s cubic-bezier(0.4, 0, 0.2, 1);
  }
  
  .movie-card:hover & img {
    transform: scale(1.1);
  }
  
  .card-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(
      to bottom,
      rgba(0, 0, 0, 0.2) 0%,
      rgba(0, 0, 0, 0.4) 50%,
      rgba(0, 0, 0, 0.9) 100%
    );
    display: flex;
    align-items: flex-end;
    padding: 0;
    opacity: 1;
    transition: opacity 0.4s ease;
  }
  
  .card-content-overlay {
    width: 100%;
    padding: 30px;
    color: white;
  }
  
  .card-header-overlay {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 15px;
    margin-bottom: 15px;
  }
  
  .card-title-overlay {
    font-size: 1.8rem;
    font-weight: 800;
    color: white;
    margin: 0;
    line-height: 1.3;
    flex: 1;
    text-shadow: 0 2px 8px rgba(0, 0, 0, 0.5);
    letter-spacing: -0.02em;
  }
  
  .card-rating-badge {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    background: rgba(0, 0, 0, 0.6);
    backdrop-filter: blur(10px);
    padding: 8px 14px;
    border-radius: 20px;
    color: white;
    font-size: 1rem;
    font-weight: 700;
    border: 1px solid rgba(255, 255, 255, 0.2);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    flex-shrink: 0;
    
    i {
      color: #fbbf24;
      font-size: 1.1rem;
      filter: drop-shadow(0 0 4px rgba(251, 191, 36, 0.5));
    }
  }
  
  .card-description-overlay {
    font-size: 1rem;
    color: rgba(255, 255, 255, 0.9);
    margin: 0 0 20px 0;
    line-height: 1.6;
    text-shadow: 0 1px 4px rgba(0, 0, 0, 0.5);
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
  
  .card-link-overlay {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    color: white;
    text-decoration: none;
    font-weight: 600;
    font-size: 1rem;
    padding: 12px 24px;
    background: rgba(59, 130, 246, 0.9);
    backdrop-filter: blur(10px);
    border-radius: 12px;
    transition: all 0.3s ease;
    border: 1px solid rgba(255, 255, 255, 0.2);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    
    &:hover {
      background: rgba(59, 130, 246, 1);
      transform: translateX(4px);
      box-shadow: 0 6px 16px rgba(59, 130, 246, 0.4);
    }
    
    i {
      font-size: 0.9rem;
      transition: transform 0.3s ease;
    }
    
    &:hover i {
      transform: translateX(4px);
    }
  }
  
  .card-shine {
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: linear-gradient(
      45deg,
      transparent 30%,
      rgba(255, 255, 255, 0.1) 50%,
      transparent 70%
    );
    transform: rotate(45deg);
    transition: all 0.6s ease;
    opacity: 0;
  }
  
  .movie-card:hover & .card-shine {
    animation: shine 1.5s ease-in-out;
  }
}



// 导航点
.carousel-dots {
  display: flex;
  justify-content: center;
  gap: 12px;
  margin-top: 30px;
  padding: 0 20px;
}

.dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  border: 2px solid #cbd5e1;
  background: transparent;
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 0;
    height: 0;
    border-radius: 50%;
    background: #3b82f6;
    transition: all 0.4s ease;
  }
  
  &:hover {
    border-color: #3b82f6;
    transform: scale(1.3);
    
    &::before {
      width: 4px;
      height: 4px;
    }
  }
  
  &.active {
    border-color: #3b82f6;
    background: #3b82f6;
    transform: scale(1.4);
    box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.2);
    
    &::before {
      width: 6px;
      height: 6px;
    }
  }
}

// 导航箭头
.carousel-nav {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 56px;
  height: 56px;
  background: white;
  border: 2px solid #e2e8f0;
  border-radius: 50%;
  color: #475569;
  font-size: 20px;
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 
    0 4px 6px -1px rgba(0, 0, 0, 0.1),
    0 2px 4px -1px rgba(0, 0, 0, 0.06);
  backdrop-filter: blur(10px);
  
  &:hover {
    background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
    border-color: #3b82f6;
    color: white;
    transform: translateY(-50%) scale(1.15);
    box-shadow: 
      0 10px 15px -3px rgba(59, 130, 246, 0.3),
      0 4px 6px -2px rgba(59, 130, 246, 0.2);
  }
  
  &:active {
    transform: translateY(-50%) scale(1.05);
  }
  
  &.prev {
    left: -20px;
  }
  
  &.next {
    right: -20px;
  }
  
  @media (max-width: 768px) {
    width: 44px;
    height: 44px;
    font-size: 16px;
    
    &.prev {
      left: -15px;
    }
    
    &.next {
      right: -15px;
    }
  }
  
  @media (max-width: 480px) {
    width: 36px;
    height: 36px;
    font-size: 14px;
    
    &.prev {
      left: -10px;
    }
    
    &.next {
      right: -10px;
    }
  }
}

// 自动播放指示器
.autoplay-indicator {
  display: flex;
  justify-content: center;
  margin-top: 20px;
  padding: 0 20px;
  
  .progress-bar {
    width: 200px;
    height: 4px;
    background: #e5e7eb;
    border-radius: 2px;
    overflow: hidden;
  }
}

.progress {
  height: 100%;
  background: #3b82f6;
  border-radius: 2px;
  transition: width 0.1s linear;
}

// 按钮样式
.btn {
  padding: 12px 24px;
  border-radius: 8px;
  text-decoration: none;
  font-weight: 600;
  transition: all 0.3s ease;
  border: 2px solid transparent;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-size: 16px;
  
  &.btn-primary {
    background: var(--primary-color);
    color: white;
    border-color: var(--primary-color);
    
    &:hover {
      background: var(--primary-dark);
      border-color: var(--primary-dark);
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(249, 115, 22, 0.3);
    }
  }
  
  &.btn-outline {
    background: transparent;
    color: white;
    border-color: rgba(255, 255, 255, 0.8);
    
    &:hover {
      background: rgba(255, 255, 255, 0.1);
      border-color: white;
      transform: translateY(-2px);
    }
  }
  
  &.btn-lg {
    padding: 16px 32px;
    font-size: 18px;
    
    @media (max-width: 480px) {
      padding: 14px 28px;
      font-size: 16px;
    }
  }
}

// 动画效果
.carousel-slide {
  &.active {
    .slide-title {
      animation: slideInUp 0.8s ease-out;
    }
    
    .slide-description {
      animation: slideInUp 0.8s ease-out 0.2s both;
    }
    
    .slide-actions {
      animation: slideInUp 0.8s ease-out 0.4s both;
    }
  }
}

@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

// 响应式设计
@media (max-width: 1024px) {
  .carousel-track {
    height: 750px;
  }
  
  .movie-card {
    width: 450px;
    height: 700px;
  }
  
  .card-title-overlay {
    font-size: 1.8rem;
  }
}

@media (max-width: 768px) {
  .carousel-container {
    padding: 30px 0;
  }
  
  .carousel-wrapper {
    padding: 0 60px;
  }
  
  .carousel-track {
    height: 700px;
  }
  
  .movie-card {
    width: 380px;
    height: 650px;
  }
  
  .card-content-overlay {
    padding: 32px;
  }
  
  .card-title-overlay {
    font-size: 1.6rem;
  }
  
  .card-description-overlay {
    font-size: 1rem;
  }
}

@media (max-width: 480px) {
  .carousel-container {
    padding: 20px 0;
  }
  
  .carousel-wrapper {
    padding: 0 50px;
  }
  
  .carousel-track {
    height: 650px;
  }
  
  .movie-card {
    width: 320px;
    height: 600px;
  }
  
  .card-content-overlay {
    padding: 28px;
  }
  
  .card-title-overlay {
    font-size: 1.4rem;
  }
  
  .card-description-overlay {
    font-size: 0.95rem;
    -webkit-line-clamp: 2;
  }
  
  .card-link-overlay {
    padding: 12px 24px;
    font-size: 1rem;
  }
}

// 动画效果
@keyframes float {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}

@keyframes shine {
  0% {
    transform: translateX(-100%) translateY(-100%) rotate(45deg);
    opacity: 0;
  }
  50% {
    opacity: 1;
  }
  100% {
    transform: translateX(100%) translateY(100%) rotate(45deg);
    opacity: 0;
  }
}
</style>
