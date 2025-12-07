import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  Req,
  Res,
  Body,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { McpStreamableHttpService } from '@rekog/mcp-nest';
import { McpServersService } from '../mcp-servers.service';

/**
 * Dynamic MCP Router Controller
 *
 * Routes MCP protocol requests to individual WordPress MCP servers
 * based on the slug parameter. Each server at /s/:slug/mcp exposes
 * the same tools (list_posts, get_post_detail) but for different WordPress sites.
 */
@Controller('s/:slug')
export class McpRouterController {
  private readonly logger = new Logger(McpRouterController.name);

  constructor(
    private readonly mcpStreamableHttpService: McpStreamableHttpService,
    private readonly mcpServersService: McpServersService,
  ) {}

  private async getServerAndSetContext(slug: string, req: Request): Promise<void> {
    const server = await this.mcpServersService.findBySlug(slug);

    if (!server) {
      throw new NotFoundException(`MCP server with slug '${slug}' not found`);
    }

    // Store WordPress URL in request for tools to access
    (req as any).wordpressUrl = server.wordpressUrl;
    (req as any).mcpServerId = server.id;
    (req as any).mcpServerSlug = slug;

    this.logger.debug(`Routing MCP request to server: ${slug} (${server.wordpressUrl})`);
  }

  @Post('mcp')
  async handlePost(
    @Param('slug') slug: string,
    @Req() req: Request,
    @Res() res: Response,
    @Body() body: unknown,
  ): Promise<void> {
    await this.getServerAndSetContext(slug, req);
    return this.mcpStreamableHttpService.handlePostRequest(req, res, body);
  }

  @Get('mcp')
  async handleGet(
    @Param('slug') slug: string,
    @Req() req: Request,
    @Res() res: Response,
  ): Promise<void> {
    await this.getServerAndSetContext(slug, req);
    return this.mcpStreamableHttpService.handleGetRequest(req, res);
  }

  @Delete('mcp')
  async handleDelete(
    @Param('slug') slug: string,
    @Req() req: Request,
    @Res() res: Response,
  ): Promise<void> {
    await this.getServerAndSetContext(slug, req);
    return this.mcpStreamableHttpService.handleDeleteRequest(req, res);
  }
}
