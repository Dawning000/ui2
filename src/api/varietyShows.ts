import { http, jsonBody } from '@/api/http'
import type { VarietyShowRateData } from '@/types/variety'

// 综艺嘉宾接口
export interface VarietyShowGuest {
  id: number; // 嘉宾ID（必需）
  role: string; // 角色（必需）
  description: string; // 描述（必需）
}

// 综艺奖项接口
export interface VarietyShowAward {
  id: number; // 奖项ID（必需）
  year: number; // 获奖年份（必需）
  status: 'nominated' | 'awarded'; // 获奖状态（必需，nominated或awarded）
  note: string; // 备注（必需）
}

// 综艺保存数据接口
export interface VarietyShowSaveData {
  id?: number; // 有id则修改，无id则添加
  title: string;
  original_title?: string;
  year: number;
  tags: string[];
  host: number; // 主持人ID（必需）
  guests: VarietyShowGuest[]; // 嘉宾列表，每个包含id、role、description
  poster: string;
  summary: string;
  awards: VarietyShowAward[]; // 奖项列表，每个包含id、year、status、note
  episodes: number;
  country: string;
  language: string;
  trailer?: string;
  photos: string[];
}


// 保存综艺（添加或修改）
// 无论新增还是修改，都使用POST /varieties/add接口，body里传id就是修改
export async function saveVarietyShow(data: VarietyShowSaveData) {
  // 确保数据格式正确，特别是主持人ID、嘉宾列表和奖项列表
  const processedData = {
    ...data,
    genre: data.tags, // 后端可能使用genre字段
    // 确保主持人ID是数字类型
    host: Number(data.host),
    // 确保嘉宾列表中的每个嘉宾都有正确的格式
    guests: data.guests.map(guest => ({
      id: Number(guest.id),
      role: guest.role.trim(),
      description: guest.description.trim()
    })),
    // 确保奖项列表中的每个奖项都有正确的格式
    awards: data.awards.map(award => ({
      id: Number(award.id),
      year: Number(award.year),
      status: award.status,
      note: award.note.trim()
    })),
    rating: undefined // 新增时不需要评分
  }
  
  // 统一使用POST /varieties/add接口，body里传id就是修改，不传id就是新增
  const response = await http<{ code: number; data: any }>(
    '/varieties/add',
    {
      method: 'POST',
      body: jsonBody(processedData)
    }
  )
  return response.data
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
    host: typeof backendData.host === 'object' ? backendData.host?.name || '' : backendData.host || '',
    hostId: typeof backendData.host === 'object' ? backendData.host?.id : (typeof backendData.host === 'number' ? backendData.host : 0),
    guests: (backendData.guests || []).map((g: any) => 
      typeof g === 'object' ? g : { id: 0, role: '', description: String(g) }
    ),
    poster: backendData.poster || '',
    summary: backendData.summary || '',
    awards: (backendData.awards || []).map((a: any) => 
      typeof a === 'object' ? a : { id: 0, year: 0, status: 'nominated', note: String(a) }
    ),
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
export async function rateVarietyShow(id: number | string, data: VarietyShowRateData, signal?: AbortSignal): Promise<void> {
  await http(`/varieties/${id}/rate`, {
    method: 'POST',
    body: jsonBody(data),
    signal
  })
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

// 获取综艺短评列表
export async function fetchVarietyShowReviews(
  id: number | string, 
  params: { page?: number; size?: number } = {}
): Promise<{
  reviews: any[];
  total: number;
  page?: number;
  size?: number;
}> {
  const query = new URLSearchParams()
  if (params.page) query.set('page', String(params.page))
  if (params.size) query.set('size', String(params.size))
  
  // 后端接口: GET /api/varieties/{id}/reviews
  const response = await http<{ code: number; data: any }>(
    `/varieties/${id}/reviews${query.toString() ? `?${query.toString()}` : ''}`
  )
  const data = response.data
  
  // 转换后端格式到前端格式
  const reviews = (data.reviews || []).map((review: any) => ({
    ...review,
    createdAt: review.createTime || review.createdAt,
    user: review.user || {
      id: review.userId,
      username: review.username || '匿名用户',
      avatar: review.avatar
    }
  }))
  
  return {
    reviews,
    total: data.total || data.pagination?.total || 0,
    page: data.pagination?.page || params.page || 1,
    size: data.pagination?.size || params.size || 10
  }
}