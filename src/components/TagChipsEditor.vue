<template>
  <div class="tag-chips-editor">
    <div class="chips">
      <span v-for="t in value" :key="t" class="chip">
        {{ t }}
        <button class="x" @click="remove(t)">×</button>
      </span>
      <input
        v-model="draft"
        class="chip-input"
        type="text"
        :placeholder="placeholder"
        @keydown.enter.prevent="commit()"
        @keydown.tab.prevent="commit()"
        @keydown.space.prevent="commit()"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'

const props = defineProps<{ modelValue?: string[], placeholder?: string }>()
const emit = defineEmits<{ (e:'update:modelValue', v:string[]):void }>()

const value = computed(() => props.modelValue ?? [])
const draft = ref('')
const placeholder = computed(() => props.placeholder || '添加标签，回车确认')

function normalizeTag(raw: string): string {
  return raw.trim().replace(/\s+/g, '')
}

function commit(): void {
  const tag = normalizeTag(draft.value)
  if (!tag) return
  if (!value.value.includes(tag)) {
    emit('update:modelValue', [...value.value, tag])
  }
  draft.value = ''
}

function remove(tag: string): void {
  emit('update:modelValue', value.value.filter(t => t !== tag))
}

watch(() => props.modelValue, () => {
  // keep draft untouched when external value changes
})
</script>

<style scoped>
.tag-chips-editor{ display:flex; align-items:center; }
.chips{ display:flex; align-items:center; gap:6px; flex-wrap:wrap; }
.chip{ display:inline-flex; align-items:center; gap:6px; padding:2px 8px; background:#f3f4f6; color:#374151; border-radius:14px; font-size:12px; }
.chip .x{ border:none; background:transparent; cursor:pointer; color:#9ca3af; font-size:12px; }
.chip-input{ min-width:120px; border:1px solid #e5e7eb; background:#fff; border-radius:8px; padding:4px 8px; font-size:12px; }
</style>



