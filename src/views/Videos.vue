<template>
  <div class="videos-page">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-background"></div>
      <div class="header-content">
        <div class="header-icon">🎬</div>
        <h1 class="page-title">我们的特色视频</h1>
        <p class="page-subtitle">探索精彩演示视频，了解我们的平台特色</p>
      </div>
    </div>

    <!-- 视频列表容器 -->
    <div class="videos-container">
      <div v-if="loading" class="videos-grid">
        <div v-for="n in 6" :key="n" class="video-card skeleton">
          <div class="skeleton-thumbnail"></div>
          <div class="skeleton-content">
            <div class="skeleton-title"></div>
            <div class="skeleton-subtitle"></div>
          </div>
        </div>
      </div>

      <div v-else-if="videos.length" class="videos-grid">
        <div 
          v-for="(video, index) in videos" 
          :key="video.name"
          class="video-card"
          :style="{ animationDelay: `${index * 0.1}s` }"
          @click="selectVideo(video)"
        >
          <div class="video-thumbnail">
            <video 
              :src="video.url" 
              :poster="video.thumbnail"
              preload="metadata"
              @loadedmetadata="onVideoLoaded"
            ></video>
            <div class="play-overlay">
              <div class="play-button">
                <span>▶</span>
              </div>
            </div>
            <div class="video-duration" v-if="video.duration">
              {{ formatDuration(video.duration) }}
            </div>
          </div>
          <div class="video-info">
            <h3 class="video-title">{{ video.displayName }}</h3>
            <p class="video-filename">{{ video.name }}</p>
          </div>
        </div>
      </div>

      <div v-else class="empty-state">
        <div class="empty-icon">📹</div>
        <h3>暂无视频</h3>
        <p>请在 public/videos 文件夹中添加视频文件</p>
      </div>
    </div>

    <!-- 视频播放模态框 -->
    <div v-if="selectedVideo" class="video-modal" @click.self="closeModal">
      <div class="modal-content">
        <button class="modal-close" @click="closeModal">×</button>
        <div class="video-player-wrapper">
          <video 
            ref="videoPlayer"
            :src="selectedVideo.url" 
            controls
            autoplay
            class="video-player"
          ></video>
        </div>
        <div class="video-modal-info">
          <h2 class="modal-title">{{ selectedVideo.displayName }}</h2>
          <p class="modal-filename">{{ selectedVideo.name }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getVideoList } from '@/utils/videos'

const videos = ref([])
const loading = ref(true)
const selectedVideo = ref(null)
const videoPlayer = ref(null)

// 获取视频列表
async function loadVideos() {
  try {
    loading.value = true
    const videoList = await getVideoList()
    videos.value = videoList
  } catch (error) {
    console.error('加载视频列表失败:', error)
    videos.value = []
  } finally {
    loading.value = false
  }
}

// 选择视频
function selectVideo(video) {
  selectedVideo.value = video
  // 确保视频元素存在后再播放
  setTimeout(() => {
    if (videoPlayer.value) {
      videoPlayer.value.play().catch(err => {
        console.error('自动播放失败:', err)
      })
    }
  }, 100)
}

// 关闭模态框
function closeModal() {
  if (videoPlayer.value) {
    videoPlayer.value.pause()
    videoPlayer.value.currentTime = 0
  }
  selectedVideo.value = null
}

// 视频元数据加载完成
function onVideoLoaded(event) {
  const video = event.target
  const videoData = videos.value.find(v => v.url === video.src)
  if (videoData && video.duration) {
    videoData.duration = video.duration
  }
}

// 格式化时长
function formatDuration(seconds) {
  if (!seconds || isNaN(seconds)) return ''
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

onMounted(() => {
  loadVideos()
  
  // ESC键关闭模态框
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && selectedVideo.value) {
      closeModal()
    }
  })
})
</script>

<style lang="scss" scoped>
.videos-page {
  min-height: 100vh;
  background: var(--bg-secondary);
}

// 页面头部
.page-header {
  position: relative;
  padding: 120px 20px 80px;
  text-align: center;
  background: radial-gradient(circle at 20% 20%, rgba(255, 149, 41, 0.4), transparent 46%),
              radial-gradient(circle at 80% 10%, rgba(255, 98, 0, 0.38), transparent 52%),
              linear-gradient(135deg, #210800 0%, #120200 35%, #1f0800 100%);
  color: white;
  overflow: hidden;
}

.header-background {
  position: absolute;
  inset: 0;
  background: url('https://www.transparenttextures.com/patterns/asfalt-dark.png');
  opacity: 0.2;
  mix-blend-mode: screen;
}

.header-content {
  position: relative;
  z-index: 2;
  max-width: 800px;
  margin: 0 auto;
}

.header-icon {
  font-size: 4rem;
  margin-bottom: 20px;
  animation: bounce 2s infinite;
}

.page-title {
  font-size: 3rem;
  font-weight: 800;
  margin: 0 0 16px 0;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
}

.page-subtitle {
  font-size: 1.25rem;
  opacity: 0.9;
  margin: 0;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.3);
}

