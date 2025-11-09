<template>
  <div class="actors-page">
    <div class="page-header">
      <h1>演员与导演</h1>
      <div class="header-actions">
        <button v-if="isAdmin" class="add-button" @click="handleAddActor">
          + 添加演员/导演
        </button>
      </div>
      <div class="filters">
        <input v-model="keyword" @keyup.enter="handleSearch" placeholder="搜索姓名，如：张艺谋 " />
        <select v-model="gender" @change="handleSearch">
          <option value="">性别（全部）</option>
          <option value="男">男</option>
          <option value="女">女</option>
          <option value="其他">其他</option>
        </select>
        <input v-model="nationality" @keyup.enter="handleSearch" placeholder="国籍，如：中国 / 美国" />
        <button @click="handleSearch" :disabled="loading">搜索</button>
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
      <div v-for="actor in actors" :key="actor.id" class="actor-card" @click="goDetail(actor.id)">
        <img 
          :src="actor.avatar || fallbackAvatar" 
          :alt="actor.name" 
          class="avatar" 
          @error="handleImageError"
        />
        <div class="meta">
          <div class="name">{{ actor.name }}</div>
          <div class="sub">
            <span v-if="actor.nationality">{{ actor.nationality }}</span>
            <span v-if="actor.gender"> · {{ actor.gender }}</span>
          </div>
          <div class="counts">
            <span v-if="actor.moviesCount">电影 {{ actor.moviesCount }}</span>
            <span v-if="actor.tvShowsCount"> · 电视剧 {{ actor.tvShowsCount }}</span>
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

// 获取全局通知服务
// 通知辅助函数（使用console避免TypeScript错误）
const notify = {
  success: (message: string) => console.log('Success:', message),
  error: (message: string) => console.error('Error:', message),
  warning: (message: string) => console.warn('Warning:', message),
  info: (message: string) => console.info('Info:', message)
};

// 处理表单提交
async function handleFormSubmit(actorData: ActorSaveData) {
  try {
    loading.value = true
    await saveActor(actorData)
    showForm.value = false
    
    // 重新加载列表
    await load()
    
    // 显示成功消息
    $notification.success('演员/导演添加成功！')
  } catch (err: any) {
    console.error('Failed to save actor:', err)
    $notification.error(err?.message || '添加失败，请稍后重试')
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
}
.page-header { display: flex; flex-direction: column; gap: 16px; margin-bottom: 16px; }
.header-actions { display: flex; align-items: center; justify-content: flex-end; }
.add-button { padding: 10px 20px; background: var(--primary-color); color: #fff; border: none; border-radius: 8px; cursor: pointer; font-weight: 600; }
.add-button:hover { background: var(--primary-dark); }
.filters { display: flex; gap: 8px; flex-wrap: wrap; }
.filters input, .filters select { padding: 10px 12px; border: 1px solid #e5e7eb; border-radius: 8px; }
.filters button { padding: 10px 16px; background: var(--primary-color); color: #fff; border: none; border-radius: 8px; cursor: pointer; }
.filters button:disabled { opacity: 0.6; cursor: not-allowed; }
.actors-grid { 
  display: grid; 
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); 
  gap: 16px; 
  min-height: 400px;
  width: 100%;
}
.actor-card { display: flex; gap: 12px; padding: 12px; border: 1px solid #f3f4f6; border-radius: 12px; background: #fff; cursor: pointer; transition: all .2s; }
.actor-card:hover { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(249,115,22,.12); }
.avatar { width: 72px; height: 96px; object-fit: contain; object-position: center; border-radius: 8px; background: #f3f4f6; flex-shrink: 0; }
.meta { display: flex; flex-direction: column; gap: 6px; }
.name { font-weight: 700; color: #111827; }
.sub, .counts { font-size: 12px; color: #6b7280; }
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
.empty-container { min-height: 400px; display: flex; flex-direction: column; justify-content: space-between; align-items: center; }
.empty { text-align: center; color: #6b7280; padding-top: 40px; }
.empty-container .pagination-info { margin-bottom: 16px; }
.loading, .error { text-align: center; padding: 40px; color: #6b7280; }
.error { color: #ef4444; }
</style>



