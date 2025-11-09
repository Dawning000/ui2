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
              <div v-if="form.actors.length > 0" class="actors-list">
                <div v-for="(actor, index) in form.actors" :key="index" class="actor-item">
                  <div class="actor-header">
                    <span class="actor-name">{{ getActorName(actor.id) }}</span>
                    <button type="button" @click="removeActor(index)" class="item-remove">×</button>
                  </div>
                  <div class="actor-fields">
                    <div class="actor-field">
                      <label>角色 <span class="required">*</span></label>
                      <input 
                        v-model="actor.role" 
                        type="text" 
                        placeholder="如：主演、配角、幕后等"
                        required
                        class="actor-input"
                      />
                    </div>
                    <div class="actor-field">
                      <label>描述 <span class="required">*</span></label>
                      <input 
                        v-model="actor.description" 
                        type="text" 
                        placeholder="描述演员在该电影中的表现"
                        required
                        class="actor-input"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="form-group">
          <label>海报图URL <span class="required">*</span></label>
          <ImageUploader
            v-model="form.poster"
            placeholder="请输入海报图片URL或点击上传"
            upload-type="image"
            button-text="上传海报"
            required
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
                <ImageUploader
                  v-model="form.photos[index]"
                  placeholder="请输入照片URL或点击上传"
                  upload-type="image"
                  button-text="上传照片"
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
              <div v-if="form.awards!.length > 0" class="selected-list">
                <span v-for="awardId in form.awards!" :key="awardId" class="selected-item">
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
import { ref, reactive, computed, getCurrentInstance } from 'vue'
import { fetchActors } from '@/api/actors'
import type { ActorListItem } from '@/types/actors'
import type { MovieSaveData, MovieActor } from '@/api/movies'
import ImageUploader from './ImageUploader.vue'

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
  actors: [] as MovieActor[],
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
    actors: props.initialData.actors?.map((a: any) => ({
      id: a.id || a,
      role: a.role || '',
      description: a.description || ''
    } as MovieActor)) || [],
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
  if (actorId) {
    // 检查是否已添加
    const exists = form.actors.find(a => a.id === actorId)
    if (!exists) {
      form.actors.push({
        id: actorId,
        role: '',
        description: ''
      })
      selectedActor.value = 0
    }
  }
}

// 删除演员
function removeActor(index: number) {
  if (index > -1 && index < form.actors.length) {
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
  if (awardId && !form.awards!.includes(awardId)) {
    form.awards!.push(awardId)
    selectedAward.value = 0
  }
}

// 删除奖项
function removeAward(awardId: number) {
  const index = form.awards!.indexOf(awardId)
  if (index > -1) {
    form.awards!.splice(index, 1)
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
    // 验证必填字段 - 只保留标题和年份作为必填
  if (!form.title || !form.year) {
    notify.warning('请填写标题和年份')
    return
  }

    const submitData: MovieSaveData = {
      title: form.title,
      original_title: form.original_title || undefined,
      year: form.year,
      tags: form.tags,
      director: Number(form.director), // 确保是数字类型
      actors: form.actors.map(actor => ({
        id: Number(actor.id),
        role: actor.role.trim(),
        description: actor.description.trim()
      })),
      poster: form.poster,
      summary: form.summary,
      duration: Number(form.duration),
      country: form.country,
      language: form.language,
      trailer: form.trailer || undefined,
      photos: form.photos.filter(p => p.trim()), // 过滤空字符串
      awards: form.awards!.length > 0 ? form.awards!.map(id => Number(id)) : undefined
    }
    
    // 如果是编辑模式，添加id字段
    if (props.isEdit && props.initialData?.id) {
      submitData.id = props.initialData.id
    }
    
    emit('submit', submitData)
    notify.success('电影保存成功！')
  } catch (error) {
    notify.error(error?.message || '保存失败，请稍后重试')
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

.actors-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 12px;
  background: #f9fafb;
  border-radius: 8px;
  margin-top: 8px;
}

.actor-item {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 12px;
}

.actor-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.actor-name {
  font-weight: 600;
  color: #374151;
  font-size: 14px;
}

.actor-fields {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.actor-field {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.actor-field label {
  font-size: 12px;
  font-weight: 500;
  color: #6b7280;
  margin: 0;
}

.actor-input {
  padding: 8px 10px;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  font-size: 13px;
  margin: 0;
}

.actor-input:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(249, 115, 22, 0.1);
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

