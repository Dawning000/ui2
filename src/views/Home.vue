<template>
  <div class="home">
    <!-- 轮播图 -->
    <Carousel />
    
    <!-- 英雄区域 -->
    <section class="hero">
      <div class="hero-bg">
        <span class="hero-glow glow-1"></span>
        <span class="hero-glow glow-2"></span>
        <span class="hero-gradient gradient-1"></span>
        <span class="hero-gradient gradient-2"></span>
        <span 
          v-for="spark in heroSparkles" 
          :key="`spark-${spark.id}`" 
          class="hero-spark"
          :style="{ animationDelay: spark.delay, left: spark.left, top: spark.top }"
        ></span>
      </div>
      <div class="hero-grid">
        <div class="hero-content">
          <div class="hero-header">
            <span class="hero-icon">🍊</span>
            <div>
              <p class="hero-tagline">给影迷的橘色乌托邦</p>
              <h1 class="hero-title">橘橙影志</h1>
            </div>
          </div>
          <h2 class="hero-subtitle">橘橙暖时光，影志话悠长</h2>
          <p class="hero-description">
            在梦幻的橙色光晕中穿梭，邂逅热烈的影像、真挚的交流与呼吸感十足的沉浸体验。
            一起在这里收藏每一次心动的电影瞬间。
          </p>
          <div class="hero-badges">
            <router-link 
              v-for="badge in heroBadges" 
              :key="badge.tab" 
              :to="badge.to"
              class="hero-badge"
            >
              <i class="icon-sparkles"></i>{{ badge.label }}
            </router-link>
          </div>
          <div class="hero-actions">
            <router-link to="/forum" class="btn btn-primary btn-lg">
              <span class="btn-icon">🍊</span>
              开始探索
            </router-link>
            <router-link to="/register" class="btn btn-outline btn-lg">
              <span class="btn-icon">✨</span>
              立即加入
            </router-link>
          </div>
          <ul class="hero-metrics">
            <li v-for="metric in heroStats" :key="metric.label" class="metric-item">
              <span class="metric-value">{{ metric.value }}</span>
              <span class="metric-label">{{ metric.label }}</span>
              <span class="metric-desc">{{ metric.description }}</span>
            </li>
          </ul>
        </div>
        <div class="hero-showcase">
          <div class="showcase-frame">
            <div class="showcase-halo"></div>
            <div class="showcase-radar"></div>
            <div class="floating-cards">
              <div class="movie-card" v-for="(movie, index) in featuredMovies" :key="movie.id" 
                   :style="{ animationDelay: `${index * 0.2}s` }">
                <img :src="movie.poster" :alt="movie.title" referrerpolicy="no-referrer" />
                <div class="card-overlay">
                  <h4>{{ movie.title }}</h4>
                  <p>{{ movie.rating }}分</p>
                </div>
              </div>
            </div>
            <div class="showcase-label">
              <span class="label-title">今日精选</span>
              <p>实时刷新 · 高能推荐</p>
            </div>
          </div>
          <div class="hero-marquee">
            <div class="marquee-track">
              <span v-for="movie in featuredMovies" :key="`marquee-${movie.id}`">
                {{ movie.title }} · {{ movie.rating }}分
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 热门分类 -->
    <section class="categories reveal" :ref="registerSection">
      <div class="container">
        <h2 class="section-title">热门分类</h2>
        <p class="section-subtitle">浏览你感兴趣的内容，发现精彩影视作品</p>
        <div class="categories-grid">
          <router-link 
            v-for="(category, index) in categories" 
            :key="category.id"
            :to="{ name: 'Search', query: { type: category.slug } }"
            class="category-card"
            :style="{ 
              '--card-delay': `${index * 80}ms`,
              '--accent-start': category.gradient[0],
              '--accent-end': category.gradient[1]
            }"
          >
            <div class="category-ornament">
              <span class="ornament-ring"></span>
              <span class="ornament-glow"></span>
              <span class="ornament-beam"></span>
            </div>
            <div class="category-icon">
              <span class="icon-glow"></span>
              <span class="icon-ring"></span>
              <i :class="category.icon"></i>
            </div>
            <span class="category-chip">{{ category.chipText }}</span>
            <h3>{{ category.name }}</h3>
            <p>{{ category.description }}</p>
            <div class="category-stats">
              <span class="count">{{ category.postsCount }}</span>
              <span class="suffix">部作品</span>
            </div>
          </router-link>
        </div>
      </div>
    </section>

    <!-- 热门帖子 -->
    <section class="hot-posts reveal" :ref="registerSection">
      <div class="container">
        <div class="section-header">
          <h2 class="section-title">热门讨论</h2>
          <router-link to="/forum" class="view-all-link">查看全部</router-link>
        </div>
        <div class="posts-grid">
          <div 
            v-for="(post, index) in hotPosts.slice(0, 3)" 
            :key="post.id" 
            class="post-card"
            :style="{ '--card-delay': `${index * 120}ms` }"
            @click="goToPost(post.id)"
            role="button"
            tabindex="0"
            @keyup.enter="goToPost(post.id)"
          >
            <div class="post-header">
              <div class="post-meta">
                <img :src="post.author?.avatar || '/avatar.png'" :alt="post.author?.username || '未知用户'" class="author-avatar" referrerpolicy="no-referrer" @error="e => e.target.src = '/avatar.png'" />
                <div class="author-info">
                  <span class="author-name">{{ post.author?.nickname || post.author?.username || '未知用户' }}</span>
                  <span class="post-time">{{ formatTime(post.createTime) }}</span>
                </div>
              </div>
              <div class="post-category">
                <span :class="`category-tag category-${post.category}`">{{ post.categoryName }}</span>
              </div>
            </div>
            <div class="post-content">
              <h3 class="post-title">{{ post.title }}</h3>
              <p class="post-excerpt">{{ post.excerpt }}</p>
            </div>
            <div class="post-footer">
              <div class="post-stats">
                <span class="stat">
                  <i class="icon-eye"></i>
                  {{ post.views }}
                </span>
                <span class="stat">
                  <i class="icon-comment"></i>
                  {{ post.comments }}
                </span>
                <span class="stat">
                  <i class="icon-like"></i>
                  {{ post.likes }}
                </span>
              </div>
              <router-link :to="`/post/${post.id}`" class="read-more">
                阅读更多
              </router-link>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 最新电影推荐 -->
    <section class="movie-recommendations reveal" :ref="registerSection">
      <div class="container">
        <h2 class="section-title">最新电影推荐</h2>
        <div class="movies-slider">
          <div 
            class="movie-item" 
            v-for="(movie, index) in latestMovies" 
            :key="movie.id"
            :style="{ '--card-delay': `${index * 60}ms` }"
          >
            <div class="movie-poster">
              <img :src="movie.poster" :alt="movie.title" referrerpolicy="no-referrer" />
              <div class="movie-rating" v-if="movie.rating > 0">
                <i class="icon-star"></i>
                <span>{{ movie.rating }}</span>
              </div>
            </div>
            <div class="movie-info">
              <h4 class="movie-title">{{ movie.title }}</h4>
              <p class="movie-genre" v-if="movie.genre">{{ movie.genre }}</p>
              <p class="movie-year" v-if="movie.year">{{ movie.year }}</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 统计数据 -->
    <section class="stats reveal" :ref="registerSection">
      <div class="container">
        <div class="stats-grid">
          <div class="stat-item">
            <div class="stat-number">{{ stats.totalUsers.toLocaleString() }}</div>
            <div class="stat-label">注册用户</div>
          </div>
          <div class="stat-item">
            <div class="stat-number">{{ stats.totalPosts.toLocaleString() }}</div>
            <div class="stat-label">讨论帖子</div>
          </div>
          <div class="stat-item">
            <div class="stat-number">{{ stats.totalComments.toLocaleString() }}</div>
            <div class="stat-label">用户评论</div>
          </div>
          <div class="stat-item">
            <div class="stat-number">{{ stats.onlineUsers.toLocaleString() }}</div>
            <div class="stat-label">在线用户</div>
          </div>
        </div>
      </div>
    </section>

  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import Carousel from '../components/Carousel.vue'
