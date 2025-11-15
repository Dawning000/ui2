<template>
  <div class="awards-page">
    <div class="page-header">
      <div class="header-content">
        <div class="header-title-section">
          <h1 class="page-title">
            <i class="icon-trophy"></i>
            所有奖项列表
          </h1>
        </div>
        <div class="header-actions">
          <button v-if="isAdmin" class="add-button" @click="handleAddAward">
            <i class="icon-plus"></i>
            新增奖项
          </button>
        </div>
      </div>
      <div class="filters">
        <div class="filter-group">
          <i class="icon-search"></i>
          <input 
            v-model="keyword" 
            @keyup.enter="handleSearch" 
            placeholder="搜索奖项名称，如：奥斯卡" 
            class="filter-input" 
          />
        </div>
        <div class="filter-group">
          <i class="icon-trophy"></i>
          <select v-model="targetType" @change="handleSearch" class="filter-select">
            <option value="">获奖对象类型（全部）</option>
            <option value="ACTOR">演员</option>
            <option value="FILM">电影</option>
            <option value="TVSHOW">电视剧</option>
            <option value="VARIETY">综艺</option>
          </select>
        </div>
        <button @click="handleSearch" :disabled="loading" class="search-button">
          <i class="icon-search"></i>
          <span>搜索</span>
        </button>
      </div>
    </div>

    <!-- 奖项表单弹窗 -->
    <AwardForm 
      v-if="showForm" 
      :is-edit="!!editFormData"
      :initial-data="editFormData"
      @submit="handleFormSubmit"
      @cancel="handleFormCancel"
    />

    <!-- 奖项详情弹窗 -->
    <div v-if="showDetailModal" class="detail-modal-overlay" @click.self="closeDetailModal">
      <div class="detail-modal" v-if="awardDetail">
        <div class="modal-header">
          <h2>{{ awardDetail.name }}</h2>
          <div class="header-actions">
            <button v-if="isAdmin" class="edit-btn" @click="handleEditFromDetail">
              <i class="icon-edit"></i>
              修改奖项信息
            </button>
            <button class="close-btn" @click="closeDetailModal">×</button>
          </div>
        </div>
        <div class="modal-content">
          <div class="detail-info">
            <div class="info-item" v-if="awardDetail.organization">
              <span class="info-label">颁奖机构:</span>
              <span class="info-value">{{ awardDetail.organization }}</span>
            </div>
            <div class="info-item" v-if="awardDetail.target_type">
              <span class="info-label">获奖对象类型:</span>
              <span class="info-value">{{ getTargetTypeLabel(awardDetail.target_type) }}</span>
            </div>
          </div>
          
          <div class="description-section" v-if="awardDetail.description">
            <h3 class="section-title">奖项说明</h3>
            <p class="description">{{ awardDetail.description }}</p>
          </div>

          <div class="winners-section" v-if="getWinners().length > 0">
            <h3 class="section-title">获奖记录</h3>
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
                  <h4 class="winner-name">{{ winner.name }}</h4>
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
      </div>
      <div v-else-if="detailLoading" class="detail-modal loading-content">
        <div class="loading">加载中...</div>
      </div>
    </div>

    <div v-if="loading" class="loading">加载中...</div>
    <div v-else-if="error" class="error">{{ error }}</div>
    <div v-else-if="awards.length === 0" class="empty-container">
      <div class="empty">暂无奖项记录</div>
    </div>
    <div v-else class="awards-list">
      <div 
        v-for="award in awards" 
        :key="award.id" 
        class="award-row"
        @click="goToDetail(award.id)"
      >
        <div class="award-main">
          <h3 class="award-name">{{ award.name }}</h3>
          <div class="award-meta">
            <span v-if="award.organization" class="award-org">{{ award.organization }}</span>
            <span v-if="award.target_type" class="award-type">{{ getTargetTypeLabel(award.target_type) }}</span>
            <span v-if="award.year" class="award-year">{{ award.year }}</span>
          </div>
        </div>
        <div class="award-details">
          <div v-if="award.movie" class="award-detail-item">
            <span class="detail-label">作品:</span>
            <span class="detail-value">{{ award.movie }}</span>
          </div>
          <div v-if="award.actor" class="award-detail-item">
            <span class="detail-label">演员:</span>
            <span class="detail-value">{{ award.actor }}</span>
          </div>
          <div v-if="award.category" class="award-detail-item">
            <span class="detail-label">类别:</span>
            <span class="detail-value">{{ award.category }}</span>
          </div>
        </div>
      </div>
    </div>

    <div class="pagination-container" v-if="!loading && awards.length > 0">
      <div class="pagination-info">
        <span>共 {{ total }} 条记录</span>
      </div>
      <div class="pagination" v-if="total > 0 && totalPages > 0">
        <button 
          class="pagination-btn" 
          :disabled="page <= 1 || totalPages <= 1" 
          @click.stop="changePage(1)"
          title="首页"
        >
          首页
        </button>
        <button 
          class="pagination-btn" 
          :disabled="page <= 1 || totalPages <= 1" 
          @click.stop="changePage(page - 1)"
          title="上一页"
        >
          上一页
        </button>
        
        <div class="page-numbers">
          <template v-for="(p, index) in visiblePages" :key="`page-${index}-${p}`">
            <button
              v-if="typeof p === 'number'"
              class="pagination-btn page-number"
              :class="{ active: p === page }"
              @click.stop="changePage(p)"
            >
              {{ p }}
            </button>
            <span v-else class="page-ellipsis">{{ p }}</span>
          </template>
        </div>
        
        <button 
          class="pagination-btn" 
          :disabled="page >= totalPages || totalPages <= 1" 
          @click.stop="changePage(page + 1)"
          title="下一页"
        >
          下一页
        </button>
        <button 
          class="pagination-btn" 
          :disabled="page >= totalPages || totalPages <= 1" 
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
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { saveAward, fetchAwardsList, fetchAwardDetail } from '@/api/awards'
import { notificationService } from '@/utils/notification'
import AwardForm from '@/components/AwardForm.vue'
import type { AwardSaveData, AwardDetail, AwardWinner } from '@/api/awards'

