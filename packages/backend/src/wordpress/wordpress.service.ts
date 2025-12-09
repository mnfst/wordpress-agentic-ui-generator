import { Injectable, Logger } from '@nestjs/common';
import type { PostListItem, PostDetail, ListPostsParams, ListPostsResponse } from '@wordpress-mcp/shared';
import {
  WpApiPost,
  WpApiAuthor,
  WpApiMedia,
  WpApiCategory,
  WpApiTag,
  WpSiteInfo,
  WordPressValidationResult,
} from './wordpress.types';

@Injectable()
export class WordpressService {
  private readonly logger = new Logger(WordpressService.name);

  /**
   * Normalizes a WordPress URL to ensure it ends without trailing slash
   */
  normalizeUrl(url: string): string {
    let normalized = url.trim();
    if (!normalized.startsWith('http://') && !normalized.startsWith('https://')) {
      normalized = `https://${normalized}`;
    }
    return normalized.replace(/\/+$/, '');
  }

  /**
   * Constructs the WordPress REST API base URL
   */
  getApiBaseUrl(wordpressUrl: string): string {
    const normalized = this.normalizeUrl(wordpressUrl);
    return `${normalized}/wp-json/wp/v2`;
  }

  /**
   * Validates a WordPress URL by probing the REST API
   */
  async validateWordPressUrl(url: string): Promise<WordPressValidationResult> {
    const normalized = this.normalizeUrl(url);

    try {
      const siteInfo = await this.fetchSiteInfo(normalized);
      const postsCount = await this.countPosts(normalized);

      return {
        isValid: true,
        siteName: siteInfo.name,
        siteDescription: siteInfo.description,
        postsCount,
        errorMessage: null,
      };
    } catch (error) {
      this.logger.warn(`Failed to validate WordPress URL: ${url}`, error);

      return {
        isValid: false,
        siteName: null,
        siteDescription: null,
        postsCount: null,
        errorMessage: this.getErrorMessage(error),
      };
    }
  }

  /**
   * Fetches site information from WordPress REST API
   */
  private async fetchSiteInfo(normalizedUrl: string): Promise<WpSiteInfo> {
    const response = await fetch(`${normalizedUrl}/wp-json`, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch site info: ${response.status} ${response.statusText}`);
    }

    const data = (await response.json()) as Record<string, unknown>;
    return {
      name: (data.name as string) || 'Unknown Site',
      description: (data.description as string) || '',
      url: (data.url as string) || normalizedUrl,
      home: (data.home as string) || normalizedUrl,
      gmt_offset: (data.gmt_offset as number) || 0,
      timezone_string: (data.timezone_string as string) || 'UTC',
    };
  }

  /**
   * Counts total posts available via WordPress REST API
   */
  private async countPosts(normalizedUrl: string): Promise<number> {
    const apiBase = `${normalizedUrl}/wp-json/wp/v2`;

    const response = await fetch(`${apiBase}/posts?per_page=1`, {
      method: 'HEAD',
      headers: {
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      this.logger.warn(`Failed to count posts: ${response.status}`);
      return 0;
    }

    const totalHeader = response.headers.get('X-WP-Total');
    return totalHeader ? parseInt(totalHeader, 10) : 0;
  }

  /**
   * Extracts a user-friendly error message from various error types
   */
  private getErrorMessage(error: unknown): string {
    if (error instanceof Error) {
      if (error.message.includes('fetch')) {
        return 'Unable to connect to the WordPress site. Please check the URL and try again.';
      }
      return error.message;
    }
    return 'An unexpected error occurred while validating the WordPress URL.';
  }

  /**
   * Fetches posts from WordPress REST API with search and filter support
   * Filter logic: OR within same taxonomy type, AND across different types
   */
  async fetchPosts(wordpressUrl: string, params: ListPostsParams): Promise<ListPostsResponse> {
    const apiBase = this.getApiBaseUrl(wordpressUrl);
    const queryParams = new URLSearchParams();

    queryParams.set('page', String(params.page || 1));
    queryParams.set('per_page', String(params.perPage || 10));

    if (params.search) {
      queryParams.set('search', params.search);
    }

    if (params.categories && params.categories.length > 0) {
      queryParams.set('categories', params.categories.join(','));
    }

    if (params.tags && params.tags.length > 0) {
      queryParams.set('tags', params.tags.join(','));
    }

    // Use _embed to get featured media in the same request
    queryParams.set('_embed', 'wp:featuredmedia');

    const response = await fetch(`${apiBase}/posts?${queryParams.toString()}`, {
      headers: { Accept: 'application/json' },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch posts: ${response.status} ${response.statusText}`);
    }

