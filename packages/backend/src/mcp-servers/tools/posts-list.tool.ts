import { Injectable, Logger } from '@nestjs/common';
import { Tool, Context } from '@rekog/mcp-nest';
import { z } from 'zod';
import { Request } from 'express';
import { WordpressService } from '../../wordpress/wordpress.service';
import { PostsListComponent } from '../../mcp-ui/components/posts-list.component';
import type { ListPostsParams, ListPostsResponse } from '@wordpress-mcp/shared';
import type { CallToolResult } from '@modelcontextprotocol/sdk/types.js';

const ListPostsParamsSchema = z.object({
  page: z.number().int().min(1).default(1).describe('Page number (1-indexed)'),
  perPage: z.number().int().min(1).max(100).default(10).describe('Number of posts per page (max 100)'),
  search: z.string().optional().describe('Search query to filter posts by title or content'),
  categories: z.array(z.number().int()).optional().describe('Category IDs to filter by (OR logic within)'),
  tags: z.array(z.number().int()).optional().describe('Tag IDs to filter by (OR logic within)'),
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

  constructor(
    private readonly wordpressService: WordpressService,
    private readonly postsListComponent: PostsListComponent,
  ) {}

  @Tool({
    name: 'list_posts',
    description:
      'Lists posts from this WordPress site with optional search, category, and tag filtering. ' +
      'Filtering logic: OR within same taxonomy type (categories or tags), AND across different types.',
    parameters: ListPostsParamsSchema,
  })
  async listPosts(
    params: ListPostsToolParams,
    _context: Context,
    httpRequest: Request,
  ): Promise<CallToolResult> {
    const wordpressUrl = (httpRequest as any).wordpressUrl as string;

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

    this.logger.log(`Listing posts for WordPress site: ${wordpressUrl}`);

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
      this.logger.error(`Failed to list posts: ${error}`);
      const message = error instanceof Error ? error.message : 'Unknown error';
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
   * Formats the response with embedded resource (for MCP ext-apps UI) and text fallback
   */
  private formatResponse(response: ListPostsResponse): CallToolResult {
    const jsonData = JSON.stringify(response);
    const textFallback = this.postsListComponent.buildText(response);

    return {
      content: [
        {
          type: 'resource',
          resource: {
            uri: POSTS_LIST_UI_RESOURCE_URI,
            mimeType: 'text/html;profile=mcp-app',
            text: jsonData,
          },
        },
        {
          type: 'text',
          text: textFallback,
        },
      ],
    };
  }
}
