import { Injectable, Logger, Scope } from '@nestjs/common';
import { Resource } from '@rekog/mcp-nest';
import { POSTS_LIST_UI_RESOURCE_URI } from '../mcp-servers/tools/posts-list.tool';
import { POST_DETAIL_UI_RESOURCE_URI } from '../mcp-servers/tools/post-detail.tool';
import * as fs from 'fs';
import * as path from 'path';

/**
 * MCP Apps Resource Provider
 *
 * Exposes MCP App UI resources that hosts can fetch and render in iframes.
 * These resources return HTML content that implements the MCP Apps SDK.
 * The HTML files are bundled as single files (all JS/CSS inlined) using vite-plugin-singlefile.
 */
@Injectable({ scope: Scope.REQUEST })
export class McpAppsResource {
  private readonly logger = new Logger(McpAppsResource.name);
  private readonly distPath: string;

  constructor() {
    // Path to the built mcp-apps dist folder
    // From compiled location: packages/backend/dist/mcp-apps/
    // Target: packages/mcp-apps/dist/
    this.distPath = path.resolve(__dirname, '../../../mcp-apps/dist');
  }

  /**
   * Posts List UI Resource
   * Returns the HTML app for rendering a paginated list of WordPress posts
   */
  @Resource({
    uri: POSTS_LIST_UI_RESOURCE_URI,
    name: 'WordPress Posts List UI',
    description: 'Interactive UI for browsing WordPress posts with search and pagination',
    mimeType: 'text/html+mcp',
  })
  getPostsListResource({ uri }: { uri: string }) {
    this.logger.log('[RESOURCE READ] Posts list UI resource requested!');

    const html = this.readAppHtml('posts-list.html');

    return {
      contents: [
        {
          uri,
          mimeType: 'text/html+mcp',
          text: html,
        },
      ],
    };
  }

  /**
   * Post Detail UI Resource
   * Returns the HTML app for rendering a single WordPress post with full content
   */
  @Resource({
    uri: POST_DETAIL_UI_RESOURCE_URI,
    name: 'WordPress Post Detail UI',
    description: 'Interactive UI for viewing full WordPress post content and metadata',
    mimeType: 'text/html+mcp',
  })
  getPostDetailResource({ uri }: { uri: string }) {
    this.logger.debug('Serving post detail UI resource');

    const html = this.readAppHtml('post-detail.html');

    return {
      contents: [
        {
          uri,
          mimeType: 'text/html+mcp',
          text: html,
        },
      ],
    };
  }

  /**
   * Reads a bundled MCP App HTML file from disk
   * These files are built with vite-plugin-singlefile, so all JS/CSS is inlined
   */
  private readAppHtml(filename: string): string {
    const filePath = path.join(this.distPath, filename);

    try {
      return fs.readFileSync(filePath, 'utf-8');
    } catch (error) {
      this.logger.error(`Failed to read MCP app HTML: ${filePath}`, error);
      return `<!DOCTYPE html>
<html>
<head><title>Error</title></head>
<body>
  <h1>Error loading MCP App</h1>
  <p>Could not load ${filename}. Make sure the mcp-apps package is built.</p>
</body>
</html>`;
    }
  }
}
