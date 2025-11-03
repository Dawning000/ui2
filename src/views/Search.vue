<template>
  <div class="search-page">
    <div class="search-header">
      <input
        v-model="store.q"
        @keyup.enter="applySearch"
        class="search-input"
        type="text"
        :placeholder="getPlaceholder()"
      />
      <button class="search-btn" @click="applySearch">
        <i class="icon-search"></i>
        搜索
      </button>
    </div>

    <div class="search-body">
      <aside class="facet-panel">
        <section class="facet-section">
          <h4>类型</h4>
          <div class="chips">
            <button
              v-for="g in (store.facets?.genres || [])"
              :key="g.value"
              :class="['chip', { active: store.genres.includes(g.value) }]"
              @click="toggleArray(store.genres, g.value)"
            >{{ g.value }}<span class="count">{{ g.count }}</span></button>
          </div>
        </section>

        <section class="facet-section">
          <h4>地区</h4>
          <div class="chips">
            <button
              v-for="r in (store.facets?.regions || [])"
              :key="r.value"
              :class="['chip', { active: store.regions.includes(r.value) }]"
              @click="toggleArray(store.regions, r.value)"
            >{{ r.value }}<span class="count">{{ r.count }}</span></button>
          </div>
        </section>

        <section class="facet-section">
          <h4>筛选</h4>
          <div class="range-row">
            <label>年份 ≥</label>
            <input type="number" v-model.number="store.yearGte" placeholder="如 2018" />
          </div>
          <div class="range-row">
            <label>评分 ≥</label>
            <input type="number" step="0.1" v-model.number="store.ratingGte" placeholder="如 7" />
          </div>
          <button class="apply-btn" @click="applySearch(true)">应用筛选</button>
          <button class="clear-btn" @click="clearAll">清空</button>
        </section>
      </aside>

      <section class="result-panel">
        <div class="result-header">
          <div class="result-count">共 {{ store.total }} 条结果</div>
          <div class="header-actions">
            <button 
              v-if="isAdmin && store.type === 'movie'" 
              @click="showMovieForm = true" 
              class="add-movie-btn"
            >
              <i class="icon-plus"></i>
              新增电影
            </button>
            <select v-model="store.sort" @change="applySearch(true)">
              <option value="relevance_desc">相关度</option>
              <option value="hot_desc">热度</option>
              <option value="rating_desc">评分</option>
              <option value="year_desc">年份</option>
              <option value="updated_desc">更新时间</option>
            </select>
          </div>
        </div>

        <div v-if="store.loading" class="grid">
          <div v-for="n in 12" :key="n" class="card skeleton"></div>
        </div>

        <div v-else-if="store.items.length" class="grid">
          <article v-for="it in store.items" :key="it.id" class="card">
            <router-link :to="`/movie/${it.id}`" class="card-link">
              <div class="poster" :style="{ backgroundImage: it.poster ? `url(${it.poster})` : undefined }"></div>
              <div class="meta">
                <h3 v-html="it.highlight?.title || it.title"></h3>
                <div class="tags">
                  <span v-for="g in (it.genres || [])" :key="g" class="tag">{{ g }}</span>
                </div>
                <div class="rating-row">
                  <RatingStars :readonly="true" :modelValue="it.rating" tooltip-base="评分" />
                  <span v-if="it.rating" class="rating-text">{{ it.rating }}/10</span>
                </div>
                <div class="sub">
                  <span>{{ it.year || '-' }}</span>
                </div>
              </div>
            </router-link>
            <div class="actions-overlay">
              <div class="actions">
                <div class="left">
                  <WatchlistButtons v-model="getEntry(it).status" @update:modelValue="v=>updateStatus(it,v)" />
                </div>
                <div class="right">
                  <AddToList :media-id="it.id" />
                </div>
              </div>
              <div class="my-tags">
                <TagChipsEditor v-model="getEntry(it).tags" @update:modelValue="v=>updateTags(it,v)" />
              </div>
            </div>
          </article>
        </div>

        <div v-else class="empty">
          <p>没有找到结果，试试放宽筛选或更换关键词。</p>
          <div class="suggestions">
            <span v-for="s in (store.facets?.genres || []).slice(0,6)" :key="s.value" class="suggest" @click="quickGenre(s.value)">{{ s.value }}</span>
          </div>
        </div>

        <div class="pagination-container" v-if="!store.loading && store.items.length > 0">
          <div class="pagination-info">
            <span>共 {{ store.total }} 条记录</span>
            <span class="divider" v-if="store.total > 0">|</span>
            <template v-if="store.total > 0">
              <span>每页显示</span>
              <select v-model="store.pageSize" @change="handleSizeChange" class="page-size-select">
                <option :value="10">10</option>
                <option :value="20">20</option>
                <option :value="50">50</option>
                <option :value="100">100</option>
              </select>
              <span>条</span>
            </template>
          </div>
          <div class="pagination" v-if="store.total > 0 && totalPages > 0">
            <button 
              class="pagination-btn" 
              :disabled="store.page <= 1 || totalPages <= 1" 
              @click.stop="changePage(1)"
              title="首页"
            >
              首页
            </button>
            <button 
              class="pagination-btn" 
              :disabled="store.page <= 1 || totalPages <= 1" 
              @click.stop="changePage(store.page - 1)"
              title="上一页"
            >
              上一页
            </button>
            
            <div class="page-numbers">
              <template v-for="(p, index) in visiblePages" :key="`page-${index}-${p}`">
                <button
                  v-if="typeof p === 'number'"
                  class="pagination-btn page-number"
                  :class="{ active: p === store.page }"
                  @click.stop="changePage(p)"
                >
                  {{ p }}
                </button>
                <span v-else class="page-ellipsis">{{ p }}</span>
              </template>
            </div>
            
            <button 
              class="pagination-btn" 
              :disabled="store.page >= totalPages || totalPages <= 1" 
              @click.stop="changePage(store.page + 1)"
              title="下一页"
            >
              下一页
            </button>
            <button 
              class="pagination-btn" 
              :disabled="store.page >= totalPages || totalPages <= 1" 
              @click.stop="changePage(totalPages)"
              title="末页"
            >
              末页
            </button>
            <div class="page-jump">
              <span>跳至</span>
              <input 
                type="number" 
                v-model.number="jumpPage" 
                :min="1" 
                :max="totalPages"
                @keyup.enter="handleJump"
                class="jump-input"
              />
              <span>页</span>
              <button @click.stop="handleJump" class="jump-btn">确定</button>
            </div>
          </div>
        </div>
      </section>
    </div>

    <!-- 电影表单弹窗 -->
    <MovieForm 
      v-if="showMovieForm" 
      :is-edit="false"
      @submit="handleMovieSubmit"
      @cancel="showMovieForm = false"
    />
  </div>
