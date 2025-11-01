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
}



