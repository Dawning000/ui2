<template>
  <div class="actor-detail-page" v-if="loaded">
    <div v-if="loading" class="loading">加载中...</div>
    <div v-else-if="error" class="error">{{ error }}</div>
    <div v-else-if="detail">
      <div class="header">
        <div class="header-content">
          <div class="name-section">
            <div class="name-row">
              <h1 class="actor-name">{{ detail.name }}</h1>
              <div v-if="isAdmin" class="admin-actions">
                <button class="edit-link-btn" @click="handleEditClick">
                  修改资料
                </button>
                <button class="delete-btn" @click="handleDeleteClick" :disabled="loading">
                  {{ loading ? '删除中...' : '删除演员' }}
                </button>
              </div>
            </div>
          </div>
          <div class="header-body">
            <div class="avatar-wrapper">
              <img 
                :src="detail.avatar || fallbackAvatar" 
                class="avatar" 
                :alt="detail.name || 'avatar'" 
                @error="handleAvatarError"
              />
            </div>
            <div class="info">
              <div class="info-item" v-if="detail.gender">
                <span class="info-label">性别:</span>
                <span class="info-value">{{ detail.gender }}</span>
              </div>
              <div class="info-item" v-if="detail.nationality">
                <span class="info-label">国籍:</span>
                <span class="info-value">{{ detail.nationality }}</span>
              </div>
              <div class="info-item" v-if="detail.birthDate">
                <span class="info-label">出生:</span>
                <span class="info-value">{{ detail.birthDate }}</span>
              </div>
              <div class="info-item" v-if="getProfession(detail)">
                <span class="info-label">职业:</span>
                <span class="info-value">{{ getProfession(detail) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="bio-section" v-if="detail.biography">
        <h2 class="bio-title">简介</h2>
        <p class="bio">{{ detail.biography }}</p>
      </div>

      <div class="section" v-if="(detail.movies?.length || 0) > 0">
        <h2>电影作品</h2>
        <div class="cards">
          <div
            v-for="m in detail.movies"
            :key="m.id"
            class="card"
            @click="navigateToMovie(m.id)"
          >
            <img :src="m.poster || placeholder" alt="poster" @error="handlePosterError" />
            <div class="title">{{ m.title }}</div>
            <div class="sub" v-if="m.year || m.role">{{ m.year }}{{ m.year && m.role ? ' · ' : '' }}{{ m.role }}</div>
          </div>
        </div>
      </div>

      <div class="section" v-if="(detail.tvShows?.length || 0) > 0">
        <h2>电视剧作品</h2>
        <div class="cards">
          <div
            v-for="t in detail.tvShows"
            :key="t.id"
            class="card"
            @click="navigateToTv(t.id)"
          >
            <img :src="t.poster || placeholder" alt="poster" @error="handlePosterError" />
            <div class="title">{{ t.title }}</div>
            <div class="sub" v-if="t.year || t.role">{{ t.year }}{{ t.year && t.role ? ' · ' : '' }}{{ t.role }}</div>
          </div>
        </div>
      </div>

      <div class="section" v-if="(detail.varietyShows?.length || 0) > 0">
        <h2>综艺作品</h2>
        <div class="cards">
          <div
            v-for="v in detail.varietyShows"
            :key="v.id"
            class="card"
            @click="navigateToVariety(v.id)"
          >
            <img :src="v.poster || placeholder" alt="poster" @error="handlePosterError" />
            <div class="title">{{ v.title }}</div>
            <div class="sub" v-if="v.year || v.role">{{ v.year }}{{ v.year && v.role ? ' · ' : '' }}{{ v.role }}</div>
          </div>
        </div>
      </div>

      <div class="section" v-if="(detail.awards?.length || 0) > 0">
        <h2>获奖与提名</h2>
        <ul class="awards">
          <li v-for="a in detail.awards" :key="a.id">
            {{ a.year }} · {{ a.name }}<span v-if="a.movie"> · {{ a.movie }}</span>
          </li>
        </ul>
      </div>
    </div>
    
    <!-- 编辑表单弹窗 -->
    <ActorForm
      v-if="showEditForm"
      :isEdit="true"
      :initialData="editFormData"
      @submit="handleFormSubmit"
      @cancel="handleFormCancel"
    />
    
    <!-- 保存错误提示 -->
    <div v-if="saveError" class="save-error">
      {{ saveError }}
      <button @click="saveError = ''" class="close-error-btn">×</button>
    </div>
    
    <!-- 自定义确认对话框 -->
    <div v-if="showConfirmDialog" class="confirm-dialog-overlay">
      <div class="confirm-dialog">
        <div class="confirm-dialog-header">
          <h3>确认删除</h3>
        </div>
        <div class="confirm-dialog-content">
          <div class="confirm-dialog-icon">
            <i class="icon-warning-circle"></i>
          </div>
          <p>确定要删除演员"{{detail?.name ?? '未知演员'}}"吗？此操作不可撤销。删除后将自动跳转到演员列表页。</p>
        </div>
        <div class="confirm-dialog-footer">
          <button class="confirm-dialog-cancel" @click="cancelDelete">取消</button>
          <button class="confirm-dialog-confirm" @click="performDelete">确认删除</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { fetchActorDetail, saveActor, deleteActor } from '@/api/actors'
import { notificationService } from '@/utils/notification'
import ActorForm from '@/components/ActorForm.vue'
import type { ActorDetail, ActorSaveData, ActorAward } from '@/types/actors'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const id = route.params.id as string

const loaded = ref(false)
const loading = ref(false)
const error = ref('')
const detail = ref<ActorDetail | null>(null)
const fallbackAvatar = '/actor_avatar.png'
const placeholder = '/actor_avatar.png'
const showEditForm = ref(false)
const saveError = ref('')
const showConfirmDialog = ref(false)

// 判断是否为管理员
const isAdmin = computed(() => {
  return userStore.user?.role === 'ADMIN'
})

// 编辑表单数据
const editFormData = computed(() => {
  if (!detail.value) return undefined
  
  // 将 ActorDetail 转换为 ActorSaveData 格式
  // 注意：awards 需要转换格式
  const awards: ActorAward[] = (detail.value.awards || []).map(award => ({
    id: award.id,
    year: award.year || new Date().getFullYear(),
    status: 'awarded' as const, // 默认设为获奖，因为无法从 AwardItem 判断
    note: award.name || '' // 使用 name 作为 note
  }))
  
  return {
    id: detail.value.id,
    name: detail.value.name || '',
    avatar: detail.value.avatar || '',
    birthday: detail.value.birthDate || '', // birthDate -> birthday
    nationality: detail.value.nationality || '',
    gender: detail.value.gender || '',
    biography: detail.value.biography || '',
    awards: awards
  }
})

async function load() {
  loading.value = true
  error.value = ''
  try {
    detail.value = await fetchActorDetail(id)
    loaded.value = true
  } catch (err: any) {
    console.error('Failed to load actor detail:', err)
    if (err?.code === 404) {
      error.value = '演员信息未找到'
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

// 处理头像加载失败
function handleAvatarError(event: Event) {
  const img = event.target as HTMLImageElement
  if (img.src !== fallbackAvatar) {
    img.src = fallbackAvatar
  }
}

// 处理海报加载失败
function handlePosterError(event: Event) {
  const img = event.target as HTMLImageElement
  if (img.src !== placeholder) {
    img.src = placeholder
  }
}

function navigateToMovie(movieId?: number) {
  if (!movieId) return
  router.push({ name: 'MovieDetail', params: { id: movieId.toString() } })
}

function navigateToTv(tvId?: number) {
  if (!tvId) return
  router.push({ name: 'TvDetail', params: { id: tvId.toString() } })
}

function navigateToVariety(varietyId?: number) {
  if (!varietyId) return
  router.push({ name: 'VarietyDetail', params: { id: varietyId.toString() } })
}

// 点击编辑按钮
function handleEditClick() {
  showEditForm.value = true
}

// 处理表单提交
async function handleFormSubmit(data: ActorSaveData) {
  saveError.value = ''
  try {
    await saveActor(data)
    showEditForm.value = false
    // 重新加载数据
    await load()
  } catch (err: any) {
    console.error('保存演员信息失败:', err)
    saveError.value = err?.message || '保存失败，请稍后重试'
  }
}

// 取消编辑
function handleFormCancel() {
  showEditForm.value = false
}

// 处理删除按钮点击
function handleDeleteClick() {
  // 显示自定义确认对话框
  showConfirmDialog.value = true
}

// 取消删除操作
function cancelDelete() {
  showConfirmDialog.value = false
}

// 执行删除操作
async function performDelete() {
  if (!id) return
  
  // 隐藏确认对话框
  showConfirmDialog.value = false
  
  loading.value = true
  error.value = ''
  try {
    await deleteActor(id)
    // 使用notify辅助函数显示成功通知
    notify.success('演员删除成功')
    // 使用Vue Router的方式跳转到演员列表页
    window.location.href = '/actors'
  } catch (err: any) {
    console.error('删除演员失败:', err)
    // 使用notify辅助函数显示错误通知
    notify.error(err?.message || '删除失败，请稍后重试')
    loading.value = false
  }
}

// 使用项目中的通知服务
const notify = notificationService;

// 计算职业信息
function getProfession(actor: ActorDetail): string {
  const professions: string[] = []
  if (actor.moviesCount && actor.moviesCount > 0) {
    professions.push('演员')
  }
  if (actor.movies?.some(m => m.role?.includes('导演')) || 
      actor.tvShows?.some(t => t.role?.includes('导演'))) {
    professions.push('导演')
  }
  if (actor.movies?.some(m => m.role?.includes('编剧')) || 
      actor.tvShows?.some(t => t.role?.includes('编剧'))) {
    professions.push('编剧')
  }
  return professions.length > 0 ? professions.join('/') : ''
}

onMounted(load)
</script>

<style scoped>
.actor-detail-page { 
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
.actor-name {
  font-size: 32px;
  font-weight: 700;
  color: #111827;
  margin: 0;
  line-height: 1.3;
  flex: 1;
}
.header-body {
  display: flex;
  gap: 32px;
  padding: 24px 32px;
  align-items: flex-start;
}
.avatar-wrapper {
  flex-shrink: 0;
  width: 200px;
  height: 280px;
  border-radius: 12px;
  overflow: hidden;
  background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}
.avatar { 
  width: 100%;
  height: 100%;
  object-fit: cover; 
  object-position: center; 
  display: block;
  transition: transform 0.3s ease;
}
.avatar:hover {
  transform: scale(1.05);
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
  color: #f97316;
  font-weight: 500;
  min-width: 60px;
}
.info-value {
  color: #111827;
  font-weight: 400;
}
.delete-btn {
  background-color: #ef4444;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  margin-left: 8px;
  transition: background-color 0.3s ease;
}

.delete-btn:hover {
  background-color: #dc2626;
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
  color: var(--primary-color);
  text-decoration: underline;
}
.bio-section {
  margin-bottom: 40px;
  padding: 32px;
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  border: 1px solid #e5e7eb;
}
.bio-title {
  font-size: 24px;
  font-weight: 700;
  color: #111827;
  margin: 0 0 16px 0;
  padding-bottom: 12px;
  border-bottom: 2px solid var(--primary-color);
}
.bio {
  color: #374151;
  line-height: 1.8;
  font-size: 15px;
  margin: 0;
  white-space: pre-wrap;
  word-break: break-word;
}
.section { 
  margin-top: 40px;
  padding: 32px;
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  border: 1px solid #e5e7eb;
}
.section h2 { 
  font-size: 28px; 
  font-weight: 700; 
  color: #111827; 
  margin-bottom: 24px; 
  padding-bottom: 12px; 
  border-bottom: 3px solid var(--primary-color);
  display: flex;
  align-items: center;
  gap: 12px;
}
.cards { 
  display: grid; 
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); 
  gap: 20px;
  width: 100%;
}
.card { 
  display: flex; 
  flex-direction: column; 
  gap: 10px; 
  cursor: pointer; 
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border-radius: 12px;
  overflow: hidden;
  background: #fff;
  border: 1px solid #e5e7eb;
}
.card:hover { 
  transform: translateY(-6px);
  box-shadow: 0 12px 32px rgba(249, 115, 22, 0.15);
  border-color: var(--primary-color);
}
.card img { 
  width: 100%; 
  height: 240px; 
  object-fit: cover; 
  border-radius: 12px 12px 0 0;
  background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%);
  transition: transform 0.3s ease;
}
.card:hover img {
  transform: scale(1.05);
}
.title { 
  font-weight: 600; 
  color: #111827; 
  font-size: 15px; 
  line-height: 1.5;
  padding: 0 12px;
  margin-top: 8px;
}
.sub { 
  font-size: 13px; 
  color: #6b7280;
  padding: 0 12px 12px;
}
.awards { 
  padding-left: 24px; 
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.awards li { 
  color: #374151; 
  line-height: 1.8; 
  padding: 12px 16px;
  background: #f9fafb;
  border-radius: 10px;
  border-left: 4px solid var(--primary-color);
  transition: all 0.2s;
  position: relative;
}
.awards li::before {
  content: '🏆';
  position: absolute;
  left: -8px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 20px;
}
.awards li:hover {
  background: rgba(249, 115, 22, 0.1);
  transform: translateX(4px);
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
.save-error { 
  position: fixed; 
  top: 80px; 
  right: 24px; 
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  color: white; 
  padding: 16px 20px; 
  border-radius: 12px; 
  box-shadow: 0 8px 24px rgba(239, 68, 68, 0.4); 
  display: flex; 
  align-items: center; 
  gap: 12px; 
  z-index: 2000; 
  max-width: 400px;
  animation: slideInRight 0.3s ease;
}
.close-error-btn { 
  background: none; 
  border: none; 
  color: white; 
  font-size: 20px; 
  cursor: pointer; 
  padding: 0; 
  width: 28px; 
  height: 28px; 
  display: flex; 
  align-items: center; 
  justify-content: center; 
  border-radius: 6px; 
  transition: background 0.2s;
  margin-left: auto;
}
.close-error-btn:hover { 
  background: rgba(255,255,255,0.2);
}

@keyframes slideInRight {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

/* 自定义确认对话框样式 */
.confirm-dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 3000;
  backdrop-filter: blur(2px);
}

.confirm-dialog {
  background: white;
  border-radius: 16px;
  width: 90%;
  max-width: 480px;
  box-shadow: 0 20px 48px rgba(0, 0, 0, 0.2);
  overflow: hidden;
  animation: dialogSlideIn 0.3s ease-out;
}

.confirm-dialog-header {
  padding: 20px 24px 16px;
  border-bottom: 1px solid #e5e7eb;
}

.confirm-dialog-header h3 {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: #111827;
}

.confirm-dialog-content {
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.confirm-dialog-icon {
  display: flex;
  justify-content: center;
  font-size: 48px;
  color: #f59e0b;
}

.confirm-dialog-content p {
  margin: 0;
  text-align: center;
  color: #374151;
  line-height: 1.6;
  font-size: 15px;
}

.confirm-dialog-footer {
  padding: 16px 24px 20px;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  border-top: 1px solid #e5e7eb;
}

.confirm-dialog-cancel,
.confirm-dialog-confirm {
  padding: 10px 20px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.confirm-dialog-cancel {
  background: #f3f4f6;
  color: #374151;
}

.confirm-dialog-cancel:hover {
  background: #e5e7eb;
  transform: translateY(-1px);
}

.confirm-dialog-confirm {
  background: #ef4444;
  color: white;
}

.confirm-dialog-confirm:hover {
  background: #dc2626;
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

/* 对话框动画 */
@keyframes dialogSlideIn {
  from {
    opacity: 0;
    transform: translateY(-20px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .actor-detail-page {
    padding: 16px;
  }
  
  .name-section {
    padding: 20px 16px 16px;
  }
  
  .actor-name {
    font-size: 24px;
  }
  
  .header-body {
    flex-direction: column;
    gap: 20px;
    padding: 20px 16px;
  }
  
  .avatar-wrapper {
    width: 100%;
    max-width: 200px;
    height: auto;
    aspect-ratio: 5 / 7;
    margin: 0 auto;
  }
  
  .info {
    width: 100%;
  }
  
  .info-item {
    font-size: 14px;
  }
  
  .bio-section {
    padding: 20px 16px;
  }
  
  .bio-title {
    font-size: 20px;
  }
  
  .section {
    padding: 20px 16px;
  }
  
  .confirm-dialog {
    margin: 20px;
    width: auto;
    max-width: none;
  }
  
  .confirm-dialog-header,
  .confirm-dialog-content,
  .confirm-dialog-footer {
    padding: 16px 20px;
  }
  
  .confirm-dialog-footer {
    flex-direction: column;
  }
  
  .confirm-dialog-cancel,
  .confirm-dialog-confirm {
    width: 100%;
  }
}
</style>



