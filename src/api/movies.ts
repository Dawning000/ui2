import { http } from '@/api/http'
import type { MoviesListQuery, MoviesListResponse } from '@/types/movies'

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
    genre: params.genre,
    year: params.year,
    rating: params.rating,
    actor: params.actor,
    award: params.award
  })
  return http<MoviesListResponse>(`/movies${query ? `?${query}` : ''}`, { signal })
}




