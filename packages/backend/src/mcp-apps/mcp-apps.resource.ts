import { Injectable, Logger } from '@nestjs/common';
import { Resource, Context } from '@rekog/mcp-nest';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import { POSTS_LIST_UI_RESOURCE_URI } from '../mcp-servers/tools/posts-list.tool';
import { POST_DETAIL_UI_RESOURCE_URI } from '../mcp-servers/tools/post-detail.tool';

/**
 * MCP Apps Resource Provider
 *
 * Exposes MCP App UI resources that hosts can fetch and render in iframes.
 * These resources return HTML content that implements the MCP Apps SDK.
 */
@Injectable()
export class McpAppsResource {
  private readonly logger = new Logger(McpAppsResource.name);
  private readonly baseUrl: string;

  constructor(private readonly configService: ConfigService) {
    this.baseUrl = this.configService.get<string>('API_BASE_URL', 'http://localhost:3000');
  }

  /**
   * Posts List UI Resource
   * Returns the HTML app for rendering a paginated list of WordPress posts
   */
  @Resource({
    uri: POSTS_LIST_UI_RESOURCE_URI,
    name: 'WordPress Posts List UI',
    description: 'Interactive UI for browsing WordPress posts with search and pagination',
    mimeType: 'text/html;profile=mcp-app',
  })
  async getPostsListResource(
    _uri: string,
    _context: Context,
    _httpRequest: Request,
  ): Promise<string> {
    this.logger.debug('Serving posts list UI resource');

    // Return the HTML that loads the MCP App
    // The host will render this in an iframe with proper sandboxing
    return this.buildAppHtml('posts-list', 'WordPress Posts List');
  }

  /**
   * Post Detail UI Resource
   * Returns the HTML app for rendering a single WordPress post with full content
   */
  @Resource({
    uri: POST_DETAIL_UI_RESOURCE_URI,
    name: 'WordPress Post Detail UI',
    description: 'Interactive UI for viewing full WordPress post content and metadata',
    mimeType: 'text/html;profile=mcp-app',
  })
  async getPostDetailResource(
    _uri: string,
    _context: Context,
    _httpRequest: Request,
  ): Promise<string> {
    this.logger.debug('Serving post detail UI resource');

    return this.buildAppHtml('post-detail', 'WordPress Post Detail');
  }

  /**
   * Builds the HTML wrapper for an MCP App
   * This HTML loads the bundled React app and initializes the MCP connection
   */
  private buildAppHtml(appName: string, title: string): string {
    const appUrl = `${this.baseUrl}/api/mcp-apps/${appName}`;

    // For production, we'd serve the built assets
    // For development, we return a redirect or embed the app URL
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html, body, iframe { width: 100%; height: 100%; border: none; }
  </style>
</head>
<body>
  <iframe src="${appUrl}" allow="clipboard-write"></iframe>
</body>
</html>`;
  }
}
