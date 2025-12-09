import { Injectable, Logger } from '@nestjs/common';
import { Tool, Context } from '@rekog/mcp-nest';
import { z } from 'zod';
import { Request } from 'express';
import { WordpressService } from '../../wordpress/wordpress.service';
import type { ListPostsParams, ListPostsResponse } from '@wordpress-mcp/shared';
import type { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import { RESOURCE_URI_META_KEY } from '@modelcontextprotocol/ext-apps';

interface McpRequest extends Request {
  wordpressUrl?: string;
}

const ListPostsParamsSchema = z.object({
  page: z
    .number()
    .int()
    .min(1)
    .default(1)
    .describe(
      'Page number for pagination, starting at 1. Use with perPage to navigate through large result sets. ' +
        'Check totalPages in the response to know how many pages are available.',
    ),
  perPage: z
    .number()
    .int()
    .min(1)
    .max(100)
    .default(10)
    .describe(
      'Number of posts to return per page. Default is 10, maximum is 100. ' +
        'Use smaller values for quick browsing, larger values when you need comprehensive results.',
    ),
  search: z
    .string()
    .optional()
    .describe(
      'Free-text search query to filter posts. Searches in post titles and content. ' +
        'Use this when looking for posts about a specific topic or containing certain keywords.',
    ),
  categories: z
    .array(z.number().int())
    .optional()
    .describe(
      'Array of category IDs to filter posts. Posts matching ANY of the provided category IDs will be returned (OR logic). ' +
        'Combine with tags for more specific filtering (AND logic between categories and tags).',
    ),
  tags: z
    .array(z.number().int())
    .optional()
    .describe(
      'Array of tag IDs to filter posts. Posts matching ANY of the provided tag IDs will be returned (OR logic). ' +
        'Combine with categories for more specific filtering (AND logic between categories and tags).',
    ),
});

type ListPostsToolParams = z.infer<typeof ListPostsParamsSchema>;

/**
 * UI Resource URI for the posts list MCP app
 * Used by MCP hosts that support ext-apps for rich UI rendering
 */
export const POSTS_LIST_UI_RESOURCE_URI = 'ui://wordpress-mcp/posts-list';

@Injectable()
export class PostsListTool {
  private readonly logger = new Logger(PostsListTool.name);

  constructor(private readonly wordpressService: WordpressService) {}

  @Tool({
    name: 'wordpress_list_posts',
    description:
      'Lists and searches blog posts from the connected WordPress site. ' +
      'Use this tool to browse recent articles, search for posts on specific topics, or filter by categories/tags. ' +
      'Returns a paginated list with: post ID, title, excerpt, publication date, author, featured image, and taxonomy terms. ' +
      'Each post includes its unique ID which can be used with wordpress_get_post to retrieve full content. ' +
      'Supports pagination (page/perPage), free-text search, and taxonomy filtering. ' +
      'Filtering logic: OR within same taxonomy (e.g., category A OR B), AND across taxonomies (e.g., category A AND tag X). ' +
      'Response includes totalPosts and totalPages for pagination navigation.',
    parameters: ListPostsParamsSchema,
    _meta: { [RESOURCE_URI_META_KEY]: POSTS_LIST_UI_RESOURCE_URI },
  })
  async listPosts(
    params: ListPostsToolParams,
    _context: Context,
    httpRequest: McpRequest,
  ): Promise<CallToolResult> {
    const wordpressUrl = httpRequest.wordpressUrl;

    if (!wordpressUrl) {
      return {
        content: [
          {
            type: 'text',
            text: 'Error: WordPress URL not found in request context. Make sure to access this server via /s/{slug}/mcp',
          },
        ],
        isError: true,
      };
    }

    try {
      const listParams: ListPostsParams = {
        page: params.page,
        perPage: params.perPage,
        search: params.search,
        categories: params.categories,
        tags: params.tags,
      };

      const response = await this.wordpressService.fetchPosts(wordpressUrl, listParams);

      return this.formatResponse(response);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Failed to list posts: ${message}`);
      return {
        content: [
          {
            type: 'text',
            text: `Error fetching posts: ${message}`,
          },
        ],
        isError: true,
      };
    }
  }

  /**
   * Formats the response with _meta linking to UI resource (for MCP ext-apps)
   * and structuredContent for the UI to consume
   */
  private formatResponse(response: ListPostsResponse): CallToolResult {
    const textFallback = this.buildTextFallback(response);

    return {
      content: [
        {
          type: 'text',
          text: textFallback,
        },
      ],
      structuredContent: response as unknown as Record<string, unknown>,
      _meta: {
        [RESOURCE_URI_META_KEY]: POSTS_LIST_UI_RESOURCE_URI,
      },
    };
  }

  private buildTextFallback(response: ListPostsResponse): string {
    const { items, pagination } = response;

    if (items.length === 0) {
      return 'No posts found matching your criteria.';
    }

    const postsText = items
      .map(
        (post, index) =>
          `${index + 1}. [ID: ${post.id}] ${post.title}\n   ${post.excerpt}\n   Date: ${new Date(post.date).toLocaleDateString()} | Link: ${post.link}`,
      )
      .join('\n\n');

    const paginationText = `\n\n---\nPage ${pagination.page} of ${pagination.totalPages} (${pagination.total} total posts)`;

    return postsText + paginationText;
  }
}