import { fetchMovies } from '@/api/movies'
import { fetchRandomPosts, getCategoryName, extractExcerpt } from '@/api/posts'

// 响应式数据
const router = useRouter()
const userStore = useUserStore()

const featuredMovies = ref([])

const categories = ref([
  {
    id: 1,
    name: '电影',
    slug: 'movie',
    icon: 'icon-film',
    chipText: '光影臻藏',
    description: '最新院线大片/冷门佳片合集',
    postsCount: 1234,
    gradient: ['#ff8a00', '#ff5100']
  },
  {
    id: 2,
    name: '电视剧',
    slug: 'tv',
    icon: 'icon-tv',
    chipText: '剧荒救星',
    description: '热播剧集/经典老剧/海外剧集',
    postsCount: 856,
    gradient: ['#ff6b1a', '#f43f5e']
  },
  {
    id: 3,
    name: '综艺',
    slug: 'variety',
    icon: 'icon-variety',
    chipText: '综娱盛宴',
    description: '热门综艺节目/脱口秀/选秀/音乐节目',
    postsCount: 432,
    gradient: ['#ffa62e', '#f97316']
  }
])

const hotPosts = ref([])

const latestMovies = ref([])

const stats = ref({
  totalUsers: 125678,
  totalPosts: 45678,
  totalComments: 234567,
  onlineUsers: 1234
})

const heroBadges = computed(() => {
  const userId = userStore.user?.id
  if (!userId) {
    // 如果用户未登录，跳转到登录页面
    return [
      { label: '影帖创作', tab: 'posts', to: '/login' },
      { label: '珍影收藏', tab: 'favorites', to: '/login' },
      { label: '影人关注', tab: 'following', to: '/login' }
    ]
  }
  // 如果用户已登录，跳转到个人中心对应的 tab
  return [
    { label: '影帖创作', tab: 'posts', to: `/user/${userId}?tab=posts` },
    { label: '珍影收藏', tab: 'favorites', to: `/user/${userId}?tab=favorites` },
    { label: '影人关注', tab: 'following', to: `/user/${userId}?tab=following` }
  ]
})

const heroSparkles = ref(
  Array.from({ length: 12 }).map((_, index) => ({
    id: index,
    left: `${10 + Math.random() * 80}%`,
    top: `${5 + Math.random() * 90}%`,
    delay: `${index * 0.4}s`
  }))
)

