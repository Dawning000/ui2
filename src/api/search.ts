import type { SearchQueryParams, SearchResponse, SuggestItem } from '@/types/search'
import { http } from '@/api/http'

const API_BASE = '/api'

function buildQuery(params: Record<string, unknown>): string {
  const searchParams = new URLSearchParams()

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') return
    if (Array.isArray(value)) {
      if (value.length > 0) searchParams.set(key, value.join(','))
    } else {
      searchParams.set(key, String(value))
    }
  })

  return searchParams.toString()
}

export async function search(params: SearchQueryParams, signal?: AbortSignal): Promise<SearchResponse> {
  const query = buildQuery({
    q: params.q,
    genres: params.genres,
    regions: params.regions,
    year_gte: params.yearGte,
    year_lte: params.yearLte,
    rating_gte: params.ratingGte,
    rating_lte: params.ratingLte,
    sort: params.sort,
    page: params.page,
    page_size: params.pageSize
  })

  return http<SearchResponse>(`/search?${query}`, { signal })
}

export async function suggest(q: string, signal?: AbortSignal): Promise<SuggestItem[]> {
  const query = new URLSearchParams({ q })
  return http<SuggestItem[]>(`/suggest?${query.toString()}`, { signal })
}


