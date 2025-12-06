/**
 * WordPress Post Interface
 * Represents a post fetched from WordPress REST API
 */
export interface WordPressPost {
  id: number;
  title: string;
  content: string;
  excerpt: string;
  slug: string;
  status: string;
  authorId: number;
  authorName: string;
  featuredMediaId: number | null;
  featuredImageUrl: string | null;
  categories: number[];
  tags: number[];
  publishedAt: Date;
  modifiedAt: Date;
  link: string;
}

/**
 * Post List Item DTO
 * Simplified post representation for list views
 */
export interface PostListItem {
  id: number;
  title: string;
  excerpt: string;
  authorName: string;
  publishedAt: string;
  featuredImageUrl: string | null;
  link: string;
}

/**
 * Post Detail DTO
 * Complete post representation for detail views
 */
export interface PostDetail {
  id: number;
  title: string;
  content: string;
  authorName: string;
  publishedAt: string;
  modifiedAt: string;
  featuredImageUrl: string | null;
  categories: string[];
  tags: string[];
  link: string;
}

/**
 * List Posts Request Parameters
 */
export interface ListPostsParams {
  page?: number;
  perPage?: number;
  search?: string;
  categories?: number[];
  tags?: number[];
}

/**
 * List Posts Response
 */
export interface ListPostsResponse {
  posts: PostListItem[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalPosts: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

/**
 * Post Detail Response
 */
export interface PostDetailResponse {
  post: PostDetail;
}