const heroStats = computed(() => [
  {
    label: '影迷社群',
    value: `${stats.value.totalUsers.toLocaleString()}+`,
    description: '一起发掘私藏佳片'
  },
  {
    label: '热度帖子',
    value: `${stats.value.totalPosts.toLocaleString()}+`,
    description: '多元观点即刻抵达'
  },
  {
    label: '互动火花',
    value: `${stats.value.totalComments.toLocaleString()}+`,
    description: '灵感碰撞实时发生'
  }
])

const animatedSections = ref([])
let observer

const registerSection = (el) => {
  if (el && !animatedSections.value.includes(el)) {
    animatedSections.value.push(el)
    if (observer) {
      observer.observe(el)
    }
  }
}

// 方法
const formatTime = (dateStr) => {
  const now = new Date()
  const date = new Date(dateStr)
  const diff = now - date
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const minutes = Math.floor(diff / (1000 * 60))
  
  if (hours > 24) {
    return `${Math.floor(hours / 24)}天前`
  } else if (hours > 0) {
    return `${hours}小时前`
  } else {
    return `${minutes}分钟前`
  }
}

/**
 * 加载随机帖子数据
 */
async function loadRandomPosts() {
  try {
    const response = await fetchRandomPosts(3);
    if (response?.data?.posts && Array.isArray(response.data.posts)) {
      hotPosts.value = response.data.posts.map(post => ({
        id: post.id,
        title: post.title,
        content: post.content,
        excerpt: extractExcerpt(post.content),
        author: post.author,
        category: post.category,
        categoryName: getCategoryName(post.category),
        createTime: post.createTime,
        views: post.views,
        likes: post.likes,
        comments: post.commentsCount
      }));
    }
  } catch (error) {
    console.error('加载随机帖子失败:', error);
  }
}

const goToPost = (postId) => {
  if (!postId) return
  router.push(`/post/${postId}`)
}

function avgRating(ratings) {
  if (!Array.isArray(ratings) || ratings.length === 0) return 0
  const sum = ratings.reduce((a, b) => a + Number(b || 0), 0)
  return Number((sum / ratings.length).toFixed(1))
}

async function loadMovies() {
  // Featured 区域：取第一页 6 条
  const data1 = await fetchMovies({ page: 1, size: 6 })
  const items1 = Array.isArray(data1?.movies) ? data1.movies : []
  featuredMovies.value = items1.map(m => ({
    id: m.id,
    title: m.title,
    poster: m.poster,
    rating: m.rating || 0
  }))
}

/**
 * 加载猫眼电影数据
 */
async function loadMaoyanMovies() {
  try {
    const response = await fetch('https://apis.netstart.cn/maoyan/index/movieOnInfoList')
    const data = await response.json()
    
    if (data?.movieList && Array.isArray(data.movieList)) {
      latestMovies.value = data.movieList.slice(0, 12).map(movie => {
        // 从上映日期提取年份
        let year = ''
        if (movie.rt) {
          const dateParts = movie.rt.split('-')
          if (dateParts.length > 0) {
            year = dateParts[0]
          }
        }
        
        return {
          id: movie.id,
          title: movie.nm || '未知电影',
          poster: movie.img || '',
          genre: movie.star || '', // 使用演员信息作为genre显示
          year: year,
          rating: movie.sc || 0 // 评分
        }
      })
    }
  } catch (error) {
    console.error('加载猫眼电影数据失败:', error)
    // 如果API调用失败，使用原来的方法作为后备
    const data2 = await fetchMovies({ page: 1, size: 12 })
    const items2 = Array.isArray(data2?.movies) ? data2.movies : []
    latestMovies.value = items2.map(m => ({
      id: m.id,
      title: m.title,
      poster: m.poster,
      genre: Array.isArray(m.tag) ? m.tag.join(',') : (m.tag || ''),
      year: String(m.year || ''),
      rating: m.rating || 0
    }))
  }
}

onMounted(() => {
  loadMovies()
  loadMaoyanMovies()
  loadRandomPosts()

  observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view')
        }
      })
    },
    { threshold: 0.2 }
  )

  animatedSections.value.forEach(section => observer.observe(section))
})

onUnmounted(() => {
  if (observer) {
    observer.disconnect()
  }
})
</script>

