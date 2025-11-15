<template>
  <div class="award-detail-page" v-if="loaded">
    <div v-if="loading" class="loading">加载中...</div>
    <div v-else-if="error" class="error">{{ error }}</div>
    <div v-else-if="detail">
      <div class="header">
        <div class="header-content">
          <div class="name-section">
            <div class="name-row">
              <h1 class="award-name">{{ detail.name }}</h1>
              <button v-if="isAdmin" class="edit-link-btn" @click="handleEditClick">
                修改资料
              </button>
            </div>
          </div>
          <div class="header-body">
            <div class="info">
              <div class="info-item" v-if="detail.organization">
                <span class="info-label">颁奖机构:</span>
                <span class="info-value">{{ detail.organization }}</span>
              </div>
              <div class="info-item" v-if="detail.target_type">
                <span class="info-label">获奖对象类型:</span>
                <span class="info-value">{{ getTargetTypeLabel(detail.target_type) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="description-section" v-if="detail.description">
        <h2 class="section-title">奖项说明</h2>
        <p class="description">{{ detail.description }}</p>
      </div>

      <div class="winners-section" v-if="getWinners().length > 0">
        <h2 class="section-title">获奖记录</h2>
        <div class="winners-list">
          <div 
            v-for="winner in getWinners()" 
            :key="`${winner.id}-${winner.year}`"
            class="winner-card"
            @click="goToWinnerDetail(winner)"
          >
            <div class="winner-image" v-if="winner.picture">
              <img :src="winner.picture" :alt="winner.name" @error="handleImageError" />
            </div>
            <div class="winner-info">
              <h3 class="winner-name">{{ winner.name }}</h3>
              <div class="winner-meta">
                <span class="winner-year">{{ winner.year }}</span>
                <span class="winner-status" :class="winner.status === 'awarded' ? 'status-awarded' : 'status-nominated'">
                  {{ winner.status === 'awarded' ? '获奖' : '提名' }}
                </span>
              </div>
              <p v-if="winner.note" class="winner-note">{{ winner.note }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 编辑表单弹窗 -->
    <AwardForm 
      v-if="showEditForm" 
      :is-edit="true"
      :initial-data="editFormData"
      @submit="handleFormSubmit"
      @cancel="showEditForm = false"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { fetchAwardDetail, saveAward } from '@/api/awards'
import { notificationService } from '@/utils/notification'
import AwardForm from '@/components/AwardForm.vue'
import type { AwardDetail, AwardSaveData, AwardWinner } from '@/api/awards'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const id = route.params.id as string

const loaded = ref(false)
const loading = ref(false)
const error = ref('')
const detail = ref<AwardDetail | null>(null)
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
    name: detail.value.name || '',
    organization: detail.value.organization || '',
    target_type: detail.value.target_type,
    description: detail.value.description || ''
  }
})

