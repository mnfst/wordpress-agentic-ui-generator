import { Injectable, Logger, Scope } from '@nestjs/common';
import { Resource, Context } from '@rekog/mcp-nest';
import { Request } from 'express';
import { POSTS_LIST_UI_RESOURCE_URI } from '../mcp-servers/tools/posts-list.tool';
import { POST_DETAIL_UI_RESOURCE_URI } from '../mcp-servers/tools/post-detail.tool';
import * as fs from 'fs';
import * as path from 'path';

interface McpRequest extends Request {
  wordpressUrl?: string;
  raw?: McpRequest;
}

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
   * Extracts the domain from a WordPress URL for CSP configuration
   */
  private extractDomain(wordpressUrl: string): string {
    try {
      const url = new URL(wordpressUrl);
      return url.origin;
    } catch {
      return wordpressUrl;
    }
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
  getPostsListResource({ uri }: { uri: string }, _context: Context, httpRequest: McpRequest) {
    // The mcp-nest library passes an adapted request object
    // The original Express request with our custom properties is in .raw
    const rawRequest = httpRequest.raw ?? httpRequest;
    const wordpressUrl = rawRequest.wordpressUrl;

    const html = this.readAppHtml('posts-list.html');
    const resourceDomains = wordpressUrl ? [this.extractDomain(wordpressUrl)] : [];

    return {
      contents: [
        {
          uri,
          mimeType: 'text/html+mcp',
          text: html,
          _meta: {
            ui: {
              csp: {
                resourceDomains, // Allow images from WordPress domain
              },
            },
          },
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
  getPostDetailResource({ uri }: { uri: string }, _context: Context, httpRequest: McpRequest) {
    // The mcp-nest library passes an adapted request object
    // The original Express request with our custom properties is in .raw
    const rawRequest = httpRequest.raw ?? httpRequest;
    const wordpressUrl = rawRequest.wordpressUrl;

    const html = this.readAppHtml('post-detail.html');
    const resourceDomains = wordpressUrl ? [this.extractDomain(wordpressUrl)] : [];

    return {
      contents: [
        {
          uri,
          mimeType: 'text/html+mcp',
          text: html,
          _meta: {
            ui: {
              csp: {
                resourceDomains, // Allow images from WordPress domain
              },
            },
          },
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
