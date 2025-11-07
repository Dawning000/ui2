<template>
  <div class="rating-stars" :title="displayTitle" :class="{ readonly }">
    <button
      v-for="i in 5"
      :key="i"
      :class="['star', { 
        full: starValue >= i, 
        half: starValue >= i - 0.5 && starValue < i 
      }]"
      @click="!readonly && handleStarClick(i)"
      :disabled="readonly"
    >
      <span class="star-bg">★</span>
      <span class="star-fill" v-if="starValue >= i - 0.5" :style="{ width: starValue >= i ? '100%' : '50%' }">★</span>
    </button>
    <button v-if="value && !readonly" class="clear" @click="handleClick(0)">清除</button>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
const props = defineProps<{ modelValue?: number, tooltipBase?: string, readonly?: boolean }>()
const emit = defineEmits<{ (e:'update:modelValue', v:number|undefined):void }>()

const value = computed(() => props.modelValue || 0)
// 将10分制转换为5星制（10分=5星，半星为1分）
const starValue = computed(() => {
  if (!value.value) return 0
  return value.value / 2 // 10分制转5星制
})
const displayTitle = computed(() => {
  const score = value.value.toFixed(1)
  return props.tooltipBase ? `${props.tooltipBase}：${score}/10` : `${score}/10`
})

// 点击星星时，支持设置完整星或半星
function handleStarClick(starIndex: number) {
  // 如果点击的是当前星，则切换为半星或清除
  if (starValue.value === starIndex) {
    // 如果已经是整数星，则减0.5成为半星
    emit('update:modelValue', (starIndex - 0.5) * 2)
  } else if (starValue.value === starIndex - 0.5) {
    // 如果是半星，则清除
    emit('update:modelValue', undefined)
  } else {
    // 设置为完整星
    emit('update:modelValue', starIndex * 2)
  }
}

function handleClick(i: number) {
  emit('update:modelValue', i || undefined)
}
</script>

<style scoped>
.rating-stars{ display:inline-flex; align-items:center; gap:2px; }
.rating-stars.readonly .star { cursor: default; }
.star{ 
  border:none; 
  background:transparent; 
  cursor:pointer; 
  position: relative;
  padding:0;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.star .star-bg {
  font-size: 18px;
  line-height: 1;
  color: #d1d5db;
  display: inline-block;
}
.star .star-fill {
  font-size: 18px;
  line-height: 1;
  color: #f59e0b;
  position: absolute;
  left: 0;
  top: 0;
  overflow: hidden;
  white-space: nowrap;
}
.star:disabled { cursor: default; }
.star:not(:disabled):hover .star-bg {
  color: #fbbf24;
}
.clear{ margin-left:6px; border:1px solid #e5e7eb; background:#fff; border-radius:6px; font-size:12px; padding:2px 6px; cursor:pointer; }
</style>


