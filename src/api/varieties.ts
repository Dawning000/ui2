import { http, jsonBody } from '@/api/http'
import type { VarietiesListQuery, VarietiesListResponse, VarietyDetail } from '@/types/varieties'

function buildQuery(params: Record<string, unknown>): string {
  const s = new URLSearchParams()
  Object.entries(params).forEach(([k, v]) => {
    if (v === undefined || v === null || v === '') return
    s.set(k, String(v))
  })
  return s.toString()
}

export async function fetchVarieties(params: VarietiesListQuery = {}, signal?: AbortSignal): Promise<VarietiesListResponse> {
  const query = buildQuery({
    page: params.page,
    size: params.size,
    tag: params.genre, // 后端参数名是tag
    year: params.year,
    rating: params.rating,
    actor: params.actor,
    award: params.award
  })
  // 后端接口: GET /api/varieties
  const res = await http<{ code: number; data: any }>(`/varieties${query ? `?${query}` : ''}`, { signal })
  const data = res.data
  // 转换后端格式到前端格式
  return {
    varieties: data.varieties || [],
    total: data.pagination?.total || 0,
    page: data.pagination?.page || params.page || 1,
    size: data.pagination?.size || params.size || 10
  }
}

// 获取综艺列表 - 使用 /api/varieties/list 接口
export async function fetchVarietiesList(params: VarietiesListQuery = {}, signal?: AbortSignal): Promise<VarietiesListResponse> {
  const query = buildQuery({
    page: params.page,
    size: params.size,
    tag: params.tag || params.genre,
    year: params.year,
    rating: params.rating,
    actor: params.actor,
    award: params.award
  })
  // 后端接口: GET /api/varieties/list
  const res = await http<{ code: number; data: any }>(`/varieties/list${query ? `?${query}` : ''}`, { signal })
  const data = res.data
  // 转换后端格式到前端格式
  return {
    varieties: data.varieties || [],
    total: data.pagination?.total || 0,
    page: data.pagination?.page || params.page || 1,
    size: data.pagination?.size || params.size || 10,
    hasMore: data.pagination?.has_next || false
  }
}

export interface VarietyActor {
  id: number; // 演员ID（必需）
  role: string; // 演员表演角色（必需）
  description: string; // 描述（必需）
}

export interface VarietySaveData {
  id?: number; // 有id则修改，无id则添加
  title: string;
  original_title?: string;
  year: number;
  tags: string[];
  director: number; // 导演ID
  actors: VarietyActor[]; // 演员列表，每个包含id、role、description
  poster: string;
  summary: string;
  awards?: number[]; // 奖项ID数组（可选）
  duration: number; // 单位：分钟
  country: string;
  language: string;
  trailer?: string;
  photos: string[];
}

export async function saveVariety(varietyData: VarietySaveData, signal?: AbortSignal): Promise<{ id: number }> {

  const res = await http<{ code: number; data: { id: number } }>('/varieties/add', {
    method: 'POST',
    body: jsonBody(varietyData),
    signal
  })
  return res.data
}

// 获取综艺详情
export async function fetchVarietyDetail(id: number | string, signal?: AbortSignal): Promise<VarietyDetail> {
  const res = await http<{ code: number; data: any }>(`/varieties/${id}`, { signal })
  const data = res.data
  // 数据已经符合前端类型，直接返回
  return data
}

// 点赞综艺
export async function likeVariety(id: number | string, signal?: AbortSignal): Promise<void> {
  await http(`/varieties/${id}/like`, {
    method: 'POST',
    signal
  })
}

// 取消点赞综艺
export async function unlikeVariety(id: number | string, signal?: AbortSignal): Promise<void> {
  await http(`/varieties/${id}/unlike`, {
    method: 'POST',
    signal
  })
}

// 提交评分
export interface VarietyRateData {
  score: number; // 1-10整数
  comment: string; // 最大长度1000字
}

export async function rateVariety(id: number | string, data: VarietyRateData, signal?: AbortSignal): Promise<void> {
  await http(`/varieties/${id}/rate`, {
    method: 'POST',
    body: jsonBody(data),
    signal
  })
}

// 收藏综艺
export async function favoriteVariety(id: number | string, signal?: AbortSignal): Promise<void> {
  await http(`/varieties/${id}/favorite`, {
    method: 'POST',
    signal
  })
}

// 取消收藏综艺
export async function unfavoriteVariety(id: number | string, signal?: AbortSignal): Promise<void> {
  await http(`/varieties/${id}/unfavorite`, {
    method: 'POST',
    signal
  })
}

// 搜索综艺 - 使用 /api/varieties/search 接口
export async function searchVarieties(params: VarietiesListQuery = {}, signal?: AbortSignal): Promise<VarietiesListResponse> {
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
  // 后端接口: GET /api/varieties/search
  const res = await http<{ code: number; data: any }>(`/varieties/search${query ? `?${query}` : ''}`, { signal })
  const data = res.data
  // 转换后端格式到前端格式
  return {
    varieties: data.varieties || [],
    total: data.pagination?.total || 0,
    page: data.pagination?.page || params.page || 1,
    size: data.pagination?.size || params.size || 10,
    hasMore: data.pagination?.has_next !== false
  }
}

// 删除综艺
export async function deleteVariety(id: number | string, signal?: AbortSignal): Promise<void> {
  await http(`/varieties/${id}/delete`, {
    method: 'POST',
    signal
  })
}