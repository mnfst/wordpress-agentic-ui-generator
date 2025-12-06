/**
 * WordPress REST API response types
 * These types match the WordPress REST API v2 response structure
 */

export interface WpRenderedContent {
  rendered: string;
  protected?: boolean;
}

export interface WpApiPost {
  id: number;
  date: string;
  date_gmt: string;
  modified: string;
  modified_gmt: string;
  slug: string;
  status: string;
  type: string;
  link: string;
  title: WpRenderedContent;
  content: WpRenderedContent;
  excerpt: WpRenderedContent;
  author: number;
  featured_media: number;
  categories: number[];
  tags: number[];
}

export interface WpApiAuthor {
  id: number;
  name: string;
  slug: string;
  description: string;
  link: string;
  avatar_urls: Record<string, string>;
}

export interface WpApiMedia {
  id: number;
  date: string;
  slug: string;
  type: string;
  link: string;
  title: WpRenderedContent;
  source_url: string;
  media_details: {
    width: number;
    height: number;
    sizes?: Record<string, { source_url: string; width: number; height: number }>;
  };
}

export interface WpApiCategory {
  id: number;
  name: string;
  slug: string;
  description: string;
  parent: number;
  count: number;
}

export interface WpApiTag {
  id: number;
  name: string;
  slug: string;
  description: string;
  count: number;
}

export interface WpSiteInfo {
  name: string;
  description: string;
  url: string;
  home: string;
  gmt_offset: number;
  timezone_string: string;
}

export interface WpApiError {
  code: string;
  message: string;
  data?: {
    status: number;
  };
}

export interface WordPressValidationResult {
  isValid: boolean;
  siteName: string | null;
  siteDescription: string | null;
  postsCount: number | null;
  errorMessage: string | null;
}
