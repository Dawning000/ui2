import { http, jsonBody } from '@/api/http'

// 电视剧演员接口
export interface TvShowActor {
  id: number; // 演员ID（必需）
  role: string; // 演员表演角色（必需）
  description: string; // 描述（必需）
}

// 电视剧奖项接口
export interface TvShowAward {
  id: number; // 奖项ID（必需）
  year: number; // 获奖年份（必需）
  status: string; // 获奖状态（必需，nominate或awarded）
  note: string; // 备注（必需）
}

// 电视剧季度接口
export interface TvShowSeason {
  id: number; // 季度ID（必需）
  number: string; // 第几季（必需）
}

// 电视剧保存数据接口
export interface TvShowSaveData {
  id?: number; // 有id则修改，无id则添加
  title: string;
  original_title?: string;
  year: number;
  tags: string[];
  director: number; // 导演ID
  actors: TvShowActor[]; // 演员列表，每个包含id、role、description
  poster: string;
  summary: string;
  awards: TvShowAward[]; // 奖项列表，每个包含id、year、status、note
  seasons: TvShowSeason[]; // 季度列表，每个包含id、number
  episodes: number;
  country: string;
  language: string;
  trailer: string;
  photos: string[];
}

// 保存电视剧 - 确保导演和演员正确关联到实际的演员和导演
export async function saveTvShow(tvShowData: TvShowSaveData, signal?: AbortSignal): Promise<{ id: number }> {
  // 确保数据格式正确，特别是演员列表中的id、role和description字段
  const processedData = {
    ...tvShowData,
    // 确保导演ID是数字类型
    director: Number(tvShowData.director),
    // 确保演员列表中的每个演员都有正确的格式
    actors: tvShowData.actors.map(actor => ({
      id: Number(actor.id),
      role: actor.role.trim(),
      description: actor.description.trim()
    }))
  }
  
  const res = await http<{ code: number; data: { id: number } }>('/tvshows/add', {
    method: 'POST',
    body: jsonBody(processedData),
    signal
  })
  return res.data
}

// 获取电视剧详情
export async function fetchTvShowDetail(id: number | string, signal?: AbortSignal): Promise<any> {
  const res = await http<{ code: number; data: any }>(`/tvshows/${id}`, { signal })
  const data = res.data.data || res.data
  // 确保返回的数据包含isLiked和isFavorited字段
  return {
    ...data,
    isLiked: data.isLiked || false,
    isFavorited: data.isFavorited || false
  }
}

// 删除电视剧
export async function deleteTvShow(id: number | string, signal?: AbortSignal): Promise<void> {
  await http(`/tvshows/${id}/delete`, {
    method: 'POST',
    signal
  })
}

// 获取电视剧列表
export async function fetchTvShowsList(params: {
  page?: number;
  size?: number;
  tag?: string;
  year?: number;
  rating?: number;
  actor?: string;
  award?: string;
}, signal?: AbortSignal): Promise<{
  tvshows: any[];
  total: number;
  page: number;
  size: number;
  hasMore: boolean;
}> {
  const searchParams = new URLSearchParams();
  
  // 添加查询参数
  if (params.page) searchParams.set('page', String(params.page));
  if (params.size) searchParams.set('size', String(params.size));
  if (params.tag) searchParams.set('tag', params.tag);
  if (params.year) searchParams.set('year', String(params.year));
  if (params.rating) searchParams.set('rating', String(params.rating));
  if (params.actor) searchParams.set('actor', params.actor);
  if (params.award) searchParams.set('award', params.award);
  
  const queryString = searchParams.toString();
  const url = `/tvshows/list${queryString ? `?${queryString}` : ''}`;
  
  const res = await http<{ code: number; data: any }>(url, { signal });
  const data = res.data;
  
  // 返回处理后的数据
  return {
    tvshows: data.tvshows || [],
    total: data.pagination?.total || data.total || 0,
    page: data.pagination?.page || data.page || params.page || 1,
    size: data.pagination?.size || data.pageSize || params.size || 24,
    hasMore: data.pagination?.has_next || false
  };
}