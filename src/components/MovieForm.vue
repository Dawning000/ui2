<template>
  <div class="movie-form-overlay" @click.self="handleCancel">
    <div class="movie-form-modal">
      <div class="modal-header">
        <h2>{{ isEdit ? '编辑电影' : '添加电影' }}</h2>
        <button class="close-btn" @click="handleCancel">×</button>
      </div>
      
      <form @submit.prevent="handleSubmit" class="movie-form">
        <div class="form-group">
          <label>标题 <span class="required">*</span></label>
          <input 
            v-model="form.title" 
            type="text" 
            required 
            placeholder="请输入电影标题"
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
            <label>时长（分钟） <span class="required">*</span></label>
            <input 
              v-model.number="form.duration" 
              type="number" 
              required 
              placeholder="如：120"
              min="1"
            />
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label>国家 <span class="required">*</span></label>
            <input 
              v-model="form.country" 
              type="text" 
              required 
              placeholder="如：中国、美国"
            />
          </div>

          <div class="form-group">
            <label>语言 <span class="required">*</span></label>
            <input 
              v-model="form.language" 
              type="text" 
              required 
              placeholder="如：中文、英语"
            />
          </div>
        </div>

        <div class="form-group">
          <label>标签 <span class="required">*</span></label>
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
          <label>导演 <span class="required">*</span></label>
          <div class="select-with-search">
            <input 
              v-model="directorSearch" 
              type="text" 
              placeholder="搜索导演姓名..."
              @input="searchDirector"
              class="search-input"
            />
            <select v-model.number="form.director" required class="select-input">
              <option :value="0">请选择导演</option>
              <option v-for="actor in directorOptions" :key="actor.id" :value="actor.id">
                {{ actor.name }}
              </option>
            </select>
          </div>
        </div>

        <div class="form-group">
          <label>演员列表 <span class="required">*</span></label>
          <div class="select-with-search">
            <input 
              v-model="actorSearch" 
              type="text" 
              placeholder="搜索演员姓名..."
              @input="searchActor"
              class="search-input"
            />
            <div class="multi-select">
              <select 
                v-model="selectedActor" 
                @change="addActor"
                class="select-input"
              >
                <option :value="0">选择演员后会自动添加</option>
                <option v-for="actor in actorOptions" :key="actor.id" :value="actor.id">
                  {{ actor.name }}
                </option>
              </select>
              <div v-if="form.actors.length > 0" class="selected-list">
                <span v-for="actorId in form.actors" :key="actorId" class="selected-item">
                  {{ getActorName(actorId) }}
                  <button type="button" @click="removeActor(actorId)" class="item-remove">×</button>
                </span>
              </div>
            </div>
          </div>
        </div>

        <div class="form-group">
          <label>海报图URL <span class="required">*</span></label>
          <input 
            v-model="form.poster" 
            type="text" 
            required 
            placeholder="请输入海报图片URL"
          />
        </div>

        <div class="form-group">
          <label>简介 <span class="required">*</span></label>
          <textarea 
            v-model="form.summary" 
            required 
            rows="4"
            placeholder="请输入电影简介"
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
          <label>照片URL列表 <span class="required">*</span></label>
          <div class="photos-input">
            <div v-if="form.photos.length > 0" class="photos-list">
              <div v-for="(photo, index) in form.photos" :key="index" class="photo-item">
                <input 
                  v-model="form.photos[index]" 
                  type="text" 
                  placeholder="照片URL"
                  class="photo-input"
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
              placeholder="搜索奖项..."
              @input="searchAward"
              class="search-input"
            />
            <div class="multi-select">
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
              <div v-if="form.awards.length > 0" class="selected-list">
                <span v-for="awardId in form.awards" :key="awardId" class="selected-item">
                  {{ getAwardName(awardId) }}
                  <button type="button" @click="removeAward(awardId)" class="item-remove">×</button>
                </span>
              </div>
            </div>
          </div>
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
import { ref, reactive, computed } from 'vue'
import { fetchActors } from '@/api/actors'
import type { ActorListItem } from '@/types/actors'
import type { MovieSaveData } from '@/api/movies'

interface AwardOption {
  id: number
  name: string
}

interface Props {
  initialData?: any
  isEdit?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  isEdit: false
})

const emit = defineEmits<{
  submit: [data: MovieSaveData]
  cancel: []
}>()

const submitting = ref(false)
const newTag = ref('')
const directorSearch = ref('')
const actorSearch = ref('')
const awardSearch = ref('')
const selectedActor = ref(0)
const selectedAward = ref(0)

const directorOptions = ref<ActorListItem[]>([])
const actorOptions = ref<ActorListItem[]>([])
const awardOptions = ref<AwardOption[]>([])

const form = reactive<Omit<MovieSaveData, 'id'>>({
  title: '',
  original_title: '',
  year: new Date().getFullYear(),
  tags: [],
  director: 0,
  actors: [],
  poster: '',
  summary: '',
  awards: [],
  duration: 0,
  country: '',
  language: '',
  trailer: '',
  photos: []
})

