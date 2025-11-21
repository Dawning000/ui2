import { http, jsonBody } from './http';

/**
 * 获取随机帖子列表
 * @param count 要获取的帖子数量
 * @returns 随机帖子列表
 */
export const fetchRandomPosts = async (count: number = 3): Promise<{posts: any[]}> => {
  return await http<{posts: any[]}>(`/posts/random?count=${count}`);
};

// 评论类型定义
export interface Comment {
  id: number;
  content: string;
  author: {
    id: number;
    username: string;
    nickname?: string;
    avatar: string;
  };
  createTime: string;
  votes: number;
  userVote?: string | null;
  replies?: Comment[];
  canEdit?: boolean; // 是否可以编辑（根据作者ID判断）
  canDelete?: boolean; // 是否可以删除（根据作者ID判断）
  createdAt?: string; // 转换后的时间字段
}

// 帖子类型定义
export interface Post {
  id: number;
  title: string;
  content: string;
  excerpt?: string;
  author: {
    id: number;
    username: string;
    nickname?: string;
    avatar: string;
  };
  category: string;
  createTime: string;
  updateTime?: string;
  views: number;
  likes: number;
  commentsCount: number;
  isLiked: boolean;
  tags: string[];
}

// 创建帖子请求参数类型
export interface CreatePostParams {
  title: string;
  content: string;
  category: string;
  tags: string[];
}

// 帖子列表响应类型
export interface PostListResponse {
  code: number;
  message: string;
  data: {
    posts: Post[];
    pagination: {
      total: number;
      page: number;
      size: number;
      has_next: boolean;
    };
  };
}

// 帖子详情响应类型
export interface PostDetailResponse {
  code: number;
  data: Post;
}

// 创建帖子响应类型
export interface CreatePostResponse {
  code: number;
  message: string;
  data: {
    id: number;
    title: string;
    content: string;
    createTime: string;
  };
}

// 创建评论请求参数类型
export interface CreateCommentParams {
  content: string;
  postId: number;
  parentId?: number;
}

// 创建评论响应类型
export interface CreateCommentResponse {
  code: number;
  message: string;
  data: Comment;
}

// 帖子权限响应类型
export interface PostPermissionResponse {
  code: number;
  message: string;
  data: {
    canEdit: boolean;
    canDelete: boolean;
  };
}

/**
 * 帖子相关API服务
 */
