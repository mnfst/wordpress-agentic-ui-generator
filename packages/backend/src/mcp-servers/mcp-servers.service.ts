import {
  Injectable,
  ConflictException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { McpServer } from './entities/mcp-server.entity';
import { WordpressService } from '../wordpress/wordpress.service';
import { CreateMcpServerDto } from './dto/create-mcp-server.dto';
import type { McpServerInfo } from '@wordpress-mcp/shared';
import { McpServerStatus } from '@wordpress-mcp/shared';

@Injectable()
export class McpServersService {
  constructor(
    @InjectRepository(McpServer)
    private readonly mcpServerRepository: Repository<McpServer>,
    private readonly wordpressService: WordpressService,
    private readonly configService: ConfigService,
  ) {}

  private generateSlug(text: string): string {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .substring(0, 50);
  }

  private async ensureUniqueSlug(baseSlug: string): Promise<string> {
    let slug = baseSlug;
    let counter = 1;

    while (await this.mcpServerRepository.findOne({ where: { slug } })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    return slug;
  }

  async findBySlug(slug: string): Promise<McpServer | null> {
    return this.mcpServerRepository.findOne({ where: { slug } });
  }

  async create(createDto: CreateMcpServerDto): Promise<McpServerInfo> {
    const normalizedUrl = this.wordpressService.normalizeUrl(createDto.wordpressUrl);

    const existingServer = await this.mcpServerRepository.findOne({
      where: { wordpressUrl: normalizedUrl },
    });

    if (existingServer) {
      throw new ConflictException('An MCP server for this WordPress URL already exists');
    }

    const validationResult = await this.wordpressService.validateWordPressUrl(normalizedUrl);

    if (!validationResult.isValid) {
      throw new BadRequestException(validationResult.errorMessage || 'Invalid WordPress URL');
    }

    // Generate slug from provided slug, site name, or URL hostname
    let baseSlug: string;
    if (createDto.slug) {
      baseSlug = createDto.slug;
    } else if (validationResult.siteName) {
      baseSlug = this.generateSlug(validationResult.siteName);
    } else {
      const url = new URL(normalizedUrl);
      baseSlug = this.generateSlug(url.hostname.replace(/^www\./, ''));
    }

    const slug = await this.ensureUniqueSlug(baseSlug);

    const mcpServer = this.mcpServerRepository.create({
      slug,
      wordpressUrl: normalizedUrl,
      siteName: validationResult.siteName,
      siteDescription: validationResult.siteDescription,
      postCount: validationResult.postsCount,
      status: McpServerStatus.ACTIVE,
    });

    const savedServer = await this.mcpServerRepository.save(mcpServer);

    return this.toServerInfo(savedServer);
  }

  async findAll(filter?: { featured?: boolean }): Promise<McpServerInfo[]> {
    const where = filter?.featured !== undefined ? { featured: filter.featured } : {};
    const servers = await this.mcpServerRepository.find({
      where,
      order: { createdAt: 'DESC' },
    });

    return servers.map((server) => this.toServerInfo(server));
  }

  async findOne(id: string): Promise<McpServerInfo> {
    const server = await this.mcpServerRepository.findOne({ where: { id } });

    if (!server) {
      throw new NotFoundException(`MCP server with ID ${id} not found`);
    }

    return this.toServerInfo(server);
  }

  async delete(id: string): Promise<void> {
    const server = await this.mcpServerRepository.findOne({ where: { id } });

    if (!server) {
      throw new NotFoundException(`MCP server with ID ${id} not found`);
    }

    await this.mcpServerRepository.remove(server);
  }

  async sync(id: string): Promise<McpServerInfo> {
    const server = await this.mcpServerRepository.findOne({ where: { id } });

    if (!server) {
      throw new NotFoundException(`MCP server with ID ${id} not found`);
    }

    const validationResult = await this.wordpressService.validateWordPressUrl(server.wordpressUrl);

    if (!validationResult.isValid) {
      server.status = McpServerStatus.ERROR;
      server.lastError = validationResult.errorMessage;
    } else {
      server.siteName = validationResult.siteName;
      server.siteDescription = validationResult.siteDescription;
      server.postCount = validationResult.postsCount;
      server.status = McpServerStatus.ACTIVE;
      server.lastError = null;
    }

    server.lastSyncAt = new Date();
    const updatedServer = await this.mcpServerRepository.save(server);

    return this.toServerInfo(updatedServer);
  }

  private toServerInfo(server: McpServer): McpServerInfo {
    const baseUrl = this.configService.get<string>('BASE_URL', 'http://localhost:3000');

    return {
      id: server.id,
      slug: server.slug,
      wordpressUrl: server.wordpressUrl,
      siteName: server.siteName,
      status: server.status,
      postCount: server.postCount,
      createdAt: server.createdAt.toISOString(),
      connectionEndpoint: `${baseUrl}/api/s/${server.slug}/mcp`,
      featured: server.featured,
    };
  }
}
