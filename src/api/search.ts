import type { SearchQueryParams, SearchResponse, SuggestItem } from '@/types/search'
import { http } from '@/api/http'
import { fetchMoviesList, searchMovies } from './movies'

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
  
  // 根据类型选择对应的接口
  const type = params.type || 'movie'
  const hasSearchKeyword = params.q && params.q.trim() !== ''
  
  // 如果是电影类型，使用电影专用接口
  if (type === 'movie') {
    // 如果没有搜索关键词，使用列表接口（默认）
    if (!hasSearchKeyword) {
      const moviesData = await fetchMoviesList({
        page: params.page,
        size: params.pageSize,
        tag: params.tag || params.genres?.join(','), // 优先使用tag参数，否则使用genres
        year: params.year || undefined,
        rating: params.ratingGte || undefined,
        actor: params.actor || undefined,
        award: params.award || undefined
        // 注意：/api/movies/list 接口不支持 country 和 language 参数
      }, signal)
      
      // 在控制台输出list接口获取的数据
      console.log('[List接口] 获取的电影列表数据:', moviesData)
      console.log('[List接口] 请求参数:', {
        page: params.page,
        size: params.pageSize,
        tag: params.tag || params.genres?.join(','),
        year: params.year,
        rating: params.ratingGte,
        actor: params.actor,
        award: params.award
      })
      
      // 转换电影列表格式为搜索响应格式
      return {
        items: moviesData.movies.map((m: any) => ({
          id: m.id,
          title: m.title,
          year: m.year,
          rating: m.rating,
          genres: Array.isArray(m.tags) ? m.tags : (m.tags ? [m.tags] : []),
          poster: m.poster,
          regions: m.country ? [m.country] : undefined
        })),
        total: moviesData.total,
        page: moviesData.page,
        pageSize: moviesData.size,
        hasMore: moviesData.hasMore !== undefined ? moviesData.hasMore : (moviesData.page * moviesData.size < moviesData.total),
        facets: undefined // 列表接口可能不返回facets
      }
    }
    
    // 有搜索关键词时，使用搜索接口
    // keyword 是必填项，从搜索栏（params.q）获取
    const keyword = (params.q || '').trim()
    if (!keyword) {
      // 如果 keyword 为空，应该使用列表接口而不是搜索接口
      // 这里理论上不应该到达，因为前面已经判断了 hasSearchKeyword
      throw new Error('搜索关键词不能为空')
    }
    
    console.log('[Search接口] 使用电影搜索接口，关键词:', keyword)
    // 确定 tag 值：优先使用 tag，如果 tag 为空则使用 genres
    const tagValue = params.tag?.trim() || params.genres?.join(',') || undefined
    console.log('[Search接口] tag参数值:', {
      'params.tag': params.tag,
      'params.genres': params.genres,
      '最终tag值': tagValue
    })
    
    const searchParams = {
      page: params.page,
      size: params.pageSize,
      keyword: keyword, // keyword 是必填项，从搜索栏获取
      tag: tagValue, // tag 参数（如果用户填写了tag，则使用tag；否则使用genres）
      year: params.year || undefined,
      rating: params.ratingGte || undefined,
      actor: params.actor?.trim() || undefined,
      award: params.award?.trim() || undefined
      // 注意：country 和 language 参数后端API不支持，无法在此接口使用
    }
    console.log('[Search接口] 完整请求参数:', searchParams)
    const moviesData = await searchMovies(searchParams, signal)
    
    // 转换电影列表格式为搜索响应格式
    return {
      items: moviesData.movies.map((m: any) => ({
        id: m.id,
        title: m.title,
        year: m.year,
        rating: m.rating,
        genres: Array.isArray(m.tags) ? m.tags : (m.tags ? [m.tags] : []),
        poster: m.poster,
        regions: m.country ? [m.country] : undefined
      })),
      total: moviesData.total,
      page: moviesData.page,
      pageSize: moviesData.size,
      hasMore: moviesData.hasMore !== undefined ? moviesData.hasMore : (moviesData.page * moviesData.size < moviesData.total),
      facets: undefined // 电影搜索接口可能不返回facets
    }
  }

  // 其他类型（tv, anime, variety）根据分类调用对应的接口
  // 根据是否有搜索关键词选择接口
  if (hasSearchKeyword) {
    // 有搜索关键词时，使用对应类型的搜索接口: /api/{type}/search
    const keyword = (params.q || '').trim()
    if (!keyword) {
      throw new Error('搜索关键词不能为空')
    }
    
    console.log(`[Search接口] 使用${type}搜索接口，关键词:`, keyword)
    // 确定 tag 值：优先使用 tag，如果 tag 为空则使用 genres
    const tagValue = params.tag?.trim() || params.genres?.join(',') || undefined
    console.log(`[Search接口] ${type}类型tag参数值:`, {
      'params.tag': params.tag,
      'params.genres': params.genres,
      '最终tag值': tagValue
    })
    
    const query = buildQuery({
      page: params.page,
      size: params.pageSize,
      keyword: keyword, // keyword 是必填项
      tag: tagValue,
      year: params.year,
      rating: params.ratingGte,
      actor: params.actor?.trim() || undefined,
      award: params.award?.trim() || undefined
    })
    
    console.log(`[Search接口] 请求URL: /${type}/search?${query}`)
    const res = await http<{ code: number; data: any }>(`/${type}/search${query ? `?${query}` : ''}`, { signal })
    const data = res.data
    
    // 转换响应格式
    return {
      items: (data.items || data.movies || []).map((m: any) => ({
        id: m.id,
        title: m.title,
        year: m.year,
        rating: m.rating,
        genres: Array.isArray(m.tags) ? m.tags : (Array.isArray(m.genres) ? m.genres : (m.tags ? [m.tags] : [])),
        poster: m.poster,
        regions: m.country ? [m.country] : (m.regions || undefined),
        highlight: m.highlight
      })),
      total: data.total || data.pagination?.total || 0,
      page: data.page || data.pagination?.page || params.page || 1,
      pageSize: data.pageSize || data.pagination?.size || params.pageSize || 24,
      hasMore: data.hasMore !== undefined ? data.hasMore : ((data.page || 1) * (data.pageSize || 24) < (data.total || 0)),
      facets: data.facets
    }
  } else {
    // 没有搜索关键词时，使用对应类型的列表接口: /api/{type}/list
    console.log(`[List接口] 使用${type}列表接口`)
    const query = buildQuery({
      page: params.page,
      size: params.pageSize,
      tag: params.tag || params.genres?.join(','),
      year: params.year,
      rating: params.ratingGte,
      actor: params.actor,
      award: params.award
    })
    
    console.log(`[List接口] 请求URL: /${type}/list?${query}`)
    const res = await http<{ code: number; data: any }>(`/${type}/list${query ? `?${query}` : ''}`, { signal })
    const data = res.data
    
    // 转换响应格式
    return {
      items: (data.items || data.movies || []).map((m: any) => ({
        id: m.id,
        title: m.title,
        year: m.year,
        rating: m.rating,
        genres: Array.isArray(m.tags) ? m.tags : (Array.isArray(m.genres) ? m.genres : (m.tags ? [m.tags] : [])),
        poster: m.poster,
        regions: m.country ? [m.country] : (m.regions || undefined)
      })),
      total: data.total || data.pagination?.total || 0,
      page: data.page || data.pagination?.page || params.page || 1,
      pageSize: data.pageSize || data.pagination?.size || params.pageSize || 24,
      hasMore: data.hasMore !== undefined ? data.hasMore : ((data.page || 1) * (data.pageSize || 24) < (data.total || 0)),
      facets: data.facets
    }
  }
}

export async function suggest(q: string, signal?: AbortSignal): Promise<SuggestItem[]> {
  const query = new URLSearchParams({ q })
  return http<SuggestItem[]>(`/suggest?${query.toString()}`, { signal })
}


