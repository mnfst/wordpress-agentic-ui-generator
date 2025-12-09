import { Injectable, Logger } from '@nestjs/common';
import { Tool, Context } from '@rekog/mcp-nest';
import { z } from 'zod';
import { Request } from 'express';
import { WordpressService } from '../../wordpress/wordpress.service';
import type { PostDetail } from '@wordpress-mcp/shared';
import type { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import { RESOURCE_URI_META_KEY } from '@modelcontextprotocol/ext-apps';

interface McpRequest extends Request {
  wordpressUrl?: string;
  siteName?: string;
}

const GetPostDetailParamsSchema = z.object({
  postId: z
    .number()
    .int()
    .positive()
    .describe(
      'The unique numeric ID of the post to retrieve. ' +
        'You can obtain post IDs from the list_posts tool results.',
    ),
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

  constructor(private readonly wordpressService: WordpressService) {}

  @Tool({
    name: 'get_post',
    description:
      'Retrieves the complete content and metadata of a single blog post by its ID. ' +
      'Use this tool when you need to read, analyze, or summarize a specific article. ' +
      'Returns: title, full HTML content, publication date, author name, featured image URL, ' +
      'categories (with IDs and names), and tags (with IDs and names). ' +
      'Typical use cases: reading an article the user referenced, fact-checking content, ' +
      'extracting quotes, or getting details about a post found via list_posts.',
    parameters: GetPostDetailParamsSchema,
    _meta: { [RESOURCE_URI_META_KEY]: POST_DETAIL_UI_RESOURCE_URI },
  })
  async getPostDetail(
    params: GetPostDetailToolParams,
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
      const postDetail = await this.wordpressService.fetchPostById(wordpressUrl, params.postId);
      const siteName = httpRequest.siteName ?? 'the site';

      return this.formatResponse(postDetail, siteName);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Failed to get post detail: ${message}`);
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
   * Formats the response with _meta linking to UI resource (for MCP ext-apps)
   * and structuredContent for the UI to consume.
   *
   * The text content is kept minimal since the UI will render the full post.
   * This prevents the LLM from repeating content already shown in the UI.
   */
  private formatResponse(post: PostDetail, siteName: string): CallToolResult {
    // Minimal text summary - the UI shows the full content
    const textSummary = this.buildMinimalSummary(post, siteName);

    return {
      content: [
        {
          type: 'text',
          text: textSummary,
        },
      ],
      structuredContent: post as unknown as Record<string, unknown>,
      _meta: {
        [RESOURCE_URI_META_KEY]: POST_DETAIL_UI_RESOURCE_URI,
      },
    };
  }

  /**
   * Builds a minimal summary for the LLM.
   * The full content is displayed in the UI, so we only provide
   * key metadata here to avoid the LLM repeating the content.
   */
  private buildMinimalSummary(post: PostDetail, siteName: string): string {
    const parts = [
      `Post "${post.title}" from ${siteName} is now displayed in the UI.`,
      `Author: ${post.author?.name ?? 'Unknown'}`,
      `Date: ${new Date(post.date).toLocaleDateString()}`,
    ];

    if (post.categories.length > 0) {
      parts.push(`Categories: ${post.categories.map((c) => c.name).join(', ')}`);
    }

    return parts.join(' | ');
  }
}
