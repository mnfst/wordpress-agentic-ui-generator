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
/**
 * Common safe domains for WordPress sites
 * These are CDNs and services commonly used across WordPress installations
 */
const SAFE_IMAGE_DOMAINS = [
  // Gravatar - WordPress avatar service
  'https://secure.gravatar.com',
  'https://*.gravatar.com',
  // WordPress.com CDN and services
  'https://*.wp.com',
  'https://*.wordpress.com',
  // Jetpack CDN (i0, i1, i2, i3)
  'https://*.wp.com',
  // Unsplash (common for stock photos)
  'https://images.unsplash.com',
  // Imgur (common image host)
  'https://i.imgur.com',
];

@Injectable({ scope: Scope.REQUEST })
export class McpAppsResource {
  private readonly logger = new Logger(McpAppsResource.name);
  private readonly distPath: string;

  constructor() {
    // In production: bundled at dist/mcp-apps-bundle (copied during build)
    // In development: referenced from sibling package
    const bundledPath = path.resolve(__dirname, '../mcp-apps-bundle');
    const devPath = path.resolve(__dirname, '../../../mcp-apps/dist');

    this.distPath = fs.existsSync(bundledPath) ? bundledPath : devPath;
  }

  /**
   * Builds the list of allowed domains for CSP configuration
   * Includes the WordPress site domain, its subdomains, and common safe domains
   */
  private buildResourceDomains(wordpressUrl: string): string[] {
    const domains: string[] = [...SAFE_IMAGE_DOMAINS];

    try {
      const url = new URL(wordpressUrl);
      const hostname = url.hostname;
      const protocol = url.protocol;

      // Add exact origin
      domains.push(url.origin);

      // Get the base domain (remove www. if present for the wildcard)
      const baseDomain = hostname.replace(/^www\./, '');

      // Add wildcard subdomain pattern (e.g., https://*.rollingstone.com)
      if (!hostname.startsWith('*.')) {
        domains.push(`${protocol}//*.${baseDomain}`);
      }
    } catch {
      domains.push(wordpressUrl);
    }

    return domains;
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
    const resourceDomains = wordpressUrl ? this.buildResourceDomains(wordpressUrl) : SAFE_IMAGE_DOMAINS;

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
    const resourceDomains = wordpressUrl ? this.buildResourceDomains(wordpressUrl) : SAFE_IMAGE_DOMAINS;

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
