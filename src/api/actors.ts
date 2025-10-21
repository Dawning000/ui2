import { http } from '@/api/http'
import type { ActorDetail, ActorListQuery, ActorListResponse } from '@/types/actors'

function buildQuery(params: Record<string, unknown>): string {
  const searchParams = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') return
    searchParams.set(key, String(value))
  })
  return searchParams.toString()
}

export async function fetchActors(params: ActorListQuery = {}, signal?: AbortSignal): Promise<ActorListResponse> {
  const query = buildQuery({
    page: params.page,
    size: params.size,
    keyword: params.keyword,
    nationality: params.nationality,
    gender: params.gender
  })
  // 后端文档返回包裹了 { code, data }，但现有 http 直接返回 JSON
  // 这里约定后端网关已透传 data 字段，或前端直接读取同结构。
  return http<ActorListResponse>(`/actors${query ? `?${query}` : ''}`, { signal })
}

export async function fetchActorDetail(id: number | string, signal?: AbortSignal): Promise<ActorDetail> {
  return http<ActorDetail>(`/actors/${id}`, { signal })
}



