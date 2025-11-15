<template>
  <div class="actors-page">
    <div class="page-header">
      <div class="header-content">
        <div class="header-title-section">
          <h1 class="page-title">
            <i class="icon-user"></i>
            演员与导演
          </h1>
          <p class="page-subtitle">探索优秀的演员和导演，发现他们的精彩作品</p>
        </div>
        <div class="header-actions">
          <button class="awards-button" @click="goToAwardsList">
            <i class="icon-trophy"></i>
            所有奖项列表
          </button>
          <button v-if="isAdmin" class="add-button" @click="handleAddActor">
            <i class="icon-plus"></i>
            添加演员/导演
          </button>
        </div>
      </div>
      <div class="filters">
        <div class="filter-group">
          <i class="icon-search"></i>
          <input v-model="keyword" @keyup.enter="handleSearch" placeholder="搜索姓名，如：张艺谋" class="filter-input" />
        </div>
        <div class="filter-group">
          <i class="icon-user"></i>
          <select v-model="gender" @change="handleSearch" class="filter-select">
            <option value="">性别（全部）</option>
            <option value="男">男</option>
            <option value="女">女</option>
            <option value="其他">其他</option>
          </select>
        </div>
        <div class="filter-group">
          <i class="icon-location"></i>
          <input v-model="nationality" @keyup.enter="handleSearch" placeholder="国籍，如：中国 / 美国" class="filter-input" />
        </div>
        <button @click="handleSearch" :disabled="loading" class="search-button">
          <i class="icon-search"></i>
          <span>搜索</span>
        </button>
      </div>
    </div>

    <div v-if="loading" class="loading">加载中...</div>
    <div v-else-if="error" class="error">{{ error }}</div>
    <div v-else-if="actors.length === 0" class="empty-container">
      <div class="empty">暂无搜索结果</div>
      <div class="pagination-info">
        <span>共 {{ total }} 条记录</span>
      </div>
    </div>
    <div v-else class="actors-grid">
      <div 
        v-for="actor in actors" 
        :key="actor.id" 
        class="actor-card" 
        @click="goDetail(actor.id)"
      >
        <div class="card-avatar-wrapper">
          <img 
            :src="actor.avatar || fallbackAvatar" 
            :alt="actor.name" 
            class="avatar" 
            @error="handleImageError"
          />
          <div class="avatar-overlay">
            <i class="icon-arrow-right"></i>
          </div>
        </div>
        <div class="meta">
          <div class="name">{{ actor.name }}</div>
          <div class="sub">
            <span v-if="actor.nationality" class="sub-item">
              <i class="icon-location location-icon"></i>
              {{ actor.nationality }}
            </span>
            <span v-if="actor.gender" class="sub-item">
              <i class="icon-user gender-icon"></i>
              {{ actor.gender }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <div class="pagination-container" v-if="!loading && actors.length > 0">
      <div class="pagination-info">
        <span>共 {{ total }} 条记录</span>
        <span class="divider" v-if="total > 0">|</span>
        <template v-if="total > 0">
          <span>每页显示</span>
          <select v-model="size" @change="handleSizeChange" class="page-size-select">
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

    <!-- 演员表单弹窗 -->
    <ActorForm 
      v-if="showForm" 
      :is-edit="false"
      @submit="handleFormSubmit"
      @cancel="showForm = false"
    />
  </div>
  
</template>

<script setup lang="ts">
import { ref, computed, onMounted, getCurrentInstance } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { fetchActors, saveActor } from '@/api/actors'
import { notificationService } from '@/utils/notification'
import type { ActorListItem, ActorSaveData } from '@/types/actors'
import ActorForm from '@/components/ActorForm.vue'

const router = useRouter()
const userStore = useUserStore()

const actors = ref<ActorListItem[]>([])
const total = ref(0)
const page = ref(1)
const size = ref(20)
const loading = ref(false)
const error = ref('')
const jumpPage = ref(1)

const keyword = ref('')
const nationality = ref('')
const gender = ref<'' | '男' | '女' | '其他'>('')

const totalPages = computed(() => Math.max(1, Math.ceil(total.value / size.value)))
const fallbackAvatar = '/actor_avatar.png'

// 计算可见的页码
const visiblePages = computed(() => {
  const pages: (number | string)[] = []
  const current = page.value
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

// 表单弹窗状态
const showForm = ref(false)

// 检查是否为管理员
const isAdmin = computed(() => {
  return userStore.user?.role === 'ADMIN'
})

async function load() {
  loading.value = true
  error.value = ''
  try {
    const data = await fetchActors({
      page: page.value || 1,
      size: size.value || 20,
      keyword: keyword.value || undefined,
      nationality: nationality.value || undefined,
      gender: gender.value || undefined
    })
    // 数据已经由 API 层转换完成
    actors.value = data.actors || []
    total.value = data.total || 0
    // 同步当前页码（使用后端返回的页码）
    if (data.page && data.page !== page.value) {
      page.value = data.page
    }
    // 同步每页数量（使用后端返回的数量）
    if (data.size && data.size !== size.value) {
      size.value = data.size
    }
    // 同步jumpPage与当前页码
    jumpPage.value = page.value
  } catch (err: any) {
    // 处理后端的业务错误码
    if (err && err.message) {
      error.value = err.message
    } else if (err && err.code === 10005) {
      error.value = '未经授权的操作！请先登录'
    } else {
      error.value = '加载失败，请稍后重试'
    }
    console.error('Failed to load actors:', err)
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
  if (targetPage === page.value) return // 如果目标页就是当前页，不重复加载
  page.value = targetPage
  jumpPage.value = targetPage
  // 滚动到顶部
  window.scrollTo({ top: 0, behavior: 'smooth' })
  load()
}

function handleSizeChange() {
  page.value = 1
  jumpPage.value = 1
  load()
}

function handleJump() {
  const targetPage = Math.max(1, Math.min(jumpPage.value, totalPages.value))
  if (targetPage !== page.value) {
    changePage(targetPage)
  }
}

function goDetail(id: number | string) {
  router.push({ name: 'ActorDetail', params: { id } })
}

function goToAwardsList() {
  router.push({ name: 'AwardsList' })
}

// 处理图片加载失败
function handleImageError(event: Event) {
  const img = event.target as HTMLImageElement
  if (img.src !== fallbackAvatar) {
    img.src = fallbackAvatar
  }
}

function handleAddActor() {
  showForm.value = true
}

// 使用项目中的通知服务
const notify = notificationService;

// 处理表单提交
async function handleFormSubmit(actorData: ActorSaveData) {
  try {
    loading.value = true
    await saveActor(actorData)
    showForm.value = false
    
    // 重新加载列表
    await load()
    
    // 显示成功消息
    notify.success('演员/导演添加成功！')
  } catch (err: any) {
    console.error('Failed to save actor:', err)
    notify.error(err?.message || '添加失败，请稍后重试')
  } finally {
    loading.value = false
  }
}

onMounted(load)
</script>

<style scoped>
.actors-page { 
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
  background: linear-gradient(135deg, rgba(249, 115, 22, 0.05) 0%, rgba(249, 115, 22, 0.02) 100%);
  border-radius: 16px;
  border: 1px solid rgba(249, 115, 22, 0.1);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
}
.header-content {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 24px;
  margin-bottom: 24px;
}
.header-title-section {
  flex: 1;
}
.page-title {
  font-size: 36px;
  font-weight: 700;
  color: #111827;
  margin: 0 0 8px 0;
  display: flex;
  align-items: center;
  gap: 12px;
  background: linear-gradient(135deg, var(--primary-color) 0%, #fb923c 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
.page-title i {
  font-size: 32px;
  -webkit-text-fill-color: var(--primary-color);
}
.page-subtitle {
  font-size: 16px;
  color: #6b7280;
  margin: 0;
  line-height: 1.6;
}
.header-actions { display: flex; align-items: center; justify-content: flex-end; gap: 12px; }
.awards-button {
  padding: 12px 24px;
  background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
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
  box-shadow: 0 4px 12px rgba(139, 92, 246, 0.3);
}
.awards-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(139, 92, 246, 0.4);
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
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(249, 115, 22, 0.1);
}
.search-button {
  padding: 12px 24px;
  background: linear-gradient(135deg, var(--primary-color) 0%, #fb923c 100%);
  color: #fff;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(249, 115, 22, 0.3);
}
.search-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(249, 115, 22, 0.4);
}
.search-button:disabled { 
  opacity: 0.6; 
  cursor: not-allowed;
  transform: none;
}
.actors-grid { 
  display: grid; 
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); 
  gap: 24px; 
  min-height: 400px;
  width: 100%;
  align-items: stretch;
}
.actor-card { 
  display: flex; 
  align-items: center;
  gap: 20px; 
  padding: 20px; 
  border: 1px solid #e5e7eb;
  border-radius: 16px; 
  background: #fff; 
  cursor: pointer; 
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  position: relative;
  overflow: hidden;
  height: 100%;
  box-sizing: border-box;
}
.actor-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, var(--primary-color) 0%, #fb923c 100%);
  transform: scaleX(0);
  transition: transform 0.3s ease;
}
.actor-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 12px 32px rgba(249, 115, 22, 0.15);
  border-color: var(--primary-color);
}
.actor-card:hover::before {
  transform: scaleX(1);
}
.card-avatar-wrapper {
  position: relative;
  flex-shrink: 0;
  overflow: hidden;
  border-radius: 12px;
  width: 120px;
  height: 160px;
  background: #f3f4f6;
  display: flex;
  align-items: center;
  justify-content: center;
}
.avatar { 
  width: 100%;
  height: 100%;
  object-fit: cover; 
  object-position: center; 
  border-radius: 12px; 
  background: #f3f4f6;
  transition: transform 0.3s ease;
  display: block;
}
.actor-card:hover .avatar {
  transform: scale(1.1);
}
.avatar-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(249, 115, 22, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;
  border-radius: 12px;
}
.avatar-overlay i {
  color: #fff;
  font-size: 24px;
}
.actor-card:hover .avatar-overlay {
  opacity: 1;
}
.card-avatar-wrapper img {
  position: relative;
  z-index: 1;
}
/* 当头像加载失败时显示占位符图标 */
.card-avatar-wrapper:has(img[src*="actor_avatar.png"])::before {
  content: '';
  position: absolute;
  width: 60px;
  height: 60px;
  border: 3px solid #9ca3af;
  border-radius: 50%;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  opacity: 0.3;
  z-index: 0;
}
.card-avatar-wrapper:has(img[src*="actor_avatar.png"])::after {
  content: '';
  position: absolute;
  width: 40px;
  height: 40px;
  border: 3px solid #9ca3af;
  border-top: none;
  border-radius: 0 0 20px 20px;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -30%);
  opacity: 0.3;
  z-index: 0;
}
.meta { 
  display: flex; 
  flex-direction: column; 
  gap: 12px;
  flex: 1;
  min-width: 0;
  justify-content: center;
  overflow: hidden;
}
.name { 
  font-weight: 700; 
  color: #111827;
  font-size: 20px;
  line-height: 1.4;
  margin: 0;
  word-break: break-word;
  overflow-wrap: break-word;
}
.sub {
  display: flex;
  flex-direction: column;
  gap: 8px;
  font-size: 14px;
  color: #6b7280;
}
.sub-item {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #6b7280;
}
.sub-item i {
  font-size: 16px;
  flex-shrink: 0;
}
.location-icon {
  color: #ec4899;
}
.gender-icon {
  color: #a855f7;
}
.pagination-container { margin-top: 24px; display: flex; flex-direction: column; gap: 16px; }
.pagination-info { display: flex; align-items: center; justify-content: center; gap: 8px; color: #6b7280; font-size: 14px; }
.pagination-info .divider { margin: 0 4px; }
.page-size-select { padding: 6px 8px; border: 1px solid #e5e7eb; border-radius: 6px; background: #fff; cursor: pointer; font-size: 14px; }
.pagination { display: flex; align-items: center; justify-content: center; gap: 8px; flex-wrap: wrap; }
.pagination-btn { padding: 8px 12px; border: 1px solid #e5e7eb; background: #fff; border-radius: 6px; cursor: pointer; font-size: 14px; color: #374151; transition: all 0.2s; min-width: 36px; }
.pagination-btn:hover:not(:disabled) { background: #f9fafb; border-color: var(--primary-color); color: var(--primary-color); }
.pagination-btn:disabled { opacity: 0.5; cursor: not-allowed; }
.pagination-btn.active { background: var(--primary-color); color: #fff; border-color: var(--primary-color); font-weight: 600; }
.page-numbers { display: flex; align-items: center; gap: 4px; }
.page-ellipsis { padding: 8px 4px; color: #9ca3af; user-select: none; }
.page-jump { display: flex; align-items: center; gap: 6px; margin-left: 12px; padding-left: 12px; border-left: 1px solid #e5e7eb; font-size: 14px; color: #6b7280; }
.jump-input { width: 50px; padding: 6px 8px; border: 1px solid #e5e7eb; border-radius: 6px; text-align: center; font-size: 14px; }
.jump-btn { padding: 6px 12px; border: 1px solid #e5e7eb; background: #fff; border-radius: 6px; cursor: pointer; font-size: 14px; color: #374151; }
.jump-btn:hover { background: #f9fafb; border-color: var(--primary-color); color: var(--primary-color); }
.empty-container { 
  min-height: 400px; 
  display: flex; 
  flex-direction: column; 
  justify-content: space-between; 
  align-items: center;
  padding: 60px 20px;
}
.empty { 
  text-align: center; 
  color: #6b7280; 
  padding-top: 40px;
  font-size: 16px;
}
.empty-container .pagination-info { margin-bottom: 16px; }
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

/* 响应式设计 */
@media (max-width: 768px) {
  .actors-page {
    padding: 16px;
  }
  .page-header {
    padding: 20px;
  }
  .header-content {
    flex-direction: column;
    gap: 16px;
  }
  .page-title {
    font-size: 28px;
  }
  .filter-group {
    min-width: 100%;
  }
  .actors-grid {
    grid-template-columns: repeat(auto-fill, minmax(100%, 1fr));
    gap: 16px;
  }
  .actor-card {
    padding: 16px;
  }
}
</style>



