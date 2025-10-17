<template>
  <div class="list-share">
    <div class="header">
      <h1>{{ list?.title || '片单' }}</h1>
      <div class="actions">
        <button class="btn" @click="copyUrl"><i class="icon-share"></i> 复制链接</button>
      </div>
    </div>
    <p class="desc" v-if="list?.description">{{ list?.description }}</p>
    <div v-if="!list" class="empty">片单不存在或未公开</div>
    <div v-else class="grid">
      <div v-for="id in list.itemIds" :key="id" class="card">
        <div class="poster" :style="{ backgroundImage: entry(id)?.poster ? `url(${entry(id)?.poster})` : undefined }"></div>
        <div class="meta">
          <h3>{{ entry(id)?.title }}</h3>
          <p class="sub">{{ entry(id)?.year || '-' }}<span v-if="entry(id)?.rating"> · 我的评分 {{ entry(id)?.rating }}/10</span></p>
          <div class="tags" v-if="(entry(id)?.tags || []).length">
            <span v-for="t in (entry(id)?.tags || [])" :key="t" class="tag">#{{ t }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useLibraryStore } from '@/stores/library'

const route = useRoute()
const library = useLibraryStore()
const listId = computed(() => route.params.id as string)
const list = computed(() => library.lists[listId.value])

function entry(id: string|number){
  return library.entries[id]
}

async function copyUrl(){
  const url = window.location.href
  try{
    await navigator.clipboard.writeText(url)
    alert('链接已复制')
  }catch{
    // noop
  }
}
</script>

<style scoped>
.list-share{ padding:24px; }
.header{ display:flex; align-items:center; justify-content:space-between; margin-bottom:8px; }
.desc{ color:#6b7280; margin-bottom:16px; }
.empty{ color:#9ca3af; padding:24px; }
.grid{ display:grid; grid-template-columns: repeat(6,1fr); gap:12px; }
.card{ background:#fff; border:1px solid #e5e7eb; border-radius:12px; overflow:hidden; }
.poster{ height:160px; background:#f3f4f6; background-size:cover; background-position:center; }
.meta{ padding:10px; }
.meta .sub{ color:#6b7280; font-size:12px; margin:6px 0; }
.meta .tags{ display:flex; flex-wrap:wrap; gap:6px; margin-top:4px; }
.meta .tag{ padding:2px 6px; background:#f3f4f6; border-radius:6px; font-size:11px; }
.btn{ border:1px solid #e5e7eb; background:#fff; border-radius:8px; padding:6px 10px; cursor:pointer; }
</style>