// 视频列表容器
.videos-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 60px 20px;
}

.videos-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 30px;
}

// 视频卡片
.video-card {
  background: white;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 20px 45px rgba(15, 23, 42, 0.08);
  transition: all 0.4s cubic-bezier(.22,.61,.36,1);
  border: 1px solid rgba(15, 23, 42, 0.04);
  animation: floatUp 0.8s ease both;
  cursor: pointer;
  
  &:hover {
    transform: translateY(-8px) scale(1.02);
    box-shadow: 0 30px 70px rgba(15, 23, 42, 0.15);
    border-color: rgba(255, 149, 41, 0.2);
  }
}

.video-thumbnail {
  position: relative;
  width: 100%;
  aspect-ratio: 16/9;
  background: #000;
  overflow: hidden;
  
  video {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.4s ease;
  }
  
  .video-card:hover video {
    transform: scale(1.05);
  }
}

.play-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.3);
  opacity: 0;
  transition: opacity 0.3s ease;
  
  .video-card:hover & {
    opacity: 1;
  }
}

.play-button {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  transform: scale(0.9);
  transition: transform 0.3s ease;
  
  span {
    font-size: 32px;
    color: #f97316;
    margin-left: 4px;
  }
  
  .video-card:hover & {
    transform: scale(1);
  }
}

.video-duration {
  position: absolute;
  bottom: 12px;
  right: 12px;
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
}

.video-info {
  padding: 20px;
  
  .video-title {
    font-size: 1.2rem;
    font-weight: 600;
    color: #1f2937;
    margin: 0 0 8px 0;
    transition: color 0.3s ease;
  }
  
  .video-filename {
    font-size: 0.9rem;
    color: #9ca3af;
    margin: 0;
    word-break: break-all;
  }
}

.video-card:hover .video-title {
  color: #f97316;
}

// 骨架屏
.skeleton {
  background: white;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 20px 45px rgba(15, 23, 42, 0.08);
}

.skeleton-thumbnail {
  width: 100%;
  aspect-ratio: 16/9;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: skeleton-loading 1.5s ease-in-out infinite;
}

.skeleton-content {
  padding: 20px;
}

.skeleton-title {
  height: 20px;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: skeleton-loading 1.5s ease-in-out infinite;
  border-radius: 4px;
  margin-bottom: 12px;
}

.skeleton-subtitle {
  height: 16px;
  width: 60%;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: skeleton-loading 1.5s ease-in-out infinite;
  border-radius: 4px;
}

@keyframes skeleton-loading {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

// 空状态
.empty-state {
  text-align: center;
  padding: 100px 20px;
  color: #6b7280;
  
  .empty-icon {
    font-size: 4rem;
    margin-bottom: 20px;
    opacity: 0.5;
  }
  
  h3 {
    font-size: 1.5rem;
    margin: 0 0 12px 0;
    color: #1f2937;
  }
  
  p {
    font-size: 1rem;
    margin: 0;
  }
}

// 视频播放模态框
.video-modal {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 20px;
  animation: fadeIn 0.3s ease;
}

.modal-content {
  position: relative;
  max-width: 1200px;
  width: 100%;
  background: #000;
  border-radius: 16px;
  overflow: hidden;
  animation: scaleIn 0.3s ease;
}

.modal-close {
  position: absolute;
  top: 20px;
  right: 20px;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: white;
  font-size: 28px;
  cursor: pointer;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.3s ease, transform 0.3s ease;
  
  &:hover {
    background: rgba(255, 255, 255, 0.3);
    transform: scale(1.1);
  }
}

.video-player-wrapper {
  position: relative;
  width: 100%;
  padding-top: 56.25%; // 16:9 aspect ratio
  background: #000;
}

.video-player {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.video-modal-info {
  padding: 24px;
  background: #1a1a1a;
  color: white;
  
  .modal-title {
    font-size: 1.5rem;
    font-weight: 600;
    margin: 0 0 8px 0;
    color: white;
  }
  
  .modal-filename {
    font-size: 0.9rem;
    color: #9ca3af;
    margin: 0;
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes scaleIn {
  from {
    transform: scale(0.9);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
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
@media (max-width: 768px) {
  .page-title {
    font-size: 2rem;
  }
  
  .page-subtitle {
    font-size: 1rem;
  }
  
  .videos-grid {
    grid-template-columns: 1fr;
  }
  
  .video-modal {
    padding: 10px;
  }
  
  .modal-content {
    border-radius: 12px;
  }
  
  .video-modal-info {
    padding: 16px;
    
    .modal-title {
      font-size: 1.2rem;
    }
  }
}
</style>

