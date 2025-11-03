<template>
  <div class="rating-stars" :title="displayTitle" :class="{ readonly }">
    <button
      v-for="i in 10"
      :key="i"
      :class="['star', { active: value >= i }]"
      @click="!readonly && handleClick(i)"
      :disabled="readonly"
    >
      ★
    </button>
    <button v-if="value && !readonly" class="clear" @click="handleClick(0)">清除</button>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
const props = defineProps<{ modelValue?: number, tooltipBase?: string, readonly?: boolean }>()
const emit = defineEmits<{ (e:'update:modelValue', v:number|undefined):void }>()

const value = computed(() => props.modelValue || 0)
const displayTitle = computed(() => props.tooltipBase ? `${props.tooltipBase}：${value.value}/10` : `${value.value}/10`)

function handleClick(i:number){
  emit('update:modelValue', i || undefined)
}
</script>

<style scoped>
.rating-stars{ display:inline-flex; align-items:center; gap:4px; }
.rating-stars.readonly .star { cursor: default; }
.star{ border:none; background:transparent; cursor:pointer; color:#d1d5db; font-size:16px; padding:0 1px; }
.star.active{ color:#f59e0b; }
.star:disabled { cursor: default; }
.clear{ margin-left:6px; border:1px solid #e5e7eb; background:#fff; border-radius:6px; font-size:12px; padding:2px 6px; cursor:pointer; }
</style>