async function load() {
  loading.value = true
  error.value = ''
  try {
    detail.value = await fetchAwardDetail(id)
    loaded.value = true
  } catch (err: any) {
    console.error('Failed to load award detail:', err)
    if (err?.code === 404) {
      error.value = '奖项信息未找到'
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

function getTargetTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    'ACTOR': '演员',
    'FILM': '电影',
    'TVSHOW': '电视剧',
    'VARIETY': '综艺'
  }
  return labels[type] || type
}

function getWinners(): AwardWinner[] {
  if (!detail.value) return []
  
  if (detail.value.target_type === 'ACTOR' && detail.value.actors) {
    return detail.value.actors
  } else if (detail.value.target_type === 'FILM' && detail.value.films) {
    return detail.value.films
  } else if (detail.value.target_type === 'TVSHOW' && detail.value.tv_shows) {
    return detail.value.tv_shows
  } else if (detail.value.target_type === 'VARIETY' && detail.value.varieties) {
    return detail.value.varieties
  }
  
  return []
}

function goToWinnerDetail(winner: AwardWinner) {
  if (!detail.value) return
  
  if (detail.value.target_type === 'ACTOR') {
    router.push({ name: 'ActorDetail', params: { id: winner.id } })
  } else if (detail.value.target_type === 'FILM') {
    router.push({ name: 'MovieDetail', params: { id: winner.id } })
  } else if (detail.value.target_type === 'TVSHOW') {
    router.push({ name: 'TvDetail', params: { id: winner.id } })
  } else if (detail.value.target_type === 'VARIETY') {
    router.push({ name: 'VarietyDetail', params: { id: winner.id } })
  }
}

function handleImageError(event: Event) {
  const img = event.target as HTMLImageElement
  img.style.display = 'none'
}

function handleEditClick() {
  showEditForm.value = true
}

// 使用项目中的通知服务
const notify = notificationService

// 处理表单提交
async function handleFormSubmit(awardData: AwardSaveData) {
  try {
    loading.value = true
    await saveAward(awardData)
    showEditForm.value = false
    
    // 重新加载数据
    await load()
    
    notify.success('奖项信息保存成功！')
  } catch (err: any) {
    console.error('保存奖项信息失败:', err)
    notify.error(err?.message || '保存失败，请稍后重试')
  } finally {
    loading.value = false
  }
}

onMounted(load)
</script>

<style scoped>
.award-detail-page { 
  padding: 24px; 
  width: 100%;
  max-width: 1600px;
  margin: 80px auto 40px;
  background: linear-gradient(to bottom, #f9fafb 0%, #ffffff 100%);
  min-height: calc(100vh - 80px);
}
.header { 
  margin-bottom: 40px; 
  padding: 0;
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  border: 1px solid #e5e7eb;
  overflow: hidden;
}
.header-content {
  display: flex;
  flex-direction: column;
}
.name-section {
  padding: 24px 32px 20px;
  border-bottom: 1px solid #f3f4f6;
}
.name-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}
.award-name {
  font-size: 32px;
  font-weight: 700;
  color: #111827;
  margin: 0;
  line-height: 1.3;
  flex: 1;
}
.edit-link-btn {
  background: none;
  border: none;
  color: #9ca3af;
  font-size: 14px;
  cursor: pointer;
  padding: 0;
  text-decoration: none;
  transition: color 0.2s;
  white-space: nowrap;
  flex-shrink: 0;
}
.edit-link-btn:hover {
  color: #8b5cf6;
  text-decoration: underline;
}
.header-body {
  padding: 24px 32px;
}
.info { 
  display: flex; 
  flex-direction: column; 
  gap: 16px; 
  flex: 1;
  padding-top: 4px;
}
.info-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 15px;
  line-height: 1.6;
}
.info-label {
  color: #8b5cf6;
  font-weight: 500;
  min-width: 120px;
}
.info-value {
  color: #111827;
  font-weight: 400;
}
.description-section,
.winners-section {
  margin-bottom: 40px;
  padding: 32px;
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  border: 1px solid #e5e7eb;
}
.section-title {
  font-size: 24px;
  font-weight: 700;
  color: #111827;
  margin: 0 0 16px 0;
  padding-bottom: 12px;
  border-bottom: 2px solid #8b5cf6;
}
.description {
  color: #374151;
  line-height: 1.8;
  font-size: 15px;
  margin: 0;
  white-space: pre-wrap;
  word-break: break-word;
}
.winners-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
}
.winner-card {
  display: flex;
  gap: 16px;
  padding: 16px;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  background: #fff;
  cursor: pointer;
  transition: all 0.3s ease;
}
.winner-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(139, 92, 246, 0.15);
  border-color: #8b5cf6;
}
.winner-image {
  flex-shrink: 0;
  width: 80px;
  height: 120px;
  border-radius: 8px;
  overflow: hidden;
  background: #f3f4f6;
}
.winner-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.winner-info {
  flex: 1;
  min-width: 0;
}
.winner-name {
  font-size: 16px;
  font-weight: 700;
  color: #111827;
  margin: 0 0 8px 0;
}
.winner-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}
.winner-year {
  padding: 2px 8px;
  background: rgba(139, 92, 246, 0.1);
  color: #8b5cf6;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
}
.winner-status {
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
}
.status-awarded {
  background: rgba(34, 197, 94, 0.1);
  color: #22c55e;
}
.status-nominated {
  background: rgba(249, 115, 22, 0.1);
  color: #f97316;
}
.winner-note {
  font-size: 13px;
  color: #6b7280;
  margin: 0;
  line-height: 1.5;
}
.loading, .error { 
  text-align: center; 
  padding: 60px 40px; 
  color: #6b7280;
  font-size: 16px;
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
}
.error { 
  color: #ef4444;
  background: #fef2f2;
  border: 1px solid #fecaca;
}

@media (max-width: 768px) {
  .award-detail-page {
    padding: 16px;
  }
  .name-section {
    padding: 20px 16px 16px;
  }
  .award-name {
    font-size: 24px;
  }
  .header-body {
    padding: 20px 16px;
  }
  .description-section,
  .winners-section {
    padding: 20px 16px;
  }
  .winners-list {
    grid-template-columns: repeat(auto-fill, minmax(100%, 1fr));
  }
}
</style>

