<template>
  <div class="actor-form-overlay">
    <div class="actor-form-modal">
      <div class="modal-header">
        <h2>{{ isEdit ? '编辑演员/导演' : '添加演员/导演' }}</h2>
        <button class="close-btn" @click="handleCancel">×</button>
      </div>
      
      <form @submit.prevent="handleSubmit" class="actor-form">
        <div class="form-group">
          <label>姓名 <span class="required">*</span></label>
          <input 
            v-model="form.name" 
            type="text" 
            required 
            placeholder="请输入演员/导演姓名"
          />
        </div>

        <div class="form-group">
          <label>头像URL </label>
          <ImageUploader
            v-model="form.avatar"
            placeholder="请输入头像图片URL或点击上传"
            upload-type="avatar"
            button-text="上传头像"
            
          />
        </div>

        <div class="form-row">
          <div class="form-group">
            <label>出生日期</label>
            <input 
              v-model="form.birthday" 
              type="date" 
            
              placeholder="yyyy-MM-dd"
            />
          </div>

          <div class="form-group">
            <label>国籍 </label>
            <input 
              v-model="form.nationality" 
              type="text" 
              
              placeholder="如：中国、美国"
            />
          </div>
        </div>

        <div class="form-group">
          <label>性别 </label>
          <select v-model="form.gender" >
            <option value="">请选择性别</option>
            <option value="男">男</option>
            <option value="女">女</option>
            <option value="其他">其他</option>
          </select>
        </div>

        <div class="form-group">
          <label>简介 </label>
          <textarea 
            v-model="form.biography" 
         
            rows="4"
            placeholder="请输入演员/导演简介"
          ></textarea>
        </div>

        <div class="form-group">
          <div class="awards-header">
            <label>获奖信息</label>
            <div class="award-selector">
              <input 
                v-model="awardSearch"
                type="text"
                class="award-search-input"
                placeholder="搜索奖项名称..."
                @input="handleAwardSearch"
              />
              <select v-model.number="selectedAward" class="award-select">
                <option :value="0">选择奖项后点击关联</option>
                <option 
                  v-for="award in awardOptions" 
                  :key="award.id" 
                  :value="award.id"
                >
                  {{ award.name }}
                </option>
              </select>
              <button 
                type="button" 
                class="add-award-btn" 
                @click="addSelectedAward"
                :disabled="!selectedAward"
              >
                关联奖项
              </button>
            </div>
          </div>
          
          <div v-if="form.awards.length === 0" class="awards-empty">
            暂无获奖信息，可通过上方搜索选择奖项后关联
          </div>
          
          <div v-else class="awards-list">
            <div v-for="(award, index) in form.awards" :key="award.id || index" class="award-item">
              <div class="award-info-row">
                <div class="award-meta">
                  <span class="award-name">{{ getAwardName(award.id) }}</span>
                  <span class="award-id">ID: {{ award.id }}</span>
                </div>
                <button type="button" class="remove-award-btn" @click="removeAward(index)">删除</button>
              </div>
              <div class="award-row">
                <input 
                  v-model.number="award.year" 
                  type="number" 
                  
                  placeholder="年份"
                  min="1900"
                  max="2099"
                  class="award-input-year"
                />
                <select v-model="award.status"  class="award-input-status">
                  <option value="nominated">提名</option>
                  <option value="awarded">获奖</option>
                </select>
                <input 
                  v-model="award.note" 
                  type="text" 
                  placeholder="备注（角色、作品等）"
                  class="award-input-note"
                />
              </div>
            </div>
          </div>
        </div>

        <div class="form-actions">
          <button type="button" class="cancel-btn" @click="handleCancel">取消</button>
          <button type="submit" class="submit-btn" :disabled="submitting">
            {{ submitting ? '提交中...' : (isEdit ? '更新' : '添加') }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onBeforeUnmount } from 'vue'
import type { ActorSaveData, ActorAward } from '@/types/actors'
import { fetchAwardsList, type AwardListItem } from '@/api/awards'
import ImageUploader from './ImageUploader.vue'

interface Props {
  isEdit?: boolean
  initialData?: Partial<ActorSaveData>
}

interface Emits {
  (e: 'submit', data: ActorSaveData): void
  (e: 'cancel'): void
}

const props = withDefaults(defineProps<Props>(), {
  isEdit: false
})

const emit = defineEmits<Emits>()

const submitting = ref(false)
const awardSearch = ref('')
const selectedAward = ref(0)
const awardOptions = ref<AwardListItem[]>([])
let awardSearchTimer: ReturnType<typeof setTimeout> | null = null

const form = reactive<ActorSaveData>({
  name: '',
  avatar: '',
  birthday: '',
  nationality: '',
  gender: '',
  biography: '',
  awards: []
})

// 初始化表单数据
if (props.initialData) {
  Object.assign(form, {
    name: props.initialData.name || '',
    avatar: props.initialData.avatar || '',
    birthday: props.initialData.birthday || '',
    nationality: props.initialData.nationality || '',
    gender: props.initialData.gender || '',
    biography: props.initialData.biography || '',
    awards: (props.initialData.awards || []).map((award: any) => ({
      id: award.id || 0,
      year: award.year || new Date().getFullYear(),
      status: (award.status as ActorAward['status']) || 'awarded',
      note: award.note || award.name || ''
    }))
  })
}

