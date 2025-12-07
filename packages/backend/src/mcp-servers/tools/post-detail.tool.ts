import { Injectable, Logger } from '@nestjs/common';
import { Tool, Context } from '@rekog/mcp-nest';
import { z } from 'zod';
import { Request } from 'express';
import { WordpressService } from '../../wordpress/wordpress.service';
import { PostDetailComponent } from '../../mcp-ui/components/post-detail.component';
import type { PostDetail } from '@wordpress-mcp/shared';
import type { CallToolResult } from '@modelcontextprotocol/sdk/types.js';

const GetPostDetailParamsSchema = z.object({
  postId: z.number().int().positive().describe('The WordPress post ID to retrieve'),
});

type GetPostDetailToolParams = z.infer<typeof GetPostDetailParamsSchema>;

/**
 * UI Resource URI for the post detail MCP app
 * Used by MCP hosts that support ext-apps for rich UI rendering
 */
export const POST_DETAIL_UI_RESOURCE_URI = 'ui://wordpress-mcp/post-detail';

@Injectable()
export class PostDetailTool {
  private readonly logger = new Logger(PostDetailTool.name);

  constructor(
    private readonly wordpressService: WordpressService,
    private readonly postDetailComponent: PostDetailComponent,
  ) {}

  @Tool({
    name: 'get_post_detail',
    description:
      'Retrieves the full content and metadata of a specific WordPress post by ID. ' +
      'Returns title, content, author, featured image, categories, and tags.',
    parameters: GetPostDetailParamsSchema,
  })
  async getPostDetail(
    params: GetPostDetailToolParams,
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

    this.logger.log(`Getting post ${params.postId} for WordPress site: ${wordpressUrl}`);

    try {
      const postDetail = await this.wordpressService.fetchPostById(wordpressUrl, params.postId);

      return this.formatResponse(postDetail);
    } catch (error) {
      this.logger.error(`Failed to get post detail: ${error}`);
      const message = error instanceof Error ? error.message : 'Unknown error';
      return {
        content: [
          {
            type: 'text',
            text: `Error fetching post: ${message}`,
          },
        ],
        isError: true,
      };
    }
  }

  /**
   * Formats the response with embedded resource (for MCP ext-apps UI) and text fallback
   */
  private formatResponse(post: PostDetail): CallToolResult {
    const jsonData = JSON.stringify(post);
    const textFallback = this.postDetailComponent.buildText(post);

    return {
      content: [
        {
          type: 'resource',
          resource: {
            uri: POST_DETAIL_UI_RESOURCE_URI,
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
