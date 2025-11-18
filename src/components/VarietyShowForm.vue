<template>
  <div class="movie-form-overlay">
    <div class="movie-form-modal">
      <div class="modal-header">
        <h2>{{ isEdit ? '编辑综艺' : '添加综艺' }}</h2>
        <button class="close-btn" @click="handleCancel">×</button>
      </div>
      
      <form @submit.prevent="handleSubmit" class="movie-form">
        <div class="form-group">
          <label>标题 <span class="required">*</span></label>
          <input 
            v-model="form.title" 
            type="text" 
            required 
            placeholder="请输入综艺标题"
          />
        </div>

        <div class="form-group">
          <label>原标题</label>
          <input 
            v-model="form.original_title" 
            type="text" 
            placeholder="如果有的话（可选）"
          />
        </div>

        <div class="form-row">
          <div class="form-group">
            <label>年份 <span class="required">*</span></label>
            <input 
              v-model.number="form.year" 
              type="number" 
              required 
              placeholder="如：2024"
              min="1900"
              max="2099"
            />
          </div>

          <div class="form-group">
            <label>集数</label>
            <input 
              v-model.number="form.episodes" 
              type="number" 
              placeholder="总集数"
              min="1"
            />
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label>国家</label>
            <input 
              v-model="form.country" 
              type="text" 
              placeholder="如：中国、美国"
            />
          </div>

          <div class="form-group">
            <label>语言</label>
            <input 
              v-model="form.language" 
              type="text" 
              placeholder="如：中文、英语"
            />
          </div>
        </div>

        <div class="form-group">
          <label>标签</label>
          <div class="tags-input">
            <div v-if="form.tags.length > 0" class="tags-list">
              <span v-for="(tag, index) in form.tags" :key="index" class="tag-item">
                {{ tag }}
                <button type="button" @click="removeTag(index)" class="tag-remove">×</button>
              </span>
            </div>
            <div class="tags-input-row">
              <input 
                v-model="newTag" 
                type="text" 
                placeholder="输入标签后按回车添加"
                @keyup.enter="addTag"
                class="tag-input"
              />
              <button type="button" @click="addTag" class="add-tag-btn">添加</button>
            </div>
          </div>
        </div>

        <div class="form-group">
          <label>主持人</label>
          <div class="select-with-search">
            <input 
              v-model="hostSearch" 
              type="text" 
              placeholder="搜索主持人姓名..."
              @input="searchHost"
              class="search-input"
            />
            <select v-model.number="form.host" class="select-input">
              <option :value="0">请选择主持人</option>
              <option v-for="actor in hostOptions" :key="actor.id" :value="actor.id">
                {{ actor.name }}
              </option>
            </select>
          </div>
        </div>

        <div class="form-group">
          <label>嘉宾列表</label>
          <div class="select-with-search">
            <input 
              v-model="guestSearch" 
              type="text" 
              placeholder="搜索嘉宾姓名..."
              @input="searchGuest"
              class="search-input"
            />
            <div class="multi-select">
              <select 
                v-model="selectedGuest" 
                @change="addGuest"
                class="select-input"
              >
                <option :value="0">选择嘉宾后会自动添加</option>
                <option v-for="actor in guestOptions" :key="actor.id" :value="actor.id">
                  {{ actor.name }}
                </option>
              </select>
              <div v-if="form.guests.length > 0" class="guests-list">
                <div v-for="(guest, index) in form.guests" :key="index" class="guest-item">
                  <div class="guest-header">
                    <span class="guest-name">{{ getGuestName(guest.id) }}</span>
                    <button type="button" @click="removeGuest(index)" class="item-remove">×</button>
                  </div>
                  <div class="guest-fields">
                    <div class="guest-field">
                      <label>角色</label>
                      <input 
                        v-model="guest.role" 
                        type="text" 
                        placeholder="如：常驻嘉宾、飞行嘉宾等"
                        class="guest-input"
                      />
                    </div>
                    <div class="guest-field">
                      <label>描述</label>
                      <input 
                        v-model="guest.description" 
                        type="text" 
                        placeholder="描述嘉宾在该综艺中的表现"
                        class="guest-input"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="form-group">
          <label>海报图URL</label>
          <ImageUploader
            v-model="form.poster"
            placeholder="请点击上传海报图片"
            upload-type="image"
            button-text="上传海报"
            :disable-url-input="true"
          />
        </div>

        <div class="form-group">
          <label>简介</label>
          <textarea 
            v-model="form.summary" 
            rows="4"
            placeholder="请输入综艺简介"
          ></textarea>
        </div>

        <div class="form-group">
          <label>预告片URL</label>
          <input 
            v-model="form.trailer" 
            type="text" 
            placeholder="可选"
          />
        </div>

        <div class="form-group">
          <label>照片URL列表</label>
          <div class="photos-input">
            <div v-if="form.photos.length > 0" class="photos-list">
              <div v-for="(photo, index) in form.photos" :key="index" class="photo-item">
                <ImageUploader
                  v-model="form.photos[index]"
                  placeholder="请点击上传照片"
                  upload-type="image"
                  button-text="上传照片"
                  :disable-url-input="true"
                />
                <button type="button" @click="removePhoto(index)" class="photo-remove">删除</button>
              </div>
            </div>
            <button type="button" @click="addPhoto" class="add-photo-btn">+ 添加照片URL</button>
          </div>
        </div>

        <div class="form-group">
          <label>奖项</label>
          <div class="select-with-search">
            <input
              v-model="awardSearch"
              type="text"
              placeholder="搜索奖项名称..."
              @input="searchAward"
              class="search-input"
            />
            <select
              v-model="selectedAward"
              @change="addAward"
              class="select-input"
            >
              <option :value="0">选择奖项后会自动添加</option>
              <option v-for="award in awardOptions" :key="award.id" :value="award.id">
                {{ award.name }}
              </option>
            </select>
          </div>
          <div v-for="(award, index) in form.awards" :key="index" class="award-item">
            <div class="award-header">
              <span>奖项 {{ index + 1 }} - {{ getAwardName(award.id) }}</span>
              <button type="button" @click="removeAward(index)" class="item-remove">×</button>
            </div>
            <div class="award-fields">
              <div class="award-field">
                <label>奖项ID</label>
                <input 
                  v-model.number="award.id" 
                  type="number" 
                  readonly
                  class="award-input"
                />
              </div>
              <div class="award-field">
                <label>年份</label>
                <input 
                  v-model.number="award.year" 
                  type="number" 
                  class="award-input"
                />
              </div>
              <div class="award-field">
                <label>状态</label>
                <select v-model="award.status" class="award-select">
                  <option value="nominated">提名</option>
                  <option value="awarded">获奖</option>
                </select>
              </div>
              <div class="award-field">
                <label>备注</label>
                <input 
                  v-model="award.note" 
                  type="text" 
                  class="award-input"
                />
              </div>
            </div>
          </div>
          <button 
            type="button" 
            @click="addAward" 
            class="add-award-btn"
            :disabled="!selectedAward"
          >
            + 添加选中奖项
          </button>
        </div>

        <div class="form-actions">
          <button type="button" @click="handleCancel" class="cancel-btn">取消</button>
          <button type="submit" :disabled="submitting" class="submit-btn">
            {{ submitting ? '提交中...' : '保存' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { fetchActors } from '@/api/actors'
import { fetchAwardsList, type AwardListItem } from '@/api/awards'
import type { VarietyShowSaveData, VarietyShowGuest, VarietyShowAward } from '@/api/varietyShows'
import ImageUploader from './ImageUploader.vue'

interface Props {
  initialData?: any
  isEdit?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  isEdit: false
})

const emit = defineEmits<{
  submit: [data: VarietyShowSaveData]
  cancel: []
}>()

const submitting = ref(false)
const newTag = ref('')
const hostSearch = ref('')
const guestSearch = ref('')
const selectedGuest = ref(0)
const hostOptions = ref<any[]>([])
const guestOptions = ref<any[]>([])
const awardSearch = ref('')
const selectedAward = ref(0)
const awardOptions = ref<AwardListItem[]>([])
let awardSearchTimer: ReturnType<typeof setTimeout> | null = null

// 响应式数据
const form = reactive<Omit<VarietyShowSaveData, 'id'>>({
  title: '',
  original_title: '',
  year: new Date().getFullYear(),
  tags: [],
  host: 0,
  guests: [] as VarietyShowGuest[],
  poster: '',
  summary: '',
  awards: [] as VarietyShowAward[],
  episodes: 1,
  country: '',
  language: '',
  trailer: '',
  photos: []
})

// 加载演员列表
async function loadActors() {
  try {
    const response = await fetchActors({ page: 1, size: 100 })
    hostOptions.value = response.actors || []
    guestOptions.value = response.actors || []
  } catch (error) {
    console.error('加载演员列表失败:', error)
  }
}

// 组件挂载时加载演员列表
onMounted(() => {
  loadActors()
  loadAwards()
})

// 初始化表单数据
if (props.initialData) {
  Object.assign(form, {
    title: props.initialData.title || '',
    original_title: props.initialData.original_title || props.initialData.originalTitle || '',
    year: props.initialData.year || new Date().getFullYear(),
    tags: props.initialData.tags || props.initialData.genre || [],
    host: props.initialData.hostId || (typeof props.initialData.host === 'number' ? props.initialData.host : 0),
    guests: (props.initialData.guests || []).map((g: any) => 
      typeof g === 'object' ? {
        id: g.id || 0,
        role: g.role || '',
        description: g.description || ''
      } : {
        id: 0,
        role: '',
        description: String(g)
      }
    ),
    poster: props.initialData.poster || '',
    summary: props.initialData.summary || '',
    awards: (props.initialData.awards || []).map((a: any) => 
      typeof a === 'object' ? {
        id: a.id || 0,
        year: a.year || new Date().getFullYear(),
        status: a.status || 'nominated',
        note: a.note || ''
      } : {
        id: 0,
        year: new Date().getFullYear(),
        status: 'nominated' as const,
        note: String(a)
      }
    ),
    episodes: props.initialData.episodes || 1,
    country: props.initialData.country || '',
    language: props.initialData.language || '',
    trailer: props.initialData.trailer || '',
    photos: props.initialData.photos || []
  })
}

// 如果是新增，添加一个默认的照片
if (!props.isEdit && form.photos.length === 0) {
  addPhoto()
}

// 获取嘉宾姓名
function getGuestName(id: number): string {
  const actor = guestOptions.value.find((a: any) => a.id === id)
  return actor ? actor.name : `嘉宾${id}`
}

// 搜索主持人
async function searchHost() {
  if (!hostSearch.value.trim()) {
    hostOptions.value = []
    return
  }
  try {
    const response = await fetchActors({ page: 1, size: 20, keyword: hostSearch.value })
    hostOptions.value = response.actors || []
  } catch (error) {
    console.error('搜索主持人失败:', error)
  }
}

// 搜索嘉宾
async function searchGuest() {
  if (!guestSearch.value.trim()) {
    guestOptions.value = []
    return
  }
  try {
    const response = await fetchActors({ page: 1, size: 20, keyword: guestSearch.value })
    guestOptions.value = response.actors || []
  } catch (error) {
    console.error('搜索嘉宾失败:', error)
  }
}

async function loadAwards(keyword?: string) {
  try {
    const { awards } = await fetchAwardsList({
      page: 1,
      size: 20,
      keyword: keyword?.trim() || undefined,
      target_type: 'VARIETY'
    })
    awardOptions.value = awards || []
    ensureInitialAwardOptions()
  } catch (error) {
    console.error('加载奖项失败:', error)
  }
}

function ensureInitialAwardOptions() {
  if (!props.initialData?.awards?.length) return
  props.initialData.awards.forEach((award: any) => {
    if (!award?.id || !award?.name) return
    if (awardOptions.value.some(a => a.id === award.id)) return
    awardOptions.value.push({
      id: award.id,
      name: award.name,
      organization: award.organization,
      target_type: award.target_type,
      description: award.description
    })
  })
}

function searchAward() {
  if (awardSearchTimer) clearTimeout(awardSearchTimer)
  awardSearchTimer = setTimeout(() => {
    loadAwards(awardSearch.value)
  }, 300)
}

// 添加标签
function addTag() {
  const tag = newTag.value.trim()
  if (tag && !form.tags.includes(tag)) {
    form.tags.push(tag)
    newTag.value = ''
  }
}

// 删除标签
function removeTag(index: number) {
  form.tags.splice(index, 1)
}

// 添加嘉宾
function addGuest() {
  if (selectedGuest.value && !form.guests.find((g: VarietyShowGuest) => g.id === selectedGuest.value)) {
    form.guests.push({
      id: selectedGuest.value,
      role: '',
      description: ''
    })
    selectedGuest.value = 0
  }
}

// 删除嘉宾
function removeGuest(index: number) {
  form.guests.splice(index, 1)
}

// 添加奖项
function addAward() {
  const awardId = selectedAward.value
  if (!awardId) return
  if (form.awards.find((a: VarietyShowAward) => a.id === awardId)) {
    selectedAward.value = 0
    return
  }
  form.awards.push({
    id: awardId,
    year: new Date().getFullYear(),
    status: 'nominated',
    note: ''
  })
  selectedAward.value = 0
}

// 删除奖项
function removeAward(index: number) {
  form.awards.splice(index, 1)
}

function getAwardName(id: number): string {
  const award = awardOptions.value.find(a => a.id === id)
  return award?.name || `奖项ID ${id}`
}

// 添加照片
function addPhoto() {
  form.photos.push('')
}

// 删除照片
function removePhoto(index: number) {
  form.photos.splice(index, 1)
}

// 获取全局通知服务
// 通知辅助函数（使用console避免TypeScript错误）
const notify = {
  success: function(message: string) { console.log('Success:', message); },
  error: function(message: string) { console.error('Error:', message); },
  warning: function(message: string) { console.warn('Warning:', message); },
  info: function(message: string) { console.info('Info:', message); }
};

// 提交表单
  async function handleSubmit() {
    submitting.value = true
    try {
      // 验证必填字段
      if (!form.title || !form.year) {
        notify.warning('请填写标题和年份')
        return
      }

      const submitData: VarietyShowSaveData = {
        title: form.title,
        original_title: form.original_title || undefined,
        year: form.year,
        tags: form.tags,
        host: Number(form.host),
        guests: form.guests.map(g => ({
          id: Number(g.id),
          role: g.role.trim(),
          description: g.description.trim()
        })),
        poster: form.poster,
        summary: form.summary,
        awards: form.awards.map(a => ({
          id: Number(a.id),
          year: Number(a.year),
          status: a.status,
          note: a.note.trim()
        })),
        episodes: Number(form.episodes),
        country: form.country,
        language: form.language,
        trailer: form.trailer || undefined,
        photos: form.photos.filter(p => p.trim()) // 过滤空字符串
      }
      
      // 如果是编辑模式，添加id字段
      if (props.isEdit && props.initialData?.id) {
        submitData.id = props.initialData.id
      }
      
      emit('submit', submitData)
      notify.success('综艺保存成功！')
    } catch (error) {
      notify.error((error as any)?.message || '保存失败，请稍后重试')
    } finally {
      submitting.value = false
    }
  }

// 取消
function handleCancel() {
  emit('cancel')
}
</script>

<style scoped>
.movie-form-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.movie-form-modal {
  background: white;
  border-radius: 16px;
  width: 100%;
  max-width: 800px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24px;
  border-bottom: 1px solid #e5e7eb;
  position: sticky;
  top: 0;
  background: white;
  z-index: 10;
}

.modal-header h2 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 700;
  color: #1f2937;
}