// 搜索并加载演员类奖项
async function loadAwards(keyword?: string) {
  try {
    const { awards } = await fetchAwardsList({
      page: 1,
      size: 20,
      keyword: keyword?.trim() || undefined,
      target_type: 'ACTOR'
    })
    awardOptions.value = awards || []
    ensureInitialAwardOptions()
  } catch (error) {
    console.error('加载奖项列表失败:', error)
  }
}

function ensureInitialAwardOptions() {
  if (!props.initialData?.awards?.length) return
  props.initialData.awards.forEach((award: any) => {
    if (!award?.id || !award?.name) return
    if (awardOptions.value.some(option => option.id === award.id)) return
    awardOptions.value.push({
      id: award.id,
      name: award.name,
      organization: award.organization,
      target_type: 'ACTOR',
      description: award.description
    })
  })
}

function handleAwardSearch() {
  if (awardSearchTimer) clearTimeout(awardSearchTimer)
  awardSearchTimer = setTimeout(() => {
    loadAwards(awardSearch.value)
  }, 300)
}

function addSelectedAward() {
  const awardId = selectedAward.value
  if (!awardId) return
  if (form.awards.find(award => award.id === awardId)) {
    selectedAward.value = 0
    return
  }

  const option = awardOptions.value.find(award => award.id === awardId)
  const newAward: ActorAward = {
    id: awardId,
    year: option?.year || new Date().getFullYear(),
    status: 'awarded',
    note: option?.name || ''
  }

  form.awards.push(newAward)
  selectedAward.value = 0
}

// 删除奖项
function removeAward(index: number) {
  form.awards.splice(index, 1)
}

function getAwardName(awardId: number) {
  const award = awardOptions.value.find(option => option.id === awardId)
  return award?.name || `ID: ${awardId}`
}

// 提交表单
async function handleSubmit() {
  submitting.value = true
  try {
    // 转换数据格式
    const submitData: ActorSaveData = {
      ...form,
      awards: form.awards.map(award => ({
        ...award,
        id: Number(award.id) || 0,
        year: Number(award.year) || new Date().getFullYear()
      }))
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

onMounted(() => {
  loadAwards()
  ensureInitialAwardOptions()
})

onBeforeUnmount(() => {
  if (awardSearchTimer) {
    clearTimeout(awardSearchTimer)
  }
})
</script>

<style scoped>
.actor-form-overlay {
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

.actor-form-modal {
  background: white;
  border-radius: 16px;
  width: 100%;
  max-width: 700px;
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
}

.modal-header h2 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 700;
  color: #111827;
}

.close-btn {
  background: none;
  border: none;
  font-size: 2rem;
  color: #6b7280;
  cursor: pointer;
  line-height: 1;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  transition: all 0.2s;
}

.close-btn:hover {
  background: #f3f4f6;
  color: #111827;
}

.actor-form {
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
  font-size: 0.9rem;
}

.required {
  color: #ef4444;
}

.form-group input,
.form-group select,
.form-group textarea {
  width: 100%;
  padding: 12px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.2s;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(249, 115, 22, 0.1);
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.awards-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.award-selector {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  justify-content: flex-end;
}

.award-search-input,
.award-select {
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 0.9rem;
}

.award-search-input {
  min-width: 180px;
}

.award-select {
  min-width: 200px;
}

.add-award-btn {
  padding: 6px 12px;
  background: var(--primary-color);
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 0.9rem;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.2s;
}

.add-award-btn:hover {
  background: var(--primary-dark);
}

.awards-empty {
  padding: 20px;
  text-align: center;
  color: #9ca3af;
  background: #f9fafb;
  border-radius: 8px;
  font-size: 0.9rem;
}

.awards-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.award-item {
  background: #f9fafb;
  padding: 12px;
  border-radius: 8px;
}

.award-info-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}

.award-meta {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.award-name {
  font-weight: 600;
  color: #111827;
}

.award-id {
  font-size: 0.75rem;
  color: #6b7280;
}

.award-row {
  display: grid;
  grid-template-columns: 120px 140px 1fr;
  gap: 8px;
  align-items: center;
}

.award-input-year,
.award-input-status,
.award-input-note {
  padding: 8px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 0.9rem;
}

.remove-award-btn {
  padding: 8px 12px;
  background: #ef4444;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 0.9rem;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.2s;
}

.remove-award-btn:hover {
  background: #dc2626;
}

.form-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 24px;
  padding-top: 24px;
  border-top: 1px solid #e5e7eb;
}

.cancel-btn,
.submit-btn {
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.cancel-btn {
  background: white;
  color: #6b7280;
  border: 1px solid #d1d5db;
}

.cancel-btn:hover {
  background: #f9fafb;
  border-color: #9ca3af;
}

.submit-btn {
  background: var(--primary-color);
  color: white;
  border: none;
}

.submit-btn:hover:not(:disabled) {
  background: var(--primary-dark);
}

.submit-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

@media (max-width: 640px) {
  .form-row {
    grid-template-columns: 1fr;
  }
  
  .award-row {
    grid-template-columns: 1fr;
    gap: 8px;
  }
  
  .remove-award-btn {
    grid-column: 1;
  }
}
</style>

