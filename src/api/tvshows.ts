import { http, jsonBody } from '@/api/http'
import type { TvshowsListQuery, TvshowsListResponse, TvshowDetail } from '@/types/tvshows'

function buildQuery(params: Record<string, unknown>): string {
  const s = new URLSearchParams()
  Object.entries(params).forEach(([k, v]) => {
    if (v === undefined || v === null || v === '') return
    s.set(k, String(v))
  })
  return s.toString()
}

export async function fetchTvshows(params: TvshowsListQuery = {}, signal?: AbortSignal): Promise<TvshowsListResponse> {
  const query = buildQuery({
    page: params.page,
    size: params.size,
    tag: params.genre, // 后端参数名是tag
    year: params.year,
    rating: params.rating,
    actor: params.actor,
    award: params.award
  })
  // 后端接口: GET /api/tvshows
  const res = await http<{ code: number; data: any }>(`/tvshows${query ? `?${query}` : ''}`, { signal })
  const data = res.data
  // 转换后端格式到前端格式
  return {
    tvshows: data.tvshows || [],
    total: data.pagination?.total || 0,
    page: data.pagination?.page || params.page || 1,
    size: data.pagination?.size || params.size || 10
  }
}

// 获取电视剧列表 - 使用 /api/tvshows/list 接口
export async function fetchTvshowsList(params: TvshowsListQuery = {}, signal?: AbortSignal): Promise<TvshowsListResponse> {
  const query = buildQuery({
    page: params.page,
    size: params.size,
    tag: params.tag || params.genre,
    year: params.year,
    rating: params.rating,
    actor: params.actor,
    award: params.award
  })
  // 后端接口: GET /api/tvshows/list
  const res = await http<{ code: number; data: any }>(`/tvshows/list${query ? `?${query}` : ''}`, { signal })
  const data = res.data
  // 转换后端格式到前端格式
  return {
    tvshows: data.tvshows || [],
    total: data.pagination?.total || 0,
    page: data.pagination?.page || params.page || 1,
    size: data.pagination?.size || params.size || 10,
    hasMore: data.pagination?.has_next || false
  }
}

export interface TvshowActor {
  id: number; // 演员ID（必需）
  role: string; // 演员表演角色（必需）
  description: string; // 描述（必需）
}

export interface TvshowSaveData {
  id?: number; // 有id则修改，无id则添加
  title: string;
  original_title?: string;
  year: number;
  tags: string[];
  director: number; // 导演ID
  actors: TvshowActor[]; // 演员列表，每个包含id、role、description
  poster: string;
  summary: string;
  awards?: number[]; // 奖项ID数组（可选）
  duration: number; // 单位：分钟
  country: string;
  language: string;
  trailer?: string;
  photos: string[];
}

export async function saveTvshow(tvshowData: TvshowSaveData, signal?: AbortSignal): Promise<{ id: number }> {

  const res = await http<{ code: number; data: { id: number } }>('/tvshows/add', {
    method: 'POST',
    body: jsonBody(tvshowData),
    signal
  })
  return res.data
}

// 获取电视剧详情
export async function fetchTvshowDetail(id: number | string, signal?: AbortSignal): Promise<TvshowDetail> {
  const res = await http<{ code: number; data: any }>(`/tvshows/${id}`, { signal })
  const data = res.data
  // 数据已经符合前端类型，直接返回
  return data
}

// 点赞电视剧
export async function likeTvshow(id: number | string, signal?: AbortSignal): Promise<void> {
  await http(`/tvshows/${id}/like`, {
    method: 'POST',
    signal
  })
}

// 取消点赞电视剧
export async function unlikeTvshow(id: number | string, signal?: AbortSignal): Promise<void> {
  await http(`/tvshows/${id}/unlike`, {
    method: 'POST',
    signal
  })
}

// 提交评分
export interface TvshowRateData {
  score: number; // 1-10整数
  comment: string; // 最大长度1000字
}

export async function rateTvshow(id: number | string, data: TvshowRateData, signal?: AbortSignal): Promise<void> {
  await http(`/tvshows/${id}/rate`, {
    method: 'POST',
    body: jsonBody(data),
    signal
  })
}

// 收藏电视剧
export async function favoriteTvshow(id: number | string, signal?: AbortSignal): Promise<void> {
  await http(`/tvshows/${id}/favorite`, {
    method: 'POST',
    signal
  })
}

// 取消收藏电视剧
export async function unfavoriteTvshow(id: number | string, signal?: AbortSignal): Promise<void> {
  await http(`/tvshows/${id}/unfavorite`, {
    method: 'POST',
    signal
  })
}

// 搜索电视剧 - 使用 /api/tvshows/search 接口
export async function searchTvshows(params: TvshowsListQuery = {}, signal?: AbortSignal): Promise<TvshowsListResponse> {
  // keyword 是必填项
  if (!params.keyword || !params.keyword.trim()) {
    throw new Error('keyword 参数是必填项，不能为空')
  }
  
  const query = buildQuery({
    page: params.page,
    size: params.size,
    keyword: params.keyword.trim(), // keyword 是必填项
    tag: params.tag || params.genre, // 支持tag和genre参数
    year: params.year,
    rating: params.rating,
    actor: params.actor,
    award: params.award
  })
  // 后端接口: GET /api/tvshows/search
  const res = await http<{ code: number; data: any }>(`/tvshows/search${query ? `?${query}` : ''}`, { signal })
  const data = res.data
  // 转换后端格式到前端格式
  return {
    tvshows: data.tvshows || [],
    total: data.pagination?.total || 0,
    page: data.pagination?.page || params.page || 1,
    size: data.pagination?.size || params.size || 10,
    hasMore: data.pagination?.has_next !== false
  }
}

// 删除电视剧
export async function deleteTvshow(id: number | string, signal?: AbortSignal): Promise<void> {
  await http(`/tvshows/${id}/delete`, {
    method: 'POST',
    signal
  })
}