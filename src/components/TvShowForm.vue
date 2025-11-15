<template>
  <div class="movie-form-overlay" @click.self="handleCancel">
    <div class="movie-form-modal">
      <div class="modal-header">
        <h2>{{ isEdit ? '编辑电视剧' : '添加电视剧' }}</h2>
        <button class="close-btn" @click="handleCancel">×</button>
      </div>
      
      <form @submit.prevent="handleSubmit" class="movie-form">
        <div class="form-group">
          <label>标题 <span class="required">*</span></label>
          <input 
            v-model="form.title" 
            type="text" 
            required 
            placeholder="请输入电视剧标题"
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

        <div class="form-group">
          <label>国家</label>
          <input 
            v-model="form.country" 
            type="text" 
            placeholder="如：美国、中国"
          />
        </div>

        <div class="form-group">
          <label>语言</label>
          <input 
            v-model="form.language" 
            type="text" 
            placeholder="如：英语、中文"
          />
        </div>

        <div class="form-group">
          <label>标签</label>
          <div class="tag-input-group">
            <input 
              v-model="newTag" 
              type="text" 
              placeholder="添加标签后按回车"
              @keyup.enter.prevent="addTag"
              class="tag-input"
            />
            <button type="button" @click="addTag" class="add-tag-btn">添加</button>
          </div>
          <div class="tags-container">
            <span 
              v-for="(tag, index) in form.tags" 
              :key="index" 
              class="tag"
            >
              {{ tag }}
              <button type="button" @click="removeTag(index)" class="tag-remove">×</button>
            </span>
          </div>
        </div>

        <div class="form-group">
          <label>导演</label>
          <div class="select-with-search">
            <input 
              v-model="directorSearch" 
              type="text" 
              placeholder="搜索导演姓名..."
              @input="searchDirector"
              class="search-input"
            />
            <select v-model.number="form.director" class="select-input">
              <option :value="0">请选择导演</option>
              <option v-for="actor in directorOptions" :key="actor.id" :value="actor.id">
                {{ actor.name }}
              </option>
            </select>
          </div>
        </div>

        <div class="form-group">
          <label>演员列表</label>
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
                      <label>角色</label>
                      <input 
                        v-model="actor.role" 
                        type="text" 
                        placeholder="如：主演、配角、幕后等"
                        class="actor-input"
                      />
                    </div>
                    <div class="actor-field">
                      <label>描述</label>
                      <input 
                        v-model="actor.description" 
                        type="text" 
                        placeholder="描述演员在该电视剧中的表现"
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
          <label>海报URL</label>
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
            placeholder="请输入电视剧简介"
            rows="6"
            class="textarea"
          ></textarea>
        </div>

        <div class="form-group">
          <label>奖项</label>
          <div v-for="(award, index) in form.awards" :key="index" class="award-item">
            <div class="award-header">
              <span>奖项 {{ index + 1 }}</span>
              <button type="button" @click="removeAward(index)" class="item-remove">×</button>
            </div>
            <div class="award-fields">
              <div class="award-field">
                <label>奖项ID</label>
                <input 
                  v-model.number="award.id" 
                  type="number" 
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
          <button type="button" @click="addAward" class="add-award-btn">+ 添加奖项</button>
        </div>

        <div class="form-group">
          <label>季度信息</label>
          <div v-for="(season, index) in form.seasons" :key="index" class="season-item">
            <div class="season-header">
              <span>季度 {{ index + 1 }}</span>
              <button type="button" @click="removeSeason(index)" class="item-remove">×</button>
            </div>
            <div class="season-fields">
              <div class="season-field">
                <label>季度ID</label>
                <input 
                  v-model.number="season.id" 
                  type="number" 
                  class="season-input"
                />
              </div>
              <div class="season-field">
                <label>季度数</label>
                <input 
                  v-model="season.number" 
                  type="text" 
                  class="season-input"
                />
              </div>
            </div>
          </div>
          <button type="button" @click="addSeason" class="add-season-btn">+ 添加季度</button>
        </div>

        <div class="form-group">
          <label>预告片URL</label>
          <input 
            v-model="form.trailer" 
            type="text" 
            placeholder="请输入预告片URL"
          />
        </div>

        <div class="form-group">
          <label>剧照</label>
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
          <button type="button" @click="addPhoto" class="add-photo-btn">+ 添加照片URL</button>
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
import { ref, reactive, computed, onMounted, getCurrentInstance } from 'vue'
import { fetchActors } from '../api/actors'
import { saveTvShow } from '../api/tvshows'
import type { TvShowSaveData, TvShowActor, TvShowAward, TvShowSeason } from '../api/tvshows'
import ImageUploader from './ImageUploader.vue'