</template>

<script setup lang="ts">
import { useSearchStore } from '@/stores/search'
import { useLibraryStore } from '@/stores/library'
import { useUserStore } from '@/stores/user'
import WatchlistButtons from '@/components/WatchlistButtons.vue'
import RatingStars from '@/components/RatingStars.vue'
import TagChipsEditor from '@/components/TagChipsEditor.vue'
import AddToList from '@/components/AddToList.vue'
import MovieForm from '@/components/MovieForm.vue'
import { saveMovie } from '@/api/movies'
import type { MovieSaveData } from '@/api/movies'
import { nextTick, ref, computed, watch } from 'vue'
const store = useSearchStore()
const library = useLibraryStore()
const userStore = useUserStore()

const showMovieForm = ref(false)
const jumpPage = ref(1)

// 检查是否为管理员
const isAdmin = computed(() => {
  return userStore.user?.role === 'ADMIN'
})

// 计算总页数
const totalPages = computed(() => Math.max(1, Math.ceil(store.total / store.pageSize)))

// 计算可见的页码
const visiblePages = computed(() => {
  const pages: (number | string)[] = []
  const current = store.page
  const total = totalPages.value
  
  if (total <= 7) {
    // 总页数少于等于7页，显示所有页码
    for (let i = 1; i <= total; i++) {
      pages.push(i)
    }
  } else {
    // 总页数大于7页，显示部分页码
    if (current <= 4) {
      // 当前页在前4页，显示前5页和最后一页
      for (let i = 1; i <= 5; i++) {
        pages.push(i)
      }
      pages.push('...')
      pages.push(total)
    } else if (current >= total - 3) {
      // 当前页在后4页，显示第一页和最后5页
      pages.push(1)
      pages.push('...')
      for (let i = total - 4; i <= total; i++) {
        pages.push(i)
      }
    } else {
      // 当前页在中间，显示第一页、当前页前后各2页和最后一页
      pages.push(1)
      pages.push('...')
      for (let i = current - 2; i <= current + 2; i++) {
        pages.push(i)
      }
      pages.push('...')
      pages.push(total)
    }
  }
  
  return pages
})