<style lang="scss" scoped>
.home {
  min-height: 100vh;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.reveal {
  opacity: 0;
  transform: translateY(60px) scale(0.98);
  filter: blur(8px);
  transition: opacity 0.8s ease, transform 0.8s ease, filter 0.8s ease;
}

.reveal.in-view {
  opacity: 1;
  transform: translateY(0) scale(1);
  filter: blur(0);
}

// 英雄区域
.hero {
  position: relative;
  color: white;
  padding: 110px 0 120px;
  overflow: hidden;
  background: radial-gradient(circle at 20% 20%, rgba(255, 149, 41, 0.4), transparent 46%),
              radial-gradient(circle at 80% 10%, rgba(255, 98, 0, 0.38), transparent 52%),
              linear-gradient(135deg, #210800 0%, #120200 35%, #1f0800 100%);
}

.hero::after {
  content: '';
  position: absolute;
  inset: 0;
  background: url('https://www.transparenttextures.com/patterns/asfalt-dark.png');
  opacity: 0.2;
  mix-blend-mode: screen;
}

.hero-bg {
  position: absolute;
  inset: 0;
  overflow: hidden;
}

.hero-glow {
  position: absolute;
  width: 480px;
  height: 480px;
  background: radial-gradient(circle, rgba(255, 140, 0, 0.6) 0%, rgba(255, 140, 0, 0) 60%);
  filter: blur(12px);
  opacity: 0.6;
  animation: pulse 6s ease-in-out infinite;
}

.glow-1 {
  top: -120px;
  left: -80px;
}

.glow-2 {
  bottom: -160px;
  right: -100px;
  animation-delay: 1.5s;
}

.hero-gradient {
  position: absolute;
  width: 120%;
  height: 120%;
  opacity: 0.2;
  mix-blend-mode: screen;
  filter: blur(10px);
}

.gradient-1 {
  background: conic-gradient(from 120deg, rgba(255, 115, 29, 0), rgba(255, 115, 29, 0.6), rgba(255, 115, 29, 0));
  animation: rotate 24s linear infinite;
}

.gradient-2 {
  background: conic-gradient(from 240deg, rgba(255, 186, 73, 0), rgba(255, 186, 73, 0.45), rgba(255, 186, 73, 0));
  animation: rotateReverse 30s linear infinite;
}

.hero-spark {
  position: absolute;
  width: 2px;
  height: 50px;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0), rgba(255, 186, 73, 0.8), rgba(255, 255, 255, 0));
  animation: sparkle 6s linear infinite;
  pointer-events: none;
}

.hero-spark:nth-child(odd) {
  transform: rotate(40deg);
}

.hero-grid {
  position: relative;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 60px;
  align-items: center;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  z-index: 2;
}

.hero-content {
  position: relative;
  z-index: 2;
}

.hero-header {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 20px;
  
  .hero-icon {
    font-size: 4rem;
    animation: bounce 2s infinite;
  }
}

.hero-tagline {
  font-size: 0.95rem;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.65);
  margin-bottom: 8px;
}

.hero-title {
  font-size: 3.5rem;
  font-weight: 800;
  margin: 0;
  line-height: 1.2;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
}

.hero-subtitle {
  font-size: 1.8rem;
  font-weight: 600;
  margin-bottom: 20px;
  opacity: 0.95;
  line-height: 1.4;
  color: #fbbf24;
  font-style: italic;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.3);
}

.hero-description {
  font-size: 1.25rem;
  margin-bottom: 40px;
  opacity: 0.9;
  line-height: 1.6;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.3);
}

.hero-badges {
  display: flex;
  flex-wrap: wrap;
  gap: 14px;
  margin-bottom: 32px;
}

.hero-badge {
  padding: 8px 16px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.12);
  font-size: 0.95rem;
  letter-spacing: 0.04em;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  backdrop-filter: blur(6px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
}

.hero-actions {
  display: flex;
  gap: 20px;
  
  .btn {
    display: flex;
    align-items: center;
    gap: 8px;
    
    .btn-icon {
      font-size: 1.2em;
    }
  }
}

.hero-metrics {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 18px;
  margin-top: 40px;
  margin-bottom: 0;
  padding: 20px;
  border-radius: 24px;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.12);
  backdrop-filter: blur(10px);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.25);
  list-style: none;
}

.metric-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.metric-value {
  font-size: 1.6rem;
  font-weight: 700;
  color: #ffb347;
}

.metric-label {
  font-size: 0.85rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.6);
}

.metric-desc {
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.8);
}

.hero-showcase {
  position: relative;
  padding: 20px;
}

.showcase-frame {
  position: relative;
  border-radius: 36px;
  padding: 45px;
  background: rgba(12, 4, 0, 0.6);
  border: 1px solid rgba(255, 153, 43, 0.3);
  box-shadow: 0 30px 80px rgba(0, 0, 0, 0.45);
  overflow: hidden;
  isolation: isolate;
}

.showcase-halo,
.showcase-radar {
  position: absolute;
  inset: 15%;
  border-radius: 50%;
  border: 1px solid rgba(255, 255, 255, 0.1);
  animation: pulse 12s ease-in-out infinite;
}

.showcase-radar {
  animation-duration: 18s;
  border-color: rgba(255, 115, 29, 0.35);
}

.floating-cards {
  position: relative;
  height: 320px;
}

.movie-card {
  position: absolute;
  width: 140px;
  height: 210px;
  border-radius: 18px;
  overflow: hidden;
  box-shadow: 0 25px 60px rgba(0, 0, 0, 0.4);
  animation: float 6s ease-in-out infinite;
  border: 1px solid rgba(255, 255, 255, 0.08);
  
  &:nth-child(1) {
    top: 10px;
    left: 20px;
    transform: rotate(-6deg);
  }
  
  &:nth-child(2) {
    top: 40px;
    right: 30px;
    transform: rotate(8deg);
  }
  
  &:nth-child(3) {
    bottom: 10px;
    left: 110px;
    transform: rotate(-2deg);
  }
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  
  .card-overlay {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    background: linear-gradient(transparent, rgba(0, 0, 0, 0.9));
    padding: 18px;
    color: white;
    
    h4 {
      font-size: 13px;
      margin: 0 0 5px 0;
      font-weight: 600;
    }
    
    p {
      font-size: 11px;
      margin: 0;
      color: #fbbf24;
    }
  }
}

