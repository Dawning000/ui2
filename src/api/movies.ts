import { http, jsonBody } from '@/api/http'
import type { MoviesListQuery, MoviesListResponse, MovieDetail, MovieReviewsResponse } from '@/types/movies'

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
    tag: params.tag || params.genre,
    year: params.year,
    rating: params.rating,
    actor: params.actor,
    award: params.award
    // 注意：根据API文档，/api/movies/list 不支持 country 和 language 参数
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

export interface MovieActor {
  id: number; // 演员ID（必需）
  role: string; // 演员表演角色（必需）
  description: string; // 描述（必需）
}

export interface MovieSaveData {
  id?: number; // 有id则修改，无id则添加
  title: string;
  original_title?: string;
  year: number;
  tags: string[];
  director: number; // 导演ID
  actors: MovieActor[]; // 演员列表，每个包含id、role、description
  poster: string;
  summary: string;
  awards?: number[]; // 奖项ID数组（可选）
  duration: number; // 单位：分钟
  country: string;
  language: string;
  trailer?: string;
  photos: string[];
}

// 保存电影 - 无论新增还是修改，都使用POST /movies/add接口，body里传id就是修改
export async function saveMovie(movieData: MovieSaveData, signal?: AbortSignal): Promise<{ id: number }> {
  // 统一使用POST /movies/add接口，body里传id就是修改，不传id就是新增
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
  const data = res.data.data || res.data
  // 确保返回的数据包含isLiked和isFavorited字段
  return {
    ...data,
    isLiked: data.isLiked || false,
    isFavorited: data.isFavorited || false
  }
}

// 点赞电影
export async function likeMovie(id: number | string, signal?: AbortSignal): Promise<void> {
  await http(`/movies/${id}/like`, {
    method: 'POST',
    signal
  })
}

// 取消点赞电影
export async function unlikeMovie(id: number | string, signal?: AbortSignal): Promise<void> {
  await http(`/movies/${id}/unlike`, {
    method: 'POST',
    signal
  })
}

// 提交评分
export interface MovieRateData {
  score: number; // 1-10整数
  comment: string; // 最大长度1000字
}

export async function rateMovie(id: number | string, data: MovieRateData, signal?: AbortSignal): Promise<void> {
  await http(`/movies/${id}/rate`, {
    method: 'POST',
    body: jsonBody(data),
    signal
  })
}

// 收藏电影
export async function favoriteMovie(id: number | string, signal?: AbortSignal): Promise<void> {
  await http(`/movies/${id}/favorite`, {
    method: 'POST',
    signal
  })
}

// 取消收藏电影
export async function unfavoriteMovie(id: number | string, signal?: AbortSignal): Promise<void> {
  await http(`/movies/${id}/unfavorite`, {
    method: 'POST',
    signal
  })
}

// 搜索电影 - 使用 /api/movies/search 接口
export async function searchMovies(params: MoviesListQuery = {}, signal?: AbortSignal): Promise<MoviesListResponse> {
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
    // 注意：country 和 language 参数后端API不支持，已移除
  })
  // 后端接口: GET /api/movies/search
  const res = await http<{ code: number; data: any }>(`/movies/search${query ? `?${query}` : ''}`, { signal })
  const data = res.data
  // 转换后端格式到前端格式
  return {
    movies: data.movies || [],
    total: data.pagination?.total || 0,
    page: data.pagination?.page || params.page || 1,
    size: data.pagination?.size || params.size || 10,
    hasMore: data.pagination?.has_next !== false
  }
}

// 删除电影
export async function deleteMovie(id: number | string, signal?: AbortSignal): Promise<void> {
  await http(`/movies/${id}/delete`, {
    method: 'POST',
    signal
  })
}

// 获取热映电影（从猫眼API）
export interface TopRatedMovie {
  movieId: number
  poster: string
  score: string
  name: string
}

export interface TopRatedMoviesResponse {
  title: string
  movieList: TopRatedMovie[]
}

export async function fetchTopRatedMovies(signal?: AbortSignal): Promise<TopRatedMoviesResponse> {
  const res = await fetch('https://apis.netstart.cn/maoyan/index/topRatedMovies', {
    signal,
    headers: {
      'Content-Type': 'application/json'
    }
  })
  
  if (!res.ok) {
    throw new Error(`HTTP ${res.status}`)
  }
  
  const data = await res.json() as TopRatedMoviesResponse
  return data
}

// 获取热门电影
export async function fetchHotMovies(params: { page?: number; size?: number } = {}, signal?: AbortSignal): Promise<MoviesListResponse> {
  const query = buildQuery({
    page: params.page || 1,
    size: params.size || 10
  })
  // 后端接口: GET /api/movies/hot
  const res = await http<{ code: number; data: any }>(`/movies/hot${query ? `?${query}` : ''}`, { signal })
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

// 获取电影短评列表
export async function fetchMovieReviews(
  id: number | string, 
  params: { page?: number; size?: number } = {}, 
  signal?: AbortSignal
): Promise<MovieReviewsResponse> {
  const query = buildQuery({
    page: params.page || 1,
    size: params.size || 10
  })
  // 后端接口: GET /api/movies/{id}/reviews
  const res = await http<{ code: number; data: any }>(`/movies/${id}/reviews${query ? `?${query}` : ''}`, { signal })
  const data = res.data
  
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