function toggleArray(arrRef, value) {
  const idx = arrRef.indexOf(value)
  if (idx >= 0) arrRef.splice(idx, 1)
  else arrRef.push(value)
  applySearch(true)
}

async function applySearch(replace = false) {
  store.page = 1
  jumpPage.value = 1
  await store.syncToRoute(replace)
}

function clearAll() {
  store.clearAll()
  applySearch(true)
}

function quickGenre(value) {
  if (!store.genres.includes(value)) store.genres.push(value)
  applySearch(true)
}

function changePage(p: number) {
  const targetPage = Math.max(1, Math.min(p, totalPages.value))
  if (targetPage === store.page) return // 如果目标页就是当前页，不重复加载
  store.page = targetPage
  jumpPage.value = targetPage
  // 滚动到顶部
  window.scrollTo({ top: 0, behavior: 'smooth' })
  store.syncToRoute(true)
}

function handleSizeChange() {
  store.page = 1
  jumpPage.value = 1
  store.syncToRoute(true)
}

function handleJump() {
  const targetPage = Math.max(1, Math.min(jumpPage.value, totalPages.value))
  if (targetPage !== store.page) {
    changePage(targetPage)
  }
}

// ensure initial sync when view mounts
nextTick(() => {
  store.syncFromRoute()
})

// 同步 jumpPage 与当前页码
watch(() => store.page, (newPage) => {
  jumpPage.value = newPage
})

function getEntry(it:any){
  const existing = library.entries[it.id]
  if (existing) return existing
  return library.upsertEntry({
    mediaId: it.id,
    mediaType: 'movie',
    title: it.title,
    poster: it.poster,
    year: it.year
  })
}

function updateStatus(it:any, v:any){
  library.setStatus(it.id, v)
}

function updateRating(it:any, v:any){
  library.setRating(it.id, v as number|undefined)
}

function updateTags(it:any, v:string[]){
  library.setTags(it.id, v)
}

function getPlaceholder(): string {
  const typeMap = {
    movie: '搜索电影...',
    tv: '搜索电视剧...',
    anime: '搜索动漫...',
    variety: '搜索综艺...'
  }
  return typeMap[store.type] || '搜索电影、剧集、动漫、人物或标签'
}

// 处理电影表单提交
async function handleMovieSubmit(movieData: MovieSaveData) {
  try {
    await saveMovie(movieData)
    alert('电影保存成功！')
    showMovieForm.value = false
    // 刷新搜索结果
    await applySearch(true)
  } catch (error: any) {
    alert(error?.message || '保存失败，请稍后重试')
  }
}
</script>