.showcase-label {
  position: absolute;
  bottom: 24px;
  left: 24px;
  padding: 14px 20px;
  border-radius: 16px;
  background: rgba(0, 0, 0, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  text-transform: uppercase;
  letter-spacing: 0.2em;
  font-size: 0.75rem;
}

.showcase-label .label-title {
  display: block;
  font-weight: 700;
  color: #ffae42;
}

.hero-marquee {
  margin-top: 24px;
  border-radius: 999px;
  border: 1px solid rgba(255, 255, 255, 0.15);
  overflow: hidden;
  position: relative;
  background: rgba(255, 255, 255, 0.04);
}

.marquee-track {
  display: flex;
  gap: 32px;
  padding: 12px 0;
  animation: marquee 18s linear infinite;
  white-space: nowrap;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.78);
}

@keyframes float {
  0%, 100% {
    transform: translateY(0px) rotate(var(--rotation, 0deg));
  }
  50% {
    transform: translateY(-18px) rotate(var(--rotation, 0deg));
  }
}
.categories {
  padding: 110px 0;
  position: relative;
  overflow: hidden;
  background:
    radial-gradient(1200px 300px at 20% 0%, rgba(255, 186, 73, 0.18), transparent 60%),
    radial-gradient(1200px 300px at 80% 0%, rgba(255, 115, 29, 0.16), transparent 60%),
    var(--bg-secondary);
}


// 通用样式
.section-title {
  font-size: 2.5rem;
  font-weight: 700;
  text-align: center;
  margin-bottom: 50px;
  color: #1f2937;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 40px;
}

.view-all-link {
  color: #3b82f6;
  text-decoration: none;
  font-weight: 500;
  transition: color 0.2s;
  
  &:hover {
    color: #2563eb;
  }
}

// 分类区域
.categories {
  padding: 100px 0;
  position: relative;
  overflow: hidden;
  background:
    radial-gradient(1200px 300px at 20% 0%, rgba(255, 186, 73, 0.18), transparent 60%),
    radial-gradient(1200px 300px at 80% 0%, rgba(255, 115, 29, 0.16), transparent 60%),
    var(--bg-secondary);
}

.categories::before,
.categories::after{
  content: '';
  position: absolute;
  pointer-events: none;
  z-index: 0;
}

.categories::before{
  top: -160px;
  left: -160px;
  width: 700px;
  height: 700px;
  background: radial-gradient(50% 50% at 50% 50%, rgba(255, 186, 73, 0.28) 0%, rgba(255, 186, 73, 0.00) 62%);
}

.categories::after{
  top: -140px;
  right: -200px;
  width: 820px;
  height: 820px;
  background: radial-gradient(50% 50% at 50% 50%, rgba(255, 115, 29, 0.22) 0%, rgba(255, 115, 29, 0.00) 60%);
}
.section-subtitle {
  text-align: center;
  margin-top: -30px;
  margin-bottom: 40px;
  color: #6b7280;
}

.categories-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 30px;
}