// 初始化表单数据
if (props.initialData) {
  Object.assign(form, {
    title: props.initialData.title || '',
    original_title: props.initialData.original_title || '',
    year: props.initialData.year || new Date().getFullYear(),
    tags: props.initialData.tags || props.initialData.genre || [],
    director: props.initialData.director?.id || props.initialData.director || 0,
    actors: props.initialData.actors?.map((a: any) => a.id || a) || [],
    poster: props.initialData.poster || '',
    summary: props.initialData.summary || '',
    awards: props.initialData.awards?.map((a: any) => a.id || a) || [],
    duration: props.initialData.duration || 0,
    country: props.initialData.country || '',
    language: props.initialData.language || '',
    trailer: props.initialData.trailer || '',
    photos: props.initialData.photos || []
  })
}

// 加载演员列表
async function loadActors() {
  try {
    const data = await fetchActors({ page: 1, size: 100 })
    directorOptions.value = data.actors || []
    actorOptions.value = data.actors || []
  } catch (error) {
    console.error('加载演员列表失败:', error)
  }
}

// 搜索导演
async function searchDirector() {
  try {
    const data = await fetchActors({ 
      page: 1, 
      size: 20, 
      keyword: directorSearch.value || undefined 
    })
    directorOptions.value = data.actors || []
  } catch (error) {
    console.error('搜索导演失败:', error)
  }
}

// 搜索演员
async function searchActor() {
  try {
    const data = await fetchActors({ 
      page: 1, 
      size: 20, 
      keyword: actorSearch.value || undefined 
    })
    actorOptions.value = data.actors || []
  } catch (error) {
    console.error('搜索演员失败:', error)
  }
}

// 搜索奖项（简化版，实际应该调用奖项API）
async function searchAward() {
  // TODO: 实现奖项搜索API调用
  // 目前使用模拟数据
  awardOptions.value = []
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

// 添加演员
function addActor() {
  const actorId = selectedActor.value
  if (actorId && !form.actors.includes(actorId)) {
    form.actors.push(actorId)
    selectedActor.value = 0
  }
}

// 删除演员
function removeActor(actorId: number) {
  const index = form.actors.indexOf(actorId)
  if (index > -1) {
    form.actors.splice(index, 1)
  }
}

// 获取演员名称
function getActorName(actorId: number): string {
  const actor = actorOptions.value.find(a => a.id === actorId)
  return actor?.name || `ID: ${actorId}`
}

// 添加奖项
function addAward() {
  const awardId = selectedAward.value
  if (awardId && !form.awards.includes(awardId)) {
    form.awards.push(awardId)
    selectedAward.value = 0
  }
}

// 删除奖项
function removeAward(awardId: number) {
  const index = form.awards.indexOf(awardId)
  if (index > -1) {
    form.awards.splice(index, 1)
  }
}

// 获取奖项名称
function getAwardName(awardId: number): string {
  const award = awardOptions.value.find(a => a.id === awardId)
  return award?.name || `ID: ${awardId}`
}

// 添加照片
function addPhoto() {
  form.photos.push('')
}

// 删除照片
function removePhoto(index: number) {
  form.photos.splice(index, 1)
}

// 提交表单
async function handleSubmit() {
  submitting.value = true
  try {
    // 验证必填字段
    if (!form.title || !form.year || form.tags.length === 0 || 
        !form.director || form.actors.length === 0 || !form.poster || 
        !form.summary || !form.duration ||
        !form.country || !form.language || form.photos.length === 0) {
      alert('请填写所有必填字段')
      return
    }

    const submitData: MovieSaveData = {
      ...form,
      original_title: form.original_title || undefined,
      trailer: form.trailer || undefined,
      awards: form.awards.length > 0 ? form.awards : undefined
    }
    
    // 如果是编辑模式，添加id字段
    if (props.isEdit && props.initialData?.id) {
      submitData.id = props.initialData.id
    }
    
    emit('submit', submitData)
  } finally {
    submitting.value = false
  }
}

// 取消
function handleCancel() {
  emit('cancel')
}

// 组件挂载时加载演员列表
loadActors()
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
  background: var(--bg-primary);
  color: var(--primary-color);
  border-radius: 16px;
  font-size: 13px;
}

.tag-remove {
  border: none;
  background: none;
  color: var(--primary-color);
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
  background: var(--primary-color);
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
}

.select-with-search {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.search-input {
  padding: 8px 12px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-size: 13px;
}

.select-input {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-size: 14px;
}

.multi-select {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.selected-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding: 8px;
  background: #f9fafb;
  border-radius: 8px;
  min-height: 40px;
}

.selected-item {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 12px;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 16px;
  font-size: 13px;
}

.item-remove {
  border: none;
  background: none;
  color: #6b7280;
  cursor: pointer;
  font-size: 16px;
  line-height: 1;
  padding: 0;
  width: 16px;
  height: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
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
}

.photo-input {
  flex: 1;
  margin: 0;
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
  background: var(--primary-color);
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
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
  background: var(--primary-color);
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s;
}

.submit-btn:hover:not(:disabled) {
  background: var(--primary-dark);
}

.submit-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>

