export interface MoviePerson {
  id: number;
  name: string;
  avatar?: string;
  birthday?: string;
  nationality?: string;
  gender?: string;
  biography?: string;
}

export interface MovieItem {
  id: number;
  title: string;
  originalTitle?: string;
  year?: number;
  ratings?: number[];
  poster?: string;
  summary?: string;
  duration?: number;
  director?: MoviePerson;
  country?: string;
  language?: string;
  trailer?: string;
  photos?: string[];
  views?: number;
}

export interface MoviesListQuery {
  page?: number;
  size?: number;
  genre?: string;
  year?: number;
  rating?: number;
  actor?: string;
  award?: string;
}

export interface MoviesListResponse {
  movies: MovieItem[];
  total: number;
  page: number;
  size: number;
  hasMore?: boolean;
}

export interface MovieAward {
  id: number;
  name: string;
  year?: number;
  category?: string;
}

export interface MovieDetail {
  id: number;
  title: string;
  originalTitle?: string;
  year: number;
  tags: string[];
  director: MoviePerson;
  actors: MoviePerson[]; // 最多4个
  rating: number; // 10分制，评分少时显示-1
  poster: string;
  summary: string;
  awards: MovieAward[]; // 最多5个
  duration: number; // 分钟
  country: string;
  language: string;
  trailer?: string;
  photos: string[];
  views: number;
  likes: number;
}