interface Props {
  initialData?: any
  isEdit?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  isEdit: false
})

const emit = defineEmits<{
  submit: [data: TvShowSaveData]
  cancel: []
}>()

const submitting = ref(false)
const newTag = ref('')
const directorSearch = ref('')
const actorSearch = ref('')
const selectedActor = ref(0)

const directorOptions = ref<any[]>([])
const actorOptions = ref<any[]>([])

// 定义奖项选项接口
interface AwardOption {
  id: number
  name: string
}

// 响应式数据
const awardSearch = ref('')
const selectedAward = ref(0)
const awardOptions = ref<AwardOption[]>([])

// 初始化表单数据
const form = reactive<TvShowSaveData>({
  title: '',
  original_title: '',
  year: new Date().getFullYear(),
  tags: [],
  director: 0,
  actors: [] as TvShowActor[],
  poster: '',
  summary: '',
  awards: [] as TvShowAward[],
  seasons: [] as TvShowSeason[],
  episodes: 1,
  country: '',
  language: '',
  trailer: '',
  photos: []
})

// 初始化表单数据
if (props.initialData) {
  Object.assign(form, {
    id: props.initialData.id, // 编辑模式下需要id
    title: props.initialData.title || '',
    original_title: props.initialData.originalTitle || props.initialData.original_title || '',
    year: props.initialData.year || new Date().getFullYear(),
    tags: props.initialData.tags || props.initialData.genre || [],
    director: props.initialData.director?.id || props.initialData.director || 0,
    actors: props.initialData.actors?.map((a: any) => ({
      id: a.id || a,
      role: a.role || '',
      description: a.description || ''
    })) || [],
    poster: props.initialData.poster || '',
    summary: props.initialData.summary || '',
    awards: props.initialData.awards?.map((aw: any) => ({
      id: aw.id || 0,
      year: aw.year || new Date().getFullYear(),
      status: aw.status || 'nominated',
      note: aw.note || ''
    })) || [],
    seasons: props.initialData.seasons?.map((s: any) => ({
      id: s.id || 0,
      number: s.number || '1'
    })) || [],
    episodes: props.initialData.episodes || 1,
    country: props.initialData.country || '',
    language: props.initialData.language || '',
    trailer: props.initialData.trailer || '',
    photos: props.initialData.photos || []
  })
}

// 加载演员列表
async function loadActors() {
  try {
    const response = await fetchActors({ page: 1, size: 100 })
    directorOptions.value = response.actors || []
    actorOptions.value = response.actors || []
  } catch (error) {
    console.error('加载演员列表失败:', error)
  }
}

// 组件挂载时加载演员列表
onMounted(() => {
  loadActors()
})

// 如果是新增，添加一个默认的照片
if (!props.isEdit && form.photos.length === 0) {
  addPhoto()
}

// 获取演员姓名
function getActorName(id: number): string {
  const actor = actorOptions.value.find((a: any) => a.id === id)
  return actor ? actor.name : `演员${id}`
}