    const posts = (await response.json()) as WpApiPost[];
    const totalPosts = parseInt(response.headers.get('X-WP-Total') || '0', 10);
    const totalPages = parseInt(response.headers.get('X-WP-TotalPages') || '1', 10);
    const currentPage = params.page || 1;

    const items: PostListItem[] = posts.map((post) => this.mapToPostListItem(post));

    return {
      items,
      pagination: {
        page: currentPage,
        perPage: params.perPage || 10,
        total: totalPosts,
        totalPages,
        hasNextPage: currentPage < totalPages,
        hasPreviousPage: currentPage > 1,
      },
    };
  }

  /**
   * Fetches a single post by ID with full content
   */
  async fetchPostById(wordpressUrl: string, postId: number): Promise<PostDetail> {
    const apiBase = this.getApiBaseUrl(wordpressUrl);

    const response = await fetch(`${apiBase}/posts/${postId}`, {
      headers: { Accept: 'application/json' },
    });

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error(`Post with ID ${postId} not found`);
      }
      throw new Error(`Failed to fetch post: ${response.status} ${response.statusText}`);
    }

    const post = (await response.json()) as WpApiPost;

    const [author, featuredMedia, categories, tags] = await Promise.all([
      this.fetchAuthor(apiBase, post.author),
      post.featured_media ? this.fetchMedia(apiBase, post.featured_media) : null,
      this.fetchCategories(apiBase, post.categories),
      this.fetchTags(apiBase, post.tags),
    ]);

    return {
      id: post.id,
      title: this.stripHtml(post.title.rendered),
      content: post.content.rendered,
      excerpt: this.stripHtml(post.excerpt.rendered),
      date: post.date,
      modified: post.modified,
      slug: post.slug,
      link: post.link,
      author: author ? { id: author.id, name: author.name } : null,
      featuredImage: featuredMedia
        ? { url: featuredMedia.source_url, alt: this.stripHtml(featuredMedia.title.rendered) }
        : null,
      categories: categories.map((c) => ({ id: c.id, name: c.name })),
      tags: tags.map((t) => ({ id: t.id, name: t.name })),
    };
  }

  /**
   * Fetches author information
   */
  async fetchAuthor(apiBase: string, authorId: number): Promise<WpApiAuthor | null> {
    try {
      const response = await fetch(`${apiBase}/users/${authorId}`, {
        headers: { Accept: 'application/json' },
      });

      if (!response.ok) return null;
      return (await response.json()) as WpApiAuthor;
    } catch {
      return null;
    }
  }

  /**
   * Fetches media (featured image) information
   */
  async fetchMedia(apiBase: string, mediaId: number): Promise<WpApiMedia | null> {
    try {
      const response = await fetch(`${apiBase}/media/${mediaId}`, {
        headers: { Accept: 'application/json' },
      });

      if (!response.ok) return null;
      return (await response.json()) as WpApiMedia;
    } catch {
      return null;
    }
  }

  /**
   * Fetches categories by IDs
   */
  private async fetchCategories(apiBase: string, categoryIds: number[]): Promise<WpApiCategory[]> {
    if (!categoryIds || categoryIds.length === 0) return [];

    try {
      const response = await fetch(`${apiBase}/categories?include=${categoryIds.join(',')}`, {
        headers: { Accept: 'application/json' },
      });

      if (!response.ok) return [];
      return (await response.json()) as WpApiCategory[];
    } catch {
      return [];
    }
  }

  /**
   * Fetches tags by IDs
   */
  private async fetchTags(apiBase: string, tagIds: number[]): Promise<WpApiTag[]> {
    if (!tagIds || tagIds.length === 0) return [];

    try {
      const response = await fetch(`${apiBase}/tags?include=${tagIds.join(',')}`, {
        headers: { Accept: 'application/json' },
      });

      if (!response.ok) return [];
      return (await response.json()) as WpApiTag[];
    } catch {
      return [];
    }
  }

  /**
   * Maps WordPress API post to PostListItem
   */
  private mapToPostListItem(post: WpApiPost): PostListItem {
    // Extract featured image URL from embedded data
    const featuredMedia = post._embedded?.['wp:featuredmedia']?.[0];
    const featuredImageUrl = featuredMedia?.source_url ?? null;

    return {
      id: post.id,
      title: this.stripHtml(post.title.rendered),
      excerpt: this.stripHtml(post.excerpt.rendered),
      date: post.date,
      slug: post.slug,
      link: post.link,
      featuredImageUrl,
    };
  }

  /**
   * Strips HTML tags from a string
   */
  private stripHtml(html: string): string {
    return html
      .replace(/<[^>]*>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#039;/g, "'")
      .trim();
  }
}
