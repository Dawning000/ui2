// 综艺详情接口
export interface VarietyShowDetail {
  id: number;
  title: string;
  originalTitle?: string;
  year: number;
  tags: string[];
  host: string; // 主持人姓名（用于显示）
  hostId?: number; // 主持人ID（用于编辑）
  guests: Array<{
    id: number;
    role: string;
    description: string;
  } | string>; // 兼容旧格式
  poster: string;
  summary: string;
  awards: Array<{
    id: number;
    year: number;
    status: 'nominated' | 'awarded';
    note: string;
  } | string>; // 兼容旧格式
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

// 综艺评分数据接口
export interface VarietyShowRateData {
  score: number; // 1-10整数
  comment: string; // 最大长度1000字
}