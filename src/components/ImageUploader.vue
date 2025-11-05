<template>
  <div class="image-uploader">
    <div class="upload-input-wrapper">
      <input
        ref="fileInput"
        type="file"
        accept="image/*"
        @change="handleFileChange"
        class="file-input"
        :disabled="uploading"
      />
      <div class="input-group">
        <input
          v-model="imageUrl"
          type="text"
          :placeholder="placeholder"
          :required="required"
          class="url-input"
          @input="handleUrlInput"
        />
        <button
          type="button"
          @click="triggerFileSelect"
          class="upload-btn"
          :disabled="uploading"
        >
          <span v-if="uploading" class="uploading-spinner"></span>
          <span v-else>{{ buttonText }}</span>
        </button>
      </div>
    </div>
    <div v-if="previewUrl" class="image-preview">
      <img :src="previewUrl" alt="预览" class="preview-image" />
      <button
        type="button"
        @click="clearImage"
        class="clear-btn"
        :disabled="uploading"
      >
        ×
      </button>
    </div>
    <div v-if="error" class="error-message">{{ error }}</div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { uploadImage, uploadAvatar } from '@/api/upload'

interface Props {
  modelValue: string
  placeholder?: string
  required?: boolean
  uploadType?: 'image' | 'avatar'
  buttonText?: string
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: '请输入图片URL或点击上传',
  required: false,
  uploadType: 'image',
  buttonText: '上传图片'
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const fileInput = ref<HTMLInputElement | null>(null)
const uploading = ref(false)
const error = ref('')
const imageUrl = ref(props.modelValue)

const previewUrl = computed(() => {
  return imageUrl.value || null
})

// 监听外部传入的值变化
watch(() => props.modelValue, (newVal) => {
  if (newVal !== imageUrl.value) {
    imageUrl.value = newVal
  }
})

// 触发文件选择
function triggerFileSelect() {
  fileInput.value?.click()
}

// 处理文件选择
async function handleFileChange(event: Event) {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return

  // 验证文件类型
  if (!file.type.startsWith('image/')) {
    error.value = '请选择图片文件'
    return
  }

  // 验证文件大小（限制为10MB）
  const maxSize = 10 * 1024 * 1024
  if (file.size > maxSize) {
    error.value = '图片大小不能超过10MB'
    return
  }

  uploading.value = true
  error.value = ''

  try {
    const url = props.uploadType === 'avatar' 
      ? await uploadAvatar(file)
      : await uploadImage(file)
    
    imageUrl.value = url
    emit('update:modelValue', url)
  } catch (err: any) {
    error.value = err.message || '上传失败，请重试'
  } finally {
    uploading.value = false
    // 清空input，允许重复选择同一文件
    if (fileInput.value) {
      fileInput.value.value = ''
    }
  }
}

// 处理URL输入
function handleUrlInput() {
  error.value = ''
  emit('update:modelValue', imageUrl.value)
}

// 清除图片
function clearImage() {
  imageUrl.value = ''
  emit('update:modelValue', '')
  error.value = ''
}
</script>

<style scoped>
.image-uploader {
  width: 100%;
}

.upload-input-wrapper {
  width: 100%;
}

.file-input {
  display: none;
}

.input-group {
  display: flex;
  gap: 8px;
  width: 100%;
}

.url-input {
  flex: 1;
  padding: 10px 12px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-size: 14px;
  transition: all 0.2s;
}

.url-input:focus {
  outline: none;
  border-color: var(--primary-color, #f97316);
  box-shadow: 0 0 0 3px rgba(249, 115, 22, 0.1);
}

.upload-btn {
  padding: 10px 20px;
  background: var(--primary-color, #f97316);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 100px;
}

.upload-btn:hover:not(:disabled) {
  background: var(--primary-dark, #ea580c);
}

.upload-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.uploading-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top: 2px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.image-preview {
  margin-top: 12px;
  position: relative;
  display: inline-block;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid #e5e7eb;
}

.preview-image {
  max-width: 200px;
  max-height: 200px;
  display: block;
  object-fit: contain;
}

.clear-btn {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 24px;
  height: 24px;
  background: rgba(0, 0, 0, 0.6);
  color: white;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  line-height: 1;
  transition: all 0.2s;
}

.clear-btn:hover:not(:disabled) {
  background: rgba(0, 0, 0, 0.8);
}

.clear-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.error-message {
  margin-top: 8px;
  color: #ef4444;
  font-size: 12px;
}
</style>

