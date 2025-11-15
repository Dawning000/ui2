<template>
  <div class="award-form-overlay" @click.self="handleCancel">
    <div class="award-form-modal">
      <div class="modal-header">
        <h2>{{ isEdit ? '编辑奖项' : '添加奖项' }}</h2>
        <button class="close-btn" @click="handleCancel">×</button>
      </div>
      
      <form @submit.prevent="handleSubmit" class="award-form">
        <div class="form-group">
          <label>奖项名称 <span class="required">*</span></label>
          <input 
            v-model="form.name" 
            type="text" 
            required 
            placeholder="请输入奖项名称，如：奥斯卡金像奖最佳影片"
          />
        </div>

        <div class="form-group">
          <label>颁奖机构 <span class="required">*</span></label>
          <input 
            v-model="form.organization" 
            type="text" 
            required 
            placeholder="请输入颁奖机构，如：美国电影艺术与科学学院"
          />
        </div>

        <div class="form-group">
          <label>获奖对象类型 <span class="required">*</span></label>
          <select v-model="form.target_type" required>
            <option value="">请选择获奖对象类型</option>
            <option value="ACTOR">演员</option>
            <option value="FILM">电影</option>
            <option value="TVSHOW">电视剧</option>
            <option value="VARIETY">综艺</option>
          </select>
          <p class="form-hint">新建时使用，修改该词条容易造成数据库混乱</p>
        </div>

        <div class="form-group">
          <label>备注 <span class="required">*</span></label>
          <textarea 
            v-model="form.description" 
            required 
            rows="6"
            placeholder="请输入奖项的详细描述和说明"
          ></textarea>
        </div>

        <div class="form-actions">
          <button type="button" class="cancel-btn" @click="handleCancel">取消</button>
          <button type="submit" class="submit-btn" :disabled="submitting">
            {{ submitting ? '提交中...' : (isEdit ? '保存' : '添加') }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from 'vue'
import type { AwardSaveData } from '@/api/awards'

interface Props {
  isEdit?: boolean
  initialData?: AwardSaveData
}

const props = withDefaults(defineProps<Props>(), {
  isEdit: false,
  initialData: undefined
})

const emit = defineEmits<{
  submit: [data: AwardSaveData]
  cancel: []
}>()

const submitting = ref(false)

const form = reactive<AwardSaveData>({
  id: undefined,
  name: '',
  organization: '',
  target_type: 'FILM',
  description: ''
})

// 监听初始数据变化
watch(() => props.initialData, (newData) => {
  if (newData) {
    form.id = newData.id
    form.name = newData.name || ''
    form.organization = newData.organization || ''
    form.target_type = newData.target_type || 'FILM'
    form.description = newData.description || ''
  } else {
    // 重置表单
    form.id = undefined
    form.name = ''
    form.organization = ''
    form.target_type = 'FILM'
    form.description = ''
  }
}, { immediate: true })

function handleSubmit() {
  if (submitting.value) return
  
  submitting.value = true
  
  const submitData: AwardSaveData = {
    name: form.name.trim(),
    organization: form.organization.trim(),
    target_type: form.target_type,
    description: form.description.trim()
  }
  
  // 如果是编辑模式且有id，添加id字段
  if (props.isEdit && form.id) {
    submitData.id = form.id
  }
  
  emit('submit', submitData)
  
  // 延迟重置提交状态，让父组件处理
  setTimeout(() => {
    submitting.value = false
  }, 100)
}

function handleCancel() {
  emit('cancel')
}
</script>

<style scoped>
.award-form-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  backdrop-filter: blur(2px);
}

.award-form-modal {
  background: white;
  border-radius: 16px;
  width: 90%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 48px rgba(0, 0, 0, 0.2);
  animation: slideIn 0.3s ease-out;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-20px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24px 32px;
  border-bottom: 1px solid #e5e7eb;
}

.modal-header h2 {
  margin: 0;
  font-size: 24px;
  font-weight: 700;
  color: #111827;
}

.close-btn {
  background: none;
  border: none;
  font-size: 32px;
  color: #9ca3af;
  cursor: pointer;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  transition: all 0.2s;
}

.close-btn:hover {
  background: #f3f4f6;
  color: #111827;
}

.award-form {
  padding: 32px;
}

.form-group {
  margin-bottom: 24px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  color: #374151;
  font-size: 14px;
}

.required {
  color: #ef4444;
}

.form-group input,
.form-group select,
.form-group textarea {
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #e5e7eb;
  border-radius: 10px;
  font-size: 14px;
  transition: all 0.2s;
  box-sizing: border-box;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(249, 115, 22, 0.1);
}

.form-group textarea {
  resize: vertical;
  font-family: inherit;
}

.form-hint {
  margin-top: 6px;
  font-size: 12px;
  color: #6b7280;
  line-height: 1.4;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 32px;
  padding-top: 24px;
  border-top: 1px solid #e5e7eb;
}

.cancel-btn,
.submit-btn {
  padding: 12px 24px;
  border: none;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.cancel-btn {
  background: #f3f4f6;
  color: #374151;
}

.cancel-btn:hover {
  background: #e5e7eb;
}

.submit-btn {
  background: linear-gradient(135deg, var(--primary-color) 0%, #fb923c 100%);
  color: white;
  box-shadow: 0 4px 12px rgba(249, 115, 22, 0.3);
}

.submit-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(249, 115, 22, 0.4);
}

.submit-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

@media (max-width: 768px) {
  .award-form-modal {
    width: 95%;
    max-height: 95vh;
  }
  
  .modal-header {
    padding: 20px;
  }
  
  .award-form {
    padding: 20px;
  }
}
</style>