const router = useRouter()
const userStore = useUserStore()

// 检查是否为管理员
const isAdmin = computed(() => {
  return userStore.user?.role === 'ADMIN'
})

// 表单弹窗状态
const showForm = ref(false)
const editFormData = ref<AwardSaveData | undefined>(undefined)

// 详情弹窗状态
const showDetailModal = ref(false)
const awardDetail = ref<AwardDetail | null>(null)
const detailLoading = ref(false)

interface Award {
  id: number
  name: string
  organization?: string
  target_type?: string
  year?: number
  movie?: string
  actor?: string
  category?: string
}

const awards = ref<Award[]>([])
const total = ref(0)
const page = ref(1)
const size = ref(20)
const loading = ref(false)
const error = ref('')
const jumpPage = ref(1)

const keyword = ref('')
const targetType = ref('')

const totalPages = computed(() => Math.max(1, Math.ceil(total.value / size.value)))

// 计算可见的页码
const visiblePages = computed(() => {
  const pages: (number | string)[] = []
  const current = page.value
  const total = totalPages.value
  
  if (total <= 7) {
    for (let i = 1; i <= total; i++) {
      pages.push(i)
    }
  } else {
    if (current <= 4) {
      for (let i = 1; i <= 5; i++) {
        pages.push(i)
      }
      pages.push('...')
      pages.push(total)
    } else if (current >= total - 3) {
      pages.push(1)
      pages.push('...')
      for (let i = total - 4; i <= total; i++) {
        pages.push(i)
      }
    } else {
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

async function load() {
  loading.value = true
  error.value = ''
  try {
    const params: {
      page: number
      size: number
      keyword?: string
      target_type?: string
    } = {
      page: page.value || 1,
      size: size.value || 20
    }
    
    // 只有在有搜索条件时才添加搜索参数
    if (keyword.value && keyword.value.trim()) {
      params.keyword = keyword.value.trim()
    }
    if (targetType.value) {
      params.target_type = targetType.value
    }
    
    const data = await fetchAwardsList(params)
    awards.value = data.awards || []
    total.value = data.total || 0
    
    // 同步当前页码
    if (data.page && data.page !== page.value) {
      page.value = data.page
    }
    // 同步每页数量
    if (data.size && data.size !== size.value) {
      size.value = data.size
    }
    // 同步jumpPage与当前页码
    jumpPage.value = page.value
  } catch (err: any) {
    if (err && err.message) {
      error.value = err.message
    } else if (err && err.code === 10005) {
      error.value = '未经授权的操作！请先登录'
    } else {
      error.value = '加载失败，请稍后重试'
    }
    console.error('Failed to load awards:', err)
  } finally {
    loading.value = false
  }
}

function handleSearch() {
  page.value = 1
  jumpPage.value = 1
  load()
}

function changePage(p: number) {
  const targetPage = Math.max(1, Math.min(p, totalPages.value))
  if (targetPage === page.value) return
  page.value = targetPage
  jumpPage.value = targetPage
  window.scrollTo({ top: 0, behavior: 'smooth' })
  load()
}

function handleJump() {
  const targetPage = Math.max(1, Math.min(jumpPage.value, totalPages.value))
  if (targetPage !== page.value) {
    changePage(targetPage)
  }
}

function handleAddAward() {
  editFormData.value = undefined
  showForm.value = true
}

function handleEditFromDetail() {
  if (!awardDetail.value) return
  
  // 将详情数据转换为表单数据
  editFormData.value = {
    id: awardDetail.value.id,
    name: awardDetail.value.name,
    organization: awardDetail.value.organization,
    target_type: awardDetail.value.target_type,
    description: awardDetail.value.description
  }
  
  // 关闭详情弹窗，打开编辑表单
  closeDetailModal()
  showForm.value = true
}

function handleFormCancel() {
  showForm.value = false
  editFormData.value = undefined
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

async function goToDetail(id: number | string) {
  showDetailModal.value = true
  detailLoading.value = true
  awardDetail.value = null
  
  try {
    awardDetail.value = await fetchAwardDetail(id)
  } catch (err: any) {
    console.error('Failed to load award detail:', err)
    notify.error(err?.message || '加载失败，请稍后重试')
    closeDetailModal()
  } finally {
    detailLoading.value = false
  }
}

function closeDetailModal() {
  showDetailModal.value = false
  awardDetail.value = null
}

function getWinners(): AwardWinner[] {
  if (!awardDetail.value) return []
  
  if (awardDetail.value.target_type === 'ACTOR' && awardDetail.value.actors) {
    return awardDetail.value.actors
  } else if (awardDetail.value.target_type === 'FILM' && awardDetail.value.films) {
    return awardDetail.value.films
  } else if (awardDetail.value.target_type === 'TVSHOW' && awardDetail.value.tv_shows) {
    return awardDetail.value.tv_shows
  } else if (awardDetail.value.target_type === 'VARIETY' && awardDetail.value.varieties) {
    return awardDetail.value.varieties
  }
  
  return []
}

function goToWinnerDetail(winner: AwardWinner) {
  if (!awardDetail.value) return
  
  closeDetailModal()
  
  if (awardDetail.value.target_type === 'ACTOR') {
    router.push({ name: 'ActorDetail', params: { id: winner.id } })
  } else if (awardDetail.value.target_type === 'FILM') {
    router.push({ name: 'MovieDetail', params: { id: winner.id } })
  } else if (awardDetail.value.target_type === 'TVSHOW') {
    router.push({ name: 'TvDetail', params: { id: winner.id } })
  } else if (awardDetail.value.target_type === 'VARIETY') {
    router.push({ name: 'VarietyDetail', params: { id: winner.id } })
  }
}

function handleImageError(event: Event) {
  const img = event.target as HTMLImageElement
  img.style.display = 'none'
}

// 使用项目中的通知服务
const notify = notificationService

// 处理表单提交
async function handleFormSubmit(awardData: AwardSaveData) {
  try {
    loading.value = true
    await saveAward(awardData)
    showForm.value = false
    editFormData.value = undefined
    
    // 重新加载列表
    await load()
    
    // 显示成功消息
    const message = awardData.id ? '奖项信息修改成功！' : '奖项添加成功！'
    notify.success(message)
  } catch (err: any) {
    console.error('Failed to save award:', err)
    const errorMessage = awardData.id ? '修改失败，请稍后重试' : '添加失败，请稍后重试'
    notify.error(err?.message || errorMessage)
  } finally {
    loading.value = false
  }
}

onMounted(load)
</script>

<style scoped>
.awards-page { 
  padding: 24px; 
  width: 100%;
  max-width: 1600px;
  margin: 80px auto 40px; 
  background: linear-gradient(to bottom, #f9fafb 0%, #ffffff 100%);
  min-height: calc(100vh - 80px);
}
.page-header { 
  margin-bottom: 32px; 
  padding: 32px;
  background: linear-gradient(135deg, rgba(139, 92, 246, 0.05) 0%, rgba(139, 92, 246, 0.02) 100%);
  border-radius: 16px;
  border: 1px solid rgba(139, 92, 246, 0.1);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
}
.header-content {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 24px;
}
.header-title-section {
  flex: 1;
}
.header-actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
}
.add-button {
  padding: 12px 24px;
  background: linear-gradient(135deg, var(--primary-color) 0%, #fb923c 100%);
  color: #fff;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  font-weight: 600;
  font-size: 15px;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(249, 115, 22, 0.3);
}
.add-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(249, 115, 22, 0.4);
}
.filters {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  align-items: center;
  margin-top: 24px;
}
.filter-group {
  position: relative;
  display: flex;
  align-items: center;
  flex: 1;
  min-width: 200px;
}
.filter-group i {
  position: absolute;
  left: 12px;
  color: #9ca3af;
  font-size: 16px;
  z-index: 1;
}
.filter-input, .filter-select {
  width: 100%;
  padding: 12px 12px 12px 40px;
  border: 2px solid #e5e7eb;
  border-radius: 10px;
  font-size: 14px;
  transition: all 0.2s;
  background: #fff;
}
.filter-input:focus, .filter-select:focus {
  outline: none;
  border-color: #8b5cf6;
  box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.1);
}
.search-button {
  padding: 12px 24px;
  background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
  color: #fff;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(139, 92, 246, 0.3);
}
.search-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(139, 92, 246, 0.4);
}
.search-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}
.page-title {
  font-size: 36px;
  font-weight: 700;
  color: #111827;
  margin: 0 0 8px 0;
  display: flex;
  align-items: center;
  gap: 12px;
  background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
.page-title i {
  font-size: 32px;
  -webkit-text-fill-color: #8b5cf6;
}
.page-subtitle {
  font-size: 16px;
  color: #6b7280;
  margin: 0;
  line-height: 1.6;
}
.awards-list {
  display: flex;
  flex-direction: column;
  gap: 0;
  min-height: 400px;
  width: 100%;
  background: #fff;
  border-radius: 16px;
  border: 1px solid #e5e7eb;
  overflow: hidden;
}
.award-row {
  display: flex;
  align-items: flex-start;
  gap: 24px;
  padding: 20px 24px;
  border-bottom: 1px solid #f3f4f6;
  transition: all 0.2s ease;
  background: #fff;
  cursor: pointer;
}
.award-row:last-child {
  border-bottom: none;
}
.award-row:hover {
  background: #f9fafb;
}
.award-main {
  flex: 1;
  min-width: 0;
}
.award-name {
  font-size: 18px;
  font-weight: 700;
  color: #111827;
  margin: 0 0 8px 0;
  line-height: 1.4;
}
.award-meta {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
  font-size: 13px;
  color: #6b7280;
}
.award-org {
  color: #374151;
  font-weight: 500;
}
.award-type {
  padding: 2px 8px;
  background: rgba(139, 92, 246, 0.1);
  color: #8b5cf6;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
}
.award-year {
  padding: 2px 8px;
  background: rgba(139, 92, 246, 0.1);
  color: #8b5cf6;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
}
.award-details {
  display: flex;
  flex-direction: column;
  gap: 6px;
  flex-shrink: 0;
  min-width: 200px;
}
.award-detail-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
}
.detail-label {
  color: #9ca3af;
  font-weight: 500;
  min-width: 50px;
  flex-shrink: 0;
}
.detail-value {
  color: #374151;
}
.empty-container { 
  min-height: 400px; 
  display: flex; 
  flex-direction: column; 
  justify-content: center; 
  align-items: center;
  padding: 60px 20px;
}
.empty { 
  text-align: center; 
  color: #6b7280; 
  font-size: 16px;
}
.loading, .error { 
  text-align: center; 
  padding: 60px 40px; 
  color: #6b7280;
  font-size: 16px;
}
.error { 
  color: #ef4444;
  background: #fef2f2;
  padding: 20px;
  border-radius: 12px;
  border: 1px solid #fecaca;
}
.pagination-container { margin-top: 24px; display: flex; flex-direction: column; gap: 16px; }
.pagination-info { display: flex; align-items: center; justify-content: center; gap: 8px; color: #6b7280; font-size: 14px; }
.pagination { display: flex; align-items: center; justify-content: center; gap: 8px; flex-wrap: wrap; }
.pagination-btn { padding: 8px 12px; border: 1px solid #e5e7eb; background: #fff; border-radius: 6px; cursor: pointer; font-size: 14px; color: #374151; transition: all 0.2s; min-width: 36px; }
.pagination-btn:hover:not(:disabled) { background: #f9fafb; border-color: #8b5cf6; color: #8b5cf6; }
.pagination-btn:disabled { opacity: 0.5; cursor: not-allowed; }
.pagination-btn.active { background: #8b5cf6; color: #fff; border-color: #8b5cf6; font-weight: 600; }
.page-numbers { display: flex; align-items: center; gap: 4px; }
.page-ellipsis { padding: 8px 4px; color: #9ca3af; user-select: none; }
.page-jump { display: flex; align-items: center; gap: 6px; margin-left: 12px; padding-left: 12px; border-left: 1px solid #e5e7eb; font-size: 14px; color: #6b7280; }
.jump-input { width: 50px; padding: 6px 8px; border: 1px solid #e5e7eb; border-radius: 6px; text-align: center; font-size: 14px; }
.jump-btn { padding: 6px 12px; border: 1px solid #e5e7eb; background: #fff; border-radius: 6px; cursor: pointer; font-size: 14px; color: #374151; }
.jump-btn:hover { background: #f9fafb; border-color: #8b5cf6; color: #8b5cf6; }

.detail-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  backdrop-filter: blur(2px);
  padding: 20px;
}

.detail-modal {
  background: white;
  border-radius: 16px;
  width: 90%;
  max-width: 900px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 48px rgba(0, 0, 0, 0.2);
  animation: slideIn 0.3s ease-out;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-20px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.detail-modal .modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24px 32px;
  border-bottom: 1px solid #e5e7eb;
  position: sticky;
  top: 0;
  background: white;
  z-index: 1;
}

.detail-modal .header-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.detail-modal .edit-btn {
  padding: 8px 16px;
  background: linear-gradient(135deg, var(--primary-color) 0%, #fb923c 100%);
  color: #fff;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(249, 115, 22, 0.3);
}

.detail-modal .edit-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(249, 115, 22, 0.4);
}

.detail-modal .modal-header h2 {
  margin: 0;
  font-size: 24px;
  font-weight: 700;
  color: #111827;
}

.detail-modal .close-btn {
  background: none;
  border: none;
  font-size: 32px;
  color: #9ca3af;
  cursor: pointer;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  transition: all 0.2s;
}

.detail-modal .close-btn:hover {
  background: #f3f4f6;
  color: #111827;
}

.modal-content {
  padding: 32px;
}

.detail-info {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 24px;
  padding-bottom: 24px;
  border-bottom: 1px solid #f3f4f6;
}

.detail-info .info-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 15px;
}

.detail-info .info-label {
  color: #8b5cf6;
  font-weight: 500;
  min-width: 120px;
}

.detail-info .info-value {
  color: #111827;
  font-weight: 400;
}

.description-section {
  margin-bottom: 24px;
}

.description-section .section-title {
  font-size: 18px;
  font-weight: 700;
  color: #111827;
  margin: 0 0 12px 0;
  padding-bottom: 8px;
  border-bottom: 2px solid #8b5cf6;
}

.description-section .description {
  color: #374151;
  line-height: 1.8;
  font-size: 14px;
  margin: 0;
  white-space: pre-wrap;
  word-break: break-word;
}

.winners-section .section-title {
  font-size: 18px;
  font-weight: 700;
  color: #111827;
  margin: 0 0 16px 0;
  padding-bottom: 8px;
  border-bottom: 2px solid #8b5cf6;
}

.winners-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 16px;
}

.winner-card {
  display: flex;
  gap: 12px;
  padding: 12px;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  background: #fff;
  cursor: pointer;
  transition: all 0.3s ease;
}

.winner-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(139, 92, 246, 0.15);
  border-color: #8b5cf6;
}

.winner-image {
  flex-shrink: 0;
  width: 60px;
  height: 90px;
  border-radius: 6px;
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
  font-size: 14px;
  font-weight: 700;
  color: #111827;
  margin: 0 0 6px 0;
}

.winner-meta {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 6px;
}

.winner-year {
  padding: 2px 6px;
  background: rgba(139, 92, 246, 0.1);
  color: #8b5cf6;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 500;
}

.winner-status {
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 11px;
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
  font-size: 12px;
  color: #6b7280;
  margin: 0;
  line-height: 1.4;
}

.loading-content {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 200px;
}

@media (max-width: 768px) {
  .awards-page {
    padding: 16px;
  }
  .page-header {
    padding: 20px;
  }
  .award-row {
    flex-direction: column;
    gap: 12px;
    padding: 16px;
  }
  .award-details {
    min-width: 100%;
    width: 100%;
  }
  .detail-modal {
    width: 95%;
    max-height: 95vh;
  }
  .modal-content {
    padding: 20px;
  }
  .winners-list {
    grid-template-columns: repeat(auto-fill, minmax(100%, 1fr));
  }
}
</style>

