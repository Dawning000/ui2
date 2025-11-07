export interface VarietyPerson {
  id: number;
  name: string;
  avatar?: string;
  birthday?: string;
  nationality?: string;
  gender?: string;
  biography?: string;
}

export interface VarietyItem {
  id: number;
  title: string;
  originalTitle?: string;
  year?: number;
  ratings?: number[];
  poster?: string;
  summary?: string;
  duration?: number;
  director?: VarietyPerson;
  country?: string;
  language?: string;
  trailer?: string;
  photos?: string[];
  views?: number;
}

export interface VarietiesListQuery {
  page?: number;
  size?: number;
  keyword?: string; // 搜索关键词
  genre?: string;
  tag?: string; // 标签（与genre功能类似，但参数名不同）
  year?: number;
  rating?: number;
  actor?: string;
  award?: string;
  country?: string; // 国家/地区筛选
  language?: string; // 语言筛选
}

export interface VarietiesListResponse {
  varieties: VarietyItem[];
  total: number;
  page: number;
  size: number;
  hasMore?: boolean;
}

export interface VarietyAward {
  id: number;
  name: string;
  year?: number;
  category?: string;
}

export interface VarietyDetail {
  id: number;
  title: string;
  originalTitle?: string;
  year: number;
  tags: string[];
  director: VarietyPerson;
  actors: VarietyPerson[]; // 最多4个
  rating: number; // 10分制，评分少时显示-1
  poster: string;
  summary: string;
  awards: VarietyAward[]; // 最多5个
  duration: number; // 分钟
  country: string;
  language: string;
  trailer?: string;
  photos: string[];
  views: number;
  likes: number;
  isLiked?: boolean; // 当前用户是否已点赞
  isFavorited?: boolean; // 当前用户是否已收藏
}