export const postApi = {
  /**
   * 获取帖子列表
   * @param page 页码
   * @param size 每页数量
   * @param category 分类
   * @param keyword 搜索关键词
   * @returns 帖子列表
   */
  getPosts: async (page = 1, size = 10, category?: string, keyword?: string): Promise<PostListResponse> => {
    const searchParams = new URLSearchParams();
    searchParams.append('page', page.toString());
    searchParams.append('size', size.toString());
    if (category) searchParams.append('category', category);
    if (keyword) searchParams.append('keyword', keyword);
    
    return await http<PostListResponse>(`/posts/list?${searchParams.toString()}`);
  },

  /**
   * 获取帖子详情
   * @param id 帖子ID
   * @returns 帖子详情
   */
  getPostDetail: async (id: number): Promise<PostDetailResponse> => {
    return await http<PostDetailResponse>(`/posts/${id}`);
  },

  /**
   * 创建帖子
   * @param postData 帖子数据
   * @returns 创建结果
   */
  createPost: async (postData: CreatePostParams): Promise<CreatePostResponse> => {
    return await http<CreatePostResponse>('/posts/create', {
      method: 'POST',
      body: jsonBody(postData)
    });
  },

  /**
   * 编辑帖子
   * @param id 帖子ID
   * @param postData 帖子数据
   * @returns 编辑结果
   */
  updatePost: async (id: number, postData: CreatePostParams): Promise<CreatePostResponse> => {
    return await http<CreatePostResponse>(`/posts/${id}/edit`, {
      method: 'POST',
      body: jsonBody(postData)
    });
  },

  /**
   * 删除帖子
   * @param id 帖子ID
   * @returns 删除结果
   */
  deletePost: async (id: number): Promise<{ code: number; message: string }> => {
    return await http<{ code: number; message: string }>(`/posts/${id}/delete`, {
      method: 'POST'
    });
  },

  /**
   * 点赞帖子
   * @param id 帖子ID
   * @returns 点赞结果
   */
  likePost: async (id: number): Promise<{ code: number; message: string }> => {
    return await http<{ code: number; message: string }>(`/posts/${id}/like`, {
      method: 'POST',
      body: jsonBody({ action: 'like' })
    });
  },

  /**
   * 取消点赞帖子
   * @param id 帖子ID
   * @returns 取消点赞结果
   */
  unlikePost: async (id: number): Promise<{ code: number; message: string }> => {
    return await http<{ code: number; message: string }>(`/posts/${id}/unlike`, {
      method: 'POST'
    });
  },
  
  /**
   * 获取帖子评论列表
   * @param id 帖子ID
   * @returns 评论列表
   */
  getComments: async (id: number): Promise<{ 
    code: number; 
    message: string; 
    data: {
      comments: Comment[];
      total: number;
      page: number;
      size: number;
    }
  }> => {
    return await http<{ 
      code: number; 
      message: string; 
      data: {
        comments: Comment[];
        total: number;
        page: number;
        size: number;
      }
    }>(`/posts/${id}/comments`);
  },

  /**
   * 创建评论
   * @param commentData 评论数据，包含content、postId，可选parentId（回复评论时需要）
   * @returns 创建结果
   */
  createComment: async (commentData: CreateCommentParams): Promise<CreateCommentResponse> => {
    return await http<CreateCommentResponse>('/comments/create', {
      method: 'POST',
      body: jsonBody(commentData)
    });
  },
  
  /**
   * 更新评论
   * @param commentData 更新数据，包含id和content
   * @returns 更新结果
   */
  updateComment: async (commentData: {id: number; content: string}): Promise<{code: number; message: string}> => {
    const { id, ...data } = commentData;
    return await http<{code: number; message: string}>(`/comments/${id}/edit`, {
      method: 'POST',
      body: jsonBody(data)
    });
  },
  
  /**
   * 删除评论
   * @param commentId 评论ID
   * @returns 删除结果
   */
  deleteComment: async (commentId: number): Promise<{code: number; message: string}> => {
    console.log('调用deleteComment API，评论ID:', commentId);
    try {
      // 注意：根据产品文档，删除操作应该使用DELETE方法而不是POST
      const response = await http<{code: number; message: string}>(`/comments/${commentId}/delete`, {
        method: 'POST'
      });
      console.log('deleteComment API响应:', response);
      return response;
    } catch (error) {
      console.error('deleteComment API调用失败:', error);
      throw error;
    }
  },

  /**
   * 获取用户的发帖列表
   * @param userId 用户ID
   * @param page 页码
   * @param size 每页数量
   * @returns 用户发帖列表及分页信息
   */
  getUserPosts: async (userId: number, page = 1, size = 10): Promise<PostListResponse> => {
    const searchParams = new URLSearchParams();
    searchParams.append('page', page.toString());
    searchParams.append('size', size.toString());
    
    return await http<PostListResponse>(`/user/${userId}/posts?${searchParams.toString()}`);
  },

  /**
   * 获取帖子权限
   * @param id 帖子ID
   * @returns 帖子权限信息（是否能编辑、删除）
   */
  getPostPermission: async (id: number): Promise<PostPermissionResponse> => {
    return await http<PostPermissionResponse>(`/posts/${id}/permission`);
  }
};

/**
 * 根据分类获取分类名称
 * @param category 分类标识
 * @returns 分类名称
 */
export const getCategoryName = (category: string): string => {
  const categoryMap: {[key: string]: string} = {
    'movie': '电影',
    'tv': '电视剧',
    'variety': '综艺',
    'anime': '动漫'
  };
  return categoryMap[category] || category;
};

/**
 * 从内容中提取摘要
 * @param content 完整内容
 * @param maxLength 摘要最大长度
 * @returns 提取的摘要
 */
export const extractExcerpt = (content: string, maxLength: number = 100): string => {
  if (!content) return '';
  // 移除HTML标签
  const plainText = content.replace(/<[^>]*>/g, '');
  return plainText.length > maxLength ? plainText.substring(0, maxLength) + '...' : plainText;
};