.close-btn {
  width: 32px;
  height: 32px;
  border: none;
  background: #f3f4f6;
  border-radius: 8px;
  font-size: 24px;
  line-height: 1;
  cursor: pointer;
  color: #6b7280;
  transition: all 0.2s;
}

.close-btn:hover {
  background: #e5e7eb;
  color: #1f2937;
}

.movie-form {
  padding: 24px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  color: #374151;
  font-size: 14px;
}

.form-group .required {
  color: #ef4444;
}

.form-group input,
.form-group textarea,
.form-group select {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-size: 14px;
  transition: all 0.2s;
}

.form-group input:focus,
.form-group textarea:focus,
.form-group select:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(249, 115, 22, 0.1);
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.tags-input {
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 12px;
}

.tags-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 12px;
}

.tag-item {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 12px;
  background: var(--bg-primary, #f3f4f6);
  color: var(--primary-color, #3b82f6);
  border-radius: 16px;
  font-size: 13px;
}

.tag-remove {
  border: none;
  background: none;
  color: var(--primary-color, #3b82f6);
  cursor: pointer;
  font-size: 18px;
  line-height: 1;
  padding: 0;
  width: 16px;
  height: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.tags-input-row {
  display: flex;
  gap: 8px;
}

.tag-input {
  flex: 1;
  margin: 0;
}

.add-tag-btn {
  padding: 10px 16px;
  background: var(--primary-color, #3b82f6);
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
}

.photos-input {
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 12px;
}

.photos-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 12px;
}

.photo-item {
  display: flex;
  gap: 8px;
  align-items: flex-start;
}

.photo-item :deep(.image-uploader) {
  flex: 1;
}

.photo-remove {
  padding: 10px 16px;
  background: #ef4444;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
}

.add-photo-btn {
  padding: 10px 16px;
  background: var(--primary-color, #3b82f6);
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
}

.select-with-search {
  position: relative;
}

.search-input {
  margin-bottom: 8px;
}

.select-input {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-size: 14px;
  transition: all 0.2s;
}

.select-input:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(249, 115, 22, 0.1);
}

.multi-select {
  margin-bottom: 12px;
}

.guests-list {
  margin-top: 12px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 12px;
}

.guest-item {
  margin-bottom: 12px;
  padding: 12px;
  background: #f9fafb;
  border-radius: 8px;
}

.guest-item:last-child {
  margin-bottom: 0;
}

.guest-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.guest-name {
  font-weight: 500;
  color: #374151;
}

.item-remove {
  background: none;
  border: none;
  color: #6b7280;
  cursor: pointer;
  font-size: 18px;
  padding: 0;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.2s;
}

.item-remove:hover {
  background: #e5e7eb;
  color: #374151;
}

.guest-fields {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.guest-field {
  display: flex;
  flex-direction: column;
}

.guest-field label {
  margin-bottom: 4px;
  font-size: 13px;
  color: #6b7280;
  font-weight: 500;
}

.guest-input {
  padding: 8px 10px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 13px;
}

.guest-input:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(249, 115, 22, 0.1);
}

.award-item {
  margin-bottom: 12px;
  padding: 12px;
  background: #f9fafb;
  border-radius: 8px;
}

.award-item:last-child {
  margin-bottom: 0;
}

.award-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.award-header span {
  font-weight: 500;
  color: #374151;
}

.award-fields {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.award-field {
  display: flex;
  flex-direction: column;
}

.award-field label {
  margin-bottom: 4px;
  font-size: 13px;
  color: #6b7280;
  font-weight: 500;
}

.award-input,
.award-select {
  padding: 8px 10px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 13px;
}

.award-input:focus,
.award-select:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(249, 115, 22, 0.1);
}

.add-award-btn {
  margin-top: 10px;
  padding: 10px 16px;
  background: #10b981;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
}

.add-award-btn:hover {
  background: #059669;
}

.add-award-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
  padding-top: 24px;
  border-top: 1px solid #e5e7eb;
}

.cancel-btn {
  padding: 10px 24px;
  background: #f3f4f6;
  color: #374151;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s;
}

.cancel-btn:hover {
  background: #e5e7eb;
}

.submit-btn {
  padding: 10px 24px;
  background: var(--primary-color, #3b82f6);
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s;
}

.submit-btn:hover:not(:disabled) {
  background: var(--primary-dark, #2563eb);
}

.submit-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .form-row {
    grid-template-columns: 1fr;
  }
  
  .guest-fields,
  .award-fields {
    grid-template-columns: 1fr;
  }
}
</style>