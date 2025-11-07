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
            <label>时长（分钟） <span class="required">*</span></label>
            <input 
              v-model.number="form.duration" 
              type="number" 
              required 
              placeholder="单集时长"
              min="1"
            />
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label>国家/地区 <span class="required">*</span></label>
            <input 
              v-model="form.country" 
              type="text" 
              required 
              placeholder="如：中国大陆"
            />
          </div>

          <div class="form-group">
            <label>语言 <span class="required">*</span></label>
            <input 
              v-model="form.language" 
              type="text" 
              required 
              placeholder="如：中文"
            />
          </div>
        </div>

        <div class="form-group">
          <label>标签 <span class="required">*</span></label>
          <TagChipsEditor v-model="form.tags" />
        </div>

        <div class="form-group">
          <label>导演 <span class="required">*</span></label>
          <select v-model="form.director" required>
            <option value="">请选择导演</option>
            <option v-for="director in directors" :key="director.id" :value="director.id">
              {{ director.name }}
            </option>
          </select>
        </div>

        <div class="form-group">
          <label>演员列表 <span class="required">*</span></label>
          <div class="actors-container">
            <div 
              v-for="(actor, index) in form.actors" 
              :key="index" 
              class="actor-item"
            >
              <div class="actor-inputs">
                <select v-model="actor.id" class="actor-select" required>
                  <option value="">请选择演员</option>
                  <option v-for="a in actorOptions" :key="a.id" :value="a.id">
                    {{ a.name }}
                  </option>
                </select>
                <input 
                  v-model="actor.role" 
                  type="text" 
                  placeholder="角色名称"
                  class="role-input"
                />
                <input 
                  v-model="actor.description" 
                  type="text" 
                  placeholder="角色描述"
                  class="description-input"
                />
                <button 
                  type="button" 
                  class="remove-actor-btn"
                  @click="removeActor(index)"
                >
                  删除
                </button>
              </div>
            </div>
          </div>
          <button 
            type="button" 
            class="add-actor-btn"
            @click="addActor"
          >
            添加演员
          </button>
        </div>

        <div class="form-group">
          <label>奖项</label>
          <div class="awards-container">
            <div class="award-selector">
              <select v-model="selectedAward">
                <option value="">请选择奖项</option>
                <option v-for="award in awardOptions" :key="award.id" :value="award.id">
                  {{ award.name }}
                </option>
              </select>
              <button 
                type="button" 
                class="add-award-btn"
                @click="addAward"
                :disabled="!selectedAward"
              >
                添加奖项
              </button>
            </div>
            <div class="awards-list">
              <span 
                v-for="awardId in form.awards" 
                :key="awardId" 
                class="award-tag"
              >
                {{ getAwardName(awardId) }}
                <button 
                  type="button" 
                  class="remove-award-btn"
                  @click="removeAward(awardId)"
                >
                  ×
                </button>
              </span>
            </div>
          </div>
        </div>

        <div class="form-group">
          <label>海报URL <span class="required">*</span></label>
          <div class="poster-upload">
            <input 
              v-model="form.poster" 
              type="text" 
              required 
              placeholder="请输入海报图片URL"
              class="poster-url-input"
            />
            <ImageUploader 
              :current-url="form.poster"
              @upload-success="handlePosterUpload"
            />
          </div>
        </div>

        <div class="form-group">
          <label>预告片URL</label>
          <input 
            v-model="form.trailer" 
            type="text" 
            placeholder="请输入预告片视频URL（可选）"
          />
        </div>

        <div class="form-group">
          <label>剧照URL列表</label>
          <div class="photos-container">
            <div 
              v-for="(photo, index) in form.photos" 
              :key="index" 
              class="photo-item"
            >
              <input 
                v-model="form.photos[index]" 
                type="text" 
                placeholder="请输入剧照URL"
              />
              <button 
                type="button" 
                class="remove-photo-btn"
                @click="removePhoto(index)"
              >
                删除
              </button>
            </div>
          </div>
          <button 
            type="button" 
            class="add-photo-btn"
            @click="addPhoto"
          >
            添加剧照
          </button>
        </div>

        <div class="form-group">
          <label>剧情简介 <span class="required">*</span></label>
          <textarea 
            v-model="form.summary" 
            required 
            placeholder="请输入电视剧剧情简介"
            rows="6"
          ></textarea>
        </div>

        <div class="form-actions">
          <button 
            type="button" 
            class="cancel-btn"
            @click="handleCancel"
            :disabled="submitting"
          >
            取消
          </button>
          <button 
            type="submit" 
            class="submit-btn"
            :disabled="submitting"
          >
            {{ submitting ? '提交中...' : '提交' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { fetchActors } from '@/api/actors'
import TagChipsEditor from './TagChipsEditor.vue'
import ImageUploader from './ImageUploader.vue'
import type { TvshowSaveData, TvshowActor } from '@/api/tvshows'

// Props
interface Props {
  isEdit: boolean
  initialData?: TvshowSaveData
}

const props = withDefaults(defineProps<Props>(), {
  initialData: undefined
})

// Emits
const emit = defineEmits<{
  submit: [data: TvshowSaveData]
  cancel: []
}>()

// 表单数据
const form = reactive<TvshowSaveData>({
  id: props.initialData?.id,
  title: props.initialData?.title || '',
  original_title: props.initialData?.original_title || '',
  year: props.initialData?.year || 2024,
  tags: props.initialData?.tags || [],
  director: props.initialData?.director || 0,
  actors: props.initialData?.actors || [],
  poster: props.initialData?.poster || '',
  summary: props.initialData?.summary || '',
  awards: props.initialData?.awards || [],
  duration: props.initialData?.duration || 45,
  country: props.initialData?.country || '',
  language: props.initialData?.language || '',
  trailer: props.initialData?.trailer || '',
  photos: props.initialData?.photos || []
})

// 选择器数据
const directors = ref<any[]>([])
const actorOptions = ref<any[]>([])
const awardOptions = ref<any[]>([])

// 临时状态
const selectedActor = ref(0)
const selectedAward = ref(0)
const submitting = ref(false)

// 加载演员和导演数据
async function loadActors() {
  try {
    // 这里应该调用获取演员列表的API
    // 暂时使用模拟数据
    const actors = await fetchActors()
    actorOptions.value = actors
    directors.value = actors.filter(a => a.director === true || a.name.includes('导演'))
    
    // 如果是编辑模式且没有演员数据，添加一个默认演员
    if (props.isEdit && (!form.actors || form.actors.length === 0)) {
      addActor()
    }
  } catch (err) {
    console.error('加载演员数据失败:', err)
  }
}

// 加载奖项数据
function loadAwards() {
  // 这里应该调用获取奖项列表的API
  // 暂时使用模拟数据
  awardOptions.value = [
    { id: 1, name: '金球奖' },
    { id: 2, name: '艾美奖' },
    { id: 3, name: '奥斯卡奖' },
    { id: 4, name: '白玉兰奖' },
    { id: 5, name: '金鹰奖' }
  ]
}

// 添加演员
function addActor() {
  form.actors.push({
    id: 0,
    role: '',
    description: ''
  })
  selectedActor.value = 0
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
        !form.director || form.director <= 0 || form.actors.length === 0 || !form.poster || 
        !form.summary || !form.duration || !form.country || !form.language) {
      alert('请填写所有必填字段')
      return
    }

    // 验证演员数据
    for (const actor of form.actors) {
      if (!actor.id || actor.id <= 0) {
        alert('请为所有演员选择有效的演员')
        return
      }
    }

    // 发送表单数据
    emit('submit', { ...form })
  } catch (err) {
    console.error('提交表单失败:', err)
    alert('提交失败，请稍后重试')
  } finally {
    submitting.value = false
  }
}

// 取消表单
function handleCancel() {
  emit('cancel')
}

// 处理海报上传成功
function handlePosterUpload(url: string) {
  form.poster = url
}

onMounted(async () => {
  await loadActors()
  loadAwards()
  
  // 如果是新增模式，确保至少有一个演员
  if (!props.isEdit && (!form.actors || form.actors.length === 0)) {
    addActor()
  }
})
</script>