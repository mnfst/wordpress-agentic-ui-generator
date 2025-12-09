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
}

const GetPostDetailParamsSchema = z.object({
  postId: z
    .number()
    .int()
    .positive()
    .describe(
      'The unique numeric ID of the WordPress post to retrieve. ' +
        'You can obtain post IDs from the wordpress_list_posts tool results.',
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
    name: 'wordpress_get_post',
    description:
      'Retrieves the complete content and metadata of a single WordPress blog post by its ID. ' +
      'Use this tool when you need to read, analyze, or summarize a specific article. ' +
      'Returns: title, full HTML content, publication date, author name, featured image URL, ' +
      'categories (with IDs and names), and tags (with IDs and names). ' +
      'Typical use cases: reading an article the user referenced, fact-checking content, ' +
      'extracting quotes, or getting details about a post found via wordpress_list_posts.',
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

      return this.formatResponse(postDetail);
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
   * and structuredContent for the UI to consume
   */
  private formatResponse(post: PostDetail): CallToolResult {
    const textFallback = this.buildTextFallback(post);

    return {
      content: [
        {
          type: 'text',
          text: textFallback,
        },
      ],
      structuredContent: post as unknown as Record<string, unknown>,
      _meta: {
        [RESOURCE_URI_META_KEY]: POST_DETAIL_UI_RESOURCE_URI,
      },
    };
  }

  private buildTextFallback(post: PostDetail): string {
    const metaLines: string[] = [];

    if (post.author) {
      metaLines.push(`Author: ${post.author.name}`);
    }
    metaLines.push(`Date: ${new Date(post.date).toLocaleDateString()}`);
    metaLines.push(`Link: ${post.link}`);

    if (post.categories.length > 0) {
      metaLines.push(`Categories: ${post.categories.map((c) => c.name).join(', ')}`);
    }
    if (post.tags.length > 0) {
      metaLines.push(`Tags: ${post.tags.map((t) => t.name).join(', ')}`);
    }
    if (post.featuredImage) {
      metaLines.push(`Featured Image: ${post.featuredImage.url}`);
    }

    const contentText = this.stripHtml(post.content);

    return `# ${post.title}\n\n${metaLines.join('\n')}\n\n---\n\n${contentText}`;
  }

  private stripHtml(html: string): string {
    return html
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<\/p>/gi, '\n\n')
      .replace(/<[^>]*>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#039;/g, "'")
      .replace(/\n{3,}/g, '\n\n')
      .trim();
  }
}
