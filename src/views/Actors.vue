<template>
  <div class="actors-page">
    <div class="page-header">
      <h1>演员与导演</h1>
      <div class="filters">
        <input v-model="keyword" @keyup.enter="load" placeholder="搜索姓名，如：张艺谋 / 梁朝伟" />
        <select v-model="gender" @change="load">
          <option value="">性别（全部）</option>
          <option value="男">男</option>
          <option value="女">女</option>
          <option value="其他">其他</option>
        </select>
        <input v-model="nationality" @keyup.enter="load" placeholder="国籍，如：中国 / 美国" />
        <button @click="load">搜索</button>
      </div>
    </div>

    <div class="actors-grid">
      <div v-for="actor in actors" :key="actor.id" class="actor-card" @click="goDetail(actor.id)">
        <img :src="actor.avatar || fallbackAvatar" alt="avatar" class="avatar" />
        <div class="meta">
          <div class="name">{{ actor.name }}</div>
          <div class="sub">
            <span v-if="actor.nationality">{{ actor.nationality }}</span>
            <span v-if="actor.gender"> · {{ actor.gender }}</span>
          </div>
          <div class="counts">
            <span v-if="actor.moviesCount">电影 {{ actor.moviesCount }}</span>
            <span v-if="actor.tvShowsCount"> · 电视剧 {{ actor.tvShowsCount }}</span>
          </div>
        </div>
      </div>
    </div>

    <div class="pagination" v-if="total > 0">
      <button :disabled="page <= 1" @click="changePage(page - 1)">上一页</button>
      <span>{{ page }} / {{ totalPages }}</span>
      <button :disabled="page >= totalPages" @click="changePage(page + 1)">下一页</button>
    </div>
  </div>
  
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { fetchActors } from '@/api/actors'
import type { ActorListItem } from '@/types/actors'

const router = useRouter()

const actors = ref<ActorListItem[]>([])
const total = ref(0)
const page = ref(1)
const size = ref(20)

const keyword = ref('')
const nationality = ref('')
const gender = ref('') as unknown as { value: '' | '男' | '女' | '其他' }

const totalPages = computed(() => Math.max(1, Math.ceil(total.value / size.value)))
const fallbackAvatar = 'https://static.billadom.top/placeholder/avatar.png'

async function load() {
  const res = await fetchActors({
    page: page.value,
    size: size.value,
    keyword: keyword.value || undefined,
    nationality: nationality.value || undefined,
    gender: (gender as any).value || undefined
  })
  // 兼容两种返回：直接对象或带 data 包裹
  const data: any = (res as any).data || res
  actors.value = data.actors || []
  total.value = data.total || 0
}

function changePage(p: number) {
  page.value = p
  load()
}

function goDetail(id: number | string) {
  router.push({ name: 'ActorDetail', params: { id } })
}

onMounted(load)
</script>

<style scoped>
.actors-page { padding: 24px; max-width: 1200px; margin: 80px auto 40px; }
.page-header { display: flex; align-items: center; justify-content: space-between; gap: 16px; margin-bottom: 16px; }
.filters { display: flex; gap: 8px; flex-wrap: wrap; }
.filters input, .filters select { padding: 10px 12px; border: 1px solid #e5e7eb; border-radius: 8px; }
.filters button { padding: 10px 16px; background: var(--primary-color); color: #fff; border: none; border-radius: 8px; cursor: pointer; }
.actors-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 16px; }
.actor-card { display: flex; gap: 12px; padding: 12px; border: 1px solid #f3f4f6; border-radius: 12px; background: #fff; cursor: pointer; transition: all .2s; }
.actor-card:hover { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(249,115,22,.12); }
.avatar { width: 72px; height: 96px; object-fit: cover; border-radius: 8px; background: #f3f4f6; }
.meta { display: flex; flex-direction: column; gap: 6px; }
.name { font-weight: 700; color: #111827; }
.sub, .counts { font-size: 12px; color: #6b7280; }
.pagination { display: flex; align-items: center; justify-content: center; gap: 12px; margin-top: 16px; }
.pagination button { padding: 8px 12px; border: 1px solid #e5e7eb; background: #fff; border-radius: 8px; cursor: pointer; }
</style>