// 搜索导演
async function searchDirector() {
  if (!directorSearch.value.trim()) {
    directorOptions.value = []
    return
  }
  try {
    const response = await fetchActors({ page: 1, size: 20, keyword: directorSearch.value })
    directorOptions.value = response.actors || []
  } catch (error) {
    console.error('搜索导演失败:', error)
  }
}

// 搜索演员
async function searchActor() {
  if (!actorSearch.value.trim()) {
    actorOptions.value = []
    return
  }
  try {
    const response = await fetchActors({ page: 1, size: 20, keyword: actorSearch.value })
    actorOptions.value = response.actors || []
  } catch (error) {
    console.error('搜索演员失败:', error)
  }
}

// 搜索奖项
async function searchAward() {
  if (!awardSearch.value.trim()) {
    awardOptions.value = []
    return
  }
  try {
    // 这里应该调用奖项搜索API，暂时使用模拟数据
    awardOptions.value = [
      { id: 1, name: `奖项: ${awardSearch.value}` }
    ]
  } catch (error) {
    console.error('搜索奖项失败:', error)
  }
}

// 添加标签
function addTag() {
  if (newTag.value.trim() && !form.tags.includes(newTag.value.trim())) {
    form.tags.push(newTag.value.trim())
    newTag.value = ''
  }
}

// 删除标签
function removeTag(index: number) {
  form.tags.splice(index, 1)
}

// 添加演员
function addActor() {
  if (selectedActor.value && !form.actors.find((a: TvShowActor) => a.id === selectedActor.value)) {
    form.actors.push({
      id: selectedActor.value,
      role: '',
      description: ''
    })
    selectedActor.value = 0
  }
}

// 删除演员
function removeActor(index: number) {
  form.actors.splice(index, 1)
}

// 添加奖项
function addAward() {
  form.awards.push({
    id: 0,
    year: new Date().getFullYear(),
    status: 'nominated',
    note: ''
  })
}

// 删除奖项
function removeAward(index: number) {
  form.awards.splice(index, 1)
}

// 添加季度
function addSeason() {
  form.seasons.push({
    id: 0,
    number: (form.seasons.length + 1).toString()
  })
}

// 删除季度
function removeSeason(index: number) {
  form.seasons.splice(index, 1)
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

// 处理表单提交
async function handleSubmit() {
  if (!form.title || !form.year) {
    notify.warning('请填写标题和年份')
    return
  }
  
  submitting.value = true
  try {
    // 创建提交数据的副本
    const submitData = { ...form }
    
    // 类型转换和数据处理
    submitData.year = Number(submitData.year)
    submitData.director = Number(submitData.director)
    submitData.episodes = Number(submitData.episodes)
    
    // 处理演员数据
    submitData.actors = submitData.actors.map((actor: TvShowActor) => ({
      id: Number(actor.id),
      role: actor.role?.trim() || '',
      description: actor.description?.trim() || ''
    }))
    
    // 处理奖项数据
    submitData.awards = submitData.awards.map((award: TvShowAward) => ({
      id: Number(award.id),
      year: Number(award.year),
      status: award.status || 'nominated',
      note: award.note?.trim() || ''
    }))
    
    // 处理季度数据
    submitData.seasons = submitData.seasons.map((season: TvShowSeason) => ({
      id: Number(season.id),
      number: season.number?.toString() || '1'
    }))
    
    // 确保tags是数组
    if (!Array.isArray(submitData.tags)) {
      submitData.tags = submitData.tags ? [submitData.tags] : []
    }
    
    // 如果是编辑模式，添加id字段
    if (props.isEdit && props.initialData?.id) {
      submitData.id = props.initialData.id
    }
    
    // 发送请求
    await saveTvShow(submitData)
    
    // 关闭表单并通知父组件
    emit('cancel')
  } catch (error) {
    console.error('保存失败:', error)
    notify.error('保存失败，请重试')
  } finally {
    submitting.value = false
  }
}

// 处理取消
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
  border-radius: 8px;
  width: 100%;
  max-width: 800px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #e5e7eb;
}

