import { http, jsonBody } from './http'

export interface AwardSaveData {
  id?: number // 仅修改时添加
  name: string // 奖项名称
  organization: string // 颁奖机构
  target_type: 'ACTOR' | 'FILM' | 'TVSHOW' | 'VARIETY' // 获奖对象类型
  description: string // 备注
}

export interface AwardListItem {
  id: number
  name: string
  organization?: string
  target_type?: string
  description?: string
  year?: number
  movie?: string
  actor?: string
  category?: string
}

export interface AwardListResponse {
  awards: AwardListItem[]
  total: number
  page: number
  size: number
}

export interface AwardWinner {
  id: number
  name: string
  picture?: string
  year: number
  status: string
  note: string
}

export interface AwardDetail {
  id: number
  name: string
  organization: string
  target_type: 'ACTOR' | 'FILM' | 'TVSHOW' | 'VARIETY'
  description: string
  actors?: AwardWinner[]
  films?: AwardWinner[]
  tv_shows?: AwardWinner[]
  varieties?: AwardWinner[]
}

// 保存奖项（新增或修改）
export async function saveAward(awardData: AwardSaveData): Promise<{ id: number }> {
  const res = await http<{ code: number; data: { id: number } }>('/award/save', {
    method: 'POST',
    body: jsonBody(awardData)
  })
  return res.data
}

// 获取奖项列表
export async function fetchAwardsList(params: {
  page?: number
  size?: number
  keyword?: string
  target_type?: string
} = {}): Promise<AwardListResponse> {
  const searchParams = new URLSearchParams()
  
  if (params.page) searchParams.set('page', String(params.page))
  if (params.size) searchParams.set('size', String(params.size))
  if (params.keyword) searchParams.set('keyword', params.keyword)
  if (params.target_type) searchParams.set('target_type', params.target_type)
  
  const queryString = searchParams.toString()
  const url = `/award/query${queryString ? `?${queryString}` : ''}`
  
  const res = await http<{ code: number; data: any }>(url)
  const data = res.data
  
  return {
    awards: data.awards || data.list || [],
    total: data.pagination?.total || data.total || 0,
    page: data.pagination?.page || data.page || params.page || 1,
    size: data.pagination?.size || data.size || params.size || 20
  }
}

// 获取奖项详情
export async function fetchAwardDetail(id: number | string): Promise<AwardDetail> {
  const res = await http<{ code: number; data: AwardDetail }>(`/award/${id}`)
  return res.data
}

