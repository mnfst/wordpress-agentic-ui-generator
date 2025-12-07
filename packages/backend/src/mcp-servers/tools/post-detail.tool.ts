import { Injectable, Logger } from '@nestjs/common';
import { Tool, Context } from '@rekog/mcp-nest';
import { z } from 'zod';
import { Request } from 'express';
import { WordpressService } from '../../wordpress/wordpress.service';
import { PostDetailComponent } from '../../mcp-ui/components/post-detail.component';

const GetPostDetailParamsSchema = z.object({
  postId: z.number().int().positive().describe('The WordPress post ID to retrieve'),
});

type GetPostDetailToolParams = z.infer<typeof GetPostDetailParamsSchema>;

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
  async getPostDetail(params: GetPostDetailToolParams, _context: Context, httpRequest: Request): Promise<string> {
    const wordpressUrl = (httpRequest as any).wordpressUrl as string;

    if (!wordpressUrl) {
      return 'Error: WordPress URL not found in request context. Make sure to access this server via /s/{slug}/mcp';
    }

    this.logger.log(`Getting post ${params.postId} for WordPress site: ${wordpressUrl}`);

    try {
      const postDetail = await this.wordpressService.fetchPostById(
        wordpressUrl,
        params.postId,
      );

      return this.postDetailComponent.buildText(postDetail);
    } catch (error) {
      this.logger.error(`Failed to get post detail: ${error}`);
      const message = error instanceof Error ? error.message : 'Unknown error';
      return `Error fetching post: ${message}`;
    }
  }
}
