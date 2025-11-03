import type { SearchQueryParams, SearchResponse, SuggestItem } from '@/types/search'
import { http } from '@/api/http'
import { fetchMoviesList } from './movies'

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
  // 如果是电影类型且没有搜索关键词，使用 /api/movies/list 接口
  if (params.type === 'movie' && !params.q) {
    const moviesData = await fetchMoviesList({
      page: params.page,
      size: params.pageSize,
      genre: params.genres?.[0], // 只取第一个类型
      year: params.yearGte,
      rating: params.ratingGte
    }, signal)
    
    // 转换电影列表格式为搜索响应格式
    // 注意：后端返回的数据是 tags/rating 字段
    return {
      items: moviesData.movies.map((m: any) => ({
        id: m.id,
        title: m.title,
        year: m.year,
        rating: m.rating, // 后端直接返回 rating 字段
        genres: Array.isArray(m.tags) ? m.tags : (m.tags ? [m.tags] : []),
        poster: m.poster
      })),
      total: moviesData.total,
      page: moviesData.page,
      pageSize: moviesData.size,
      hasMore: moviesData.hasMore !== undefined ? moviesData.hasMore : (moviesData.page * moviesData.size < moviesData.total)
    }
  }

  // 否则使用搜索接口
  const query = buildQuery({
    q: params.q,
    type: params.type,
    genres: params.genres,
    regions: params.regions,
    year_gte: params.yearGte,
    year_lte: params.yearLte,
    rating_gte: params.ratingGte,
    rating_lte: params.ratingLte,
    sort: params.sort,
    page: params.page,
    page_size: params.pageSize
  })

  return http<SearchResponse>(`/search?${query}`, { signal })
}

export async function suggest(q: string, signal?: AbortSignal): Promise<SuggestItem[]> {
  const query = new URLSearchParams({ q })
  return http<SuggestItem[]>(`/suggest?${query.toString()}`, { signal })
}


