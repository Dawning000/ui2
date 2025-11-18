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
          <label>头像URL <span class="required">*</span></label>
          <ImageUploader
            v-model="form.avatar"
            placeholder="请输入头像图片URL或点击上传"
            upload-type="avatar"
            button-text="上传头像"
            required
          />
        </div>

        <div class="form-row">
          <div class="form-group">
            <label>出生日期 <span class="required">*</span></label>
            <input 
              v-model="form.birthday" 
              type="date" 
              required 
              placeholder="yyyy-MM-dd"
            />
          </div>

          <div class="form-group">
            <label>国籍 <span class="required">*</span></label>
            <input 
              v-model="form.nationality" 
              type="text" 
              required 
              placeholder="如：中国、美国"
            />
          </div>
        </div>

        <div class="form-group">
          <label>性别 <span class="required">*</span></label>
          <select v-model="form.gender" required>
            <option value="">请选择性别</option>
            <option value="男">男</option>
            <option value="女">女</option>
            <option value="其他">其他</option>
          </select>
        </div>

        <div class="form-group">
          <label>简介 <span class="required">*</span></label>
          <textarea 
            v-model="form.biography" 
            required 
            rows="4"
            placeholder="请输入演员/导演简介"
          ></textarea>
        </div>

        <div class="form-group">
          <div class="awards-header">
            <label>获奖信息</label>
            <button type="button" class="add-award-btn" @click="addAward">+ 添加奖项</button>
          </div>
          
          <div v-if="form.awards.length === 0" class="awards-empty">
            暂无获奖信息，可点击上方按钮添加
          </div>
          
          <div v-else class="awards-list">
            <div v-for="(award, index) in form.awards" :key="index" class="award-item">
              <div class="award-row">
                <input 
                  v-model="award.year" 
                  type="number" 
                  required 
                  placeholder="年份"
                  min="1900"
                  max="2099"
                  class="award-input-year"
                />
                <select v-model="award.status" required class="award-input-status">
                  <option value="nominated">提名</option>
                  <option value="awarded">获奖</option>
                </select>
                <input 
                  v-model="award.note" 
                  type="text" 
                  required 
                  placeholder="奖项名称/备注"
                  class="award-input-note"
                />
                <button type="button" class="remove-award-btn" @click="removeAward(index)">删除</button>
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
import { ref, reactive } from 'vue'
import type { ActorSaveData, ActorAward } from '@/types/actors'
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
    awards: props.initialData.awards || []
  })
}

// 添加奖项
function addAward() {
  const newAward: ActorAward = {
    id: 0,
    year: new Date().getFullYear(),
    status: 'awarded',
    note: ''
  }
  form.awards.push(newAward)
}

// 删除奖项
function removeAward(index: number) {
  form.awards.splice(index, 1)
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
        id: award.id || 0
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

.award-row {
  display: grid;
  grid-template-columns: 100px 120px 1fr auto;
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