.category-card {
  background: radial-gradient(circle at 30% 0%, rgba(255, 184, 120, 0.28), rgba(255, 255, 255, 0.9) 60%),
              #ffffff;
  background-size: 160% 160%;
  padding: 42px 30px;
  border-radius: 24px;
  text-align: center;
  text-decoration: none;
  color: inherit;
  box-shadow: 0 20px 60px rgba(15, 23, 42, 0.08);
  transition: transform 0.65s cubic-bezier(.22,.61,.36,1),
              box-shadow 0.65s ease,
              background-position 0.9s ease,
              border-color 0.45s ease;
  position: relative;
  overflow: hidden;
  border: 1px solid rgba(239, 108, 0, 0.18);
  animation: floatUp 0.9s ease var(--card-delay, 0ms) both;
  isolation: isolate;
  cursor: pointer;
  transform-style: preserve-3d;
  backface-visibility: hidden;
  
  &::before {
    content: '';
    position: absolute;
    inset: 1px;
    border-radius: 22px;
    border: 1px solid rgba(255, 255, 255, 0.6);
    pointer-events: none;
    opacity: 0;
    transition: opacity 0.35s ease;
    z-index: 1;
  }
  
  &::after {
    content: '';
    position: absolute;
    inset: -40%;
    background: conic-gradient(from 120deg, rgba(255, 255, 255, 0.15), rgba(255, 255, 255, 0), rgba(255, 255, 255, 0.25), rgba(255, 255, 255, 0));
    mix-blend-mode: screen;
    opacity: 0;
    transform: scale(0.7) rotate(0deg);
    filter: blur(0);
    transition: opacity 0.5s ease, transform 0.6s ease, filter 0.6s ease;
    animation: holographicSweep 8s linear infinite;
    animation-play-state: paused;
    z-index: 0;
  }
  
  &:hover {
    transform: translateY(-14px) scale(1.03) rotateX(4deg);
    box-shadow: 0 45px 90px rgba(15, 23, 42, 0.18);
    background-position: 100% 100%;
    border-color: rgba(255, 255, 255, 0.4);
    
    &::before {
      opacity: 1;
    }
    
    &::after {
      opacity: 0.55;
      transform: scale(1.05) rotate(12deg);
      filter: blur(18px);
      animation-play-state: running;
    }
  }
  
  h3 {
    font-size: 1.5rem;
    font-weight: 600;
    margin-bottom: 12px;
    color: #1f2937;
  }
  
  p {
    color: #6b7280;
    margin-bottom: 22px;
    line-height: 1.5;
  }
  
  .category-stats { display:flex; justify-content:center; align-items:baseline; gap:6px; transition: transform 0.45s ease, opacity 0.45s ease; }
  .category-stats .count { color:#ef6c00; font-size:18px; font-weight:700; transition: color 0.45s ease, text-shadow 0.45s ease; }
  .category-stats .suffix { color:#9ca3af; font-size:12px; transition: color 0.45s ease; }
  
  &:hover {
    .category-stats {
      transform: translateY(-4px);
    }
    
    .category-stats .count {
      color: #ff7a18;
      text-shadow: 0 6px 14px rgba(255, 122, 24, 0.35);
    }
    
    .category-stats .suffix {
      color: #f97316;
    }
  }
}
.category-card > * {
  position: relative;
  z-index: 2;
}

.category-ornament {
  position: absolute;
  inset: 0;
  z-index: 0;
  pointer-events: none;

  .ornament-ring,
  .ornament-beam {
    transition: opacity 0.4s ease, filter 0.4s ease;
  }
}

.category-card:hover .category-ornament {
  .ornament-ring {
    animation-duration: 8s;
    opacity: 0.7;
    filter: drop-shadow(0 0 12px rgba(255, 184, 120, 0.35));
  }
  
  .ornament-beam {
    opacity: 0.45;
    animation-duration: 3.6s;
  }
}

.ornament-ring,
.ornament-glow,
.ornament-beam {
  position: absolute;
  inset: 20%;
  border-radius: 50%;
}

.ornament-ring {
  border: 1px solid rgba(255, 149, 41, 0.3);
  animation: orbit 14s linear infinite;
}

.ornament-glow {
  background: radial-gradient(circle, rgba(255, 162, 88, 0.25) 0%, rgba(255, 162, 88, 0) 70%);
  filter: blur(10px);
  transform: scale(1.2);
}

.ornament-beam {
  background: linear-gradient(120deg, transparent 0%, rgba(255, 255, 255, 0.9) 40%, transparent 70%);
  transform: rotate(15deg);
  opacity: 0.3;
  animation: beamSweep 6s ease-in-out infinite;
}

.category-icon {
  position: relative;
  margin: 0 auto 24px;
  width: 110px;
  height: 110px;
  border-radius: 32px;
  background: linear-gradient(135deg, var(--accent-start), var(--accent-end));
  box-shadow: 0 18px 38px rgba(247, 147, 30, 0.35);
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid rgba(255, 255, 255, 0.2);
  overflow: hidden;
  transition: transform 0.55s ease, box-shadow 0.55s ease, opacity 0.45s ease;

  .icon-glow,
  .icon-ring {
    transition: opacity 0.4s ease, transform 0.5s ease;
  }
}

.category-card:hover .category-icon {
  transform: translateY(-6px) scale(1.06) rotateX(6deg);
  box-shadow: 0 25px 45px rgba(247, 147, 30, 0.45);
}

.category-card:hover .icon-glow {
  opacity: 0.8;
  animation: glowLift 2.4s ease-in-out infinite;
}

.category-card:hover .icon-ring {
  opacity: 1;
  animation: ringOrbitFlash 1.8s linear infinite;
}

.category-icon i {
  font-size: 42px;
  color: #fffaf2;
  position: relative;
  z-index: 2;
  text-shadow: 0 8px 16px rgba(0, 0, 0, 0.25);
}

.icon-glow,
.icon-ring {
  position: absolute;
  inset: 10px;
  border-radius: 26px;
}

.icon-glow {
  background: radial-gradient(circle, rgba(255, 255, 255, 0.35), transparent 68%);
  filter: blur(4px);
  animation: pulse 6s ease-in-out infinite;
}

.icon-ring {
  border: 1px solid rgba(255, 255, 255, 0.45);
  opacity: 0.7;
}

.category-chip {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 6px 16px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.6);
  border: 1px solid rgba(255, 164, 81, 0.4);
  color: #b45309;
  font-size: 0.85rem;
  letter-spacing: 0.1em;
  margin-bottom: 18px;
  position: relative;
  z-index: 1;
  transition: transform 0.35s ease, background 0.35s ease, letter-spacing 0.35s ease, box-shadow 0.35s ease;
}

.category-card:hover .category-chip {
  transform: translateY(-2px) scale(1.04);
  letter-spacing: 0.18em;
  background: rgba(255, 255, 255, 0.92);
  box-shadow: 0 8px 20px rgba(255, 255, 255, 0.35);
}

// 热门帖子
.hot-posts {
  padding: 80px 0;
  position: relative;
  overflow: hidden;
  background: linear-gradient(180deg, rgba(255, 244, 235, 0.9) 0%, rgba(255, 255, 255, 1) 100%);
}

.hot-posts::before {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at 30% 20%, rgba(255, 186, 73, 0.15), transparent 50%);
  z-index: 0;
}

.posts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 30px;
}

