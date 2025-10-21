<template>
  <div class="actor-detail-page" v-if="loaded">
    <div class="header">
      <img :src="detail?.avatar || fallbackAvatar" class="avatar" alt="avatar" />
      <div class="info">
        <h1>{{ detail?.name }}</h1>
        <div class="meta">
          <span v-if="detail?.birthDate">出生：{{ detail?.birthDate }}</span>
          <span v-if="detail?.nationality"> · 国籍：{{ detail?.nationality }}</span>
          <span v-if="detail?.gender"> · 性别：{{ detail?.gender }}</span>
        </div>
        <p class="bio" v-if="detail?.biography">{{ detail?.biography }}</p>
      </div>
    </div>

    <div class="section" v-if="(detail?.movies?.length || 0) > 0">
      <h2>电影作品</h2>
      <div class="cards">
        <div v-for="m in detail!.movies" :key="m.id" class="card">
          <img :src="m.poster || placeholder" alt="poster" />
          <div class="title">{{ m.title }}</div>
          <div class="sub">{{ m.year }} · {{ m.role }}</div>
        </div>
      </div>
    </div>

    <div class="section" v-if="(detail?.tvShows?.length || 0) > 0">
      <h2>电视剧作品</h2>
      <div class="cards">
        <div v-for="t in detail!.tvShows" :key="t.id" class="card">
          <img :src="t.poster || placeholder" alt="poster" />
          <div class="title">{{ t.title }}</div>
          <div class="sub">{{ t.year }} · {{ t.role }}</div>
        </div>
      </div>
    </div>

    <div class="section" v-if="(detail?.awards?.length || 0) > 0">
      <h2>获奖与提名</h2>
      <ul class="awards">
        <li v-for="a in detail!.awards" :key="a.id">{{ a.year }} · {{ a.name }}<span v-if="a.movie"> · {{ a.movie }}</span></li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { fetchActorDetail } from '@/api/actors'
import type { ActorDetail } from '@/types/actors'

const route = useRoute()
const id = route.params.id as string

const loaded = ref(false)
const detail = ref<ActorDetail | null>(null)
const fallbackAvatar = 'https://static.billadom.top/placeholder/avatar.png'
const placeholder = 'https://static.billadom.top/placeholder/poster.png'

async function load() {
  const res = await fetchActorDetail(id)
  detail.value = (res as any).data || (res as any)
  loaded.value = true
}

onMounted(load)
</script>

<style scoped>
.actor-detail-page { padding: 24px; max-width: 1200px; margin: 80px auto 40px; }
.header { display: flex; gap: 16px; }
.avatar { width: 160px; height: 210px; object-fit: cover; border-radius: 12px; background: #f3f4f6; }
.info { display: flex; flex-direction: column; gap: 8px; }
.meta { color: #6b7280; font-size: 14px; }
.bio { color: #374151; line-height: 1.7; }
.section { margin-top: 24px; }
.cards { display: grid; grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); gap: 12px; }
.card { display: flex; flex-direction: column; gap: 6px; }
.card img { width: 100%; height: 200px; object-fit: cover; border-radius: 8px; background: #f3f4f6; }
.title { font-weight: 600; }
.sub { font-size: 12px; color: #6b7280; }
.awards { padding-left: 16px; }
</style>



