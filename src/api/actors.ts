import { http, jsonBody } from '@/api/http'
import type { ActorDetail, ActorListQuery, ActorListResponse, ActorSaveData } from '@/types/actors'

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
  // 后端接口: GET /api/actor/query
  const res = await http<{ 
    code: number
    message: string
    data: {
      actors: Array<{
        id: number
        name: string
        avatar?: string
        birthday?: string
        nationality?: string
        gender?: '男' | '女' | '其他'
        movies_count?: number
        tv_shows_count?: number
      }>
      pagination: {
        total: number
        page: number
        size: number
        has_next?: boolean
      }
    }
  }>(`/actor/query${query ? `?${query}` : ''}`, { signal })
  
  // 转换后端数据格式到前端格式
  const backendData = res.data
  const pagination = backendData.pagination || {}
  
  return {
    actors: (backendData.actors || []).map(actor => ({
      id: actor.id,
      name: actor.name,
      avatar: actor.avatar,
      birthDate: actor.birthday, // birthday -> birthDate
      nationality: actor.nationality,
      gender: actor.gender,
      moviesCount: actor.movies_count, // movies_count -> moviesCount
      tvShowsCount: actor.tv_shows_count // tv_shows_count -> tvShowsCount
    })),
    total: pagination.total || 0,
    page: pagination.page || params.page || 1,
    size: pagination.size || params.size || 20
  }
}

export async function fetchActorDetail(id: number | string, signal?: AbortSignal): Promise<ActorDetail> {
  // 后端接口: GET /api/actor/{id}
  const res = await http<{ 
    code: number
    message: string
    data: {
      id: number
      name: string
      avatar?: string
      birthday?: string
      nationality?: string
      gender?: '男' | '女' | '未知'
      biography?: string
      movies_count?: number
      tv_shows_count?: number
      awards?: Array<{
        id: number
        name: string
        year?: number
        movie?: string
      }>
      movies?: Array<{
        id: number
        title: string
        year?: number
        role?: string
        poster?: string
      }>
      tv_shows?: Array<{
        id: number
        title: string
        year?: number
        role?: string
        poster?: string
      }>
      variety_shows?: Array<{
        id: number
        title: string
        year?: number
        role?: string
        poster?: string
      }>
    }
  }>(`/actor/${id}`, { signal })
  
  // 转换后端数据格式到前端格式
  const backendData = res.data
  return {
    id: backendData.id,
    name: backendData.name,
    avatar: backendData.avatar,
    birthDate: backendData.birthday, // birthday -> birthDate
    nationality: backendData.nationality,
    gender: backendData.gender === '未知' ? '其他' : (backendData.gender as '男' | '女' | '其他'), // '未知' -> '其他'
    biography: backendData.biography,
    moviesCount: backendData.movies_count, // movies_count -> moviesCount
    tvShowsCount: backendData.tv_shows_count, // tv_shows_count -> tvShowsCount
    movies: backendData.movies,
    tvShows: backendData.tv_shows, // tv_shows -> tvShows
    varietyShows: backendData.variety_shows, // variety_shows -> varietyShows
    awards: backendData.awards
  }
}

export async function saveActor(actorData: ActorSaveData, signal?: AbortSignal): Promise<{ id: number }> {
  // 后端接口: POST /api/actor/save
  const res = await http<{ code: number; data: { id: number } }>('/actor/save', {
    method: 'POST',
    body: jsonBody(actorData),
    signal
  })
  return res.data
}