.modal-header h2 {
  margin: 0;
  font-size: 20px;
  color: #111827;
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #6b7280;
  padding: 0;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.close-btn:hover {
  background: #f3f4f6;
}

.movie-form {
  padding: 20px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 6px;
  font-weight: 500;
  color: #374151;
  font-size: 14px;
}

.required {
  color: #ef4444;
}

.form-group input[type="text"],
.form-group input[type="number"],
.form-group select,
.form-group textarea {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
  transition: border-color 0.2s;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.textarea {
  resize: vertical;
  min-height: 100px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.tag-input-group {
  display: flex;
  gap: 8px;
  margin-bottom: 10px;
}

.tag-input {
  flex: 1;
}

.add-tag-btn {
  padding: 8px 16px;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.2s;
}

.add-tag-btn:hover {
  background: #2563eb;
}

.tags-container {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.tag {
  display: inline-flex;
  align-items: center;
  padding: 4px 10px;
  background: #e5e7eb;
  border-radius: 16px;
  font-size: 13px;
  color: #374151;
}

.tag-remove {
  background: none;
  border: none;
  color: #6b7280;
  margin-left: 6px;
  cursor: pointer;
  font-size: 16px;
  padding: 0;
  width: 16px;
  height: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: background-color 0.2s;
}

.tag-remove:hover {
  background: #d1d5db;
  color: #374151;
}

.select-with-search {
  position: relative;
}

.search-input {
  margin-bottom: 8px;
}

.multi-select {
  margin-bottom: 12px;
}

.actors-list,
.selected-list {
  margin-top: 12px;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  padding: 10px;
}

.actor-item,
.selected-item,
.award-item,
.season-item,
.photo-item {
  margin-bottom: 12px;
  padding: 12px;
  background: #f9fafb;
  border-radius: 6px;
}

.actor-item:last-child,
.selected-item:last-child,
.award-item:last-child,
.season-item:last-child,
.photo-item:last-child {
  margin-bottom: 0;
}

.actor-header,
.award-header,
.season-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.actor-name,
.selected-item {
  font-weight: 500;
  color: #374151;
}

.item-remove {
  background: none;
  border: none;
  color: #6b7280;
  cursor: pointer;
  font-size: 16px;
  padding: 0;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: background-color 0.2s;
}

.item-remove:hover {
  background: #e5e7eb;
  color: #374151;
}

.actor-fields,
.award-fields,
.season-fields {
  display: grid;
  gap: 12px;
}

.actor-field,
.award-field,
.season-field {
  display: flex;
  flex-direction: column;
}

.actor-field label,
.award-field label,
.season-field label {
  margin-bottom: 4px;
  font-size: 13px;
  color: #6b7280;
}

.actor-input,
.award-input,
.season-input,
.award-select {
  padding: 6px 10px;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  font-size: 13px;
}

.add-award-btn,
.add-season-btn,
.add-photo-btn {
  margin-top: 10px;
  padding: 6px 12px;
  background: #10b981;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.2s;
}

.add-award-btn:hover,
.add-season-btn:hover,
.add-photo-btn:hover {
  background: #059669;
}

.photo-remove {
  margin-left: 10px;
  padding: 6px 12px;
  background: #ef4444;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 13px;
  transition: background-color 0.2s;
}

.photo-remove:hover {
  background: #dc2626;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 30px;
  padding-top: 20px;
  border-top: 1px solid #e5e7eb;
}

.cancel-btn {
  padding: 10px 20px;
  background: #f3f4f6;
  color: #374151;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
}

.cancel-btn:hover {
  background: #e5e7eb;
}

.submit-btn {
  padding: 10px 20px;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.2s;
}

.submit-btn:hover:not(:disabled) {
  background: #2563eb;
}

.submit-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .form-row {
    grid-template-columns: 1fr;
  }
  
  .actor-fields,
  .award-fields,
  .season-fields {
    grid-template-columns: 1fr;
  }
}
</style>