export interface ActorListQuery {
  page?: number;
  size?: number;
  keyword?: string;
  nationality?: string;
  gender?: '男' | '女' | '其他';
}

export interface ActorListItem {
  id: number;
  name: string;
  avatar?: string;
  birthDate?: string;
  nationality?: string;
  gender?: '男' | '女' | '其他';
  moviesCount?: number;
  tvShowsCount?: number;
  awards?: string[];
}

export interface ActorListResponse {
  actors: ActorListItem[];
  total: number;
  page: number;
  size: number;
}

export interface ActorWorkItem {
  id: number;
  title: string;
  year?: number;
  role?: string;
  poster?: string;
}

export interface AwardItem {
  id: number;
  name: string;
  year?: number;
  movie?: string;
}

export interface ActorDetail {
  id: number;
  name: string;
  avatar?: string;
  birthDate?: string;
  nationality?: string;
  gender?: '男' | '女' | '其他';
  biography?: string;
  movies?: ActorWorkItem[];
  tvShows?: ActorWorkItem[];
  awards?: AwardItem[];
}

