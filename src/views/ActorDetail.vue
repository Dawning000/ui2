<template>
  <div class="actor-detail-page" v-if="loaded">
    <div v-if="loading" class="loading">加载中...</div>
    <div v-else-if="error" class="error">{{ error }}</div>
    <div v-else-if="detail">
      <div class="header">
        <img 
          :src="detail.avatar || fallbackAvatar" 
          class="avatar" 
          :alt="detail.name || 'avatar'" 
          @error="handleAvatarError"
        />
        <div class="info">
          <div class="title-row">
            <h1>{{ detail.name }}</h1>
            <button 
              v-if="isAdmin" 
              class="edit-btn"
              @click="handleEditClick"
            >
              修改演员信息
            </button>
          </div>
          <div class="meta">
            <span v-if="detail.birthDate">出生：{{ detail.birthDate }}</span>
            <span v-if="detail.nationality"> · 国籍：{{ detail.nationality }}</span>
            <span v-if="detail.gender"> · 性别：{{ detail.gender }}</span>
          </div>
          <div class="stats" v-if="detail.moviesCount !== undefined || detail.tvShowsCount !== undefined">
            <span v-if="detail.moviesCount !== undefined">电影 {{ detail.moviesCount }} 部</span>
            <span v-if="detail.tvShowsCount !== undefined"> · 电视剧 {{ detail.tvShowsCount }} 部</span>
          </div>
          <p class="bio" v-if="detail.biography">{{ detail.biography }}</p>
        </div>
      </div>

      <div class="section" v-if="(detail.movies?.length || 0) > 0">
        <h2>电影作品</h2>
        <div class="cards">
          <div v-for="m in detail.movies" :key="m.id" class="card">
            <img :src="m.poster || placeholder" alt="poster" @error="handlePosterError" />
            <div class="title">{{ m.title }}</div>
            <div class="sub" v-if="m.year || m.role">{{ m.year }}{{ m.year && m.role ? ' · ' : '' }}{{ m.role }}</div>
          </div>
        </div>
      </div>

      <div class="section" v-if="(detail.tvShows?.length || 0) > 0">
        <h2>电视剧作品</h2>
        <div class="cards">
          <div v-for="t in detail.tvShows" :key="t.id" class="card">
            <img :src="t.poster || placeholder" alt="poster" @error="handlePosterError" />
            <div class="title">{{ t.title }}</div>
            <div class="sub" v-if="t.year || t.role">{{ t.year }}{{ t.year && t.role ? ' · ' : '' }}{{ t.role }}</div>
          </div>
        </div>
      </div>

      <div class="section" v-if="(detail.varietyShows?.length || 0) > 0">
        <h2>综艺作品</h2>
        <div class="cards">
          <div v-for="v in detail.varietyShows" :key="v.id" class="card">
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
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { fetchActorDetail, saveActor } from '@/api/actors'
import ActorForm from '@/components/ActorForm.vue'
import type { ActorDetail, ActorSaveData, ActorAward } from '@/types/actors'

const route = useRoute()
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

onMounted(load)
</script>

<style scoped>
.actor-detail-page { 
  padding: 24px; 
  width: 100%;
  max-width: 1600px;
  margin: 80px auto 40px; 
}
.header { display: flex; gap: 24px; margin-bottom: 32px; padding-bottom: 32px; border-bottom: 1px solid #e5e7eb; }
.avatar { width: 160px; height: 210px; object-fit: contain; object-position: center; border-radius: 12px; background: #f3f4f6; flex-shrink: 0; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
.info { display: flex; flex-direction: column; gap: 12px; flex: 1; }
.title-row { display: flex; align-items: center; justify-content: space-between; gap: 16px; }
.info h1 { font-size: 32px; font-weight: 700; color: #111827; margin: 0; flex: 1; }
.edit-btn { padding: 8px 16px; background: var(--primary-color); color: white; border: none; border-radius: 8px; font-size: 14px; font-weight: 600; cursor: pointer; transition: all 0.2s; white-space: nowrap; }
.edit-btn:hover { background: var(--primary-dark); transform: translateY(-1px); box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
.meta { color: #6b7280; font-size: 14px; }
.stats { color: #6b7280; font-size: 14px; margin-top: 4px; }
.bio { color: #374151; line-height: 1.7; font-size: 15px; margin-top: 8px; }
.section { margin-top: 32px; }
.section h2 { font-size: 24px; font-weight: 600; color: #111827; margin-bottom: 16px; padding-bottom: 8px; border-bottom: 2px solid var(--primary-color); }
.cards { 
  display: grid; 
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); 
  gap: 16px;
  width: 100%;
}
.card { display: flex; flex-direction: column; gap: 8px; cursor: pointer; transition: all 0.2s; }
.card:hover { transform: translateY(-4px); }
.card img { width: 100%; height: 220px; object-fit: cover; border-radius: 8px; background: #f3f4f6; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
.title { font-weight: 600; color: #111827; font-size: 14px; line-height: 1.4; }
.sub { font-size: 12px; color: #6b7280; }
.awards { padding-left: 24px; list-style: disc; }
.awards li { color: #374151; line-height: 1.8; margin-bottom: 8px; }
.loading, .error { text-align: center; padding: 40px; color: #6b7280; font-size: 16px; }
.error { color: #ef4444; }
.save-error { position: fixed; top: 80px; right: 24px; background: #ef4444; color: white; padding: 12px 16px; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.2); display: flex; align-items: center; gap: 12px; z-index: 2000; max-width: 400px; }
.close-error-btn { background: none; border: none; color: white; font-size: 20px; cursor: pointer; padding: 0; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; border-radius: 4px; transition: background 0.2s; }
.close-error-btn:hover { background: rgba(255,255,255,0.2); }
</style>