<style lang="scss" scoped>
.search-page {
  min-height: calc(100vh - 70px);
  padding: 24px;
  display: flex;
  flex-direction: column;
}
.search-header {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
  .search-input {
    flex: 1;
    padding: 10px 12px;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
  }
  .search-btn {
    padding: 10px 14px;
    border: none;
    background: var(--primary-color);
    color: #fff;
    border-radius: 8px;
    cursor: pointer;
  }
}
.search-body {
  display: grid;
  grid-template-columns: 260px 1fr;
  gap: 16px;
  flex: 1;
  min-height: 0;
}
.facet-panel {
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 12px;
  .facet-section { 
    & + .facet-section { margin-top: 12px; }
    h4 { margin: 0 0 8px 0; font-size: 13px; color: #6b7280; }
  }
  .chips { display: flex; flex-wrap: wrap; gap: 8px; }
  .chip { 
    padding: 6px 10px; border-radius: 16px; border: 1px solid #e5e7eb; background: #f8fafc; cursor: pointer; font-size: 12px;
    &.active { background: var(--bg-primary); color: var(--primary-color); border-color: var(--primary-color); }
    .count { margin-left: 6px; color: #9ca3af; }
  }
  .range-row { display: flex; align-items: center; gap: 8px; margin: 8px 0; }
  .apply-btn { width: 100%; padding: 8px 10px; border: none; background: var(--primary-color); color: #fff; border-radius: 8px; cursor: pointer; }
  .clear-btn { width: 100%; margin-top: 6px; padding: 8px 10px; border: 1px solid #e5e7eb; background: #fff; border-radius: 8px; cursor: pointer; }
}
.result-panel {
  display: flex;
  flex-direction: column;
  min-height: 0;
  .result-header { 
    display: flex; 
    justify-content: space-between; 
    align-items: center; 
    margin-bottom: 12px; 
    flex-shrink: 0;
    gap: 12px;
    .header-actions {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .add-movie-btn {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 8px 16px;
      background: var(--primary-color);
      color: white;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      font-size: 14px;
      font-weight: 500;
      transition: all 0.2s;
      white-space: nowrap;
      &:hover {
        background: var(--primary-dark);
      }
      i {
        font-size: 16px;
      }
    }
  }
  .grid { display: grid; grid-template-columns: repeat(6, 1fr); gap: 12px; }
  .card { background: #fff; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden; position: relative; }
  .card-link { text-decoration: none; color: inherit; display: block; }
  .card-link:hover .poster { opacity: 0.9; }
  .card .poster { height: 180px; background-color: #f3f4f6; background-size: cover; background-position: center; transition: opacity 0.2s; }
  .card .meta { padding: 10px; }
  .card .meta h3 { margin: 0; font-size: 14px; color: #111827; }
  .card-link:hover h3 { color: var(--primary-color); }
  .card .meta .sub { margin: 6px 0; color: #6b7280; font-size: 12px; }
  .card .meta .tags { display: flex; flex-wrap: wrap; gap: 6px; }
  .card .meta .tag { padding: 2px 6px; background: #f3f4f6; border-radius: 6px; font-size: 11px; }
  .card .meta .rating-row { margin-top: 6px; margin-bottom: 4px; display: flex; align-items: center; gap: 6px; }
  .card .meta .rating-text { color: #6b7280; font-size: 12px; }
  .card .actions-overlay { padding: 0 10px 10px; }
  .card .actions { margin-top: 8px; display: flex; align-items: center; justify-content: space-between; gap: 8px; }
  .card .actions .left{ display:flex; align-items:center; gap:8px; }
  .card .actions .right{ display:flex; align-items:center; gap:8px; }
  .card .my-tags{ margin-top:8px; }
  .skeleton { height: 240px; background: linear-gradient(90deg, #f3f4f6 25%, #e5e7eb 37%, #f3f4f6 63%); background-size: 400% 100%; animation: shimmer 1.4s ease infinite; border-radius: 12px; }
  .empty { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 300px; }
  .pagination-container { margin-top: 24px; display: flex; flex-direction: column; gap: 16px; }
  .pagination-info { display: flex; align-items: center; justify-content: center; gap: 8px; color: #6b7280; font-size: 14px; }
  .pagination-info .divider { margin: 0 4px; }
  .page-size-select { padding: 6px 8px; border: 1px solid #e5e7eb; border-radius: 6px; background: #fff; cursor: pointer; font-size: 14px; }
  .pagination { display: flex; align-items: center; justify-content: center; gap: 8px; flex-wrap: wrap; }
  .pagination-btn { padding: 8px 12px; border: 1px solid #e5e7eb; background: #fff; border-radius: 6px; cursor: pointer; font-size: 14px; color: #374151; transition: all 0.2s; min-width: 36px; }
  .pagination-btn:hover:not(:disabled) { background: #f9fafb; border-color: var(--primary-color); color: var(--primary-color); }
  .pagination-btn:disabled { opacity: 0.5; cursor: not-allowed; }
  .pagination-btn.active { background: var(--primary-color); color: #fff; border-color: var(--primary-color); font-weight: 600; }
  .page-numbers { display: flex; align-items: center; gap: 4px; }
  .page-ellipsis { padding: 8px 4px; color: #9ca3af; user-select: none; }
  .page-jump { display: flex; align-items: center; gap: 6px; margin-left: 12px; padding-left: 12px; border-left: 1px solid #e5e7eb; font-size: 14px; color: #6b7280; }
  .jump-input { width: 50px; padding: 6px 8px; border: 1px solid #e5e7eb; border-radius: 6px; text-align: center; font-size: 14px; }
  .jump-btn { padding: 6px 12px; border: 1px solid #e5e7eb; background: #fff; border-radius: 6px; cursor: pointer; font-size: 14px; color: #374151; }
  .jump-btn:hover { background: #f9fafb; border-color: var(--primary-color); color: var(--primary-color); }
}
@keyframes shimmer { 0% { background-position: 100% 0; } 100% { background-position: 0 0; } }
</style>


