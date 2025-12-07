import { Injectable, Logger } from '@nestjs/common';
import { Tool, Context } from '@rekog/mcp-nest';
import { z } from 'zod';
import { Request } from 'express';
import { WordpressService } from '../../wordpress/wordpress.service';
import { PostsListComponent } from '../../mcp-ui/components/posts-list.component';
import type { ListPostsParams } from '@wordpress-mcp/shared';

const ListPostsParamsSchema = z.object({
  page: z.number().int().min(1).default(1).describe('Page number (1-indexed)'),
  perPage: z.number().int().min(1).max(100).default(10).describe('Number of posts per page (max 100)'),
  search: z.string().optional().describe('Search query to filter posts by title or content'),
  categories: z.array(z.number().int()).optional().describe('Category IDs to filter by (OR logic within)'),
  tags: z.array(z.number().int()).optional().describe('Tag IDs to filter by (OR logic within)'),
});

type ListPostsToolParams = z.infer<typeof ListPostsParamsSchema>;

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
  async listPosts(params: ListPostsToolParams, _context: Context, httpRequest: Request): Promise<string> {
    const wordpressUrl = (httpRequest as any).wordpressUrl as string;

    if (!wordpressUrl) {
      return 'Error: WordPress URL not found in request context. Make sure to access this server via /s/{slug}/mcp';
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

      const response = await this.wordpressService.fetchPosts(
        wordpressUrl,
        listParams,
      );

      return this.postsListComponent.buildText(response);
    } catch (error) {
      this.logger.error(`Failed to list posts: ${error}`);
      const message = error instanceof Error ? error.message : 'Unknown error';
      return `Error fetching posts: ${message}`;
    }
  }
}
