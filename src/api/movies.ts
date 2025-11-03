import { http, jsonBody } from '@/api/http'
import type { MoviesListQuery, MoviesListResponse, MovieDetail } from '@/types/movies'

function buildQuery(params: Record<string, unknown>): string {
  const s = new URLSearchParams()
  Object.entries(params).forEach(([k, v]) => {
    if (v === undefined || v === null || v === '') return
    s.set(k, String(v))
  })
  return s.toString()
}

export async function fetchMovies(params: MoviesListQuery = {}, signal?: AbortSignal): Promise<MoviesListResponse> {
  const query = buildQuery({
    page: params.page,
    size: params.size,
    tag: params.genre, // 后端参数名是tag
    year: params.year,
    rating: params.rating,
    actor: params.actor,
    award: params.award
  })
  // 后端接口: GET /api/movies
  const res = await http<{ code: number; data: any }>(`/movies${query ? `?${query}` : ''}`, { signal })
  const data = res.data
  // 转换后端格式到前端格式
  return {
    movies: data.movies || [],
    total: data.pagination?.total || 0,
    page: data.pagination?.page || params.page || 1,
    size: data.pagination?.size || params.size || 10
  }
}

// 获取电影列表 - 使用 /api/movies/list 接口
export async function fetchMoviesList(params: MoviesListQuery = {}, signal?: AbortSignal): Promise<MoviesListResponse> {
  const query = buildQuery({
    page: params.page,
    size: params.size,
    tag: params.genre,
    year: params.year,
    rating: params.rating,
    actor: params.actor,
    award: params.award
  })
  // 后端接口: GET /api/movies/list
  const res = await http<{ code: number; data: any }>(`/movies/list${query ? `?${query}` : ''}`, { signal })
  const data = res.data
  // 转换后端格式到前端格式
  return {
    movies: data.movies || [],
    total: data.pagination?.total || 0,
    page: data.pagination?.page || params.page || 1,
    size: data.pagination?.size || params.size || 10,
    hasMore: data.pagination?.has_next || false
  }
}

export interface MovieSaveData {
  id?: number; // 有id则修改，无id则添加
  title: string;
  original_title?: string;
  year: number;
  tags: string[];
  director: number; // 导演ID
  actors: number[]; // 演员ID数组
  poster: string;
  summary: string;
  awards?: number[]; // 奖项ID数组（可选）
  duration: number; // 单位：分钟
  country: string;
  language: string;
  trailer?: string;
  photos: string[];
}

export async function saveMovie(movieData: MovieSaveData, signal?: AbortSignal): Promise<{ id: number }> {

  const res = await http<{ code: number; data: { id: number } }>('/movies/add', {
    method: 'POST',
    body: jsonBody(movieData),
    signal
  })
  return res.data
}

// 获取电影详情
export async function fetchMovieDetail(id: number | string, signal?: AbortSignal): Promise<MovieDetail> {
  const res = await http<{ code: number; data: any }>(`/movies/${id}`, { signal })
  const data = res.data
  // 数据已经符合前端类型，直接返回
  return data
}




