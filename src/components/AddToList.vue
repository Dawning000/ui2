<template>
  <div class="add-to-list">
    <select v-model="selected" @change="apply">
      <option disabled value="">加入片单...</option>
      <option v-for="ls in allLists" :key="ls.id" :value="ls.id">{{ ls.title }}</option>
      <option value="__new__">＋ 新建片单</option>
    </select>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useLibraryStore } from '@/stores/library'

const props = defineProps<{ mediaId: string|number }>()
const library = useLibraryStore()
const selected = ref('')
const allLists = computed(() => Object.values(library.lists))

function apply(){
  const v = selected.value
  if (!v) return
  if (v === '__new__') {
    const id = 'list-' + Date.now()
    library.ensureList(id, '新建片单')
    library.addToList(id, props.mediaId)
    selected.value = ''
    return
  }
  library.addToList(v, props.mediaId)
  selected.value = ''
}
</script>

<style scoped>
.add-to-list select{ border:1px solid #e5e7eb; background:#fff; border-radius:8px; padding:6px 10px; font-size:12px; }
</style>



