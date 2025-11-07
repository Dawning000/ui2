import type { SearchQueryParams, SearchResponse, SuggestItem } from '@/types/search'
import { http } from '@/api/http'
import { fetchMoviesList, searchMovies } from '@/api/movies'
import { fetchTvshowsList, searchTvshows } from '@/api/tvshows'
import { fetchVarietiesList, searchVarieties } from '@/api/varieties'

const API_BASE = '/api'

function buildQuery(params: Record<string, unknown>): string {
  const searchParams = new URLSearchParams()

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') return
    if (Array.isArray(value)) {
      if (value.length > 0) searchParams.set(key, value.join(','))
    } else {
      searchParams.set(key, String(value))
    }
  })

  return searchParams.toString()
}

export async function search(params: SearchQueryParams, signal?: AbortSignal): Promise<SearchResponse> {
  // 调试日志：输出接收到的参数（包括所有筛选参数）
  console.log('[Search API] 接收到的参数:', {
    type: params.type,
    q: params.q,
    page: params.page,
    pageSize: params.pageSize,
    // 筛选参数
    tag: params.tag,
    year: params.year,
    ratingGte: params.ratingGte,
    actor: params.actor,
    award: params.award,
    genres: params.genres
  })
  
  // 根据类型调用不同的搜索接口
  switch (params.type || 'movie') {
    case 'movie':
      return await searchMoviesByType('movie', params, signal)
    case 'tvshow':
      return await searchMoviesByType('tvshow', params, signal)
    case 'variety':
      return await searchMoviesByType('variety', params, signal)
    default:
      // 默认为电影搜索
      return await searchMoviesByType('movie', params, signal)
  }
}

// 根据类型进行搜索的通用函数
async function searchMoviesByType(type: string, params: SearchQueryParams, signal?: AbortSignal): Promise<SearchResponse> {
  const hasSearchKeyword = params.q && params.q.trim() !== ''
  const tagValue = params.tag?.trim() || params.genres?.join(',') || undefined
  
  // 构建基础参数
  const baseParams = {
    page: params.page,
    size: params.pageSize,
    tag: tagValue,
    year: params.year,
    rating: params.ratingGte,
    actor: params.actor,
    award: params.award
  }
  
  let data: any
  
  // 没有搜索关键词时，使用列表接口
  if (!hasSearchKeyword) {
    console.log(`[List接口] 使用${getTypeName(type)}列表接口`, baseParams)
    
    switch (type) {
      case 'movie':
        data = await fetchMoviesList(baseParams, signal)
        break
      case 'tvshow':
        data = await fetchTvshowsList(baseParams, signal)
        break
      case 'variety':
        data = await fetchVarietiesList(baseParams, signal)
        break
      default:
        data = await fetchMoviesList(baseParams, signal)
    }
  } else {
    // 有搜索关键词时，使用搜索接口
    const keyword = (params.q || '').trim()
    console.log(`[Search接口] 使用${getTypeName(type)}搜索接口，关键词:`, keyword)
    
    const searchParams = {
      ...baseParams,
      keyword: keyword
    }
    
    switch (type) {
      case 'movie':
        data = await searchMovies(searchParams, signal)
        break
      case 'tvshow':
        data = await searchTvshows(searchParams, signal)
        break
      case 'variety':
        data = await searchVarieties(searchParams, signal)
        break
      default:
        data = await searchMovies(searchParams, signal)
    }
  }
  
  // 确定数据数组的键名
  const dataKey = type === 'movie' ? 'movies' : (type === 'tvshow' ? 'tvshows' : 'varieties')
  
  // 转换数据格式为搜索响应格式
  return {
    items: (data[dataKey] || []).map((item: any) => ({
      id: item.id,
      title: item.title,
      year: item.year,
      rating: item.rating,
      genres: Array.isArray(item.tags) ? item.tags : (Array.isArray(item.genres) ? item.genres : (item.tags ? [item.tags] : [])),
      poster: item.poster,
      regions: item.country ? [item.country] : item.regions
    })),
    total: data.total || data.pagination?.total || 0,
    page: data.page || data.pagination?.page || params.page || 1,
    pageSize: data.size || data.pageSize || data.pagination?.size || params.pageSize || 24,
    hasMore: data.hasMore !== undefined ? data.hasMore : ((data.page || 1) * (data.size || data.pageSize || 24) < (data.total || 0)),
    facets: data.facets
  }
  
  // 获取类型名称
  function getTypeName(type: string): string {
    switch (type) {
      case 'movie':
        return '电影'
      case 'tvshow':
        return '电视剧'
      case 'variety':
        return '综艺'
      default:
        return '电影'
    }
  }

export async function suggest(q: string, signal?: AbortSignal): Promise<SuggestItem[]> {
  const query = new URLSearchParams({ q })
  return http<SuggestItem[]>(`/suggest?${query.toString()}`, { signal })
}


