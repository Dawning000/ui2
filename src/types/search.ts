export interface SearchQueryParams {
  q?: string;
  type?: 'movie' | 'tv' | 'anime' | 'variety';
  genres?: string[];
  regions?: string[];
  languages?: string[];
  country?: string; // 国家（单个值）
  language?: string; // 语言（单个值）
  year?: number; // 年份（等于）
  yearGte?: number;
  yearLte?: number;
  ratingGte?: number;
  ratingLte?: number;
  tag?: string; // 标签筛选
  actor?: string; // 演员筛选（只要名字）
  award?: string; // 奖项筛选（只要名字）
  sort?: 'relevance_desc' | 'hot_desc' | 'rating_desc' | 'year_desc' | 'updated_desc';
  page?: number;
  pageSize?: number;
}

export interface SearchItem {
  id: number | string;
  title: string;
  year?: number;
  rating?: number;
  regions?: string[];
  genres?: string[];
  poster?: string;
  highlight?: Record<string, string>;
}

export interface FacetBucket {
  value: string;
  count: number;
}

export interface SearchFacets {
  genres?: FacetBucket[];
  regions?: FacetBucket[];
  languages?: FacetBucket[];
  yearRanges?: FacetBucket[];
  ratingRanges?: FacetBucket[];
}

export interface SearchResponse {
  items: SearchItem[];
  facets?: SearchFacets;
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
  suggestions?: string[];
}

export type SuggestItemType = 'movie' | 'tv' | 'anime' | 'person' | 'tag' | 'list';

export interface SuggestItem {
  type: SuggestItemType;
  text: string;
  id?: number | string;
}

