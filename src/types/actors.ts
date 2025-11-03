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
  moviesCount?: number;
  tvShowsCount?: number;
  movies?: ActorWorkItem[];
  tvShows?: ActorWorkItem[];
  varietyShows?: ActorWorkItem[];
  awards?: AwardItem[];
}

// 奖项保存模型
export interface ActorAward {
  id: number;
  year: number;
  status: 'nominated' | 'awarded';
  note: string;
}

// 保存演员数据模型
export interface ActorSaveData {
  id?: number; // 只在修改时添加此字段
  name: string;
  avatar: string;
  birthday: string; // yyyy-MM-dd
  nationality: string;
  gender: string;
  biography: string;
  awards: ActorAward[];
}

