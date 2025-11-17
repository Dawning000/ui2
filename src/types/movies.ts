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
  rating?: number; // 10分制评分
  tags?: string[]; // 标签数组
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
  isLiked?: boolean; // 当前用户是否已点赞
  isFavorited?: boolean; // 当前用户是否已收藏
}

// 短评用户信息
export interface MovieReviewUser {
  id: number;
  username: string;
  avatar?: string;
  nickname?: string;
}

// 电影短评
export interface MovieReview {
  id: number;
  userId: number;
  user: MovieReviewUser;
  score: number; // 1-10分
  comment: string; // 评论内容
  createdAt: string; // 创建时间
  createTime?: string; // 兼容后端可能的字段名
}

// 短评列表响应
export interface MovieReviewsResponse {
  reviews: MovieReview[];
  total: number;
  page?: number;
  size?: number;
}