.post-card {
  background: linear-gradient(140deg, rgba(255, 255, 255, 0.96), rgba(255, 245, 237, 0.98));
  border-radius: 26px;
  padding: 32px;
  box-shadow: 0 24px 64px rgba(15, 23, 42, 0.08);
  transition: transform 0.6s cubic-bezier(.22,.61,.36,1),
              box-shadow 0.6s ease,
              border-color 0.5s ease,
              background 0.6s ease;
  border: 1px solid rgba(249, 115, 22, 0.08);
  position: relative;
  overflow: hidden;
  animation: floatUp 0.9s ease var(--card-delay, 0ms) both;
  isolation: isolate;
  cursor: pointer;
  backdrop-filter: blur(6px);
  
  &::before {
    content: '';
    position: absolute;
    inset: 10px;
    border-radius: 20px;
    border: 1px solid rgba(255, 255, 255, 0.75);
    opacity: 0;
    transition: opacity 0.4s ease;
    pointer-events: none;
    z-index: 1;
  }
  
  &::after {
    content: '';
    position: absolute;
    inset: -40% 0;
    background: linear-gradient(120deg, rgba(255, 255, 255, 0) 30%, rgba(255, 255, 255, 0.45) 50%, rgba(255, 255, 255, 0) 70%);
    opacity: 0;
    transform: translateX(-30%);
    transition: opacity 0.45s ease, transform 0.7s ease;
    mix-blend-mode: screen;
    animation: cardSheen 6s linear infinite;
    animation-play-state: paused;
    z-index: 0;
  }
  
  &:hover {
    transform: translateY(-14px) scale(1.01) rotateX(2deg);
    box-shadow: 0 42px 90px rgba(15, 23, 42, 0.16);
    border-color: rgba(249, 115, 22, 0.25);
    
    &::before {
      opacity: 1;
    }
    
    &::after {
      opacity: 1;
      transform: translateX(25%);
      animation-play-state: running;
    }
  }
}

.post-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;
  position: relative;
  z-index: 2;
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
  border: 2px solid rgba(249, 115, 22, 0.12);
  box-shadow: 0 8px 18px rgba(15, 23, 42, 0.08);
  transition: transform 0.45s ease, box-shadow 0.45s ease;
}

.author-info {
  display: flex;
  flex-direction: column;
  
  .author-name {
    font-weight: 600;
    color: #1f2937;
    font-size: 14px;
  }
  
  .post-time {
    color: #9ca3af;
    font-size: 12px;
  }
}

.post-category {
  display: flex;
}

.category-tag {
  padding: 4px 12px;
  border-radius: 16px;
  font-size: 12px;
  font-weight: 500;
  transition: transform 0.4s ease, background 0.4s ease, color 0.4s ease, box-shadow 0.4s ease;
  
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
}

.post-card {
  .post-category,
  .post-content,
  .post-footer {
    position: relative;
    z-index: 2;
  }
}

.post-title,
.post-excerpt,
.post-stats .stat,
.read-more {
  transition: color 0.4s ease, transform 0.4s ease, text-shadow 0.4s ease;
}

.post-card:hover {
  .post-title {
    color: #f97316;
    text-shadow: 0 6px 14px rgba(249, 115, 22, 0.25);
  }
  
  .post-excerpt {
    color: #6b7280;
  }
  
  .category-tag {
    transform: translateY(-2px);
    box-shadow: 0 8px 18px rgba(249, 115, 22, 0.18);
  }
  
  .post-stats .stat {
    color: #ea580c;
    transform: translateY(-2px);
  }
  
  .read-more {
    color: #2563eb;
    transform: translateX(4px);
  }
  
  .author-avatar {
    transform: translateY(-4px) scale(1.04);
    box-shadow: 0 16px 26px rgba(15, 23, 42, 0.16);
  }
}

.post-content {
  margin-bottom: 20px;
  
  .post-title {
    font-size: 1.25rem;
    font-weight: 600;
    color: #1f2937;
    margin-bottom: 10px;
    line-height: 1.4;
  }
  
  .post-excerpt {
    color: #6b7280;
    line-height: 1.6;
    display: -webkit-box;
    line-clamp: 3;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
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

.read-more {
  color: #3b82f6;
  text-decoration: none;
  font-weight: 500;
  font-size: 14px;
  
  &:hover {
    color: #2563eb;
  }
}

// 电影推荐
.movie-recommendations {
  padding: 80px 0;
  background: var(--bg-secondary);
  position: relative;
  overflow: hidden;
}

.movie-recommendations::before,
.movie-recommendations::after {
  content: '';
  position: absolute;
  width: 320px;
  height: 320px;
  border-radius: 50%;
  background: rgba(255, 145, 72, 0.2);
  filter: blur(60px);
  animation: drift 12s ease-in-out infinite;
}

.movie-recommendations::before {
  top: -80px;
  left: -40px;
}

.movie-recommendations::after {
  bottom: -100px;
  right: -60px;
  animation-delay: 4s;
}

.movies-slider {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 30px;
}

.movie-item {
  background: white;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 20px 45px rgba(15, 23, 42, 0.08);
  transition: all 0.3s;
  border: 1px solid rgba(15, 23, 42, 0.04);
  animation: floatUp 0.8s ease var(--card-delay, 0ms) both;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 25px 60px rgba(0, 0, 0, 0.12);
  }
}

.movie-poster {
  position: relative;
  aspect-ratio: 2/3;
  overflow: hidden;
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.3s;
  }
  
  &:hover img {
    transform: scale(1.05);
  }
}

.movie-rating {
  position: absolute;
  top: 15px;
  right: 15px;
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 5px 10px;
  border-radius: 20px;
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 14px;
  font-weight: 600;
  
  i {
    color: #fbbf24;
  }
}

