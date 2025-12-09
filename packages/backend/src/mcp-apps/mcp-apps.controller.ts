import { Controller, Get, Param, Res, NotFoundException, Logger } from '@nestjs/common';
import { Response } from 'express';
import { join } from 'path';
import { existsSync, readFileSync } from 'fs';

/**
 * MCP Apps Controller
 *
 * Serves the built MCP App static files (HTML, JS, CSS) for MCP host clients.
 * These apps are loaded in iframes by MCP hosts and communicate via postMessage.
 *
 * Route: /mcp-apps/:appName (e.g., /mcp-apps/posts-list, /mcp-apps/post-detail)
 */
@Controller('mcp-apps')
export class McpAppsController {
  private readonly logger = new Logger(McpAppsController.name);
  private readonly appsDistPath: string;

  constructor() {
    // In development, this points to the mcp-apps package dist folder
    // In production, these files would be bundled with the backend
    this.appsDistPath = join(__dirname, '..', '..', '..', 'mcp-apps', 'dist');
  }

  @Get(':appName')
  serveApp(@Param('appName') appName: string, @Res() res: Response): void {
    const validApps = ['posts-list', 'post-detail'];

    if (!validApps.includes(appName)) {
      this.logger.warn(`Invalid app name requested: ${appName}`);
      throw new NotFoundException(`MCP App '${appName}' not found`);
    }

    const htmlPath = join(this.appsDistPath, `${appName}.html`);

    if (!existsSync(htmlPath)) {
      this.logger.error(`App HTML not found: ${htmlPath}`);
      throw new NotFoundException(
        `MCP App '${appName}' not found. Make sure to build the mcp-apps package.`,
      );
    }

    const html = readFileSync(htmlPath, 'utf-8');
    res.type('text/html').send(html);
  }

  @Get('assets/:fileName')
  serveAsset(@Param('fileName') fileName: string, @Res() res: Response): void {
    const assetPath = join(this.appsDistPath, 'assets', fileName);

    if (!existsSync(assetPath)) {
      this.logger.warn(`Asset not found: ${assetPath}`);
      throw new NotFoundException(`Asset '${fileName}' not found`);
    }

    const content = readFileSync(assetPath);
    const ext = fileName.split('.').pop()?.toLowerCase();

    const contentTypes: Record<string, string> = {
      js: 'application/javascript',
      css: 'text/css',
      json: 'application/json',
      svg: 'image/svg+xml',
      png: 'image/png',
      jpg: 'image/jpeg',
      jpeg: 'image/jpeg',
      woff: 'font/woff',
      woff2: 'font/woff2',
    };

    res.type(contentTypes[ext || ''] || 'application/octet-stream').send(content);
  }
}
