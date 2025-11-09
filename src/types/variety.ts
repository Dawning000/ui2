// 综艺详情接口
export interface VarietyShowDetail {
  id: number;
  title: string;
  originalTitle?: string;
  year: number;
  tags: string[];
  host: string;
  guests: string[];
  poster: string;
  summary: string;
  awards: string[];
  episodes: number;
  country: string;
  language: string;
  trailer?: string;
  photos: string[];
  rating: number;
  views: number;
  likes: number;
  isLiked: boolean;
  isFavorited: boolean;
}

// 综艺评分数据接口（前端表单使用）
export interface VarietyShowRateData {
  score: number;
  comment: string;
}

// 综艺评分API数据接口（与后端交互使用）
export interface VarietyShowApiRateData {
  userId: number;
  varietyShowId: number;
  rating: number;
}