.movie-info {
  padding: 20px;
  
  .movie-title {
    font-size: 1.1rem;
    font-weight: 600;
    color: #1f2937;
    margin-bottom: 5px;
  }
  
  .movie-genre {
    color: #6b7280;
    font-size: 14px;
    margin-bottom: 5px;
  }
  
  .movie-year {
    color: #9ca3af;
    font-size: 14px;
  }
}

// 统计数据
.stats {
  padding: 100px 0;
  background: radial-gradient(circle at 20% 20%, rgba(255, 150, 61, 0.5), transparent 46%),
              linear-gradient(135deg, var(--primary-dark) 0%, var(--primary-color) 100%);
  color: white;
  position: relative;
  overflow: hidden;
}

.stats::before {
  content: '';
  position: absolute;
  inset: 20px;
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 32px;
  opacity: 0.4;
  animation: glowPulse 6s ease-in-out infinite;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 40px;
  text-align: center;
}

.stat-item {
  .stat-number {
    font-size: 3rem;
    font-weight: 800;
    color: var(--secondary-color);
    margin-bottom: 10px;
  }
  
  .stat-label {
    font-size: 1.1rem;
    color: #d1d5db;
  }
}

// 按钮样式
.btn {
  padding: 12px 24px;
  border-radius: 8px;
  text-decoration: none;
  font-weight: 600;
  transition: all 0.2s;
  border: 2px solid transparent;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  
  &.btn-primary {
    background: var(--primary-color);
    color: white;
    
    &:hover {
      background: var(--primary-dark);
      transform: translateY(-2px);
    }
  }
  
  &.btn-outline {
    background: transparent;
    color: white;
    border-color: white;
    
    &:hover {
      background: white;
      color: var(--primary-color);
    }
  }
  
  &.btn-lg {
    padding: 16px 32px;
    font-size: 1.1rem;
  }
}

// 响应式设计
@media (max-width: 768px) {
  .hero-grid {
    grid-template-columns: 1fr;
    gap: 40px;
    text-align: center;
  }
  
  .hero-content {
    text-align: center;
  }
  
  .hero-badges {
    justify-content: center;
  }
  
  .hero-metrics {
    grid-template-columns: 1fr;
    text-align: center;
  }
  
  .hero-title {
    font-size: 2.5rem;
  }
  
  .hero-actions {
    justify-content: center;
    flex-wrap: wrap;
  }
  
  .section-title {
    font-size: 2rem;
  }
  
  .categories-grid {
    grid-template-columns: 1fr;
  }
  
  .posts-grid {
    grid-template-columns: 1fr;
  }
  
  .movies-slider {
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  }
  
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 480px) {
  .hero {
    padding: 60px 0;
  }
  
  .hero-title {
    font-size: 2rem;
  }
  
  .hero-subtitle {
    font-size: 1rem;
  }
  
  .hero-actions {
    flex-direction: column;
    gap: 15px;
  }
  
  .btn {
    width: 100%;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
  }
}

// 动画效果
@keyframes cardSheen {
  0% {
    transform: translateX(-40%);
  }
  100% {
    transform: translateX(40%);
  }
}

@keyframes holographicSweep {
  0% {
    transform: scale(0.7) rotate(0deg);
  }
  50% {
    transform: scale(0.9) rotate(180deg);
  }
  100% {
    transform: scale(0.7) rotate(360deg);
  }
}

@keyframes ringOrbitFlash {
  from {
    transform: rotate(0deg);
    opacity: 0.9;
  }
  50% {
    opacity: 0.5;
  }
  to {
    transform: rotate(360deg);
    opacity: 0.9;
  }
}

@keyframes glowLift {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
}

@keyframes pulse {
  0%, 100% {
    transform: scale(0.9);
    opacity: 0.4;
  }
  50% {
    transform: scale(1.1);
    opacity: 0.8;
  }
}

@keyframes rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

@keyframes rotateReverse {
  from { transform: rotate(360deg); }
  to { transform: rotate(0deg); }
}

@keyframes sparkle {
  0% {
    opacity: 0;
    transform: translateY(0) scaleY(1);
  }
  50% {
    opacity: 1;
    transform: translateY(-20px) scaleY(1.2);
  }
  100% {
    opacity: 0;
    transform: translateY(-40px) scaleY(0.8);
  }
}

@keyframes marquee {
  from {
    transform: translateX(0);
  }
  to {
    transform: translateX(-50%);
  }
}

@keyframes floatUp {
  from {
    opacity: 0;
    transform: translateY(40px) scale(0.98);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@keyframes orbit {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

@keyframes beamSweep {
  0% {
    transform: rotate(10deg) translateX(-10%);
    opacity: 0;
  }
  40% {
    opacity: 0.4;
  }
  60% {
    opacity: 0.1;
  }
  100% {
    transform: rotate(25deg) translateX(20%);
    opacity: 0;
  }
}

@keyframes drift {
  0% {
    transform: translate(0, 0) scale(1);
  }
  50% {
    transform: translate(40px, -30px) scale(1.1);
  }
  100% {
    transform: translate(0, 0) scale(1);
  }
}

@keyframes glowPulse {
  0%, 100% {
    opacity: 0.15;
  }
  50% {
    opacity: 0.35;
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

</style>
