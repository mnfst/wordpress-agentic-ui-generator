import { Injectable, Logger } from '@nestjs/common';
import { Tool, Context } from '@rekog/mcp-nest';
import { z } from 'zod';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { McpServer } from '../entities/mcp-server.entity';
import { WordpressService } from '../../wordpress/wordpress.service';
import { PostDetailComponent } from '../../mcp-ui/components/post-detail.component';

const GetPostDetailParamsSchema = z.object({
  serverId: z.string().uuid().describe('The ID of the MCP server to query'),
  postId: z.number().int().positive().describe('The WordPress post ID to retrieve'),
});

type GetPostDetailToolParams = z.infer<typeof GetPostDetailParamsSchema>;

@Injectable()
export class PostDetailTool {
  private readonly logger = new Logger(PostDetailTool.name);

  constructor(
    @InjectRepository(McpServer)
    private readonly mcpServerRepository: Repository<McpServer>,
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
  async getPostDetail(params: GetPostDetailToolParams, context: Context): Promise<string> {
    this.logger.log(`Getting post ${params.postId} for server ${params.serverId}`);

    const server = await this.mcpServerRepository.findOne({
      where: { id: params.serverId },
    });

    if (!server) {
      return `Error: MCP server with ID ${params.serverId} not found`;
    }

    try {
      const postDetail = await this.wordpressService.fetchPostById(
        server.wordpressUrl,
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
