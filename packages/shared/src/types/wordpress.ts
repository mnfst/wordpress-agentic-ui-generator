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
  date: string;
  slug: string;
  link: string;
  featuredImageUrl: string | null;
}

/**
 * Post Detail DTO
 * Complete post representation for detail views
 */
export interface PostDetail {
  id: number;
  title: string;
  content: string;
  excerpt: string;
  date: string;
  modified: string;
  slug: string;
  link: string;
  author: { id: number; name: string } | null;
  featuredImage: { url: string; alt: string } | null;
  categories: Array<{ id: number; name: string }>;
  tags: Array<{ id: number; name: string }>;
}

/**
 * List Posts Request Parameters
 */
export interface ListPostsParams {
  page?: number | undefined;
  perPage?: number | undefined;
  search?: string | undefined;
  categories?: number[] | undefined;
  tags?: number[] | undefined;
}

/**
 * Pagination Info
 */
export interface PaginationInfo {
  page: number;
  perPage: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

/**
 * List Posts Response
 */
export interface ListPostsResponse {
  items: PostListItem[];
  pagination: PaginationInfo;
}

/**
 * Post Detail Response
 */
export interface PostDetailResponse {
  post: PostDetail;
}
