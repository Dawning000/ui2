import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import type { SearchQueryParams, SearchResponse, SearchItem } from '@/types/search'
import * as api from '@/api/search'
import type { LocationQueryValue } from 'vue-router'

// 辅助函数：将LocationQueryValue转换为string或string[]
function convertQueryValue(value: LocationQueryValue | LocationQueryValue[] | null | undefined): string | string[] | null | undefined {
  if (!value) return undefined
  if (Array.isArray(value)) {
    return value.map(v => v?.toString() || '').filter(Boolean)
  }
  return value?.toString() || ''
}

function parseArray(value: string | string[] | null | undefined): string[] | undefined {
  if (!value) return undefined
  const v = Array.isArray(value) ? value.join(',') : value
  const arr = v.split(',').map(s => s.trim()).filter(Boolean)
  return arr.length ? arr : undefined
}

function parseNumber(value: string | string[] | null | undefined): number | undefined {
  if (!value) return undefined
  const v = Array.isArray(value) ? value[0] : value
  const n = Number(v)
  return Number.isFinite(n) ? n : undefined
}

export const useSearchStore = defineStore('search', () => {
  // routing
  const route = useRoute()
  const router = useRouter()

  // query state
  const q = ref<string>('')
  const type = ref<SearchQueryParams['type']>(undefined)
  const genres = ref<string[]>([])
  const regions = ref<string[]>([])
  const languages = ref<string[]>([])
  const country = ref<string>('') // 国家（输入框）
  const language = ref<string>('') // 语言（输入框）
  const year = ref<number | undefined>(undefined) // 年份（等于）
  const yearGte = ref<number | undefined>(undefined)
  const yearLte = ref<number | undefined>(undefined)
  const ratingGte = ref<number | undefined>(undefined)
  const ratingLte = ref<number | undefined>(undefined)
  const tag = ref<string>('') // 标签筛选
  const actor = ref<string>('') // 演员筛选（只要名字）
  const award = ref<string>('') // 奖项筛选（只要名字）
  const sort = ref<SearchQueryParams['sort']>('relevance_desc')
  const page = ref<number>(1)
  const pageSize = ref<number>(10)

  // results state
  const items = ref<SearchItem[]>([])
  const total = ref<number>(0)
  const hasMore = ref<boolean>(false)
  const facets = ref<SearchResponse['facets']>()
  const loading = ref<boolean>(false)
  const error = ref<string | null>(null)

  // abort control
  let abortController: AbortController | null = null
  
  // 防止循环更新的标志
  let isSyncing = false

  const params = computed<SearchQueryParams>(() => ({
    q: q.value || undefined,
    type: type.value,
    genres: genres.value.length ? genres.value : undefined,
    regions: regions.value.length ? regions.value : undefined,
    languages: languages.value.length ? languages.value : undefined,
    country: country.value || undefined,
    language: language.value || undefined,
    year: year.value,
    yearGte: yearGte.value,
    yearLte: yearLte.value,
    ratingGte: ratingGte.value,
    ratingLte: ratingLte.value,
    tag: tag.value || undefined,
    actor: actor.value || undefined,
    award: award.value || undefined,
    sort: sort.value,
    page: page.value,
    pageSize: pageSize.value
  }))

  function syncFromRoute(): void {
    const query = route.query
    q.value = (convertQueryValue(query.q) as string) || ''
    type.value = (convertQueryValue(query.type) as SearchQueryParams['type']) || undefined
    genres.value = parseArray(convertQueryValue(query.genres)) || []
    regions.value = parseArray(convertQueryValue(query.regions)) || []
    languages.value = parseArray(convertQueryValue(query.languages)) || []
    country.value = (convertQueryValue(query.country) as string) || ''
    language.value = (convertQueryValue(query.language) as string) || ''
    year.value = parseNumber(convertQueryValue(query.year))
    yearGte.value = parseNumber(convertQueryValue(query.year_gte))
    yearLte.value = parseNumber(convertQueryValue(query.year_lte))
    ratingGte.value = parseNumber(convertQueryValue(query.rating_gte))
    ratingLte.value = parseNumber(convertQueryValue(query.rating_lte))
    tag.value = (convertQueryValue(query.tag) as string) || ''
    actor.value = (convertQueryValue(query.actor) as string) || ''
    award.value = (convertQueryValue(query.award) as string) || ''
    sort.value = (convertQueryValue(query.sort) as any) || 'relevance_desc'
    page.value = parseNumber(convertQueryValue(query.page)) || 1
    pageSize.value = parseNumber(convertQueryValue(query.page_size)) || 10
  }

  async function syncToRoute(replace = false): Promise<void> {
    // 如果正在同步，避免循环
    if (isSyncing) return
    
    const query: Record<string, any> = {}
    if (q.value) query.q = q.value
    // 如果 store.type 有值，使用它；否则，如果当前路由有 type 参数，保留它并更新 store
    // 这样可以避免在分类页面搜索时丢失 type 参数
    if (type.value) {
      query.type = type.value
    } else if (route.query.type) {
      const routeType = convertQueryValue(route.query.type) as string
      query.type = routeType
      // 同时更新 store.type，确保状态一致
      type.value = routeType as SearchQueryParams['type']
    }
    if (genres.value.length) query.genres = genres.value.join(',')
    if (regions.value.length) query.regions = regions.value.join(',')
    if (languages.value.length) query.languages = languages.value.join(',')
    if (country.value) query.country = country.value
    if (language.value) query.language = language.value
    if (year.value !== undefined) query.year = year.value
    if (yearGte.value !== undefined) query.year_gte = yearGte.value
    if (yearLte.value !== undefined) query.year_lte = yearLte.value
    if (ratingGte.value !== undefined) query.rating_gte = ratingGte.value
    if (ratingLte.value !== undefined) query.rating_lte = ratingLte.value
    if (tag.value) query.tag = tag.value
    if (actor.value) query.actor = actor.value
    if (award.value) query.award = award.value
    if (sort.value) query.sort = sort.value
    if (page.value && page.value !== 1) query.page = page.value
    if (pageSize.value && pageSize.value !== 24) query.page_size = pageSize.value

    // 检查 query 参数是否真的发生了变化，避免不必要的路由更新
    const currentQuery = route.query
    const queryChanged = Object.keys(query).some(key => {
      const currentValue = currentQuery[key]
      const newValue = query[key]
      if (Array.isArray(currentValue)) {
        return currentValue.join(',') !== newValue
      }
      return String(currentValue) !== String(newValue)
    }) || Object.keys(currentQuery).some(key => !(key in query) && currentQuery[key] !== undefined)

    // 如果 query 没有变化，且使用 replace 模式，则不更新路由
    if (replace && !queryChanged) {
      // 即使路由没有变化，也要确保从路由同步状态并执行搜索
      // 因为用户可能在同一个页面手动修改了搜索条件
      syncFromRoute()
      await runSearch()
      return
    }

    isSyncing = true
    try {
      const nav = { name: route.name || 'Search', query }
      if (replace) await router.replace(nav)
      else await router.push(nav)
      
      // 路由更新后，从路由同步状态（因为路由可能已经变化）
      syncFromRoute()
      // 显式调用 runSearch，因为 watch 可能因为 isSyncing 标志被跳过
      await runSearch()
    } finally {
      // 使用 nextTick 确保路由更新完成后再重置标志
      setTimeout(() => {
        isSyncing = false
      }, 100)
    }
  }

  async function runSearch(): Promise<void> {
    if (abortController) abortController.abort()
    abortController = new AbortController()
    loading.value = true
    error.value = null
    // 清空现有数据，确保切换分类时不会显示旧数据
    items.value = []
    total.value = 0
    hasMore.value = false
    facets.value = undefined
    try {
      const res = await api.search(params.value, abortController.signal)
      items.value = res.items
      total.value = res.total
      hasMore.value = res.hasMore
      facets.value = res.facets
    } catch (e: any) {
      if (e?.name === 'AbortError') return
      if (e?.code === 10005) {
        error.value = '请先登录'
      } else {
        error.value = e?.message || '搜索失败'
      }
    } finally {
      loading.value = false
    }
  }

  function clearAll(): void {
    q.value = ''
    // type 不重置，保留当前值，这样新增电影按钮不会消失
    // type.value = undefined
    genres.value = []
    regions.value = []
    languages.value = []
    country.value = ''
    language.value = ''
    year.value = undefined
    yearGte.value = undefined
    yearLte.value = undefined
    ratingGte.value = undefined
    ratingLte.value = undefined
    tag.value = ''
    actor.value = ''
    award.value = ''
    sort.value = 'relevance_desc'
    page.value = 1
  }

  // watch route -> state
  watch(() => route.fullPath, () => {
    // 如果正在同步路由，跳过这次更新，避免循环
    if (isSyncing) return
    
    syncFromRoute()
    runSearch()
  }, { immediate: true })

  // 监听type变化，确保切换分类时立即清空数据
  watch(() => type.value, () => {
    items.value = []
    total.value = 0
    hasMore.value = false
    facets.value = undefined
  })

  // public API
  return {
    // state
    q, type, genres, regions, languages, country, language, year, yearGte, yearLte, ratingGte, ratingLte, tag, actor, award, sort, page, pageSize,
    items, total, hasMore, facets, loading, error,
    // computed
    params,
    // actions
    syncFromRoute,
    syncToRoute,
    runSearch,
    clearAll
  }
})


