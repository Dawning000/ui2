import { http, jsonBody } from '@/api/http'

// 综艺保存数据接口
export interface VarietyShowSaveData {
  id?: number; // 有id则修改，无id则添加
  title: string;
  original_title?: string;
  year: number;
  tags: string[];
  host: string;
  guests: string[];
  poster: string;
  summary: string;
  awards: string[];
  episodes: number;
  country: string;
  language: string;
  trailer?: string;
  photos: string[];
}

// 综艺评分数据接口
export interface VarietyShowRateData {
  userId: number;
  varietyShowId: number;
  rating: number;
}

// 保存综艺（添加或修改）
export async function saveVarietyShow(data: VarietyShowSaveData) {
  // 构造请求数据
  const requestData = {
    ...data,
    genre: data.tags, // 后端可能使用genre字段
    rating: undefined // 新增时不需要评分
  }
  
  // 根据是否有id判断是添加还是修改
  if (data.id) {
    // 修改综艺
    const response = await http<{ code: number; data: any }>(
      `/varieties/${data.id}`,
      {
        method: 'PUT',
        body: jsonBody(requestData)
      }
    )
    return response.data
  } else {
    
    const response = await http<{ code: number; data: any }>(
      '/varieties/add',
      {
        method: 'POST',
        body: jsonBody(requestData)
      }
    )
    return response.data
  }
}

// 获取综艺详情
export async function fetchVarietyShowDetail(id: number) {
  const response = await http<{ code: number; data: any }>(`/varieties/${id}`)
  // 添加空值检查，防止响应格式异常导致的错误
  if (!response || !response.data) {
    throw new Error('Invalid API response format')
  }
  
  // 尝试获取数据，兼容不同的响应格式
  const backendData = response.data.data || response.data
  
  // 确保backendData存在
  if (!backendData) {
    throw new Error('No data returned from API')
  }
  
  // 数据转换
  return {
    id: backendData.id || 0,
    title: backendData.title || '',
    originalTitle: backendData.originalTitle || backendData.original_title || '',
    year: backendData.year || 0,
    tags: backendData.genre || backendData.tags || [],
    host: backendData.host || '',
    guests: backendData.guests || [],
    poster: backendData.poster || '',
    summary: backendData.summary || '',
    awards: backendData.awards || [],
    episodes: backendData.episodes || 0,
    country: backendData.country || '',
    language: backendData.language || '',
    trailer: backendData.trailer || '',
    photos: backendData.photos || [],
    rating: backendData.rating || 0,
    views: backendData.views || 0,
    likes: backendData.likes || 0,
    isLiked: backendData.isLiked || false,
    isFavorited: backendData.isFavorited || false
  }
}

// 删除综艺
export async function deleteVarietyShow(id: number) {
  const response = await http<{ code: number; data: any }>(
    `/varieties/${id}/delete`,
    {
      method: 'POST'
    }
  )
  return response.data
}

// 获取综艺列表
export async function fetchVarietyShowsList(params: {
  page?: number
  size?: number
  genre?: string
  year?: number
  rating?: number
  host?: string
  guest?: string
}) {
  // 构建查询参数
  const queryParams = new URLSearchParams()
  
  if (params.page) queryParams.append('page', params.page.toString())
  if (params.size) queryParams.append('size', params.size.toString())
  if (params.genre) queryParams.append('genre', params.genre)
  if (params.year) queryParams.append('year', params.year.toString())
  if (params.rating) queryParams.append('rating', params.rating.toString())
  if (params.host) queryParams.append('host', params.host)
  if (params.guest) queryParams.append('guest', params.guest)
  
  const response = await http<{ code: number; data: any }>(
    `/varieties?${queryParams.toString()}`
  )
  
  return {
    varietyShows: (response.data.data?.varietyShows || []).map((item: any) => ({
      id: item.id,
      title: item.title,
      originalTitle: item.originalTitle || item.original_title,
      year: item.year,
      tags: item.genre || item.tags || [],
      host: item.host,
      guests: item.guests || [],
      rating: item.rating,
      poster: item.poster,
      summary: item.summary,
      awards: item.awards || [],
      episodes: item.episodes,
      country: item.country,
      language: item.language
    })),
    total: response.data.data?.total || 0,
    page: response.data.data?.page || params.page || 1,
    size: response.data.data?.size || params.size || 10
  }
}

// 为综艺评分
export async function rateVarietyShow(data: VarietyShowRateData) {
  const response = await http<{ code: number; data: any }>(
    '/varieties/rate',
    {
      method: 'POST',
      body: jsonBody(data)
    }
  )
  return response.data
}

// 点赞综艺
export async function likeVarietyShow(id: number) {
  const response = await http<{ code: number; data: any }>(
    `/varieties/${id}/like`,
    {
      method: 'POST'
    }
  )
  return response.data
}

// 取消点赞综艺
export async function unlikeVarietyShow(id: number) {
  const response = await http<{ code: number; data: any }>(
    `/varieties/${id}/unlike`,
    {
      method: 'POST'
    }
  )
  return response.data
}

// 收藏综艺
export async function favoriteVarietyShow(id: number) {
  const response = await http<{ code: number; data: any }>(
    `/varieties/${id}/favorite`,
    {
      method: 'POST'
    }
  )
  return response.data
}

// 取消收藏综艺
export async function unfavoriteVarietyShow(id: number) {
  const response = await http<{ code: number; data: any }>(
    `/varieties/${id}/unfavorite`,
    {
      method: 'POST'
    }
  )
  return response.data
}